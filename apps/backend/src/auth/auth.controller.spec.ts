import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: vi.fn(),
    login: vi.fn(),
    confirmEmail: vi.fn(),
    resendConfirmation: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
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

  it('register delegates to the service', async () => {
    const dto = {
      name: 'Fulana',
      email: 'a@b.com',
      phone: '48999999999',
      state: 'SC',
      professionId: 'prof-1',
      password: 'secret123',
      passwordConfirmation: 'secret123',
    };
    const response = { message: 'Conta criada.' };
    authService.register.mockResolvedValue(response);
    await expect(controller.register(dto)).resolves.toEqual(response);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('login delegates to the service', async () => {
    const dto = { email: 'a@b.com', password: 'secret123' };
    authService.login.mockResolvedValue({ accessToken: 'jwt' });
    await expect(controller.login(dto)).resolves.toEqual({ accessToken: 'jwt' });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('confirm delegates the token to the service', async () => {
    authService.confirmEmail.mockResolvedValue({ message: 'ok' });
    await expect(controller.confirm({ token: 'tok' })).resolves.toEqual({
      message: 'ok',
    });
    expect(authService.confirmEmail).toHaveBeenCalledWith('tok');
  });

  it('resendConfirmation delegates the email to the service', async () => {
    authService.resendConfirmation.mockResolvedValue({ message: 'ok' });
    await expect(
      controller.resendConfirmation({ email: 'a@b.com' }),
    ).resolves.toEqual({ message: 'ok' });
    expect(authService.resendConfirmation).toHaveBeenCalledWith('a@b.com');
  });

  it('forgotPassword delegates to the service', async () => {
    const dto = { email: 'a@b.com' };
    authService.forgotPassword.mockResolvedValue({ message: 'ok' });
    await expect(controller.forgotPassword(dto)).resolves.toEqual({
      message: 'ok',
    });
    expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
  });

  it('resetPassword delegates to the service', async () => {
    const dto = {
      email: 'a@b.com',
      code: '123456',
      password: 'novaSenha123',
      passwordConfirmation: 'novaSenha123',
    };
    authService.resetPassword.mockResolvedValue({ message: 'ok' });
    await expect(controller.resetPassword(dto)).resolves.toEqual({
      message: 'ok',
    });
    expect(authService.resetPassword).toHaveBeenCalledWith(dto);
  });
});
