
	
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

var crowdDist = 10; //distance that fish try to stay away from other fish




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
	switch(type){
	case 0:
		this.speed = preySpeed;
		break;
	case 1:
		this.speed = preySpeed;
		break;
	case 2:
		this.speed = predatorSpeed;
		break;
	default:
		this.speed = 2;
	}
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

	//from project 1 tutorial code https://github.com/mdee/CS-679-Tutorial-1/blob/master/tutor.js#L58
	this.norm = function () {
		
		
        var z = Math.sqrt(this.vX * this.vX + this.vY * this.vY );
        if (z<.001) {
            this.vX = (Math.random() - .5) * this.speed;
            this.vY = (Math.random() - .5) * this.speed;
            this.norm();
        } else {
            z = this.speed / z;
            this.vX *= z;
            this.vY *= z;
        }
    }
	
}


function fillFlock(qty){
	for (var i = 0; i < qty; i++){
		var type = 1;
		var rx = randFromTo(1, WIDTH);	//random x position between 1 and width
		var ry = randFromTo(1, HEIGHT);	//random y position between 1 and height
		//var rvX = randFromTo(1, preySpeed);  //random x velocity between 1 and speed
		//var rvY = randFromTo(1, preySpeed);  //random y velocity between 1 and speed
		var rvX = preySpeed;
		var rvY = preySpeed;
		var tmp = new Fish(rx, ry, rvX, rvY, type);
		flock.push(tmp);  //add new fish to end of flock array
	}
	

}

function renderFlock(){
	for(var i = 0; i <  flock.length; i++){
		flock[i].draw();
		ctx.font = "14pt Arial";
		ctx.fillText(i, flock[i].x, flock[i].y + -20);
	}
}


function updateFlock(){
	
	//temporory, makes them all move
	for(var i = 0; i < flock.length; i++){
		flock[i].move();
	}
	
	var ali = 0.6;
	
	var tmpVX = new Array(flock.length); //temporarily storage of new vX
	var tmpVY = new Array(flock.length);
	
	//n^2 loop over all pairs to find neighbors(consider k-d tree)
    for(var i = 0; i < flock.length; i++) {
		var fishI = flock[i];
		
		
		
		tmpVX[i] = 0;
		tmpVY[i] = 0;
		
		
        for(var j = 0; j <  flock.length; j++) {
			var fishJ = flock[j];
			
			var dx = (fishJ.x - fishI.x);
			var dy = (fishJ.y - fishI.y);
			var dist = Math.sqrt((dx*dx)+(dy*dy));
			
			tmpVX[i] += (fishJ.vX / (dist + ali));
			tmpVY[i] += (fishJ.vY / (dist + ali));

			//bounce
			if(dist <= 10 && dist > 0){
			tmpVX[i] = -fishJ.vX;
			tmpVY[i] = -fishJ.vY;
			}
        }
    }
	
	for(var i= 0; i < flock.length;  i++) {
			//alert("tmvVX " +i + ": " + tmpVX[i] + "\ntmvVY " +i + ": " + tmpVY[i]);
            flock[i].vX = tmpVX[i];
            flock[i].vY = tmpVY[i];
			flock[i].norm();
        } 
	
	// use neighbor[] to adjust velocity per three flocking rules
		
	//loop through flock
	/*for(var i = 0; i < flock.length; i++){
		
		
		var nearby = neighbor[i].length; //number of nearby boids
		if(nearby > 0){  //0 is by someone
		
			var cohPos = new Vec2(0,0);//average position of neighbors (used for coherence)
			var avgVel = new Vec2(0,0);//average velocity vector of neighbors
			var avgAvd = new Vec2(0,0);//average position of "crowded" neighbors (those too close to you)
			var avoided = 0; //for normalizing avgAvd position
			
			//loop through all neighbors and sum vectors for position, velocity, 
			//	and position of those crowding you (in case there are multiple)
			for(var j = 0; j < nearby; j++){  
				cohPos.x += neighbor[i][j].x;
				cohPos.y += neighbor[i][j].y;
				
				avgVel.x += neighbor[i][j].vX;
				avgVel.y += neighbor[i][j].vY;
				
				//if neighbor is crowding you add his position and increment "avoided"
				if(neighborDist[i][j] <= crowdDist){
					//avgAvd.x += neighbor[i][j].x;
					//avgAvd.y += neighbor[i][j].y;
					//alert("\nAdded avgAvd: \tx: " +avgAvd.x +"\ty: " +avgAvd.y);
					//avoided += 1;
					
					//bounce them
					
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
			cohPos.x = (cohPos.x - flock[i].x) / (preySight/preySpeed);
			cohPos.y = (cohPos.y - flock[i].y) / (preySight/preySpeed);
			
			//calculate vector from current position to avgAvd (making it negative as we want to avoid them)
			if(avoided > 0){
				avgAvd.x = -(flock[i].x - avgAvd.x);
				avgAvd.y = -(flock[i].y - avgAvd.y);
			}
			
			alert("\nFish 0: \tx: " +flock[i].vX +"\ty: " +flock[i].vY
				+ "\ncohPos: \tx: " +cohPos.x +"\ty: " +cohPos.y
				+ "\navgVel: \tx: " +avgVel.x +"\ty: " +avgVel.y
				+ "\navgAvd: \tx: " +avgAvd.x +"\ty: " +avgAvd.y);
			
				
			//compute new vector with weighting
			var newX = (((ori * flock[i].vX) 	//weighted original velocity
						//+ (avd * avgAvd.x)		//avoidance * average vector toward "too close" neighbors
						+ (ali * avgVel.x)		//alignment * average neighbor alignmnent
						+ (coh * cohPos.x)		//weighted cohesion vector
						) / 3);					//average
						
			var newY = (((ori * flock[i].vY) 	//weighted original velocity
						//+ (avd * avgAvd.y)		//avoidance * average vector toward "too close" neighbors
						+ (ali * avgVel.y)		//alignment * average neighbor alignmnent
						+ (coh * cohPos.y)		//weighted cohesion vector
						) / 3);					//average
			
			//alert("Fish i: \tx: " +newX +"\ty: " +newY);
			//assign new vector
			flock[i].vX = newX;
			flock[i].vY = newY;
			flock[i].norm();
			
			
		}
		
	}*/ //end loop i
		
	
	
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
