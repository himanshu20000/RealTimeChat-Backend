const mongoose = require('mongoose');
const User = require('../Models/Users/UserModals');
const Message = require('../Models/Message/MessageModals');
const admin = require('firebase-admin'); 
const {sendPushNotification} = require('../notification/fcmNotification');

const chatSocket = (io) => {
  const roomParticipants = {};
  const socketToUsername = {}; 

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

   
    socket.on('createOrJoinRoom', async (roomId, username, fcmToken) => {
      try {
        console.log(`Username is ${username}`);
        const user = await User.findOne({ username });

        if (!user) {
          return socket.emit('error', { message: 'User not found' });
        }

        if (!user.fcmTokens) {
          user.fcmTokens = [];
        }

        if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
          user.fcmTokens.push(fcmToken);
          await user.save(); 
        }

        socketToUsername[socket.id] = username;

        if (roomParticipants[roomId]) {
          if (roomParticipants[roomId].length < 2) {
            socket.join(roomId);
            roomParticipants[roomId].push(socket.id);
            console.log(`User ${socket.id} joined room: ${roomId}`);

            io.to(roomId).emit('roomJoined', { roomId });
          } else {
            socket.emit('error', { message: 'Room is full, cannot join.' });
          }
        } else {
          socket.join(roomId);
          roomParticipants[roomId] = [socket.id];
          console.log(`Room created: ${roomId} by ${socket.id}`);

          socket.emit('roomCreated', { roomId });
        }
      } catch (err) {
        console.error('Error in createOrJoinRoom:', err);
        socket.emit('error', { message: 'An error occurred while joining the room.' });
      }
    });

    socket.on('sendMessage', async ({ room, message, sender }) => {
      if (!sender) {
        return console.error("Sender is required for the message.");
      }

      try {
        const newMessage = new Message({ room, sender, message });
        await newMessage.save();

        const participants = roomParticipants[room];
        const receiverSocketId = participants.find(id => id !== socket.id); 

        if (!receiverSocketId) {
          return console.error("Receiver not found in the room.");
        }

        console.log(`Message from ${sender} sent to receiver with socket id: ${receiverSocketId}`);

        io.to(room).emit('receiveMessage', { sender, message });

        const receiverUsername = socketToUsername[receiverSocketId];
        if (!receiverUsername) {
          return console.error("Receiver username not found for socket.id");
        }

        const receiver = await User.findOne({ username: receiverUsername });

        if (receiver && receiver.fcmTokens && receiver.fcmTokens.length > 0) {
          sendPushNotification(receiver.fcmTokens, `${sender} sent you a message`, message);
          console.log(`Push notification sent to ${receiver.username}`);
        } else {
          console.log(`Receiver ${receiverUsername} does not have FCM tokens.`);
        }

        console.log(`Message sent to room ${room}: ${message}`);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      for (const roomId in roomParticipants) {
        const index = roomParticipants[roomId].indexOf(socket.id);
        if (index !== -1) {
          roomParticipants[roomId].splice(index, 1);
          console.log(`User ${socket.id} removed from room: ${roomId}`);
        }
      }

      delete socketToUsername[socket.id];
    });
  });
};

module.exports = chatSocket;
