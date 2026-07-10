import { io } from 'socket.io-client';

// One shared connection for the whole app
const socket = io('https://vantara-backend-cwtf.onrender.com');

export default socket;