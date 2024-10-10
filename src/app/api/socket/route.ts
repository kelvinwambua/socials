import { Server as SocketIOServer } from 'socket.io'
import type { NextApiResponse } from 'next'
import type { NextRequest } from 'next/server'
import type { Server as HttpServer } from 'http'

interface SocketServer extends HttpServer {
  io?: SocketIOServer;
}

const ioHandler = (req: NextRequest, res: NextApiResponse & { socket: { server: SocketServer } }) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')

    const io = new SocketIOServer(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      socket.on('join-conversation', (conversationId: string) => {
        void socket.join(conversationId)
      })

      socket.on('send-message', (message: unknown, conversationId: string) => {
        io.to(conversationId).emit('receive-message', message)
      })
    })
  }
  res.end()
}

export const GET = ioHandler
export const POST = ioHandler