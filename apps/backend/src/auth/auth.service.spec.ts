import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import { User, UserRole } from './entities/user.entity.js';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

const user: User = {
  id: 'uuid-1',
  email: 'a@b.com',
  passwordHash: '$hash',
  role: UserRole.USER,
  createdAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  const usersRepository = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const jwtService = {
    sign: vi.fn().mockReturnValue('jwt-token'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = { email: 'a@b.com', password: 'secret123' };

    it('registers a new user and returns a token', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('$hash');
      usersRepository.create.mockReturnValue(user);
      usersRepository.save.mockResolvedValue(user);

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(usersRepository.create).toHaveBeenCalledWith({
        email: dto.email,
        passwordHash: '$hash',
      });
      expect(usersRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: { id: user.id, email: user.email, role: user.role },
      });
    });

    it('throws ConflictException when email already exists', async () => {
      usersRepository.findOne.mockResolvedValue(user);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const dto = { email: 'a@b.com', password: 'secret123' };

    it('logs in with valid credentials', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.passwordHash);
      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: { id: user.id, email: user.email, role: user.role },
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
  });
});
