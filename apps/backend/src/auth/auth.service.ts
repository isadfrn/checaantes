import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User } from './entities/user.entity.js';
import { Profession } from '../professions/entities/profession.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service.js';
import { MailService } from '../mail/mail.service.js';

const DEFAULT_ALLOWED_STATE = 'SC';
const NATIONAL_SIGNUP_FLAG = 'cadastro-nacional-liberado';
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profession)
    private professionsRepository: Repository<Profession>,
    private jwtService: JwtService,
    private featureFlags: FeatureFlagsService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const nationalSignupEnabled =
      this.featureFlags.isEnabled(NATIONAL_SIGNUP_FLAG);
    if (!nationalSignupEnabled && dto.state !== DEFAULT_ALLOWED_STATE) {
      throw new ForbiddenException(
        `No momento, o cadastro está disponível apenas para ${DEFAULT_ALLOWED_STATE}.`,
      );
    }

    const profession = await this.professionsRepository.findOneBy({
      id: dto.professionId,
    });
    if (!profession) {
      throw new BadRequestException('Profissão selecionada não existe');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Já existe uma conta com esse e-mail');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const emailConfirmationToken = randomBytes(32).toString('hex');

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      state: dto.state,
      professionId: profession.id,
      passwordHash,
      emailConfirmed: false,
      emailConfirmationToken,
    });
    await this.usersRepository.save(user);

    await this.trySend(() =>
      this.mailService.sendConfirmationEmail(
        user.email,
        user.name,
        emailConfirmationToken,
      ),
    );

    return {
      message:
        'Conta criada. Enviamos um e-mail de confirmação — confirme para poder entrar.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        professionId: user.professionId,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    if (!user.emailConfirmed) {
      throw new ForbiddenException(
        'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
      );
    }

    return this.generateToken(user);
  }

  async confirmEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { emailConfirmationToken: token },
    });
    if (!user) {
      throw new BadRequestException('Token de confirmação inválido ou já usado');
    }

    if (user.pendingEmail) {
      const taken = await this.usersRepository.findOne({
        where: { email: user.pendingEmail },
      });
      if (taken && taken.id !== user.id) {
        throw new ConflictException('Esse e-mail já está em uso por outra conta');
      }
      user.email = user.pendingEmail;
      user.pendingEmail = null;
    }

    user.emailConfirmed = true;
    user.emailConfirmationToken = null;
    await this.usersRepository.save(user);

    return { message: 'E-mail confirmado com sucesso. Você já pode entrar.' };
  }

  async resendConfirmation(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user && !user.emailConfirmed) {
      user.emailConfirmationToken = randomBytes(32).toString('hex');
      await this.usersRepository.save(user);
      await this.trySend(() =>
        this.mailService.sendConfirmationEmail(
          user.email,
          user.name,
          user.emailConfirmationToken!,
        ),
      );
    }

    return {
      message:
        'Se houver uma conta pendente com esse e-mail, um novo link de confirmação foi enviado.',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (user) {
      const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
      user.passwordResetCodeHash = await bcrypt.hash(code, 10);
      user.passwordResetExpiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);
      await this.usersRepository.save(user);
      await this.trySend(() =>
        this.mailService.sendPasswordResetEmail(user.email, user.name, code),
      );
    }

    return {
      message:
        'Se houver uma conta com esse e-mail, enviamos um código para redefinir a senha.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    const invalidCode = () =>
      new BadRequestException('Código inválido ou expirado');

    if (
      !user ||
      !user.passwordResetCodeHash ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
      throw invalidCode();
    }

    const codeValid = await bcrypt.compare(dto.code, user.passwordResetCodeHash);
    if (!codeValid) {
      throw invalidCode();
    }

    user.passwordHash = await bcrypt.hash(dto.password, 10);
    user.passwordResetCodeHash = null;
    user.passwordResetExpiresAt = null;
    await this.usersRepository.save(user);

    return { message: 'Senha redefinida com sucesso. Você já pode entrar.' };
  }

  private async trySend(send: () => Promise<void>) {
    try {
      await send();
    } catch (err) {
      this.logger.error(`Falha ao enviar e-mail: ${(err as Error).message}`);
    }
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        professionId: user.professionId,
      },
    };
  }
}
