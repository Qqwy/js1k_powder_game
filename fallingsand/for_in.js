

const WIDTH = 400;
const HEIGHT = 400;
const SAND = 10000;
const SIZE = WIDTH * HEIGHT;
const FPS = 60;

var field = []; // the main field holding all information



/*
 * binary flags:
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


function update(){
    
    // for timing the update costs. remove when minifying
    var updateStart = Date.now();
    
    c.clearRect(0,0,WIDTH , HEIGHT);
    
    // js arrays are actually hashmaps so empty cells are skipped
    for (i in field){
        // unfortunately, the iterator is a string. this fixes it
        i |= 0;
        
        // the drawing is one frame behind on the physics, but I don't think that matters
        // this is way simpler
        c.fillRect(i%WIDTH,i/WIDTH|0,1,1);
        
        // if this cell has gravity and the cell below is empty
        if (field[i]&4 && !(field[i+WIDTH]&2)){
            // set the cell below
            field[i+WIDTH] = field[i];
            // free the original cell so it gets skipped in the loop
            // this step is the main bottleneck
            delete field[i];
        }
    }
    
    // for timing the update costs. remove when minifying
    console.log(Date.now()-updateStart);
//     requestAnimationFrame(update);
}
// requestAnimationFrame(update);
setInterval(update,1000/FPS);
