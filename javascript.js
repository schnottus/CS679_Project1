
	
var WIDTH = 1200;  //height and width should match canvas in index.html, is there a way to assert this?
var HEIGHT = 800;
var canvas;
var ctx;

var flock = [];  //all fish on game board
var sharks = [];
var preySpeed = 2;	//regular fish speed to normalize to
var predSpeed = 2;  //predator speed
var align = 0.95;  //alignment strength (between 0 and 1)
var preySight = 150; //distance a fish can "see" other fish
var predSight = 200; //distance a predator can "see other fish
var arcPlayer = 0; //rotation of player fish
var crowdDist = 15; //distance that fish try to stay away from other fish
var leadStr = 0.1; //strength of attraction to player fish, 0.0 for infinitely strong, 1.0 for normal fish strength
var test = 0;





function editAlign(amt){
	align += amt;
	if(align <= 0 ) align = 0.01;
	if(align > 1) align = 1;
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
function Octopus(x, y){
	this.x = x;
	this.y = y;
	this.vX = 0;
	this.vY = 0;
	this.counter = 499;
	this.img = new Image();
	this.img.src = "img/octopus.png";
	this.draw = function(){
		ctx.drawImage(this.img, this.x, this.y);
		this.x += this.vX;
		this.y += this.vY;
		this.counter++;
		if(this.counter == 500){
			this.vX = randFromTo(0, 1)/10 - 0.05;
			this.vY = randFromTo(0, 1)/10 - 0.05;
			this.counter = 0;
		}else if(this.x < -200){
			this.vX = .1;
		}else if(this.x > WIDTH-300){
			this.vX = -.1;
		}else if(this.y > HEIGHT-200){
			this.vY = -.1;
		}else if(this.y < -100){
			this.vY = .1;
		}
	}
}
function Shark(x, y, vX, vY, mouthX){
	this.x = x;
	this.y = y;
	this.vX = vX;
	this.vY = vY;
	this.mouthX = mouthX;
	this.mouthY = 103;
	
	this.img = new Image();
	if(vX < 0){
		this.img.src = "img/shark2.png";
	}
	else{
		 this.img.src = "img/shark.png";
	}
	
	
	this.draw = function(){
		ctx.drawImage(this.img, this.x, this.y);
		this.x+= this.vX;
		

	}
}

function Fish(x, y, vX, vY, type){
	this.type = type;   // 0 for player, 1 for regular fish, 2 for predator fish
	switch(type){
	case 0:
		this.speed = preySpeed;
		break;
	case 1:
		this.speed = preySpeed;
		this.img1 = new Image()
		this.img1.src = "img/clown fish.png";
		this.img2 = new Image();
		this.img2.src = "img/clown fish2.png";
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
		/*
		ctx.save();
		ctx.strokeStyle = "black";
		ctx.fillStyle = "purple";
		ctx.beginPath();
		

		ctx.moveTo(this.x,this.y);
        ctx.lineTo(this.x + 6*this.vX, this.y + 6*this.vY);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		ctx.restore();
		*/
		
		ctx.save();
			var aTanVal = Math.atan(this.vY/this.vX);
			ctx.translate(this.x-25, this.y-15);
			
			if(this.vX < 0){
				ctx.rotate(Math.PI+aTanVal);
				ctx.drawImage(this.img2, 0, 0);
			} else{
				ctx.rotate(aTanVal);
				ctx.drawImage(this.img1, 0, 0);
			}
			ctx.restore();
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
		if(i == 0){
			tmp.img1.src = "img/lead fish.png";
			tmp.img2.src = "img/lead fish2.png";
		}
		flock.push(tmp);  //add new fish to end of flock array
	}
	

}
function fillSharks(qty){
	for (var i = 0; i < qty; i++){
		var rx = randFromTo(0, 1);	//random x position between 1 and 2
		var ry = randFromTo(1, HEIGHT-200);	//random y position between 1 and height
		//var rvX = randFromTo(1, preySpeed);  //random x velocity between 1 and speed
		//var rvY = randFromTo(1, preySpeed);  //random y velocity between 1 and speed
		var rvX;
		var mouthX;
		if(rx > .5){
			rvX = 2;
			rx = -1*randFromTo(300,900);
			mouthX = 434;
		} else{
			rvX = -2;
			rx = WIDTH + randFromTo(300,900);
			mouthX = 41;
		}
		var rvY = 0;
		var tmp = new Shark(rx, ry, rvX, rvY, mouthX);
		sharks.push(tmp);  //add new fish to end of flock array
	}
}



function renderFlock(){
	for(var i = 0; i <  flock.length; i++){
		flock[i].draw();
		//ctx.font = "14pt Arial";
		//ctx.fillText(i, flock[i].x, flock[i].y + -20);
	}
}


function renderSharks(){
	for(var i = 0; i <  sharks.length; i++){
		sharks[i].draw();
		//ctx.font = "14pt Arial";
		//ctx.fillText(i, flock[i].x, flock[i].y + -20);
	}
}
var oct = new Octopus(300, 300);
function renderOctopuses(){
	oct.draw();
}

function updateSharks(){
	for(var i = 0; i <  sharks.length; i++){
		var s = sharks[i];
		if((s.vX > 0 && s.x > WIDTH+50) || (s.vX < 0 && s.x < -500)){
			sharks.splice(i, 1);
			fillSharks(1);
		}
	}
}
function updateFlock(){
	
	//temporory, makes them all move
	for(var i = 0; i < flock.length; i++){
		flock[i].move();
	}
	
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
			
			if(dist <= preySight){  //update if more than one type of fish
			//tmpVX[i] += (fishJ.vX / (dist + align));
			//tmpVY[i] += (fishJ.vY / (dist + align));
				if(j == 0){ //player fish nearby, disregard own vector
					tmpVX[i] += (fishJ.vX / ((dist*leadStr) + align));
					tmpVY[i] += (fishJ.vY / ((dist*leadStr) + align));
				}else{ //other fish
					tmpVX[i] += (fishJ.vX / (dist + align));
					tmpVY[i] += (fishJ.vY / (dist + align));
				}
			
			}
			
			/*
			//redirect if too close 
			if(dist <= crowdDist && dist > 0){  //dist == 0 when self so disregard 0
				tmpVX[i] = -fishJ.vX;
				tmpVY[i] = -fishJ.vY;
			}*/
			
			//slightly smoother redirect, only on the minor axis, also no bounce for player fish
			if(dist <= crowdDist && dist > 0 && j !=0){  //dist == 0 when self so disregard 0
				if(fishJ.vX > fishJ.vY){
					tmpVY[i] = -fishJ.vY;
				}else{
					tmpVX[i] = -fishJ.vX;
				}
			}
        }
		for(var j = 0; j < sharks.length; j++){
			var shark = sharks[j];
			if( Math.abs(fishI.x - (shark.x+shark.mouthX)) < 25 && Math.abs(fishI.y - (shark.y+shark.mouthY)) < 20){
				flock.splice(i, 1);
				i--;
				if(i == -1 && flock.length > 0){
					flock[0].img1.src = "img/lead fish.png";
					flock[0].img2.src = "img/lead fish2.png";
				}
			}
		}
    }
	
    //start at 1 to not affect player
	for(var i= 1; i < flock.length;  i++) {
			//alert("tmvVX " +i + ": " + tmpVX[i] + "\ntmvVY " +i + ": " + tmpVY[i]);
            flock[i].vX = tmpVX[i];
            flock[i].vY = tmpVY[i];
			flock[i].norm();
        } 
	
	
}
	
function updateGame(){
	updateFlock();
	//updatePredators
	updateSharks();
	//update user interface (health, score, etc)
}

function init() {
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.strokeStyle = "black";
	fillFlock(50);
	fillSharks(3);
  
	//change to request animation frame
	return setInterval(gameLoop, 10);  //calls the gameLoop function every 10 milliseconds
}



function doKeyDown(evt){
	switch (evt.keyCode) {
	case 38:  /* Up arrow was pressed */
		//flock[0].vX += 1;
		//flock[0].vY += 1;
		break;
	case 40:  /* Down arrow was pressed */
		//flock[0].vX -= 1;
		//flock[0].vY -= 1;
		break;
	case 37:  /* Left arrow was pressed */
		arcPlayer -= 0.1;
		flock[0].vX = Math.cos(arcPlayer);
		flock[0].vY = Math.sin(arcPlayer);
		flock[0].norm();
		break;
	case 39:  /* Right arrow was pressed */
		arcPlayer += 0.1;
		flock[0].vX = Math.cos(arcPlayer);
		flock[0].vY = Math.sin(arcPlayer);
		flock[0].norm();
		break;
	}
}

function gameLoop() {

	updateGame();  //update game pieces, score, etc
	
	ctx.clearRect(0, 0, WIDTH, HEIGHT); //erase everything on the canvas
	
	//white canvas background, remove when we get an image in place
	ctx.fillStyle = "#0589B2";
	ctx.fillRect(0,0,WIDTH,HEIGHT);
	
	//draw background image
 //draw regular fish (flock)
	//draw predators
	renderSharks();
		renderFlock(); 
	renderOctopuses();
}

window.onload = function(){
init();
}

window.addEventListener('keydown',doKeyDown,true);