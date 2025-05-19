var PORT = process.env.PORT || 3000;
var __express = require('express');
var app = __express();
var __http = require('http').Server(app);
var io = require('socket.io')(__http);
var __moment = require('moment');
var clientInfo = {};

app.use(__express.static(__dirname + '/public'));

/**
 * Send a list of users currently in the same room as the given socket.
 *
 * @param {Socket} socket 
 */
function sendCurrentUsers(socket) {
  const requester = clientInfo[socket.id];
  if (!requester) return;           

  // Collect the names of all clients in the same room.
  const usersInRoom = Object.values(clientInfo)
    .filter(({ room }) => room === requester.room)
    .map(({ name }) => name);

  socket.emit('message', {
    name: 'JohnDoe',
    text: `Current users: ${usersInRoom.join(', ')}`,
    timeStamp: __moment().valueOf()
  });
}


io.on('connection', function(socket) {
    console.log("USER CONNECTED via SOCKET");
    
    socket.on('disconnect', function() {
        if(typeof clientInfo[socket.id] !== 'undefined') {
            socket.leave(clientInfo[socket.id].room);
            io.to(clientInfo[socket.id].room).emit('message', {
                name: 'JohnDoe',
                text: clientInfo[socket.id].name + ' has left!',
                timeStamp: __moment().valueOf()
            });
            delete clientInfo[socket.id];
        }
    });
    socket.on('joinRoom', function(request) {
        clientInfo[socket.id] = request;
        socket.join(request.room);
        console.log(clientInfo[socket.id].room);
        socket.broadcast.to(request.room).emit('message', {
            name: 'JohnDoe',
            text: request.name + ' has joined!',
            timeStamp: __moment().valueOf()
        });
    });
    
    // Handle an incoming chat message from this socket
    socket.on('message', msg => {
        msg.timeStamp = Date.now();
        if (msg.text === '@currentUsers') {
            sendCurrentUsers(socket);             
            return;
        }
        const { room } = clientInfo[socket.id] || {};
        if (!room) {
            console.warn(`No room for socket ${socket.id}; message ignored`);
            return;
        }
        console.log(`Message received from ${socket.id}: ${msg.text}`);
        io.to(room).emit('message', msg);        
    });

    socket.emit('message', {
        name: 'JohnDoe',
        text: "Hello from the server's side",
        timeStamp: Date.now()          
    });

});

__http.listen(PORT, function() {
    console.log("SERVER STARTED");
});