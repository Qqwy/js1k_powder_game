
const WIDTH = 500;
const HEIGHT = 400;
const SAND = 10000;
const SIZE = WIDTH * HEIGHT;
const DELAY = 30; // 1000/FPS

// binary flags
const SOLID = 1; // will probably be replaced by density
const GRAVITY = 2;
const FLUID = 4;

const DEFAULT_PARTICLE = SOLID | GRAVITY | FLUID;

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags, pos, object, newPos;

var field = []; // the main field holding all information

// a list of all pacticles that can do somehing or ar drawn (static invisible walls can be excluded)
var objects = [];


// add some random sand
for (i=0; i<SAND;i++){
    // a particle consists of the pair of the binary flags and its position
    objects[i] = [DEFAULT_PARTICLE, Math.random()*SIZE|0];
    
    // make vertical wall
    // it will have the height of SAND instead of HEIGHT, but as long as SAND>HEIGHT that's okay
    field[i*WIDTH]=SOLID;
    // the floor can be done with less bytes in the move conditions
    // if there is only 1 moving down condition
}


setInterval(()=>{
    
    
    c.clearRect(0,0,WIDTH, HEIGHT);
    
    // ES6 syntax. closure can only work up to ES5. closure will make a huge workaround
    // My best solution so far is to manually remove workaround
    for (object of objects){
        // same as previous line
        [flags, pos] = object;
        
        // the drawing is one frame behind on the physics, but I don't think that matters
        // this is way simpler
        c.fillRect(pos%WIDTH,pos/WIDTH|0,1,1);
        
        // if this cell has gravity
        if (flags & GRAVITY && pos < SIZE){
            // most probably go straight down, but there is a small chance to go left or right
            newPos = pos + WIDTH + (Math.random()*2.4-1.2|0);
            // if the newPos is not solid, or this cell is fluid and the cell above newPos is not solid
            if(SOLID ^ field[newPos] & SOLID || flags & FLUID && SOLID ^ field[newPos -= WIDTH] & SOLID){
                // move to newPos
                field[newPos] = flags;
                field[pos] = 0;
                object[1] = newPos;
            }
        }
    }
    
},DELAY);
