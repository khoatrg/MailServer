import mailReducer, { fetchMails, sendMail } from '../src/features/mail/mailSlice';

describe('mail slice reducer', () => {
  const initial = { items: [], loading: false, error: null };

  it('sets loading on fetchMails.pending', () => {
    const next = mailReducer(initial, { type: fetchMails.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('stores items on fetchMails.fulfilled', () => {
    const payload = [{ id: 1, subject: 'hi' }];
    const next = mailReducer(initial, { type: fetchMails.fulfilled.type, payload });
    expect(next.items).toEqual(payload);
    expect(next.loading).toBe(false);
  });

  it('adds new mail on sendMail.fulfilled', () => {
    const state = { items: [{id:2, subject:'old'}], loading: false, error: null };
    const newMsg = { id: 3, subject: 'new' };
    const next = mailReducer(state, { type: sendMail.fulfilled.type, payload: newMsg });
    expect(next.items[0]).toEqual(newMsg);
  });
});
