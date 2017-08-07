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

        // 添加滑动
        game.input.onDown.add(this.pickTile, this);
    };
    this.addTile = function (row, col) {
        var tile = game.add.sprite(col * gameOptions.tileSize, row * gameOptions.tileSize, 'tiles');
        tile.width = gameOptions.gameWidth;
        tile.height = gameOptions.gameHeight;
        do {
            var randomTile = game.rnd.integerInRange(0, gameOptions.tileTypes - 1);
            this.tileArray[row][col] = {
                tileSprite: tile,
                tileValue: randomTile,
                isEmpty: false
            }
        } while (this.isMatch(row, col));
        tile.frame = randomTile;
        this.tileGroup.add(tile);
    };
    this.addTempTile = function () {
        this.temptile = game.add.sprite(0, 0, 'tiles');
        this.temptile.width = gameOptions.tileSize;
        this.temptile.height = gameOptions.tileSize;
        this.temptile.visible = false;
        this.tileGroup.add(this.temptile);
    };
    this.isMatch = function (row, col) {
        // retur
    };
    this.pickTile = function (e) {
        //处理手势动作
        this.movingRow = Math.floor((e.position.y - gameOptions.offsetY) / gameOptions.tileSize);
        this.movingCol = Math.floor((e.position.x - gameOptions.offsetX) / gameOptions.tileSize);
        console.log('move row = ' + this.movingRow);
        console.log('move col = ' + this.movingCol);
        //设置判读条件确认在已知局域内做滑动
        if (this.movingRow >= 0
            && this.movingCol >= 0
            && this.movingRow < gameOptions.fieldSize
            && this.movingCol < gameOptions.fieldSize) {
            this.dragDirection = NO_DRAG;
            game.input.onDown.remove(this.pickTile, this);
            game.input.onUp.add(this.releaseTile, this);
            game.input.addMoveCallback(this.moveTile, this);
        }
    };
    this.releaseTile = function () {
        this.gameState = GAME_STATE_STOP;
        game.input.onUp.remove(this.releaseTile, this);
        game.input.deleteMoveCallback(this.moveTile, this);
    };
    this.moveTile = function (e) {
        this.gameState = GAME_STATE_DRAG;
        // e.positionDown.x 鼠标点击下去的第一个点 e.position.x 滑动是改变的点
        this.distX = e.position.x - e.positionDown.x;
        this.distY = e.position.y - e.positionDown.y;
        console.log('this.distX = ' + this.distX);
        console.log('this.distY = ' + this.distY);
        if (this.dragDirection == NO_DRAG) {
            var distance = e.position.distance(e.positionDown);
            if (distance > 5) {
                //Math.atan2 返回 从x坐标轴 到指定坐标点（x,y）的角度
                //Math.atan2(y,x) 参数格式
                var dragAngle = Math.abs(Math.atan2(this.distY, this.distX));
                if (dragAngle > Math.PI / 4 && dragAngle < 3 * Math.PI / 4) {
                    this.dragDirection = VERTICAL_DRAG;
                } else {
                    this.dragDirection = HORIZONTAL_DRAG;
                }
            }
        }
    };
    this.update = function () {
        switch (this.gameState) {
            case GAME_STATE_DRAG:
                this.handleDrag();
                break;
            case GAME_STATE_STOP:
                this.handleStop();
                break;
        }
    };
    this.handleDrag = function () {
        switch(this.dragDirection){
            case HORIZONTAL_DRAG:
                console.log('横向滑动');
                this.temptile.visible = false;
                this.temptile.y = this.movingRow*gameOptions.tileSize;
                var deltaX = (Math.floor(this.distX/gameOptions.tileSize)%gameOptions.fieldSize);
                break;
            case VERTICAL_DRAG:
                console.log('竖向滑动');
                break;
        }
    };
    this.handleStop = function () {
        switch(this.dragDirection){
            case HORIZONTAL_DRAG:
                console.log(' stop 横向滑动');
                break;
            case VERTICAL_DRAG:
                console.log(' stop 竖向滑动');
                break;
        }
    }


};
window.onload = function () {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight);
    var playgame = new playGame(game);
    game.state.add('playGame', playgame);
    game.state.start('playGame');
};
