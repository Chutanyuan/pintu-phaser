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
    fallSpeed: 250,
    score:0
};
var NO_DRAG = 0;
var HORIZONTAL_DRAG = 1;
var VERTICAL_DRAG = 2;
var GAME_STATE_IDLE = 0;
var GAME_STATE_DRAG = 1;
var GAME_STATE_STOP = 2;
var touchNumber = 0;
var touchNumberCopy = touchNumber;
var scoreText;
var scoreToRemove = [];

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
        scoreText = game.add.text(gameOptions.gameWidth/2,10,'分数：'+gameOptions.score,{
            fill:'#ffffff',
            font:'16px Arial'
        });
        scoreText.anchor.x = 0.5;
        game.input.onDown.add(this.pickTile, this);// 添加滑动
        this.gameState = GAME_STATE_IDLE;
    };
    this.addTile = function (row, col) {
        var tile = game.add.sprite(col * gameOptions.tileSize, row * gameOptions.tileSize, 'tiles');
        tile.width = gameOptions.tileSize;
        tile.height = gameOptions.tileSize;
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
        this.tempTile = game.add.sprite(0, 0, 'tiles');
        this.tempTile.width = gameOptions.tileSize;
        this.tempTile.height = gameOptions.tileSize;
        this.tempTile.visible = false;
        this.tileGroup.add(this.tempTile);
    };
    this.pickTile = function (e) {
        scoreToRemove = [];
        scoreToRemove.length = 0;
        this.movingRow = Math.floor((e.position.y - gameOptions.offsetY) / gameOptions.tileSize);
        this.movingCol = Math.floor((e.position.x - gameOptions.offsetX) / gameOptions.tileSize);
        if (this.movingRow >= 0 && this.movingCol >= 0 && this.movingRow < gameOptions.fieldSize && this.movingCol < gameOptions.fieldSize) {//设置判读条件确认在已知局域内做滑动
            touchNumberCopy = touchNumber;
            this.dragDirection = NO_DRAG;
            game.input.onDown.remove(this.pickTile, this);
            game.input.onUp.add(this.releaseTile, this);
            game.input.addMoveCallback(this.moveTile, this);
            if (touchNumber === touchNumberCopy){
                game.input.onDown.add(this.pickTile,this);
            }
        }
    };
    this.timeOut = function () {
      game.input.onDown.add(this.pickTile,this);
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
        this.gameState = GAME_STATE_IDLE;
    };
    this.handleDrag = function () {
        switch (this.dragDirection) {
            case HORIZONTAL_DRAG:
                this.tempTile.visible = false;
                this.tempTile.y = this.movingRow * gameOptions.tileSize;
                var deltaX = (Math.floor(this.distX / gameOptions.tileSize) % gameOptions.fieldSize);
                if (deltaX >= 0) {
                    this.tempTile.frame = this.tileArray[this.movingRow][gameOptions.fieldSize - 1 - deltaX].tileValue;
                } else {
                    deltaX = deltaX * -1 - 1;
                    this.tempTile.frame = this.tileArray[this.movingRow][deltaX].tileValue;
                }
                for (var i = 0; i < gameOptions.fieldSize; i++) {
                    this.tileArray[this.movingRow][i].tileSprite.x = (i * gameOptions.tileSize + this.distX) % (gameOptions.tileSize * gameOptions.fieldSize);
                    if (this.tileArray[this.movingRow][i].tileSprite.x < 0) {
                        this.tileArray[this.movingRow]
                            [i].tileSprite.x += gameOptions.tileSize * gameOptions.fieldSize;
                    }
                }
                var tileX = this.distX % gameOptions.tileSize;
                if (tileX > 0) {
                    this.tempTile.x = tileX - gameOptions.tileSize;
                    this.tempTile.visible = true;
                }
                if (tileX < 0) {
                    this.tempTile.x = tileX;
                    this.tempTile.visible = true;
                }
                break;
            case VERTICAL_DRAG:
                this.tempTile.visible = false;
                this.tempTile.x = this.movingCol * gameOptions.tileSize;
                var deltaY = (Math.floor(this.distY / gameOptions.tileSize) % gameOptions.fieldSize);
                if (deltaY >= 0) {
                    this.tempTile.frame = this.tileArray[gameOptions.fieldSize - 1 - deltaY][this.movingCol].tileValue;
                } else {
                    deltaY = deltaY * -1 - 1;
                    this.tempTile.frame = this.tileArray[deltaY][this.movingCol].tileValue;
                }
                for (var i = 0; i < gameOptions.fieldSize; i++) {
                    this.tileArray[i][this.movingCol].tileSprite.y = (i * gameOptions.tileSize + this.distY) % (gameOptions.tileSize * gameOptions.fieldSize);
                    if (this.tileArray[i][this.movingCol].tileSprite.y < 0) {
                        this.tileArray[i][this.movingCol].tileSprite.y += gameOptions.tileSize * gameOptions.fieldSize;
                    }
                }
                var tileY = this.distY % gameOptions.tileSize;
                if (tileY > 0) {
                    this.tempTile.y = tileY - gameOptions.tileSize;
                    this.tempTile.visible = true;
                }
                if (tileY < 0) {
                    this.tempTile.y = tileY;
                    this.tempTile.visible = true;
                }
                break;
        }
    };
    this.handleStop = function () {
        switch (this.dragDirection) {
            case HORIZONTAL_DRAG:
                var shiftAmount = Math.floor(this.distX / (gameOptions.tileSize / 2));
                shiftAmount = Math.ceil(shiftAmount / 2) % gameOptions.fieldSize;
                var tempArray = [];
                if (shiftAmount > 0) {
                    for (var i = 0; i < gameOptions.fieldSize; i++) {
                        tempArray[(shiftAmount + i) % gameOptions.fieldSize] = this.tileArray[this.movingRow][i].tileValue;
                    }
                } else {
                    for (var i = 0; i < gameOptions.fieldSize; i++) {
                        tempArray[i] = this.tileArray[this.movingRow][(Math.abs(shiftAmount) + i) % gameOptions.fieldSize].tileValue;
                    }
                }
                var offset = this.distX % gameOptions.tileSize;
                if (Math.abs(offset) > gameOptions.tileSize / 2) {
                    if (offset < 0) {
                        offset = offset + gameOptions.tileSize;
                    } else {
                        offset = offset - gameOptions.tileSize;
                    }
                }
                for (i = 0; i < gameOptions.fieldSize; i++) {
                    this.tileArray[this.movingRow][i].tileValue = tempArray[i];
                    this.tileArray[this.movingRow][i].tileSprite.frame = tempArray[i];
                    this.tileArray[this.movingRow][i].tileSprite.x = i * gameOptions.tileSize + offset;
                    game.add.tween(this.tileArray[this.movingRow][i].tileSprite).to({
                        x: i * gameOptions.tileSize
                    }, gameOptions.tweenSpeed, Phaser.Easing.Cubic.Out, true);
                }
                var tempDestination = -gameOptions.tileSize;
                if (offset < 0) {
                    this.tempTile.x += gameOptions.tileSize * gameOptions.fieldSize;
                    tempDestination = gameOptions.fieldSize * gameOptions.tileSize;
                }
                var tween = game.add.tween(this.tempTile).to({
                    x: tempDestination
                }, gameOptions.tweenSpeed, Phaser.Easing.Cubic.Out, true);
                tween.onComplete.add(function () {
                    if (this.matchInBoard()) {
                        this.handleMatches();
                    } else {
                        if (shiftAmount != 0) {
                            shiftAmount *= -1;
                            tempArray = [];
                            if (shiftAmount > 0) {
                                for (var i = 0; i < gameOptions.fieldSize; i++) {
                                    tempArray[(shiftAmount + i) % gameOptions.fieldSize] = this.tileArray[this.movingRow][i].tileValue;
                                }
                            } else {
                                for (var i = 0; i < gameOptions.fieldSize; i++) {
                                    tempArray[i] = this.tileArray[this.movingRow][(Math.abs(shiftAmount) + i) % gameOptions.fieldSize].tileValue;
                                }
                            }
                            for (i = 0; i < gameOptions.fieldSize; i++) {
                                this.tileArray[this.movingRow][i].tileValue = tempArray[i];
                                this.tileArray[this.movingRow][i].tileSprite.frame = tempArray[i];
                                this.tileArray[this.movingRow][i].tileSprite.x = i * gameOptions.tileSize;
                                var tween = game.add.tween(this.tileArray[this.movingRow][i].tileSprite).to({
                                    alpha: 0.5
                                }, gameOptions.tweenSpeed / 8, Phaser.Easing.Bounce.Out, true, 0, 8, true);
                            }
                            tween.onComplete.add(function () {
                                if (tween.manager.getAll().length == 1) {
                                    game.input.onDown.add(this.pickTile, this);
                                }
                            }, this)
                        } else {
                            game.input.onDown.add(this.pickTile, this);
                        }
                    }
                }, this);
                break;
            case VERTICAL_DRAG:
                var shiftAmount = Math.floor(this.distY / (gameOptions.tileSize / 2));
                shiftAmount = Math.ceil(shiftAmount / 2) % gameOptions.fieldSize;
                var tempArray = [];
                if (shiftAmount > 0) {
                    for (var i = 0; i < gameOptions.fieldSize; i++) {
                        tempArray[(shiftAmount + i) % gameOptions.fieldSize] = this.tileArray[i][this.movingCol].tileValue;
                    }
                } else {
                    for (var i = 0; i < gameOptions.fieldSize; i++) {
                        tempArray[i] = this.tileArray[(Math.abs(shiftAmount) + i) % gameOptions.fieldSize][this.movingCol].tileValue;
                    }
                }
                var offset = this.distY % gameOptions.tileSize;
                if (Math.abs(offset) > gameOptions.tileSize / 2) {
                    if (offset < 0) {
                        offset = offset + gameOptions.tileSize;
                    } else {
                        offset = offset - gameOptions.tileSize;
                    }
                }
                for (var i = 0; i < gameOptions.fieldSize; i++) {
                    this.tileArray[i][this.movingCol].tileValue = tempArray[i];
                    this.tileArray[i][this.movingCol].tileSprite.frame = tempArray[i];
                    this.tileArray[i][this.movingCol].tileSprite.y = i * gameOptions.tileSize + offset;
                    game.add.tween(this.tileArray[i][this.movingCol].tileSprite).to({
                        y: i * gameOptions.tileSize
                    }, gameOptions.tweenSpeed, Phaser.Easing.Cubic.Out, true);
                }
                var tempDestination = -gameOptions.tileSize
                if (offset < 0) {
                    this.tempTile.y += gameOptions.tileSize * gameOptions.fieldSize;
                    tempDestination = gameOptions.fieldSize * gameOptions.tileSize;
                }
                var tween = game.add.tween(this.tempTile).to({
                    y: tempDestination
                }, gameOptions.tweenSpeed, Phaser.Easing.Cubic.Out, true);
                tween.onComplete.add(function () {
                    if (this.matchInBoard()) {
                        this.handleMatches();
                    } else {
                        if (shiftAmount != 0) {
                            shiftAmount *= -1;
                            tempArray = [];
                            if (shiftAmount > 0) {
                                for (var i = 0; i < gameOptions.fieldSize; i++) {
                                    tempArray[(shiftAmount + i) % gameOptions.fieldSize] = this.tileArray[i][this.movingCol].tileValue;
                                }
                            } else {
                                for (var i = 0; i < gameOptions.fieldSize; i++) {
                                    tempArray[i] = this.tileArray[(Math.abs(shiftAmount) + i) % gameOptions.fieldSize][this.movingCol].tileValue;
                                }
                            }
                            for (var i = 0; i < gameOptions.fieldSize; i++) {
                                this.tileArray[i][this.movingCol].tileValue = tempArray[i];
                                this.tileArray[i][this.movingCol].tileSprite.frame = tempArray[i];
                                this.tileArray[i][this.movingCol].tileSprite.y = i * gameOptions.tileSize;
                                var tween = game.add.tween(this.tileArray[i][this.movingCol].tileSprite).to({
                                    alpha: 0.5
                                }, gameOptions.tweenSpeed / 8, Phaser.Easing.Bounce.Out, true, 0, 8, true);
                            }
                            tween.onComplete.add(function () {
                                if (tween.manager.getAll().length == 1) {
                                    game.input.onDown.add(this.pickTile, this);
                                }
                            }, this)
                        } else {
                            game.input.onDown.add(this.pickTile, this);
                        }
                    }
                }, this)
                break;
        }
        this.dragDirection = NO_DRAG;
    };
    this.handleMatches = function () {
        this.tilesToRemove = [];
        for (var i = 0; i < gameOptions.fieldSize; i++) {
            this.tilesToRemove[i] = [];
            for (var j = 0; j < gameOptions.fieldSize; j++) {
                this.tilesToRemove[i][j] = 0;
            }
        }
        this.handleHorizontalMatches();
        this.handleVerticalMatches();
        for (var i = 0; i < gameOptions.fieldSize; i++) {
            for (var j = 0; j < gameOptions.fieldSize; j++) {
                if (this.tilesToRemove[i][j] != 0) {
                    scoreToRemove.push(i+'-'+j);
                    console.log('i = '+ i + " j = "+ j + 'scoreToRemove length = '+scoreToRemove.length);
                    var tween = game.add.tween(this.tileArray[i][j].tileSprite).to({
                        alpha: 0
                    }, gameOptions.fadeSpeed, Phaser.Easing.Linear.None, true);
                    this.tilePool.push(this.tileArray[i][j].tileSprite);
                    tween.onComplete.add(function (e) {
                        if (tween.manager.getAll().length == 1) {
                            this.fillVerticalHoles();
                            console.log('1 scoreToRemove length = '+scoreToRemove.length);
                        }
                        console.log('2 scoreToRemove length = '+scoreToRemove.length);
                        gameOptions.score+=1;
                        scoreText.setText('分数：'+gameOptions.score);
                    }, this);
                    this.tileArray[i][j].isEmpty = true;
                }
            }
        }
    };
    this.fillVerticalHoles = function () {
        for (var i = gameOptions.fieldSize - 2; i >= 0; i--) {
            for (var j = 0; j < gameOptions.fieldSize; j++) {
                if (!this.tileArray[i][j].isEmpty) {
                    var holesBelow = this.countSpacesBelow(i, j);
                    if (holesBelow) {
                        this.moveDownTile(i, j, i + holesBelow, false);
                    }
                }
            }
        }
        for (i = 0; i < gameOptions.fieldSize; i++) {
            var topHoles = this.countSpacesBelow(-1, i);
            for (j = topHoles - 1; j >= 0; j--) {
                var reusedTile = this.tilePool.shift();
                reusedTile.y = (j - topHoles) * gameOptions.tileSize;
                reusedTile.x = i * gameOptions.tileSize;
                reusedTile.alpha = 1;
                var randomTile = game.rnd.integerInRange(0, gameOptions.tileTypes - 1);
                reusedTile.frame = randomTile;
                this.tileArray[j][i] = {
                    tileSprite: reusedTile,
                    tileValue: randomTile,
                    isEmpty: false
                };
                this.moveDownTile(0, i, j, true);
            }
        }
    };
    this.moveDownTile = function (fromRow, fromCol, toRow, justMove) {
        if (!justMove) {
            var spriteSave = this.tileArray[fromRow][fromCol].tileSprite;
            var valueSave = this.tileArray[fromRow][fromCol].tileValue;
            this.tileArray[toRow][fromCol] = {
                tileSprite: spriteSave,
                tileValue: valueSave,
                isEmpty: false
            };
            this.tileArray[fromRow][fromCol].isEmpty = true;
        }
        var distanceToTraval = toRow - this.tileArray[toRow][fromCol].tileSprite.y / gameOptions.tileSize;
        var tween = game.add.tween(this.tileArray[toRow][fromCol].tileSprite).to({
            y: toRow * gameOptions.tileSize
        }, distanceToTraval * gameOptions.fallSpeed, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(function () {
            if (tween.manager.getAll().length == 1) {
                if (this.matchInBoard()) {
                    this.handleMatches();
                } else {
                    game.input.onDown.add(this.pickTile, this);
                }
            }
        }, this)
    };
    this.handleHorizontalMatches = function () {
        for (var i = 0; i < gameOptions.fieldSize; i++) {
            var colorStreak = 1;
            var currentColor = -1;
            var startStreak = 0;
            for (var j = 0; j < gameOptions.fieldSize; j++) {
                if (this.tileAt(i, j).tileValue == currentColor) {
                    colorStreak++;
                }
                if (this.tileAt(i, j).tileValue != currentColor || j == gameOptions.fieldSize - 1) {
                    if (colorStreak > 2) {
                        var endStreak = j - 1
                        if (this.tileAt(i, j).tileValue == currentColor) {
                            endStreak = j;
                        }
                        for (var k = startStreak; k <= endStreak; k++) {
                            this.tilesToRemove[i][k]++;
                        }
                    }
                    currentColor = this.tileAt(i, j).tileValue
                    colorStreak = 1;
                    startStreak = j;
                }
            }
        }
    };
    this.handleVerticalMatches = function () {
        for (var i = 0; i < gameOptions.fieldSize; i++) {
            var colorStreak = 1;
            var currentColor = -1;
            var startStreak = 0;
            for (var j = 0; j < gameOptions.fieldSize; j++) {
                if (this.tileAt(j, i).tileValue == currentColor) {
                    colorStreak++;
                }
                if (this.tileAt(j, i).tileValue != currentColor || j == gameOptions.fieldSize - 1) {
                    if (colorStreak > 2) {
                        var endStreak = j - 1
                        if (this.tileAt(j, i).tileValue == currentColor) {
                            endStreak = j;
                        }
                        for (var k = startStreak; k <= endStreak; k++) {
                            this.tilesToRemove[k][i]++;
                        }
                    }
                    currentColor = this.tileAt(j, i).tileValue
                    colorStreak = 1;
                    startStreak = j;
                }
            }
        }
    };
    this.moveTile = function (e) {
        this.gameState = GAME_STATE_DRAG;// e.positionDown.x 鼠标点击下去的第一个点 e.position.x 滑动是改变的点
        this.distX = e.position.x - e.positionDown.x;
        this.distY = e.position.y - e.positionDown.y;
        touchNumber+=1;
        console.log('两点距离Y = '+this.distY);
        console.log('两点距离X = '+this.distX);
        if (this.dragDirection == NO_DRAG) {
            var distance = e.position.distance(e.positionDown);
            if (distance > 5) {//Math.atan2 返回 从x坐标轴 到指定坐标点（x,y）的角度//Math.atan2(y,x) 参数格式
                var dragAngle = Math.abs(Math.atan2(this.distY, this.distX));
                if (dragAngle > Math.PI / 4 && dragAngle < 3 * Math.PI / 4) {
                    this.dragDirection = VERTICAL_DRAG;
                } else {
                    this.dragDirection = HORIZONTAL_DRAG;
                }
            }else{
                console.log('两点距离'+distance);
            }
        }
    };
    this.releaseTile = function () {
        this.gameState = GAME_STATE_STOP;
        game.input.onUp.remove(this.releaseTile, this);
        game.input.deleteMoveCallback(this.moveTile, this);
    };
    this.tileAt = function (row, col) {
        if (row < 0 || row >= gameOptions.fieldSize || col < 0 || col >= gameOptions.fieldSize) {
            return false;
        }
        return this.tileArray[row][col];
    };
    this.isHorizontalMatch = function (row, col) {
        return this.tileAt(row, col).tileValue == this.tileAt(row, col - 1).tileValue && this.tileAt(row, col).tileValue == this.tileAt(row, col - 2).tileValue;
    };
    this.isVerticalMatch = function (row, col) {
        return this.tileAt(row, col).tileValue == this.tileAt(row - 1, col).tileValue && this.tileAt(row, col).tileValue == this.tileAt(row - 2, col).tileValue;
    };
    this.isMatch = function (row, col) {
        return this.isHorizontalMatch(row, col) || this.isVerticalMatch(row, col);
    };
    this.matchInBoard = function () {
        for (var i = 0; i < gameOptions.fieldSize; i++) {
            for (var j = 0; j < gameOptions.fieldSize; j++) {
                if (this.isMatch(i, j)) {
                    return true;
                }
            }
        }
        return false;
    };
    this.countSpacesBelow = function (row, col) {
        var result = 0;
        for (var i = row + 1; i < gameOptions.fieldSize; i++) {
            if (this.tileArray[i][col].isEmpty) {
                result++;
            }
        }
        return result;
    };

};
window.onload = function () {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight);
    var playgame = new playGame(game);
    game.state.add('playGame', playgame);
    game.state.start('playGame');
};
