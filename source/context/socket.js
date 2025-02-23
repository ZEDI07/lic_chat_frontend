/* eslint-disable react-hooks/exhaustive-deps */


// SocketContext.js
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "../constant";
import { AuthContext } from "./auth";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [socketConn, setSocketConnection] = useState();

  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const socket = io(`${BASE_URL}`, {
     transports: ["websocket"],
     auth: {
       token: token,
     }
    });
    setSocketConnection(socket);

    socket.on("connect", () => {
      console.log("Connected to Server :", socket.connected);
      setConnected(true)
    });

    socket.on("disconnected", () => {
      console.log("Disconnected From server");
      setConnected(false)
    });

    socket.on("error", () => {
      console.log("Error while connection", socket.connected);
      setConnected(false)

    });

    socket.on("connect_error", (error) => {
      console.log("connect_error >>>", error);
      setConnected(false)
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (socketConn)
    return (
      <SocketContext.Provider value={socketConn}>{children}</SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
