const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoDbConnect = require('./DatabaseConfig/mongoDb');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const chatSocket = require('./sockets/chatsRoomSocket');
const port = process.env.PORT || 3000;

mongoDbConnect();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth',authRoutes);
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the server</h1>');
});

chatSocket(io);

server.listen(port, '0.0.0.0', ()=>{
  console.log(`Server started and running on port ${port}`);
  });

