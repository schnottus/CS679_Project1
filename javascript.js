var WIDTH = 1200;
var HEIGHT = 800;
var canvas;
var ctx;

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

function init() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  return setInterval(draw, 10);  //calls the draw function every 10 milliseconds
}


function doKeyDown(evt){
	switch (evt.keyCode) {
	case 38:  /* Up arrow was pressed */
	y -= 10;
	break;
	case 40:  /* Down arrow was pressed */
	y += 10;
	break;
	case 37:  /* Left arrow was pressed */
	x -= 10;
	break;
	case 39:  /* Right arrow was pressed */
	x += 10;
	break;
	}
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT); //erase everything on the canvas
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  rect(300,300,200,50);
  ctx.fillStyle = "purple";
  circle(x, y, 10);
}

init();
window.addEventListener('keydown',doKeyDown,true);
