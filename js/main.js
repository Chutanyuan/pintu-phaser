var game;
var gameOptions = {
    gameWidth: 400,
    gameHeight: 400,
    spritesheetSize: 50,
    tileSize: 50,
    fieldSize: 6,
    tileTypes: 6,
    offsetX: 50,
    offsetY: 50,
    tweenSpeed: 100,
    fadeSpeed: 1000,
    fallSpeed: 250
};
var NO_DRAG = 0;
var HORIZONTAL_DRAG = 1;
var VERTICAL_DRAG = 2;
var GAME_STATE_IDLE = 0;
var GAME_STATE_DRAG = 1;
var GAME_STATE_STOP = 2;

var playGame = function (game) {
    this.preload = function () {
        game.load.spritesheet('tiles', 'image/tiles.png', gameOptions.spritesheetSize, gameOptions.spritesheetSize);
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    };
    this.create = function () {
        this.tileArray = [];
        this.tilePool = [];
        this.tileGroup = game.add.group();
        this.tileGroup.x = gameOptions.offsetX;
        this.tileGroup.y = gameOptions.offsetY;
        this.tileMask = game.add.graphics(this.tileGroup.x, this.tileGroup.y);
        this.tileMask.beginFill(0xffffff);
        this.tileMask.drawRect(0, 0, gameOptions.fieldSize * gameOptions.tileSize, gameOptions.fieldSize * gameOptions.tileSize);
        this.tileGroup.mask = this.tileMask;
        this.tileMask.visible = true;
        for (var i = 0; i < gameOptions.fieldSize; i++) {
            this.tileArray[i] = [];
            for (var j = 0; j < gameOptions.fieldSize; j++) {
                this.addTile(i, j);
            }
        }
        this.addTempTile();
    };
    this.update = function () {

    };
    this.addTile = function (row, col) {
        var tile = game.add.sprite(col * gameOptions.tileSize, row * gameOptions.tileSize, 'tiles');
        tile.width = gameOptions.gameWidth;
        tile.height = gameOptions.gameHeight;
        do {
            var randomTile = game.rnd.integerInRange(0,gameOptions.tileTypes-1);
            this.tileArray[row][col] = {
                tileSprite:tile,
                tileValue:randomTile,
                isEmpty:false
            }
        } while (this.isMatch(row, col));
        tile.frame = randomTile;
        this.tileGroup.add(tile);
    };
    this.addTempTile = function () {
        this.temptile = game.add.sprite(0,0,'tiles');
        this.temptile.width = gameOptions.tileSize;
        this.temptile.height = gameOptions.tileSize;
        this.temptile.visible = false;
        this.tileGroup.add(this.temptile);
    };
    this.isMatch = function (row, col) {
        // retur
    }
};
window.onload = function () {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight);
    var playgame = new playGame(game);
    game.state.add('playGame', playgame);
    game.state.start('playGame');
};
