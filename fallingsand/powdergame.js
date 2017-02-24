
const WIDTH = 200;
const HEIGHT = 200;
const OBJECTS = 10000;
const SIZE = WIDTH * HEIGHT;
const DELAY = 30; // 1000/FPS

// binary flags
const DENSITY = 3;
const LOW_DENSITY = 1;
const MEDIUM_DENSITY = 2;
const HIGH_DENSITY = 3;
const GRAVITY = 8;
const FLUID = 4;

const SAND = HIGH_DENSITY | GRAVITY;
const WATER = LOW_DENSITY | GRAVITY | FLUID;

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags, pos, object, newPos;

var field = []; // the main field holding all information

// a list of all pacticles that can do somehing or ar drawn (static invisible walls can be excluded)
var objects = [];

var colours = [];
colours[SAND] = "#ba8";
colours[WATER] = "#22f";

// add some random objects
for (i=0; i<OBJECTS;i++){
    // a particle consists of the pair of the binary flags and its position
    objects[i] = [WATER, Math.random()*SIZE|0];
    
    // make vertical wall
    // it will have the height of OBJECTS instead of HEIGHT, but as long as OBJECTS>HEIGHT that's okay
    field[i*WIDTH]=HIGH_DENSITY;
    // the floor can be done with less bytes in the move conditions
    // if there is only 1 moving down condition
}


var startTime = Date.now();
var totalSteps = 0;

// var updateStart = Date.now();

setInterval(_=>{
    
    
    
    c.clearRect(0,0,WIDTH, HEIGHT);
    
    // ES6 syntax. closure can only work up to ES5. closure will make a huge workaround
    // My best solution so far is to manually remove workaround
    for (object of objects){
        // same as previous line
        [flags, pos] = object;
        
        // the drawing is one frame behind on the physics, but I don't think that matters
        // this is way simpler
        c.fillStyle = colours[flags];
        c.fillRect(pos%WIDTH,pos/WIDTH|0,1,1);
        
        // if this cell has gravity
        if (flags & GRAVITY && pos < SIZE){
            // most probably go straight down, but there is a small chance to go left or right
            newPos = pos + WIDTH + (Math.random()*2.4-1.2|0);
            // if the newPos is not solid, or this cell is fluid and the cell above newPos is not solid
            if((field[newPos] & DENSITY) < (flags & DENSITY) || flags & FLUID && (field[newPos -= WIDTH] & DENSITY) < (flags & DENSITY)){
                // move to newPos
                field[pos] = field[newPos];
                field[newPos] = flags;
                object[1] = newPos;
            }
        }
    }
    console.log((Date.now()-startTime)/++totalSteps);
//     updateStart = Date.now();
    
},DELAY);

// when the mouse is pressed, create 20 objects under the cursor
onmousedown = e => {for (i=200; i--;)objects.push([SAND, e.offsetX+i+e.offsetY*WIDTH])};
