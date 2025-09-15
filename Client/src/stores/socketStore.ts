import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null as Socket | null,
    messageSocket: null as Socket | null,
    notificationSocket: null as Socket | null,
    userId: undefined as string | undefined,
    accessToken: undefined as string | undefined,
  }),
  actions: {
    connect(token: string, userId: string) {
      this.accessToken = token;
      this.userId = userId;

      // WebSocket cho messages
      this.messageSocket = io('http://localhost', {
        path: '/message-gateway/socket.io/',
        transports: ['websocket', 'polling'],
        auth: { token: `Bearer ${token}` },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // this.messageSocket = io('http://localhost:3080', {
      //   auth: { token: `Bearer ${token}` },
      //   path: '/message-gateway/',
      // });

      this.messageSocket.on('connect', () => {
        console.log(`Kết nối socket tới message thành công: ${token}`);
      });

      this.messageSocket.on('connect_error', (err: any) => {
        console.log('Kết nối socket tới message lỗi:', err);
      });

      this.messageSocket.on('disconnect', () => {
        console.log('Socket đã mất kết nối tới message');
      });

      // Notification Gateway
      this.notificationSocket = io('http://localhost', {
        path: '/notification-gateway/socket.io/',
        transports: ['websocket', 'polling'],
        auth: { token: `Bearer ${token}` },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });


      // this.notificationSocket = io('http://localhost:3060', {
      //   auth: { token: `Bearer ${token}` },
      //   path: '/notification-gateway/',
      // });

      this.notificationSocket.on('connect', () => {
        console.log(`Kết nối socket tới notification thành công: ${token}`);
      });

      this.notificationSocket.on('connect_error', (err: any) => {
        console.log('Kết nối tới notification socket lỗi:', err);
      });

      this.notificationSocket.on('disconnect', () => {
        console.log('Socket notification đã mất kết nối');
      });

      // this.notificationSocket.on('notification', (data) => {
      //   if (this.userId) {
      //     alert(data.content);
      //   }
      // });
    },

    disconnect() {
      this.socket?.disconnect();
      this.socket = null;
      this.userId = undefined;
      this.accessToken = undefined;
    },
  },
});
