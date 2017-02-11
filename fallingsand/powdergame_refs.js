
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
const FLY = 64;
const VOLATILE = 128;
const FLAMMABLE = 256;
const IGNITE = 512;

const SAND = HIGH_DENSITY | GRAVITY | HIGH_FRICTION | FLAMMABLE;
const WATER = MEDIUM_DENSITY | GRAVITY | FLUID | LOW_FRICTION;
const FIRE = LOW_DENSITY | FLY | MEDIUM_FRICTION | VOLATILE | IGNITE;
const STONE = HIGH_DENSITY | GRAVITY;
const BIRD = LOW_DENSITY | FLY | MEDIUM_FRICTION;
const NUM_OBJ_TYPES = 5;
// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags, pos, object, newPos, currentType = 0;

var field = []; // the main field holding all information

var objects = [];
// a list of all pacticles that can do somehing or are drawn (static invisible walls can be excluded)

var objectTypes = [SAND, WATER, FIRE, STONE, BIRD];

// this can be simplified to object syntax later
var colours = [];
colours[SAND] = "#ba8";
colours[WATER] = "#22f";
colours[FIRE] = "#f00";
colours[STONE] = "#888";
colours[BIRD] = "#445";


// find better solution for this later
for (i=SIZE*1.5;i--;){
    field[i] = [];
}

// add some random objects
for (i=HEIGHT;i--;){
    // a particle consists of the pair of the binary flags and its position
//     objects[i] = [WATER, Math.random()*SIZE|0];
    
    
    // make vertical wall
    field[i*WIDTH] = [HIGH_DENSITY, i*WIDTH];
    // the floor can be done with less bytes in the move conditions
    // if there is only 1 moving down condition
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
        if (flags){
            // the drawing is one frame behind on the physics, but I don't think that matters
            // this is way simpler
            c.fillStyle = colours[flags];
            c.fillRect(pos%WIDTH,pos/WIDTH|0,1,1);
            // most probably go straight down, but there is a small chance to go left or right
            
            if (flags & VOLATILE && Math.random() < .1){
                object[0] = 0;
            }
            
            newPos = pos +
                WIDTH * (!!(flags & GRAVITY)-!!(flags & FLY)) +
                (Math.random() < (flags & FRICTION)*.3)*(Math.random()>.5?1:-1);
            
            
            // if not the newPos has lower density, or this cell is fluid and the cell above newPos has lower density
            if(!(newPos<SIZE && newPos>0 && (field[newPos][0] & DENSITY) < (flags & DENSITY) || flags & FLUID && (field[newPos -= WIDTH][0] & DENSITY) < (flags & DENSITY))){
                newPos = pos;
            }
            
            if (flags & IGNITE && field[newPos+WIDTH][0] & FLAMMABLE){
                field[newPos+WIDTH][0] = FIRE;
            }
            
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
onclick = e => {
    for (i=20; i--;){
        objects.push([
            objectTypes[currentType%NUM_OBJ_TYPES], Math.min(e.offsetX,WIDTH)+Math.min(e.offsetY*WIDTH, SIZE)]);
    }
}

// press any key to change type of spawned particle
onkeydown = _ => currentType++;

