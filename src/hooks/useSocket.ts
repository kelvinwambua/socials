import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = (roomId: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      path: "/api/socket",
      addTrailingSlash: false,
    });

    socketRef.current = socket;

    socket.emit("join-room", roomId);

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return socketRef.current;
};