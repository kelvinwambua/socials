// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import type { 
  ServerToClientEvents, 
  ClientToServerEvents 
} from '../server/db/schema';

export const useSocket = (roomId: string) => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    const socket = io({
      path: "/api/socket",
      addTrailingSlash: false,
    });

    socketRef.current = socket;

    socket.emit("join-room", roomId);

    return () => {
      if (socket) {
        socket.emit("leave-room", roomId);
        socket.disconnect();
      }
    };
  }, [roomId]);

  return socketRef.current;
};