import { configureStore } from '@reduxjs/toolkit';
import mailReducer from '../features/mail/mailSlice';
import authReducer from '../features/auth/authSlice';
import { register401Handler } from '../api/client';
import { logout } from '../features/auth/authSlice';

const store = configureStore({
  reducer: {
    mail: mailReducer,
    auth: authReducer,
  },
});

// register a 401 handler that dispatches logout — keeps client decoupled from store
register401Handler(() => {
  try {
    store.dispatch(logout());
  } catch (e) {
    // noop
  }
});

export default store;
