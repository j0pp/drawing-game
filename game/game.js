class Game {
  constructor(maxPlayers, numRounds, host) {
    this.host = host;
    this.maxPlayers = maxPlayers;
    this.rounds = [];
    this.currentRound = 0;
    this.numRounds = numRounds;
    this.started = false;
    this.ended = false;
    this.players = [];
  }

  getCurrentPlayers() {
    return this.players;
  }

  addPlayer(name, id) {
    if (this.started) {
      return 'Game has already started, cannot add new players.';
    } else if (this.players.length == this.maxPlayers) {
      return 'Game has reached the maximum number of players';
    }
    this.players.push(new User(name, id));
    return 'Player with name: ' + name + ' added.';
  }

  startGame() {
    this.started = true;
    this.currentRound = 1;
    for (let i = 0; i < this.numRounds; i++) {
      this.rounds[i] = new Round(this.players[i % this.players.length], null, this.players.length);
    }
  }

  getCurrentRound() {
    if (this.started) {
      return this.rounds[this.currentRound - 1];
    }
    return null;
  }

  nextRound() {
    this.currentRound++;
  }
  
}

class Round {
  
  constructor(judge, prompt, playerCount) {
    this.judge = judge;
    this.prompt = prompt;
    this.drawings = {};
    this.winningUser = null;
    this.playerCount = playerCount;
  }

  submitDrawing(user, drawing) {
    if (this.drawings[user] != null) {
      return 'You have already submitted a drawing.';
    }
    this.drawings[user] = drawing;
    this.playerCount--;
    return 'Drawing for user: ' + user + ' submitted.'
  }

  pickWinner(user) {
    this.winningUser = user;
  }
}

class User {
  constructor(name, id) {
    this.name = name;
    this.id = id;
  }
}

module.exports = Game