
	
var WIDTH = 1200;  //height and width should match canvas in index.html, is there a way to assert this?
var HEIGHT = 800;
var canvas;
var ctx;

var flock = [];
var flockSpeed = 5;	//player fish speed
var predSpeed = 4;  //predator speed

//var x = 100;
//var y = 100;

//circle function from http://html5.litten.com/moving-shapes-on-the-html5-canvas-with-the-keyboard/
function circle(x,y,r) {
ctx.beginPath();
ctx.arc(x, y, r, 0, Math.PI*2, true);
ctx.fill();
ctx.closePath();
}

//rectangle function from http://html5.litten.com/moving-shapes-on-the-html5-canvas-with-the-keyboard/
function rect(x,y,w,h) {
ctx.beginPath();
ctx.rect(x,y,w,h);
ctx.closePath();
ctx.fill();
ctx.stroke();
}

//returns random number between 2 values (inclusive)
function randFromTo(from,to)
{
    return Math.floor(Math.random()*(to-from +1) +from);
}

function printFlock(){ //flock troubleshooting
	var str = "Flock array:";
	
	for(var i = 0; i < flock.length; i++){
		str += "\nfish " +i +": " +flock[i].x +", " +flock[i].y;
	}
	
	alert(str);
}

function Fish(x, y, vX, vY, type){
	this.type = type;   // 0 for player, 1 for regular fish, 2 for predator fish
	this.x = x;
	this.y = y;
	this.vX = vX;
	this.vY = vY;
	this.draw = function(){
		ctx.fillStyle = "purple";
        circle(this.x, this.y, 10);
	}
	this.move = function() {
			this.x += this.vX;
            this.y += this.vY;
            if (this.x > canvas.width) {
                if (this.vX > 0) {
                    this.vX = -this.vX;
                }
            }
            if (this.y > canvas.height) {
                if (this.vY > 0) {
                    this.vY = -this.vY;
                }
            }
            if (this.x < 0) {
                if (this.vX < 0) {
                    this.vX = -this.vX;
                }
            }
            if (this.y < 0) {
                if (this.vY < 0) {
                    this.vY = -this.vY;
                }
           }
        }    
	
}
//var myFish = new Fish(20, 20);
//var myFish2 = new Fish(20, 40);

function fillFlock(qty){
	for (var i = 0; i < qty; i++){
		var type = 1;
		var rx = randFromTo(1, WIDTH);	//random x position between 1 and width
		var ry = randFromTo(1, HEIGHT);	//random y position between 1 and height
		var rvX = randFromTo(1, flockSpeed);  //random x velocity between 1 and speed
		var rvY = randFromTo(1, flockSpeed);  //random y velocity between 1 and speed
		var tmp = new Fish(rx, ry, rvX, rvY, type);
		flock.push(tmp);  //add new fish to end of flock array
	}

}

function renderFlock(){
	var size = flock.length;
	for(var i = 0; i < size; i++){
		flock[i].draw();
	}
}


function updateFlock(){
	var size = flock.length;
	for(var i = 0; i < size; i++){
		flock[i].move();
	}
}
	
function updateGame(){
	updateFlock();
	//updatePredators
	//update user interface (health, score, etc)
}

function init() {
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.strokeStyle = "black";
	fillFlock(10);
  
	//change to request animation frame
	return setInterval(gameLoop, 10);  //calls the gameLoop function every 10 milliseconds
}



function doKeyDown(evt){
	switch (evt.keyCode) {
	case 38:  /* Up arrow was pressed */
		myFish.y -= 10;
		break;
	case 40:  /* Down arrow was pressed */
		myFish.y += 10;
		break;
	case 37:  /* Left arrow was pressed */
		myFish.x -= 10;
		break;
	case 39:  /* Right arrow was pressed */
		myFish.x += 10;
		break;
	}
}

function gameLoop() {
	updateGame();  //update game pieces, score, etc
	
	ctx.clearRect(0, 0, WIDTH, HEIGHT); //erase everything on the canvas
	
	//draw background image
	renderFlock();  //draw regular fish (flock)
	//draw predators
}

window.onload = function(){
init();
}

window.addEventListener('keydown',doKeyDown,true);
