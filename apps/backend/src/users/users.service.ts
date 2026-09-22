import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User } from '../auth/entities/user.entity.js';
import { MailService } from '../mail/mail.service.js';
import { StorageService, type UploadFile } from '../storage/storage.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ChangeEmailDto } from './dto/change-email.dto.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService,
    private storageService: StorageService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.findOwnOrFail(userId);
    return this.toProfileView(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findOwnOrFail(userId);
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.phone !== undefined) user.phone = dto.phone;
    await this.usersRepository.save(user);
    return this.toProfileView(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.findOwnOrFail(userId);

    const currentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!currentValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    user.passwordHash = await bcrypt.hash(dto.password, 10);
    await this.usersRepository.save(user);
    return { message: 'Senha alterada com sucesso.' };
  }

  async requestEmailChange(userId: string, dto: ChangeEmailDto) {
    const user = await this.findOwnOrFail(userId);

    if (dto.email === user.email) {
      throw new BadRequestException('Esse já é o seu e-mail atual');
    }

    const taken = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (taken) {
      throw new ConflictException('Esse e-mail já está em uso por outra conta');
    }

    user.pendingEmail = dto.email;
    user.emailConfirmationToken = randomBytes(32).toString('hex');
    await this.usersRepository.save(user);

    await this.trySend(() =>
      this.mailService.sendEmailChangeConfirmation(
        dto.email,
        user.name,
        user.emailConfirmationToken!,
      ),
    );

    return {
      message:
        'Enviamos um link de confirmação para o novo e-mail. Ele passa a valer após a confirmação.',
    };
  }

  async updateAvatar(userId: string, file: UploadFile) {
    const user = await this.findOwnOrFail(userId);

    const previousAvatarUrl = user.avatarUrl;
    user.avatarUrl = await this.storageService.save(file, 'avatars');
    await this.usersRepository.save(user);

    if (previousAvatarUrl) {
      await this.storageService.remove(previousAvatarUrl);
    }

    return { avatarUrl: user.avatarUrl };
  }

  private async findOwnOrFail(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { profession: true },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  private toProfileView(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      state: user.state,
      role: user.role,
      emailConfirmed: user.emailConfirmed,
      pendingEmail: user.pendingEmail,
      avatarUrl: user.avatarUrl,
      profession: user.profession
        ? { id: user.profession.id, name: user.profession.name }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async trySend(send: () => Promise<void>) {
    try {
      await send();
    } catch (err) {
      this.logger.error(`Falha ao enviar e-mail: ${(err as Error).message}`);
    }
  }
}
