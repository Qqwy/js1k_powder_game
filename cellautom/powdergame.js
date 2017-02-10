

const WIDTH = 100;
const HEIGHT = 120;
const SIZE = WIDTH * HEIGHT;
const PIXELS_PER_CELL = 1;
const FPS = 30;

var field = []; // the main field holding all information
var tfield; // termporary field to write the update to. becomes field



/*
 * binary flags:
 * 1: solid. Will block other particles trying to enter
 * 2: gravity loaded
 */

// add some random sand
for (i=0; i<1000;i++){
    field[Math.random()*SIZE|0] = 3;
}




function update(){
    
    var updateStart = Date.now();
    // add a floor below the field
    for (i=1; i<=WIDTH; i++){
        field[SIZE-i] = 1;
    }
    tfield = [];
    c.clearRect(0,0,WIDTH * PIXELS_PER_CELL, HEIGHT * PIXELS_PER_CELL);
    for (i=0; i<SIZE; i++){
        if (!(field[i]&1) && field[i-WIDTH]&2){
            tfield[i] = field[i-WIDTH];
        }
        if (field[i] && field[i+WIDTH]&1){
            tfield[i] = field[i];
        }
        if (tfield[i]){
            c.fillRect(PIXELS_PER_CELL*(i%WIDTH),PIXELS_PER_CELL*(i/WIDTH|0),PIXELS_PER_CELL,PIXELS_PER_CELL);
        }
    }
    field = tfield;
    console.log(Date.now()-updateStart);
    requestAnimationFrame(update);
}
requestAnimationFrame(update);
// setInterval(update,20);
