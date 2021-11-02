const express = require('express')
const app = express()
const port = 4000
const server = require('http').createServer(app)
const io = require("socket.io")(server,  {cors: {origin: "*" }})
var all_moves_saved = []

const connections = [null, null]
var rooms = {}
var users = []

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

  socket.join(socket.id)

  let thisUser = {id:socket.id,room:null,color:null,all_moves_saved:[],name:null}
  let thisRoom = null

  function checkRivalConnected(thisUser, thisRoom){
    var connectedUsers = users.filter(obj => {return obj.room === thisRoom}).length
    return connectedUsers
  }

  function setNames(thisRoom){
      var connectedUsers = users.filter(obj => {return obj.room === thisRoom})
      let white_name = ''
      let black_name = ''
      for (var i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].color == 'white'){
          white_name = connectedUsers[i].name
        } else if (connectedUsers[i].color == 'black'){
          black_name = connectedUsers[i].name
        }
      }
      socket.broadcast.to(thisRoom).emit('setNames',white_name,black_name)
  }

  socket.on('askRivalName', () => {
    socket.broadcast.to(thisUser.room).emit('getRivalName')
  })

  socket.on('setRivalName', (name) => {
    socket.broadcast.to(thisUser.room).emit('setRivalName2', name)
  })  

  socket.on('restart',() => {

    for (var i in users) {
        if ((users[i].color == 'white')&&(users[i].room == thisUser.room)){
          socket.broadcast.to(users[i].id).emit('restartGame')
          socket.broadcast.to(users[i].id).emit('player-color', 1);
          users[i].color = 'black'
          console.log('1')
        } else if ((users[i].color == 'black')&&(users[i].room == thisUser.room)){
          socket.broadcast.to(users[i].id).emit('restartGame')
          socket.broadcast.to(users[i].id).emit('player-color', 0);
          users[i].color = 'white'
          console.log('2')
        } 
    }

    socket.emit('restartGame')


    rooms[thisRoom] = []


  })

  socket.on('joinRoom', (room) => {

    thisUser = {id:socket.id,room:room,color:null,all_moves_saved:[],name:null}

    socket.join(room)

    thisRoom = room

    if (!(room in rooms)){
      rooms[room] = []
    } else {
      socket.emit('updateAllMoves',rooms[room])
    }

    let options = ['white','black']

    for (var i in users) {
      if (users[i].room == thisUser.room && users[i].color !== 'spectator') {
        if (users[i].color == 'white'){
          options.splice(options.indexOf('white'),1)
        } else if (users[i].color == 'black'){
          options.splice(options.indexOf('black'),1)
        }
      }
    }


    // console.log(options)

    if (options.length == 0){
        // socket.emit('player-color', 2);
        // thisUser.color = 'spectator'
        socket.emit('kick')
        return false
    } else if (options[0] == 'white') {
        socket.emit('player-color', 0);
        thisUser.color = 'white'
    } else if (options[0] == 'black'){
        socket.emit('player-color', 1);
        thisUser.color = 'black'
    } else {return false}

    users.push(thisUser)

  // console.log(users)
  console.log(`Player ${thisUser.color} Connected`);

  if (checkRivalConnected(thisUser, thisRoom) < 2){
    socket.emit('waitingForRival')
    console.log('here')
  } else {
    socket.broadcast.to(thisUser.room).emit('rivalConnected')
  }

  })

  socket.on('setName', (name, color) => {
    // users = users.filter(function(value, index, arr){ 
    //       return value.id == socket.id;
    //   })[0].name = name
    socket.broadcast.to(thisUser.room).emit('setNames',name,color)

  })

  socket.on('disconnect', function() {
    socket.broadcast.to(thisUser.room).emit('waitingForRival')
    thisUser = thisUser
    console.log(`Player ${thisUser.color} Disconnected`);

    users = users.filter(function(value, index, arr){ 
          return value.id !== socket.id;
      });


  });


	socket.on('pieceMoved', (origin,target,id,all_moves) => {
    console.log(users)


  		socket.broadcast.to(thisUser.room).emit('updateMove',origin,target,id, all_moves)


      rooms[thisRoom] = all_moves

		
	})


})

