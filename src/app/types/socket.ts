import type { Message } from '../../server/db/schema'

export interface ServerToClientEvents {
  'receive-message': (event: MessageEvent) => void;
  'typing-status': (conversationId: number, userId: string, typing: boolean) => void;
}

export interface ClientToServerEvents {
  'join-room': (roomId: string) => void;
  'leave-room': (roomId: string) => void;
  'send-message': (event: MessageEvent) => void;
  'typing': (conversationId: number, typing: boolean) => void;
}

export interface MessageEvent {
  type: 'send';
  message: Message;
  conversationId: number;
}