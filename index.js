const express = require('express')
const app = express()
const port = 3000
const server = require('http').createServer(app)
const io = require("socket.io")(server,  {cors: {origin: "*" }})
var all_moves_saved = []

const connections = [null, null]

app.set('view engine','ejs')

app.use(express.static('public'))
app.use(express.static('node-modules'))

app.use('/node-modules', express.static(__dirname + '/node_modules/'));

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/multiplayer', (req, res) => {
	// console.log(req.query.room)
  res.render('index',{lolo:req.query.room})
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


io.on('connection', (socket) => {

  let currentRoom


  // Find an available player number

  socket.on('joinRoom', function(room) {
    socket.join(room);
    currentRoom = room
    socket.broadcast.to(room).emit('updateAllMoves',all_moves_saved)
  });

  let playerIndex = -1;
  for (var i in connections) {
    if (connections[i] === null) {
      playerIndex = i;
    }
  }


  // Tell the connecting client what player number they are
  socket.emit('player-color', playerIndex);
  
  // Ignore player 3
  if (playerIndex == -1) return;
  
  connections[playerIndex] = socket;
  
  // Tell everyone else what player number just connected
  socket.broadcast.emit('player-connect', playerIndex);

  socket.on('disconnect', function() {
    console.log(`Player ${playerIndex} Disconnected`);
    connections[playerIndex] = null;

    if (!connections[0] && !connections[1]){all_moves_saved = []}
  });


	socket.on('pieceMoved', (origin,target,id,all_moves) => {

    socket.broadcast.to('tito').emit('updateMove',origin,target,id, all_moves)
		// socket.broadcast.emit('updateMove',origin,target,id, all_moves)

		all_moves_saved = all_moves

		
	})


})

