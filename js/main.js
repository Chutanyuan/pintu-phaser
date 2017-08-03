var gameOperation = {
  gameWidth:400,
  gameHeight:400
};
var game = new Phaser.Game(gameOperation.gameWidth, gameOperation.gameHeight, Phaser.AUTO, 'drag');
var gameBoot = function() {
    this.preload = function () {
        console.log('preload boot');
    }

    this.create = function () {
        game.state.start('preload');
    }
}
var gamePreload = function() {
    this.preload = function () {
        game.load.spritesheet('tiles','image/tiles.png');
    }

    this.create = function () {
        game.state.start('create');
    }
}
var gameCreate = function() {
    this.create = function () {
        console.log('create create');
    }
}
game.state.add('boot', gameBoot);
game.state.add('create', gameCreate);
game.state.add('preload', gamePreload);
game.state.start('boot');
