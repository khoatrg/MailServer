import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getItem, setItem, deleteItem } from '../../utils/secureStore';
import api, { setAuthToken } from '../../api/client';

const TOKEN_KEY = 'mailclient_token';

export const login = createAsyncThunk('auth/login', async ({email, password}, {rejectWithValue}) => {
  try {
    const res = await api.post('/api/auth/login', {email, password});
    return res.data; // expect { token, user }
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const restoreAuth = createAsyncThunk('auth/restore', async (_, {rejectWithValue}) => {
  try {
    const token = await getItem(TOKEN_KEY);
    return { token };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await deleteItem(TOKEN_KEY);
  setAuthToken(null);
  return {};
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null, user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = a.payload.user || null;
        // store token securely
        setItem(TOKEN_KEY, a.payload.token).catch(()=>{});
        setAuthToken(a.payload.token);
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })
  .addCase(restoreAuth.fulfilled, (s, a) => { s.token = a.payload.token; if (a.payload.token) setAuthToken(a.payload.token); })
  .addCase(restoreAuth.rejected, (s, a) => { s.error = a.payload || a.error.message; })
      .addCase(logout.fulfilled, (s) => { s.token = null; s.user = null; });
  }
});

export default authSlice.reducer;
