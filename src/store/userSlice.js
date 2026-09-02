import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: "",
  displayName: "",
  emailVerified: "",
  createdAt: "",
  uid: "",
  settings: null,
  contacts: [],
  profilePic: ""
};
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => { return action.payload; },

    updateUser: (state, action) => {
      return {
        ...state,
        ...action.payload
      };
    },
    resetUser: () => {
      return initialState;
    }
  },
});

export const { setUser, updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
