import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('issues tokens', async () => {
    process.env.JWT_ACCESS_SECRET = 'accesssecretaccesssecret';
    process.env.JWT_REFRESH_SECRET = 'refreshsecretrefreshsecret';
    process.env.JWT_ACCESS_TTL_SEC = '60';
    process.env.JWT_REFRESH_TTL_SEC = '3600';
    const jwtService = { signAsync: async () => 'token' } as any;
    const usersService = {
      findByEmail: async () => null,
      create: async () => ({ id: 'u1', role: 'customer' }),
      saveRefreshToken: async () => ({}),
    } as any;
    const svc = new AuthService(jwtService, usersService, {} as any);
    const out = await svc.register({ name: 'N', email: 'e@e.com', phone: '9999999999', password: 'p' });
    expect(out.accessToken).toBeDefined();
    expect(out.refreshToken).toBeDefined();
  });
});
