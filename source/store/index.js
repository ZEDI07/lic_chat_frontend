
import { configureStore } from "@reduxjs/toolkit";
import chatSlice from "./reducer";
import groupSlice from "./reducer/group";
import callSlice from "./reducer/call";

const store = configureStore({
  reducer: {
    chats: chatSlice,
    groups: groupSlice,
    calls: callSlice,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    });
  },
});

export default store;
