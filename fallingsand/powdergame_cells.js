
const WIDTH = 900;
const HEIGHT = 600;
const OBJECTS = 100000;
const SIZE = WIDTH * HEIGHT;
const DELAY = 15; // 1000/FPS

const DROP_SIZE = 50;


// binary flags

const VISCOSITY = 3;
// the lower the viscosity, the higher the chance of moving on the x axis
// I'm still not sure whether the viscosity bits are worth their code
const HIGH_VISCOSITY = 1;
const MEDIUM_VISCOSITY = 2;
const LOW_VISCOSITY = 3;

const UPDATE_BIT = 4;
const GRAVITY = 8;
const FLUID = 16;
const DENSITY = 192;
const LOW_DENSITY = 64;
const MEDIUM_DENSITY = 128;
const HIGH_DENSITY = 192;
const VISIBLE = 32;

const FLY = 1024;
const VOLATILE = 2048;
const SLOW = 512;
const TRAIL = 256;
const REACT_ABOVE = 1<<12;
const REACT_SIDE = 1<<13;
const REACT_BELOW = 1<<14;
const REACT_NEIGHBOURS = REACT_ABOVE | REACT_SIDE | REACT_BELOW;

// afther the PRODUCT_SHIFTth bit, the key for the product starts
// the PRODUCT number is the index of that type in the particleTypes array
const PRODUCT_SHIFT = 27;

// those numbers refer to the index in particleTypes array
const NUM_PLACABLE_TYPES = 6;
const WOOD_PLACE = 0 + NUM_PLACABLE_TYPES;
const FIRE_PLACE = 2;
const TREE_PLACE = 1 + NUM_PLACABLE_TYPES;
const MUD_PLACE = 2 + NUM_PLACABLE_TYPES;



const REACTING_SHIFT = 22;
const REACTING = (1<<PRODUCT_SHIFT) - (1<<REACTING_SHIFT);
const IGNITE =  1 << REACTING_SHIFT + 0;
const NEED_SOIL =  1 << REACTING_SHIFT + 1;
const NEED_WATERING =  1 << REACTING_SHIFT + 2;

const REAGENT_SHIFT = 17;
const REAGENT = (1 << REACTING_SHIFT) - (1<<REAGENT_SHIFT);
const FLAMMABLE = 1 << REAGENT_SHIFT + 0;
const SOIL = 1 << REAGENT_SHIFT + 1;
const WATERING = 1 << REAGENT_SHIFT + 2;



// particle types
const SAND = VISIBLE | HIGH_DENSITY | GRAVITY | HIGH_VISCOSITY | FLAMMABLE | SOIL | NEED_WATERING | (MUD_PLACE << PRODUCT_SHIFT);
const MUD = VISIBLE | HIGH_DENSITY | GRAVITY | HIGH_VISCOSITY | SOIL | SLOW;
const WATER = VISIBLE | MEDIUM_DENSITY | GRAVITY | FLUID | LOW_VISCOSITY | WATERING;
const FIRE = VISIBLE | LOW_DENSITY | FLY | LOW_VISCOSITY | VOLATILE | IGNITE | REACT_NEIGHBOURS | (FIRE_PLACE << PRODUCT_SHIFT);
const PILLAR = VISIBLE | HIGH_DENSITY;
const GAS = VISIBLE | LOW_DENSITY | FLY | LOW_VISCOSITY | FLAMMABLE | FLUID;
const SEED = VISIBLE | HIGH_DENSITY | GRAVITY | HIGH_VISCOSITY | FLAMMABLE | NEED_SOIL | REACT_NEIGHBOURS | (TREE_PLACE << PRODUCT_SHIFT);
const TREE = VISIBLE | HIGH_DENSITY | FLY | MEDIUM_VISCOSITY | TRAIL | VOLATILE | (WOOD_PLACE << PRODUCT_SHIFT);
const WOOD = VISIBLE | HIGH_DENSITY | NEED_WATERING | REACT_ABOVE | FLAMMABLE | (TREE_PLACE << PRODUCT_SHIFT);

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags, pos, object, newPos, imgdata, update;
var currentType = 0;
var evenLoop = UPDATE_BIT;

var field = new Uint32Array(SIZE); // the main field holding all information

var particleTypes = [SAND, WATER, FIRE, PILLAR, GAS, SEED, // placable
    WOOD, TREE, MUD]; // not placable

var colours = [];
// aaBBGGRR
colours[SAND|UPDATE_BIT] = 0x88aabb;
colours[MUD|UPDATE_BIT] = 0x7799bb;
colours[WATER|UPDATE_BIT] = 0xff2222;
colours[FIRE|UPDATE_BIT] = 0x0000ff;
colours[PILLAR| UPDATE_BIT] = 0x888888;
colours[GAS| UPDATE_BIT] = 0x006600;
colours[TREE| UPDATE_BIT] = 0x00aa00;
colours[SEED | UPDATE_BIT] = 0x66aa66;
colours[WOOD | UPDATE_BIT] = 0x008899;

var drawData = new ArrayBuffer(SIZE*4);
var pixel32Array = new Uint32Array(drawData)
var imgDataArray = new Uint8ClampedArray(drawData);

for (i=HEIGHT;i--;){
    
    // make vertical wall
    field[i*WIDTH]=HIGH_DENSITY;
    // the floor can be done with less bytes in the move conditions
    // if there is only 1 moving down condition
}


// when the mouse is pressed, create 20 objects under the cursor
onmousedown = e => {
    for (i=DROP_SIZE;i--;){
        field[e.offsetX+e.offsetY*WIDTH+i] =
        field[e.offsetX+e.offsetY*WIDTH-i] =
        field[e.offsetX+(e.offsetY+i)*WIDTH] =
        field[e.offsetX+(e.offsetY-i)*WIDTH] = particleTypes[currentType%NUM_PLACABLE_TYPES];
    }
}



// press any key to change type of spawned particle
onkeydown = _ => currentType++;

// var startTime = Date.now();
// var totalSteps = 0;
update = _ => {
    
//     var updateStart = Date.now();
    
    pixel32Array.fill(0xff000000);
    
    for (pos=SIZE; pos--;){
        flags = field[pos];
        if (flags & VISIBLE && UPDATE_BIT & flags ^ evenLoop){
            
            // the drawing is one frame behind on the physics, but I don't think that matters
            // this is way simpler
            pixel32Array[pos] |= colours[flags|UPDATE_BIT];
            
            
            if (flags & VOLATILE && Math.random() < .1){
                flags = 0;
            }
            
            // react with neighbouring cells
            if (flags & REACT_ABOVE && field[pos-WIDTH] & REAGENT & (flags >> (REACTING_SHIFT - REAGENT_SHIFT))){
                field[pos-WIDTH] = particleTypes[flags>>PRODUCT_SHIFT]^evenLoop;
            }
            if (flags & REACT_BELOW && field[pos+WIDTH] & REAGENT & (flags >> (REACTING_SHIFT - REAGENT_SHIFT))){
                field[pos+WIDTH] = particleTypes[flags>>PRODUCT_SHIFT]^evenLoop;
            }
            if (flags & REACT_SIDE){
                if (field[pos+1] & REAGENT & (flags >> (REACTING_SHIFT - REAGENT_SHIFT))){
                    field[pos+1] = particleTypes[flags>>PRODUCT_SHIFT]^evenLoop;
                }
                if (field[pos-1] & REAGENT & (flags >> (REACTING_SHIFT - REAGENT_SHIFT))){
                    field[pos-1] = particleTypes[flags>>PRODUCT_SHIFT]^evenLoop;
                }
            }
            
            
            // most probably go straight down, but there is a small chance to go left or right
            newPos = pos +
                WIDTH*(!!(flags & GRAVITY) - !!(flags & FLY)) * (!(flags&SLOW) || Math.random()>.5) +
                (Math.random() < (flags & VISCOSITY)*.3)*(Math.random()>.5?1:-1);
            
            
            // if the newPos is not solid, or this cell is fluid and the cell above newPos is not solid
            if(!(newPos<SIZE && newPos>0 &&
                (field[newPos] & DENSITY) < (flags & DENSITY) ||
                flags & FLUID && (field[newPos = (newPos%WIDTH)+(pos/WIDTH|0)*WIDTH] & DENSITY) < (flags & DENSITY))){
                newPos = pos;
            }
            
            // react with newPos
            if (field[newPos] & REAGENT & (flags >> (REACTING_SHIFT - REAGENT_SHIFT))){
                flags = particleTypes[flags>>PRODUCT_SHIFT]^evenLoop;
            }
            
            // move to newPos
            if (flags & TRAIL){
                field[pos] = particleTypes[flags>>PRODUCT_SHIFT]^evenLoop;
            } else {
                field[pos] = field[newPos];
            }
            field[newPos] = flags ^ UPDATE_BIT;
        }
    }
    
    imgData = new ImageData(imgDataArray, WIDTH, HEIGHT);
    c.putImageData(imgData,0,0);
    
    // toggle update bit of update
    evenLoop ^= UPDATE_BIT;
    
//     console.log((Date.now()-updateStart));//-startTime)/++totalSteps);;
    
    requestAnimationFrame(update);
}//,DELAY);

update();
