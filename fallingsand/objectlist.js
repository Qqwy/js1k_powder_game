
const WIDTH = 400;
const HEIGHT = 400;
const SAND = 10000;
const SIZE = WIDTH * HEIGHT;
const FPS = 60;

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags, pos, object;

var field = []; // the main field holding all information

// a list of all pacticles that can do somehing (static walls etc. can be excluded)
var objects = [];


/*
 * binary flags:
 * 1: solid. Will block other particles trying to enter
 * 2: gravity loaded
 */

// add some random sand
for (i=0; i<SAND;i++){
    // a particle consists of the pair of the binary flags and its position
    objects[i] = [3, Math.random()*SIZE|0];
}


// add a floor below the field
for (i=0; i<WIDTH; i++){
    field[SIZE+i] = 1;
}


function update(){
    
    // for timing the update costs. remove when minifying
    var updateStart = Date.now();
    
    c.clearRect(0,0,WIDTH, HEIGHT);
    
    // ES6 syntax. closure can only work up to ES5. closure will make a huge workaround
    // My best solution so far is to manually remove workaround
    for (object of objects){
        // same as previous line
        [flags, pos] = object;
        
        // the drawing is one frame behind on the physics, but I don't think that matters
        // this is way simpler
        c.fillRect(pos%WIDTH,pos/WIDTH|0,1,1);
        
        // if this cell has gravity and the cell below is empty
        if ((flags & 2) && (1 ^ field[pos + WIDTH] & 1)){
            // move the cell down
            field[pos + WIDTH] = flags;
            field[pos] = 0;
            object[1] += WIDTH
        }
    }
    
    // for timing the update costs. remove when minifying
    console.log((Date.now()-updateStart));
//     requestAnimationFrame(update);
}
// requestAnimationFrame(update);
setInterval(update,1000/FPS);
