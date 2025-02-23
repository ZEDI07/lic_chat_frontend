
import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const reducer = {
  addGroup: (state, action) => {
    try {
      const { _id } = action.payload;
      state[_id] = { ...state[_id], ...action.payload };
    } catch (error) {
      console.log("error while add group", error);
    }
  },

  update: (state, action) => {
    try {
      const { group, type } = action.payload;
      switch (type) {
        case "pendingMembers":
          const stateGroup = state[group];
          if (stateGroup) {
            stateGroup.pendingMembers = stateGroup.pendingMembers + action.payload.pendingMembers;
          }
      }
    } catch (error) {
      console.log("error while update group", error);

    }
  },

  updateMember: (state, action) => {
    const { group, user } = action.payload;
    if (!state[group]) return
    const members = state[group].members
    const index = members.findIndex(member => member.user._id == user._id);
    if (index !== -1) {
      members[index].user = user
    }
  }
};

const groupSlice = createSlice({
  name: "groups",
  initialState: initialState,
  reducers: reducer,
});

export const actions = groupSlice.actions;
export default groupSlice.reducer;
