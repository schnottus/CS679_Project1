
	
var WIDTH = 1200;  //height and width should match canvas in index.html, is there a way to assert this?
var HEIGHT = 800;
var canvas;
var ctx;

var flock = [];  //all fish on game board
var preySpeed = 5;	//regular fish speed to normalize to
var predSpeed = 4;  //predator speed
var align = 0.8;  //alignment strength (between 0 and 1)
var preySight = 50; //distance a fish can "see" other fish
var predSight = 200; //distance a predator can "see other fish

var crowdDist = 15; //distance that fish try to stay away from other fish


// vector 2D structure
function Vec2(x_,y_) {
     this.x = x_;
     this.y = y_;
}

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

function print2dArray(array)
{
	var table = "Array: \n";
	var row;
	for (row = 0; row < array.length; ++row)
	{
		table = table + "\n Row " +row +": ";
		
		var col;
		for (col = 0; col < array[row].length; ++col){
			table = table +"\t" + array[row][col];
		}
			
	}
	
	alert(table);
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
	
	//2d array for regular fish that can "see" each other  
	//format: neigbor[fish][list of other fish within fishSight]
	var neighbor = [];  
	//distance to corresponding neighbor[][]
	var neighborDist = [];
	

	//n^2 loop over all pairs  (consider k-d tree)
    for(var i = 0; i < size; i++) {
		var outX = flock[i].x; //outer loop fish x
		var outY = flock[i].y; //outer loop fish y
		
		var tmp = []; //temporarily stores nearby fish
		var tmpDist = [];
		
		//now loop through regular fish
        for(var j = 0; j < size; j++) {
			var inX = flock[j].x;
			var inY = flock[j].y;
			
			// if j is within preySight add it to neighbors[]
			var dx = (inX-outX);
			var dy = (inY-outY);
			var dist = Math.sqrt((dx*dx)+(dy*dy));
			if(dist <= preySight && dist != 0){  //if within sight and not self(dist of 0)
				tmp.push(flock[j]);  
				tmpDist.push(dist);
				
				//alert("pushing " +j +" to neighbor of " +i);
			}
        }
		neighbor.push(tmp);
		neighborDist.push(tmpDist);
    }
	
	// use neighbor[] to adjust velocity per three flocking rules
		
	//loop through flock
	var ori = 1;	//how much weight to give boid's original velocity vector
	var avd = 0.4;	//how much weight to give avoidance
	var ali = 1;	//how much weight to give alignment
	var coh = 0.5;	//how much weight to give cohesion
	
	var nearby = neighbor[0].length; //number of nearby boids
	if(nearby > 0){  //0 is by someone
	
		var cohPos = new Vec2(0,0);//average position of neighbors (used for coherence)
		var avgVel = new Vec2(0,0);//average velocity vector of neighbors
		var avgAvd = new Vec2(0,0);//average position of "crowded" neighbors (those too close to you)
		var avoided = 0; //for normalizing avgAvd position
		
		//loop through all neighbors and sum vectors for position, velocity, 
		//	and position of those crowding you (in case there are multiple)
		for(var i = 0; i < nearby; i++){  
			cohPos.x += neighbor[0][i].x;
			cohPos.y += neighbor[0][i].y;
			
			avgVel.x += neighbor[0][i].vX;
			avgVel.y += neighbor[0][i].vY;
			
			//if neighbor is crowding you add his position and increment "avoided"
			if(neighborDist[0][i] <= crowdDist){
				avgAvd.x += neighbor[0][i].x;
				avgAvd.y += neighbor[0][i].y;
				//alert("\nAdded avgAvd: \tx: " +avgAvd.x +"\ty: " +avgAvd.y);
				avoided += 1;
			}
		}
		
		//average
		cohPos.x = cohPos.x / nearby;
		cohPos.y = cohPos.y / nearby;
		avgVel.x = avgVel.x / nearby;
		avgVel.y = avgVel.y / nearby;
		if(avoided > 0){
			avgAvd.x = avgAvd.x / avoided;
			avgAvd.y = avgAvd.y / avoided;
			//alert("\nAveraged avgAvd: \tx: " +avgAvd.x +"\ty: " +avgAvd.y);
		}
		
		//create normalized vectors
		//calculate vector from current position to cohPos
		cohPos.x = (cohPos.x - flock[0].x) / (preySight/preySpeed);
		cohPos.y = (cohPos.y - flock[0].y) / (preySight/preySpeed);
		
		//calculate vector from current position to avgAvd (making it negative as we want to avoid them)
		if(avoided > 0){
			avgAvd.x = -(flock[0].x - avgAvd.x);
			avgAvd.y = -(flock[0].y - avgAvd.y);
		}
		
		alert("\nFish 0: \tx: " +flock[0].vX +"\ty: " +flock[0].vY
			+ "\ncohPos: \tx: " +cohPos.x +"\ty: " +cohPos.y
			+ "\navgVel: \tx: " +avgVel.x +"\ty: " +avgVel.y
			+ "\navgAvd: \tx: " +avgAvd.x +"\ty: " +avgAvd.y);
		
			
		//compute new vector with weighting
		var newX = (((ori * flock[0].vX) 	//weighted original velocity
					+ (avd * avgAvd.x)		//avoidance * average vector toward "too close" neighbors
					+ (ali * avgVel.x)		//alignment * average neighbor alignmnent
					+ (coh * cohPos.x)		//weighted cohesion vector
					) / 4);					//average
					
		var newY = (((ori * flock[0].vY) 	//weighted original velocity
					+ (avd * avgAvd.y)		//avoidance * average vector toward "too close" neighbors
					+ (ali * avgVel.y)		//alignment * average neighbor alignmnent
					+ (coh * cohPos.y)		//weighted cohesion vector
					) / 4);					//average
		
		//alert("Fish 0: \tx: " +newX +"\ty: " +newY);
		//assign new vector
		flock[0].vX = newX;
		flock[0].vY = newY;
		
		
	}
		
	
	
	//print2dArray(neighborDist);  //for troubleshooting
	
	
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
	fillFlock(20);
  
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
