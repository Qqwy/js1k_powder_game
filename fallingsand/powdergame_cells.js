
const WIDTH = 900;
const HEIGHT = 600;
const OBJECTS = 100000;
const SIZE = WIDTH * HEIGHT;
const DELAY = 16; // 1000/FPS

const DROP_SIZE = 9;


// binary flags

// the higher the spread, the higher the chance of moving on the x axis
// the values of these constants actually matter
// since they are used in a multiplication
const SPREAD = 6;
const LOW_SPREAD = 2;
const MEDIUM_SPREAD = 4;
const HIGH_SPREAD = 6;
// medium or high spread automatically implies fluid
const FLUID = 4;

const UPDATE_BIT = 1;
const GRAVITY = 8;
const DENSITY = 192;
const LOW_DENSITY = 64;
const MEDIUM_DENSITY = 128;
const HIGH_DENSITY = 192;

const VOLATILE = 32;
const SLOW = 16;
const FLY = SLOW;
const TRAIL = 256;
const REACT_ABOVE = 1<<12;
const REACT_SIDE = 1<<13;
const REACT_BELOW = 1<<14;
const REACT_NEIGHBOURS = REACT_ABOVE | REACT_SIDE | REACT_BELOW;

// afther the PRODUCT_SHIFTth bit, the key for the product starts
// the PRODUCT number is the index of that type in the particleTypes array
const PRODUCT_SHIFT = 27;

// those numbers refer to the index in particleTypes array
const NUM_PLACABLE_TYPES = 10;
const FIRE_PLACE = 3;
const WOOD_PLACE = 0 + NUM_PLACABLE_TYPES;
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
const EMPTY = 0; // trees need to grow through empty so this might not be 0 later

const SAND = HIGH_DENSITY | GRAVITY | LOW_SPREAD | FLAMMABLE | SOIL | NEED_WATERING | (MUD_PLACE << PRODUCT_SHIFT);
const MUD = HIGH_DENSITY | GRAVITY | LOW_SPREAD | SOIL | SLOW;
const WATER = MEDIUM_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | WATERING;
const OIL = LOW_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | FLAMMABLE;
const FIRE = LOW_DENSITY | FLY | HIGH_SPREAD | VOLATILE | IGNITE | REACT_NEIGHBOURS | (FIRE_PLACE << PRODUCT_SHIFT);
const BLOCK = HIGH_DENSITY;
const GAS = LOW_DENSITY | FLY | HIGH_SPREAD | FLAMMABLE | FLUID;
const SEED = HIGH_DENSITY | GRAVITY | LOW_SPREAD | FLAMMABLE | NEED_SOIL | REACT_NEIGHBOURS | (TREE_PLACE << PRODUCT_SHIFT);
const TREE = HIGH_DENSITY | FLY | MEDIUM_SPREAD | TRAIL | VOLATILE | (WOOD_PLACE << PRODUCT_SHIFT);
const WOOD = HIGH_DENSITY | NEED_WATERING | REACT_ABOVE | FLAMMABLE | (TREE_PLACE << PRODUCT_SHIFT);
const STONE = HIGH_DENSITY | GRAVITY | SLOW; // slow is set to have at least some vertical spread

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags, pos, object, newPos, imgdata, update, md, mx, my, i, colour;
var currentType = 0;
var evenLoop = UPDATE_BIT;

var field = new Uint32Array(SIZE); // the main field holding all information

var particleTypes = [SAND, WATER, OIL, FIRE, BLOCK, GAS, SEED, STONE, SAND, SAND, // placable
    WOOD, TREE, MUD]; // not placable

var colours = [];
// RGB
colours[SAND|UPDATE_BIT] = 'ba8';//0x88aabb;
colours[MUD|UPDATE_BIT] = '975';//0x7799bb;
colours[WATER|UPDATE_BIT] = '27f';//0xff2222;
colours[OIL|UPDATE_BIT] = '733';//0x333377;
colours[FIRE|UPDATE_BIT] = 'f00';//0x0000ff;
colours[BLOCK| UPDATE_BIT] = '888';//0x888888;
colours[GAS| UPDATE_BIT] = '060';//0x006600;
colours[TREE| UPDATE_BIT] = '0a0';//0x00aa00;
colours[SEED | UPDATE_BIT] = '6a6';//0x66aa66;
colours[WOOD | UPDATE_BIT] = '980';//0x008899;
colours[STONE | UPDATE_BIT] = 'bbb';

// doing this calcualtion each step was terrible for performance
// therefore, calculate the colours now
var pixelColours = [];
for (colour in colours){
    for (i=3;i--;){
        pixelColours[colour] |= "0x"+colours[colour][i]+colours[colour][i]<<i*8;
    }
};

var drawData = new ArrayBuffer(SIZE*4);
var pixel32Array = new Uint32Array(drawData)
var imgDataArray = new Uint8ClampedArray(drawData);

md = 0;
mx = my = -1;
// right clicking used to give a problem because it sometimes triggers mousedown but not mouseup
// setting instead of adding should fix this
onmousedown = e => md=1;
onmouseup   = e => md=0;
onmousemove = e => {mx = e.offsetX; my = e.offsetY};




// press the number keys to set the corresponding type of spawned particle
// any other key gets the first particle (sand)
onkeydown = e => currentType = e.key|0

// var startTime = Date.now();
// var totalSteps = 0;
// var updateEnd = Date.now();

update = e => {
    
//     var updateStart = Date.now();
    
    for (y=DROP_SIZE;md && --y>-DROP_SIZE;){
        for (x=DROP_SIZE;--x>-DROP_SIZE;){
            if (x*x+y*y < DROP_SIZE*DROP_SIZE){
                field[mx+x+(my+y)*WIDTH] = particleTypes[currentType%NUM_PLACABLE_TYPES] ^ evenLoop ^ UPDATE_BIT;
            }
        }
    }
    
    pixel32Array.fill(0xff000000);
    
    for (pos=SIZE; pos--;){
        flags = field[pos];
        if (flags ^ EMPTY && UPDATE_BIT & flags ^ evenLoop){
            
            // the drawing is one frame behind on the physics, but I don't think that matters
            // this is way simpler
            pixel32Array[pos] |= pixelColours[flags|UPDATE_BIT];
            
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
            
            
            // most probably go straight down, but there is a small chance to go left or right depending on spread
            newPos = pos +
                WIDTH*(!!(flags & GRAVITY) - (flags&SLOW && Math.random()>.5)) +
                ((Math.random() - .5) * (1+(flags & SPREAD))|0);
            
            
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
    
    for (i=NUM_PLACABLE_TYPES;i--;)
    {
            // c.fillStyle = 'rgb('+ (colours[particleTypes[i]|UPDATE_BIT] & 0xff) +','+ ((colours[particleTypes[i]|UPDATE_BIT] & 0xff00) >> 8) +','+ ((colours[particleTypes[i]|UPDATE_BIT] & 0xff0000) >> 16) +')';
        c.fillStyle = '#'+colours[particleTypes[i]|UPDATE_BIT];
        c.fillRect(i*16+9, i==currentType%NUM_PLACABLE_TYPES ? 16 : 9, 9, 9);
        // if(i == currentType%NUM_PLACABLE_TYPES)
            // c.fillRect(i*16+9, 20, 9, 2);
    }
    
    // toggle update bit of update
    evenLoop ^= UPDATE_BIT;
    
//     console.log((Date.now()-updateEnd));/*/-startTime)/++totalSteps);/**/
//     updateEnd = Date.now();
    
    requestAnimationFrame(update);
}//,DELAY);

update();
