const express = require('express')
const app = express()
const port = 3000
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


  let thisUser = {id:socket.id,room:null,color:null,all_moves_saved:[]}
  let thisRoom = null



  socket.on('joinRoom', (room) => {

    thisUser = {id:socket.id,room:room,color:null,all_moves_saved:[]}

    users.push(thisUser)

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
        socket.emit('player-color', 2);
        thisUser.color = 'spectator'
    } else if (options[0] == 'white') {
        socket.emit('player-color', 0);
        thisUser.color = 'white'
    } else if (options[0] == 'black'){
        socket.emit('player-color', 1);
        thisUser.color = 'black'
    } else {return false}


  // console.log(users)
  console.log(`Player ${thisUser.color} Connected`);


    // let largestMovesSaved = []
    // let all_moves_all_players = []

    // console.log(users)

    // try {

    //         all_moves_all_players = users.map((user) => {
    //           if (user.room == thisUser.room){
    //             if (user.all_moves_saved !== undefined){
    //               return user.all_moves_saved
    //             } else {
    //               return []
    //             }
    //           }
    //         })


    //         largestMovesSaved = all_moves_all_players.reduce((maxI,el,i,arr) => 
    //             (el.length>arr[maxI].length) ? i : maxI, 0);

    //         socket.emit('updateAllMoves',all_moves_all_players[largestMovesSaved])
    // } catch (err){
    //   console.log(all_moves_all_players)
    //   console.log(err)
    // }



  })



  // const keys = Object.keys(rooms);

  // keys.forEach((key, index) => {
  //   console.log(rooms[key])
  //     if(socket.id in rooms[key].players){
  //       console.log(`The room is ${key}!!!`)
  //     }




  // let all_moves_all_players = users.filter((user) => {
  //   if (user.room == thisUser.room){
  //     return user.all_moves_saved
  //   }
  // })




 //  largestMovesSaved = all_moves_all_players.reduce((maxI,el,i,arr) => 
 //      (el.length>arr[maxI].length) ? i : maxI, 0);

 //  console.log(all_moves_all_players)



	// socket.emit('updateAllMoves',largestMovesSaved)





  // Tell the connecting client what player number they are
  // socket.emit('player-color', playerIndex);
  
  

  socket.on('disconnect', function() {
    thisUser = thisUser
    console.log(`Player ${thisUser.color} Disconnected`);

    users = users.filter(function(value, index, arr){ 
          return value.id !== socket.id;
      });


  });


	socket.on('pieceMoved', (origin,target,id,all_moves) => {


      // socket.to('tito').broadcast.emit('updateMove',origin,target,id, all_moves)
  		socket.broadcast.to(thisUser.room).emit('updateMove',origin,target,id, all_moves)

      // for (var i = 0; i < users.length; i++) {
      //   if (users[i].id == thisUser.id ){
      //     users[i].all_moves_saved = all_moves
      //   }
      // }

      rooms[thisRoom] = all_moves

		
	})


})

