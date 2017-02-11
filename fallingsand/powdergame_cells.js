
const WIDTH = 500;
const HEIGHT = 400;
const OBJECTS = 10000;
const SIZE = WIDTH * HEIGHT;
const DELAY = 30; // 1000/FPS

// binary flags
const UPDATE_BIT = 1;
const GRAVITY = 8;
const FLUID = 16;
const DENSITY = 6;
const LOW_DENSITY = 2;
const MEDIUM_DENSITY = 4;
const HIGH_DENSITY = 6;
const VISIBLE = 32

const SAND = HIGH_DENSITY | GRAVITY | VISIBLE;
const WATER = LOW_DENSITY | GRAVITY | FLUID | VISIBLE;

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags, pos, object, newPos;
var evenLoop = UPDATE_BIT;

var field = []; // the main field holding all information

var colours = [];
colours[SAND|UPDATE_BIT] = "#ba8";
colours[WATER|UPDATE_BIT] = "#22f";

// add some random objects
for (i=0; i<OBJECTS;i++){
    // a particle consists of the pair of the binary flags and its position
    field[Math.random()*SIZE|0] = WATER;
    
    // make vertical wall
    // it will have the height of OBJECTS instead of HEIGHT, but as long as OBJECTS>HEIGHT that's okay
    field[i*WIDTH]=HIGH_DENSITY;
    // the floor can be done with less bytes in the move conditions
    // if there is only 1 moving down condition
}




var startTime = Date.now();
var totalSteps = 0;

setInterval(_=>{
    
    
    
    c.clearRect(0,0,WIDTH, HEIGHT);
    
    
    for (pos=0; pos<SIZE; pos++){
        flags = field[pos];
        if (flags & VISIBLE && UPDATE_BIT & flags ^ evenLoop){
            // the drawing is one frame behind on the physics, but I don't think that matters
            // this is way simpler
            c.fillStyle = colours[flags|UPDATE_BIT];
            c.fillRect(pos%WIDTH,pos/WIDTH|0,1,1);
            
            // most probably go straight down, but there is a small chance to go left or right
            newPos = pos + WIDTH*(flags & GRAVITY && pos < SIZE) + (Math.random()*2.4-1.2|0);
            // if the newPos is not solid, or this cell is fluid and the cell above newPos is not solid
            if(
                (field[newPos] & DENSITY) < (flags & DENSITY) ||
                flags & FLUID && (field[newPos -= WIDTH] & DENSITY) < (flags & DENSITY)){
            } else {
                newPos = pos;
            }
            // move to newPos
            field[pos] = field[newPos];
            field[newPos] = flags ^ UPDATE_BIT;
        }
    }
    // toggle update bit of update
    evenLoop ^= UPDATE_BIT;
    console.log((Date.now()-startTime)/++totalSteps);;
    
    
},DELAY);

// when the mouse is pressed, create 20 objects under the cursor
onmousedown = e => {field[e.offsetX+e.offsetY*WIDTH] = SAND}
