import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { UserRole } from '../entities/user.entity.js';

function createContext(user?: any) {
  const request = { user };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };
}

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  let guard: RolesGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows access when no roles are defined', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(createContext() as any)).toBe(true);
  });

  it('allows access when roles array is empty', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    expect(guard.canActivate(createContext() as any)).toBe(true);
  });

  it('allows access when user has the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const ctx = createContext({ role: UserRole.ADMIN });
    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('throws ForbiddenException when user lacks the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const ctx = createContext({ role: UserRole.USER });
    expect(() => guard.canActivate(ctx as any)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when there is no user', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const ctx = createContext(undefined);
    expect(() => guard.canActivate(ctx as any)).toThrow(ForbiddenException);
  });
});
