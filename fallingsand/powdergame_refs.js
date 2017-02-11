
const WIDTH = 500;
const HEIGHT = 400;
const OBJECTS = 10000;
const SIZE = WIDTH * HEIGHT;
const DELAY = 30; // 1000/FPS

// binary flags
const FRICTION = 3;
// the lower the friction, the higher the chance of moving on the x axis
// I'm still not sure whether the friction bits are worth their code
const HIGH_FRICTION = 1;
const MEDIUM_FRICTION = 2;
const LOW_FRICTION = 3;
// important to keep 1st and 2nd bit for friction
// their value is actually used
const FLUID = 4;
const GRAVITY = 8;
const DENSITY = 48;
const LOW_DENSITY = 16;
const MEDIUM_DENSITY = 32;
const HIGH_DENSITY = 48;

const SAND = HIGH_DENSITY | GRAVITY | HIGH_FRICTION;
const WATER = LOW_DENSITY | GRAVITY | FLUID | LOW_FRICTION;

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags, pos, object, newPos;

var field = []; // the main field holding all information

// a list of all pacticles that can do somehing or are drawn (static invisible walls can be excluded)
var objects = [];

// this can be simplified to object syntax later
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

// find better solution for this later
for (i=SIZE*1.5;i--;){
    field[i] = [];
}
    

// var startTime = Date.now();
// var totalSteps = 0;

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
        // most probably go straight down, but there is a small chance to go left or right
        newPos = pos +
            WIDTH * (flags & GRAVITY && pos < SIZE) +
            (Math.random() < (flags & FRICTION)*.3)*(Math.random()>.5?1:-1);
        
        // if the newPos has lower density, or this cell is fluid and the cell above newPos has lower density
        if((field[newPos][0] & DENSITY) < (flags & DENSITY) || flags & FLUID && (field[newPos -= WIDTH][0] & DENSITY) < (flags & DENSITY)){
            // swap place with object at newPos
            field[newPos][1] = pos;
            field[pos] = field[newPos];
            field[newPos] = object;
            object[1] = newPos;
        }
    }
//     console.log((Date.now()-startTime)/++totalSteps);
//     updateStart = Date.now();
    
},DELAY);

// when the mouse is pressed, create 20 objects under the cursor
onmousedown = e => {for (i=20; i--;)objects.push([SAND, e.offsetX+e.offsetY*WIDTH])}
