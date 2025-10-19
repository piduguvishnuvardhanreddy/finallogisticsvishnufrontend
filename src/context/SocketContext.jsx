import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("https://finallogisticsvishnubackend.onrender.com");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to socket server:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
