
import { createContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { useDispatch } from "react-redux";
import { RUN_MODE, RUN_MODES } from "../constant";
import Login from "../pages/login";
import { clearOpens } from "../store/reducer";
import axiosInstance from "../utils/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children, clientToken, client, setCall }) => {
  const dispatch = useDispatch();
  const [USER_ID, SET_USER_ID] = useState();
  const [token, setToken] = useState(token);
  const [user, setUser] = useState();
  const [groupJoinDialog, setGroupJoinDialog] = useState();

  useEffect(() => {
    if (Platform.OS == "web") {
      if (RUN_MODE == RUN_MODES.SCRIPT) {
        window.dispatchEvent(new CustomEvent("script", {
          detail: { type: "auth" },
        }));
        const handleMessage = (event) => {
          if (event.detail.type == "auth" && event.detail.auth) {
            const { auth_user: user, token } = event.detail;
            if (user) {
              SET_USER_ID(user._id);
              setToken(token);
              setUser(user);
            }
          };
        }
        window.addEventListener('circuit_chat', handleMessage);
        return () => {
          window.removeEventListener('circuit_chat', handleMessage);
        }
      } else {
        window.top.postMessage("circuitChatDefaultParams", "*");
        window.addEventListener(
          "message",
          (event) => {
            if (event.data.type == "circuitChat") {
              const { user, token, groupJoin, call } = event.data;
              if (!user || !token) {
                console.log("user credentials invalid", user, token);
                return;
              }
              const localuser = localStorage.getItem("user");
              if (localuser != user._id) {
                localStorage.clear();
                dispatch(clearOpens());
                localStorage.setItem("user", user._id);
              }
              SET_USER_ID(user._id);
              setToken(token);
              setUser(user);
              if (groupJoin) setGroupJoinDialog(groupJoin);
              if (call) {
                setCall(call)
              }
            }
          },
          false
        );
      }
    } else {
      SET_USER_ID(client?._id);
      setToken(clientToken);
      setUser(client);
    }
  }, []);

  if (USER_ID && token && user) {
    axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + token;
    return (
      <AuthContext.Provider
        value={{
          USER_ID,
          token,
          user,
          setToken,
          SET_USER_ID,
          setUser,
          groupJoinDialog,
          setGroupJoinDialog,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  } else {
    return null;
  }
}; 
