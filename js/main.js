var gameOption = {
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

var game = new Phaser.Game(400,400,Phaser.AUTO,'dragColor',{
    preload:preload,
    create:create,
    update:update
});
function preload() {
    game.load.spritesheet('tiles', 'image/tiles.png', gameOption.spritesheetSize, gameOption.spritesheetSize);
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
}
function create() {
    this.tileArray = [];
    this.tilePool = [];
    this.tileGroup = game.add.group();
    this.tileGroup.x = gameOption.offsetX;
    this.tileGroup.y = gameOption.offsetY;
    this.tileMask = game.add.graphics(this.tileGroup.x,this.tileGroup.y);
    this.tileMask.beginFill(0xffffff);
    this.tileMask.drawRect(0,0,gameOption.fieldSize*gameOption.tileSize,gameOption.fieldSize*gameOption.tileSize);
    this.tileGroup.mask = this.tileMask;
    this.tileMask.visible = true;
    for (var i = 0; i <gameOption.fieldSize;i++){
        this.tileArray[i] = [];
        for (var j = 0; j<gameOption.fieldSize;j++){
            addTile(i,j);
        }

    }
}
function addTile(row, col) {

}
function update() {

}
