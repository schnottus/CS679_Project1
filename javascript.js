
	
var WIDTH = 1200;  //height and width should match canvas in index.html, is there a way to assert this?
var HEIGHT = 800;
var canvas;
var ctx;

var flock = [];


var x = 100;
var y = 100;

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

function printFlock(){ //flock troubleshooting
	var str = "Flock array:";
	
	for(var i = 0; i < flock.length; i++){
		str += "\nfish " +i +": " +flock[i].x +", " +flock[i].y;
	}
	
	alert(str);
}

function Fish(x, y){
	this.x = x;
	this.y = y;
	this.draw = function(){
		ctx.fillStyle = "purple";
        circle(this.x, this.y, 10);
	}
}
//var myFish = new Fish(20, 20);
//var myFish2 = new Fish(20, 40);

function fillFlock(qty){
	for (var i = 0; i < qty; i++){
		var rx = Math.floor((Math.random()*WIDTH)+1);	//random x position between 1 and width
		var ry = Math.floor((Math.random()*HEIGHT)+1);	//random y position between 1 and height
		var tmp = new Fish(rx, ry);
		flock.push(tmp);  //add new fish to end of flock array
	}

}

function renderFlock(){
	var size = flock.length;
	for(var i = 0; i < size; i++){
		flock[i].draw();
	}
}
	


function init() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  
  fillFlock(10);
  
  return setInterval(draw, 10);  //calls the draw function every 10 milliseconds
  
  
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

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT); //erase everything on the canvas
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  //rect(300,300,200,50);

  //myFish.draw();
  //myFish2.draw();
  
  renderFlock();
}

window.onload = function(){
init();
}
window.addEventListener('keydown',doKeyDown,true);
