

const WIDTH = 400;
const HEIGHT = 400;
const SAND = 10000;
const SIZE = WIDTH * HEIGHT;
const FPS = 30;

var tfield; // termporary field to write the update to. becomes field

var field = []; // the main field holding all information



/*
 * binary flags:
 * 1: solid. Will block other particles trying to enter
 * 2: gravity loaded
 */

// add some random sand
for (i=0; i<SAND;i++){
    field[Math.random()*SIZE|0] = 3;
}




function update(){
    
    // for timing the update costs. remove when minifying
    var updateStart = Date.now();
    
    // add a floor below the field
    // this should be inside update since field gets replaced every step
    // can possibly be replaced by an if action in the for loop
    for (i=1; i<=WIDTH; i++){
        field[SIZE-i] = 1;
    }
    
    tfield = [];
    c.clearRect(0,0,WIDTH, HEIGHT);
    
    for (i=0; i<SIZE; i++){
        // if the cell above is solid and the current one empty
        if ( 1 ^ field[i] & 1 && field[i-WIDTH] & 2){
            // set this to current field
            tfield[i] = field[i-WIDTH];
        }
        // if the cell below is solid
        if (field[i+WIDTH]&1){
            // nothing changes
            tfield[i] = field[i];
        }
        if (tfield[i]){
            // draw this cell if filled
            c.fillRect(i%WIDTH, i/WIDTH|0,1,1);
        }
    }
    
    field = tfield;
    
    // for timing the update costs. remove when minifying
    console.log(Date.now()-updateStart);
//     requestAnimationFrame(update);
}
// requestAnimationFrame(update);
setInterval(update,1000/FPS);
