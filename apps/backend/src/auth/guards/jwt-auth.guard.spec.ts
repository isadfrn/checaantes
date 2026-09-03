import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';

function createContext(headers: Record<string, string> = {}) {
  const request = { headers, user: undefined as any };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    request,
  };
}

describe('JwtAuthGuard', () => {
  const jwtService = { verify: vi.fn() };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new JwtAuthGuard(jwtService as any);
  });

  it('throws when authorization header is missing', async () => {
    const ctx = createContext();
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws when format is not Bearer', async () => {
    const ctx = createContext({ authorization: 'Basic abc' });
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws when token verification fails', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid');
    });
    const ctx = createContext({ authorization: 'Bearer bad-token' });
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('returns true and sets request.user on valid token', async () => {
    const payload = { sub: 'uuid-1', email: 'a@b.com', role: 'user' };
    jwtService.verify.mockReturnValue(payload);
    const ctx = createContext({ authorization: 'Bearer good-token' });

    await expect(guard.canActivate(ctx as any)).resolves.toBe(true);
    expect(ctx.request.user).toEqual(payload);
    expect(jwtService.verify).toHaveBeenCalledWith('good-token');
  });
});
