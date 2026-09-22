import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { UsersService } from './users.service.js';
import { User, UserRole } from '../auth/entities/user.entity.js';
import { MailService } from '../mail/mail.service.js';
import { StorageService } from '../storage/storage.service.js';

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn(), compare: vi.fn() },
}));

const user: User = {
  id: 'uuid-1',
  name: 'Fulana',
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

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = { findOne: vi.fn(), save: vi.fn() };
  const mailService = {
    sendEmailChangeConfirmation: vi.fn().mockResolvedValue(undefined),
  };
  const storageService = { save: vi.fn(), remove: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: MailService, useValue: mailService },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  describe('getProfile', () => {
    it('returns a sanitized profile view (no passwordHash)', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      const view = await service.getProfile(user.id);
      expect(view).not.toHaveProperty('passwordHash');
      expect(view.email).toBe(user.email);
    });
  });

  describe('updateProfile', () => {
    it('updates only provided fields', async () => {
      const target = { ...user };
      usersRepository.findOne.mockResolvedValue(target);
      usersRepository.save.mockResolvedValue(target);
      await service.updateProfile(user.id, { phone: '11888887777' });
      expect(target.phone).toBe('11888887777');
      expect(target.name).toBe(user.name);
    });
  });

  describe('changePassword', () => {
    it('rejects a wrong current password', async () => {
      usersRepository.findOne.mockResolvedValue({ ...user });
      (bcrypt.compare as any).mockResolvedValue(false);
      await expect(
        service.changePassword(user.id, {
          currentPassword: 'x',
          password: 'novaSenha123',
          passwordConfirmation: 'novaSenha123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('changes the password when the current one matches', async () => {
      const target = { ...user };
      usersRepository.findOne.mockResolvedValue(target);
      (bcrypt.compare as any).mockResolvedValue(true);
      (bcrypt.hash as any).mockResolvedValue('$newhash');
      usersRepository.save.mockResolvedValue(target);
      await service.changePassword(user.id, {
        currentPassword: 'ok',
        password: 'novaSenha123',
        passwordConfirmation: 'novaSenha123',
      });
      expect(target.passwordHash).toBe('$newhash');
    });
  });

  describe('requestEmailChange', () => {
    it('rejects an email already in use', async () => {
      usersRepository.findOne
        .mockResolvedValueOnce({ ...user })
        .mockResolvedValueOnce({ id: 'other' });
      await expect(
        service.requestEmailChange(user.id, { email: 'taken@b.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects changing to the same email', async () => {
      usersRepository.findOne.mockResolvedValueOnce({ ...user });
      await expect(
        service.requestEmailChange(user.id, { email: user.email }),
      ).rejects.toThrow(BadRequestException);
    });

    it('sets pendingEmail and sends confirmation to the new address', async () => {
      const target = { ...user };
      usersRepository.findOne
        .mockResolvedValueOnce(target)
        .mockResolvedValueOnce(null);
      usersRepository.save.mockResolvedValue(target);
      await service.requestEmailChange(user.id, { email: 'new@b.com' });
      expect(target.pendingEmail).toBe('new@b.com');
      expect(target.emailConfirmationToken).toBeTruthy();
      expect(mailService.sendEmailChangeConfirmation).toHaveBeenCalled();
    });
  });

  describe('updateAvatar', () => {
    it('saves the new file, stores the url and removes the previous avatar', async () => {
      const target = { ...user, avatarUrl: 'http://x/uploads/avatars/old.png' };
      usersRepository.findOne.mockResolvedValue(target);
      usersRepository.save.mockResolvedValue(target);
      storageService.save.mockResolvedValue(
        'http://x/uploads/avatars/new.png',
      );

      const result = await service.updateAvatar(user.id, {
        buffer: Buffer.from('img'),
        originalName: 'a.png',
        mimeType: 'image/png',
      });

      expect(storageService.save).toHaveBeenCalled();
      expect(target.avatarUrl).toBe('http://x/uploads/avatars/new.png');
      expect(storageService.remove).toHaveBeenCalledWith(
        'http://x/uploads/avatars/old.png',
      );
      expect(result.avatarUrl).toBe('http://x/uploads/avatars/new.png');
    });
  });
});
