import authReducer, { login, restoreAuth, logout } from '../src/features/auth/authSlice';

describe('auth slice reducer', () => {
  const initial = { token: null, user: null, loading: false, error: null };

  it('handles login.pending', () => {
    const next = authReducer(initial, { type: login.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('stores token on login.fulfilled', () => {
    const payload = { token: 'abc', user: { id:1 } };
    const next = authReducer(initial, { type: login.fulfilled.type, payload });
    expect(next.token).toBe('abc');
    expect(next.user).toEqual({ id:1 });
  });

  it('clears token on logout.fulfilled', () => {
    const state = { token: 'abc', user: { id:1 }, loading:false, error:null };
    const next = authReducer(state, { type: logout.fulfilled.type });
    expect(next.token).toBeNull();
    expect(next.user).toBeNull();
  });
});
