import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import { User, UserRole } from './entities/user.entity.js';
import { Profession } from '../professions/entities/profession.entity.js';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service.js';
import { MailService } from '../mail/mail.service.js';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

const user: User = {
  id: 'uuid-1',
  name: 'Fulana de Tal',
  email: 'a@b.com',
  phone: '48999999999',
  state: 'SC',
  profession: null,
  professionId: 'prof-1',
  avatarUrl: null,
  passwordHash: '$hash',
  role: UserRole.USER,
  emailConfirmed: true,
  emailConfirmationToken: null,
  pendingEmail: null,
  passwordResetCodeHash: null,
  passwordResetExpiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  const usersRepository = {
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const professionsRepository = {
    findOneBy: vi.fn(),
  };
  const jwtService = {
    sign: vi.fn().mockReturnValue('jwt-token'),
  };
  const featureFlags = {
    isEnabled: vi.fn().mockReturnValue(false),
  };
  const mailService = {
    sendConfirmationEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    sendEmailChangeConfirmation: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    featureFlags.isEnabled.mockReturnValue(false);
    jwtService.sign.mockReturnValue('jwt-token');
    professionsRepository.findOneBy.mockResolvedValue({ id: 'prof-1' });
    mailService.sendConfirmationEmail.mockResolvedValue(undefined);
    mailService.sendPasswordResetEmail.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        {
          provide: getRepositoryToken(Profession),
          useValue: professionsRepository,
        },
        { provide: JwtService, useValue: jwtService },
        { provide: FeatureFlagsService, useValue: featureFlags },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      name: 'Fulana de Tal',
      email: 'a@b.com',
      phone: '48999999999',
      state: 'SC',
      professionId: 'prof-1',
      password: 'secret123',
      passwordConfirmation: 'secret123',
    };

    it('creates an unconfirmed user linked to a profession, sends the email and returns a message (no token)', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('$hash');
      const createdUser = {
        ...user,
        emailConfirmed: false,
        emailConfirmationToken: 'tok',
      };
      usersRepository.create.mockReturnValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(professionsRepository.findOneBy).toHaveBeenCalledWith({
        id: 'prof-1',
      });
      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          state: dto.state,
          professionId: 'prof-1',
          emailConfirmed: false,
          emailConfirmationToken: expect.any(String),
        }),
      );
      expect(mailService.sendConfirmationEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
      expect(result).not.toHaveProperty('accessToken');
      expect(result.user.professionId).toBe('prof-1');
    });

    it('throws BadRequestException when the profession does not exist', async () => {
      professionsRepository.findOneBy.mockResolvedValue(null);
      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('blocks registration outside SC when the national flag is off', async () => {
      featureFlags.isEnabled.mockReturnValue(false);
      await expect(
        service.register({ ...dto, state: 'SP' }),
      ).rejects.toThrow(ForbiddenException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('allows registration outside SC when the national flag is on', async () => {
      featureFlags.isEnabled.mockReturnValue(true);
      usersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('$hash');
      usersRepository.create.mockReturnValue({ ...user, professionId: 'prof-1' });
      usersRepository.save.mockResolvedValue(user);

      await expect(
        service.register({ ...dto, state: 'SP' }),
      ).resolves.toHaveProperty('message');
    });

    it('throws ConflictException when email already exists', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const dto = { email: 'a@b.com', password: 'secret123' };

    it('logs in a confirmed user', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login(dto);
      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          professionId: user.professionId,
        },
      });
    });

    it('throws UnauthorizedException when email not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as any).mockResolvedValue(false);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException when the email is not confirmed', async () => {
      usersRepository.findOne.mockResolvedValue({
        ...user,
        emailConfirmed: false,
      });
      (bcrypt.compare as any).mockResolvedValue(true);
      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('confirmEmail', () => {
    it('confirms a fresh signup and clears the token', async () => {
      const pending = {
        ...user,
        emailConfirmed: false,
        emailConfirmationToken: 'tok',
        pendingEmail: null,
      };
      usersRepository.findOne.mockResolvedValue(pending);
      usersRepository.save.mockResolvedValue(pending);

      await service.confirmEmail('tok');

      expect(pending.emailConfirmed).toBe(true);
      expect(pending.emailConfirmationToken).toBeNull();
    });

    it('applies a pending email change on confirmation', async () => {
      const pending = {
        ...user,
        emailConfirmationToken: 'tok',
        pendingEmail: 'new@b.com',
      };
      usersRepository.findOne
        .mockResolvedValueOnce(pending)
        .mockResolvedValueOnce(null);
      usersRepository.save.mockResolvedValue(pending);

      await service.confirmEmail('tok');

      expect(pending.email).toBe('new@b.com');
      expect(pending.pendingEmail).toBeNull();
    });

    it('throws BadRequestException when the token is invalid', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      await expect(service.confirmEmail('nope')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('generates a code and emails it when the account exists', async () => {
      usersRepository.findOne.mockResolvedValue({ ...user });
      (bcrypt.hash as any).mockResolvedValue('$codehash');
      usersRepository.save.mockResolvedValue(user);

      const result = await service.forgotPassword({ email: user.email });

      expect(usersRepository.save).toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('responds generically without sending when the account does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.forgotPassword({ email: 'ghost@b.com' });
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });
  });

  describe('resetPassword', () => {
    const baseDto = {
      email: user.email,
      code: '123456',
      password: 'novaSenha123',
      passwordConfirmation: 'novaSenha123',
    };

    it('resets the password with a valid, unexpired code', async () => {
      const target = {
        ...user,
        passwordResetCodeHash: '$codehash',
        passwordResetExpiresAt: new Date(Date.now() + 60_000),
      };
      usersRepository.findOne.mockResolvedValue(target);
      (bcrypt.compare as any).mockResolvedValue(true);
      (bcrypt.hash as any).mockResolvedValue('$newhash');
      usersRepository.save.mockResolvedValue(target);

      await service.resetPassword(baseDto);

      expect(target.passwordHash).toBe('$newhash');
      expect(target.passwordResetCodeHash).toBeNull();
      expect(target.passwordResetExpiresAt).toBeNull();
    });

    it('throws when the code is expired', async () => {
      usersRepository.findOne.mockResolvedValue({
        ...user,
        passwordResetCodeHash: '$codehash',
        passwordResetExpiresAt: new Date(Date.now() - 60_000),
      });
      await expect(service.resetPassword(baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when the code does not match', async () => {
      usersRepository.findOne.mockResolvedValue({
        ...user,
        passwordResetCodeHash: '$codehash',
        passwordResetExpiresAt: new Date(Date.now() + 60_000),
      });
      (bcrypt.compare as any).mockResolvedValue(false);
      await expect(service.resetPassword(baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
