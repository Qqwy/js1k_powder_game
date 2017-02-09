
var air, canvas, ctx;
const CELL_SIZE = 8;
const FPS = 10
const WIDTH = 80;
const HEIGHT = 60

function main(){
    canvas = document.getElementById("outputcanvas");
    ctx = canvas.getContext("2d");
    
    air = new Air(WIDTH, HEIGHT, 0);
    canvas.width = air.width*CELL_SIZE;
    canvas.height = air.height*CELL_SIZE;
    
    
    
//     air.pressure.set(10,10,5000);
    
    
    // var loop = setInterval(update, 1000 / FPS);
    window.addEventListener("keydown", function(e){
        if (e.which == 81){ // 'q'
            clearInterval(loop);
        }
    });
    
    
    canvas.addEventListener("contextmenu", function(e){e.preventDefault();});
    canvas.addEventListener("mousedown", function(e){
        e.preventDefault();
        if (e.button == 0){
            increasePressure(e.offsetX, e.offsetY, 2000);
        } else if (e.button == 2){
            increasePressure(e.offsetX, e.offsetY, -2000);
        }
    });
}

function increasePressure(x, y, amount){
    var cellX = x / CELL_SIZE | 0;
    var cellY = y / CELL_SIZE | 0;
    air.pressure.set(cellX, cellY, air.pressure.get(cellX, cellY) + amount);
}

function update(){
    air.update();
    draw();
    requestAnimationFrame(update);
}
requestAnimationFrame(update);

function draw(){
    air.pressure.forAny(function(value, [x, y]){
        // draw air pressure. Positive pressure is green, negative pressure is blue
        var scale = (v) =>(v>0 ? Math.log(v+1)*25|0 : 0)
        ctx.fillStyle = "rgb(0," + scale(value) + ","+scale(-value)+")";
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
    air.velocityX.forAny(function(value, [x,y]){
        // draw wind velocity vectors in red
        var vx = value;
        var vy = air.velocityY.get(x, y);
        ctx.strokeStyle = "#F00"//"rgba(255,0,0,"+value+")";
        ctx.beginPath();
        var centerX = (x+.5)*CELL_SIZE;
        var centerY = (y+.5)*CELL_SIZE
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + vx*CELL_SIZE, centerY + vy*CELL_SIZE);
        ctx.stroke();
    });
}


window.addEventListener("load", main);
