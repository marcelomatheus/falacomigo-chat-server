import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageEntity } from './entities/message.entity';

interface Message {
  socketId: string;
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  constructor() {}
  private connection: string[] = [];
  private messages: Message[] = [];
  afterInit() {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.messages.push({
      socketId: client.id,
      userId: client.handshake.query.userId as string,
    });
    console.log('Client connected:', client.handshake.query.userId as string);
  }
  handleDisconnect(client: Socket) {
    this.messages = this.messages.filter((msg) => msg.socketId !== client.id);
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, payload: MessageEntity) {
    console.log('Message received from', client.id, ':', payload);
    const user = this.messages.find((msg) => msg.userId === payload.to);
    console.log('Sending message to:', user);
    this.server
      .to(String(user?.socketId))
      .emit('receiveMessage', payload.content);
  }
}
