import { beforeEach, describe, expect, it } from 'vitest';
import {
  getDemoCurrentUser,
  loginWithDemoAccount,
  logoutDemoAccount,
} from './demoAuth';

describe('demo authentication', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('authenticates the documented admin demo account', async () => {
    const result = await loginWithDemoAccount({
      username: 'admin',
      password: 'ant.design',
      type: 'account',
    });

    expect(result).toEqual(
      expect.objectContaining({ status: 'ok', currentAuthority: 'admin' }),
    );
    expect(getDemoCurrentUser()).toEqual(
      expect.objectContaining({ name: 'Nora Liu', access: 'admin' }),
    );
  });

  it('rejects invalid credentials without creating a session', async () => {
    const result = await loginWithDemoAccount({
      username: 'admin',
      password: 'incorrect',
      type: 'account',
    });

    expect(result.status).toBe('error');
    expect(getDemoCurrentUser()).toBeUndefined();
  });

  it('clears the persisted demo session on logout', async () => {
    await loginWithDemoAccount({
      username: 'admin',
      password: 'ant.design',
      type: 'account',
    });

    logoutDemoAccount();

    expect(getDemoCurrentUser()).toBeUndefined();
  });
});
