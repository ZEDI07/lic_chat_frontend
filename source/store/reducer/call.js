import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: {},
    lastCall: "",
    more: false,
    fetched: false
};

const reducer = {
    addCall: (state, action) => {
        try {
            const { channel } = action.payload;
            state.data[channel] = { ...state.data[channel], ...action.payload };
        } catch (error) {
            console.log("error while add group", error);
        }
    },

    updateCall: (state, action) => {
        try {
            const { channel } = action.payload;
            delete action.payload.chat;
            if (state.data[channel])
                state.data[channel] = { ...state.data[channel], ...action.payload };
        } catch (error) {
            console.log("error while add group", error);
        }
    },

    update: (state, action) => {
        try {
            const { lastCall, more, fetched } = action.payload;
            state.lastCall = lastCall;
            state.more = more;
            state.fetched = fetched;
        } catch (error) {
            console.log("error while updating call", error)
        }
    },
};

const callSlice = createSlice({
    name: "calls",
    initialState: initialState,
    reducers: reducer,
});

export const actions = callSlice.actions;
export default callSlice.reducer;
