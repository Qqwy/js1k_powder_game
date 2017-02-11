
const WIDTH = 400;
const HEIGHT = 400;
const SAND = 10000;
const SIZE = WIDTH * HEIGHT;
const FPS = 60;

var evenloop;

var field = []; // the main field holding all information



/*
 * binary flags:
 * 1: update flag. whether the cell was last updated in an even or odd update
 * 2: solid. Will block other particles trying to enter
 * 4: gravity loaded
 */

// add some random sand
for (i=0; i<SAND;i++){
    field[Math.random()*SIZE|0] = 6;
}


// add a floor below the field
for (i=1; i<=WIDTH; i++){
    field[SIZE-i] = 2;
}

evenLoop = 1;

function update(){
    
    // for timing the update costs. remove when minifying
    var updateStart = Date.now();
    
    c.clearRect(0,0,WIDTH , HEIGHT);
    
    for (i=0; i<SIZE; i++){
        if (field[i]){
            // a cell might be drawn twice per step, but this is not very bad
            // I think this might be a nice effect
            c.fillRect(i%WIDTH,i/WIDTH|0,1,1)
            
            // if the cell wasn't updated this update
            if (1 & field[i] ^ evenLoop){
                // togggle update bit of cell
                field[i] ^= 1;
                
                // move down if possible
                if (field[i]&4 && !(field[i+WIDTH]&2)){
                    field[i+WIDTH] = field[i];
                    field[i] = 0;
                }
            }
        }
    }
    // toggle update bit of update
    evenLoop ^= 1;
    
    // for timing the update costs. remove when minifying
    console.log((Date.now()-updateStart));
//     requestAnimationFrame(update);
}
// requestAnimationFrame(update);
setInterval(update,1000/FPS);
