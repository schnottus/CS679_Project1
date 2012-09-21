
	
var WIDTH = 1200;  //height and width should match canvas in index.html, is there a way to assert this?
var HEIGHT = 800;
var canvas;
var ctx;

var flock = [];  //all fish on game board
var preySpeed = 5;	//regular fish speed to normalize to
var predSpeed = 4;  //predator speed
var align = 0.8;  //alignment strength (between 0 and 1)
var fishSight = 50; //distance a fish can "see" other fish
var predSight = 200; //distance a predator can "see other fish


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
		ctx.strokeStyle = "black";
		ctx.fillStyle = "purple";
		ctx.beginPath();
		ctx.beginPath();
		ctx.arc(this.x, this.y, 5, 0, Math.PI*2, true);
		ctx.moveTo(this.x,this.y);
        ctx.lineTo(this.x + 6*this.vX, this.y + 6*this.vY);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
        

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


function fillFlock(qty){
	for (var i = 0; i < qty; i++){
		var type = 1;
		var rx = randFromTo(1, WIDTH);	//random x position between 1 and width
		var ry = randFromTo(1, HEIGHT);	//random y position between 1 and height
		var rvX = randFromTo(1, preySpeed);  //random x velocity between 1 and speed
		var rvY = randFromTo(1, preySpeed);  //random y velocity between 1 and speed
		var tmp = new Fish(rx, ry, rvX, rvY, type);
		flock.push(tmp);  //add new fish to end of flock array
	}
	

}

function renderFlock(){
	var size = flock.length;
	for(var i = 0; i < size; i++){
		flock[i].draw();

		ctx.font = "20pt Arial";
		ctx.fillText(i, flock[i].x, flock[i].y + -20);
	}
}


function updateFlock(){
	
	//temporory, makes them all move
	var size = flock.length;
	for(var i = 0; i < size; i++){
		flock[i].move();
	}
	
	//for regular fish that can "see" each other 
	//format: neigbor[fish][list of other fish within fishSight]
	//var neighbor = [][];  
	//distance to corresponding neighbor[][]
	//var neighborDist = [][];
	

	//n^2 loop over all pairs  (consider k-d tree)
   /* for(var i=flock.length-1; i>=0; i--) {
		var outX = flock[i].x; //outer loop fish x
		var outY = flock[i].y; //outer loop fish y
		
		//now loop through regular fish
        for(var j=flock.length-1; j>=0; j--) {
			var inX = flock[j].x;
			var inY = flock[j].y;
			
			// if j is within fishSight add it to neighbors[]
			var dx = (inX-outX);
			var dy = (inY-outY);
			var dist = Math.sqrt((dx*dx)+(dy*dy));
			if(dist <= fishSight && dist != 0){  //if within sight and not self(dist of 0)
				neighbor[i][].push(flock[j]);  
				neighborDist[i][].push(dist);
				
				alert("pushing " +j +" to neighbor of " +i);
			}

        }
		
		// use neighbor[] to adjust velocity per flocking rules
    }*/
	
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
		flock[0].y -= 10;
		break;
	case 40:  /* Down arrow was pressed */
		flock[0].y += 10;
		break;
	case 37:  /* Left arrow was pressed */
		flock[0].x -= 10;
		break;
	case 39:  /* Right arrow was pressed */
		flock[0].x += 10;
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
