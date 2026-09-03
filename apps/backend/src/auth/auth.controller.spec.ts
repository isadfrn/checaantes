import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

const tokenResponse = {
  accessToken: 'jwt-token',
  user: { id: 'uuid-1', email: 'a@b.com', role: 'user' },
};

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: vi.fn(),
    login: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('delegates to the service', async () => {
      const dto = { email: 'a@b.com', password: 'secret123' };
      authService.register.mockResolvedValue(tokenResponse);

      await expect(controller.register(dto)).resolves.toEqual(tokenResponse);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('delegates to the service', async () => {
      const dto = { email: 'a@b.com', password: 'secret123' };
      authService.login.mockResolvedValue(tokenResponse);

      await expect(controller.login(dto)).resolves.toEqual(tokenResponse);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });
});
