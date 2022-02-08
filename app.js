const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Game = require('./game/game');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/scripts/sketchpad.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/sketchpad/scripts/sketchpad.js');
});
app.get('/scripts/initialize.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/sketchpad/scripts/initialize.js');
});

let game = null;
let maxPlayers = 3;

io.on('connection', (socket) => {

  if (game == null) {
    game = new Game(maxPlayers, 4, socket.id);
  }

  if (game.started || game.getCurrentPlayers().length == game.maxPlayers) {
    // game is started, not allowed to join
    socket.emit('already started');
  } else {
    socket.emit('allow join');
    socket.on('submit name', (name) => {
      console.log(name, socket.id);
      game.addPlayer(name, socket.id);
      if (socket.id == game.host) {
        socket.emit('host');
      }
      socket.join('game1');
      io.sockets.in('game1').emit('player list update', game.getCurrentPlayers(), maxPlayers);
      
    });
    socket.on('start game', () => {
      game.startGame();
      console.log(game.getCurrentRound().judge);
      socket.broadcast.to('game1').emit('wait for judge', game.getCurrentRound().judge.name);
      socket.emit('judge prompt');
      console.log(game.getCurrentRound().judge.id);
    });
    socket.on('submit prompt', (text) => {
      console.log(text);
      game.getCurrentRound().prompt = text;
      let round = game.getCurrentRound();
      socket.emit('wait for drawings', text);
      socket.broadcast.to('game1').emit('start round', round.judge, round.prompt);
    });
    socket.on('submit drawing', (drawing) => {
      let round = game.getCurrentRound();
      round.submitDrawing(socket.id, drawing);
      console.log(round.playerCount);
      if (round.playerCount == 1) {
        io.sockets.in('game1').emit('start judgement', round);
      }
    });
    socket.on('choose winner', (winner) => {
      let round = game.getCurrentRound();
      round.pickWinner(winner);
      for (let i = 0; i < game.getCurrentPlayers().length; i++) {
        let user = game.getCurrentPlayers()[i];
        if (user.id == winner) {
          socket.broadcast.to('game1').emit('winner chosen', user);
        }
      }
    });
  }
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});