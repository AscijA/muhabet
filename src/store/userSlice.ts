import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';

export interface UserState extends User {
  displayName: string;
  emailVerified: string | boolean;
  createdAt: string | number;
  settings: any | null;
}

const initialState: UserState = {
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
    setUser: (state, action: PayloadAction<UserState>) => { return action.payload; },

    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
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
