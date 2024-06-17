import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    value: {
      email: "",
      displayName: "",
      emailVerified: "",
      createdAt: "",
      uid: "",
    }
  },
  reducers: {
    setUser: (state, action) => { return action.payload; },

  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
