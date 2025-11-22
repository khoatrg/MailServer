import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const fetchMails = createAsyncThunk('mail/fetchMails', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/messages');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const sendMail = createAsyncThunk('mail/sendMail', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/messages', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const mailSlice = createSlice({
  name: 'mail',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMails.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMails.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchMails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(sendMail.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendMail.fulfilled, (state, action) => { state.loading = false; state.items.unshift(action.payload); })
      .addCase(sendMail.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default mailSlice.reducer;
