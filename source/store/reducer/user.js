import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const reducer = {
  update: (state, action) => {
    const payload = action.payload;
    state[payload._id] = { ...state[payload._id], ...action.payload };
  }
};

const userSlice = createSlice({
  name: "users",
  initialState: initialState,
  reducers: reducer,
});

export const actions = userSlice.actions;
export default userSlice.reducer;
