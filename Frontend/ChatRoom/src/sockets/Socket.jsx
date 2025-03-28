import { io } from "socket.io-client";
import React, { useContext, useMemo } from "react";
// "undefined" means the URL will be computed from the `window.location` object
// const URL =
//   process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
const SocketContext = React.createContext();
export const useSocket = () => useContext(SocketContext);
export const Socket = (prop) => {
  const socket = useMemo(() => io("http://localhost:3001"), []);
  return <SocketContext value={{ socket }}>{prop.children}</SocketContext>;
};
