import io from 'socket.io-client';

// const SERVER_URL = 'http://10.0.2.2:3001'; // Or use 'https://prokutumb.com' for deployed
const SERVER_URL = 'https://prokutumb.com'; // Or use 'https://prokutumb.com' for deployed

const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket'],
  upgrade: false,
});

export const connectSocket = () => {
  console.log('Attempting to connect socket...');
  if (!socket) {
    socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
  }

  // socket.on('connect_error', error => {
  //   console.log('Connection Error:', error);
  // });
};

// Function to disconnect from the server
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('Socket disconnected');
  }
};

// Export the socket instance and connection functions
export default socket;
