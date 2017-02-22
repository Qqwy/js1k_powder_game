

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags,
    pos,
    object,
    newPos,
    imgdata,
    update,
    md,
    mx,
    my,
    i,
    j,
    colour,
    reactGroup1,
    reactGroup2,
    drawData,
    currentType,
    evenLoop,
    field,
    particleTypes,
    pixelColours,
    imgDataArray,
    pixel32Array;



const WIDTH = 800;
const HEIGHT = 500;
// const OBJECTS = 100000;
const SIZE = WIDTH * HEIGHT;
const DELAY = 16; // 1000/FPS

const DROP_SIZE = 4;


// binary flags

const UPDATE_BIT = 1;

// the higher the spread, the higher the chance of moving on the x axis
// the values of these constants actually matter
// since they are used in a multiplication
const SPREAD = 6;
const LOW_SPREAD = 2;
const MEDIUM_SPREAD = 4;
const HIGH_SPREAD = 6;
// medium or high spread automatically implies fluid
const FLUID = 4;

const GRAVITY = 8;
const SLOW = 16;
const FLY = SLOW;
const VOLATILE = 32;
const DENSITY = 192;
const LOW_DENSITY = 64;
const MEDIUM_DENSITY = 128;
const HIGH_DENSITY = 192;


const REACT_NEIGHBOURS = 1<<8; //REACT_ABOVE | REACT_SIDE | REACT_BELOW;



/* Each element can have 2 reactions in which it plays as an actor
 * Reaction 1 changes the reactable it reacts with, reaction 2 changes itself
 * movement still proceeds as usual
 * Both reactions have a different reactable group. they have 3 bits to refer to this group
 * Having the reactable group at 0 means this reaction won't happen
 */


const REAGENT_SHIFT = 9;
const DESTRUCTIBLE = 1;
const FLAMMABLE = 2;
const HOT = 3;
const SOIL = 4;
const PERFORABLE = 5; // questionable use
const WATERING = 6;
const CHEMICAL = 7;

const REACT_AS = 1<<REAGENT_SHIFT;


const REACTING1_SHIFT = 16;
const REACT1 = REACTING1_SHIFT;
// afther the PRODUCT_SHIFTth bit, the key for the product starts
// the PRODUCT number is the index of that type in the particleTypes array
const PRODUCT1_SHIFT = 19;
const REACTING1 = (1<<PRODUCT1_SHIFT) - (1<<REACTING1_SHIFT);

const REACTING2_SHIFT = 23;
const REACT2 = REACTING2_SHIFT;
const PRODUCT2_SHIFT = 26;
const REACTING2 = (1<<PRODUCT2_SHIFT) - (1<<REACTING2_SHIFT);



// those numbers refer to the index in particleTypes array
const NUM_PLACABLE_TYPES = 10;

const PLACABLE_BEGIN = 0;
const NON_PLACABLE_BEGIN = NUM_PLACABLE_TYPES;

const WATER_PLACE = PLACABLE_BEGIN + 2;
const FIRE_PLACE = PLACABLE_BEGIN + 3;
const BLOCK_PLACE = PLACABLE_BEGIN + 5;
const ICE_PLACE = PLACABLE_BEGIN + 9;
const RAINBOW1_PLACE = PLACABLE_BEGIN +9;
const WOOD_PLACE = NON_PLACABLE_BEGIN + 0;
const TREE_PLACE = NON_PLACABLE_BEGIN + 1;
const MUD_PLACE = NON_PLACABLE_BEGIN + 2;
const GAS_PLACE = NON_PLACABLE_BEGIN + 3;
const STONE_PLACE = NON_PLACABLE_BEGIN + 4;
const LEAF_PLACE = NON_PLACABLE_BEGIN + 5;
const RAINBOW2_PLACE = NON_PLACABLE_BEGIN + 2;

// particle types
const EMPTY = (REACT_AS << PERFORABLE);

const DUST = UPDATE_BIT | HIGH_DENSITY | GRAVITY | LOW_SPREAD | REACT_NEIGHBOURS | (REACT_AS << FLAMMABLE) | (REACT_AS << SOIL) | (WATERING << REACT2) | (MUD_PLACE << PRODUCT2_SHIFT) | (REACT_AS << DESTRUCTIBLE);
const MUD = UPDATE_BIT | HIGH_DENSITY | GRAVITY | LOW_SPREAD | (REACT_AS << SOIL) | SLOW | (REACT_AS << DESTRUCTIBLE);
const WATER = UPDATE_BIT | MEDIUM_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | (REACT_AS << WATERING) | (REACT_AS << PERFORABLE) | (REACT_AS << DESTRUCTIBLE);
const OIL = UPDATE_BIT | LOW_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | (REACT_AS << FLAMMABLE) | (REACT_AS << DESTRUCTIBLE) | (CHEMICAL << REACT2) | REACT_NEIGHBOURS | (GAS_PLACE << PRODUCT2_SHIFT);
const FIRE = UPDATE_BIT | LOW_DENSITY | FLY | HIGH_SPREAD | VOLATILE | (REACT_AS << HOT) | (FLAMMABLE << REACT1) | REACT_NEIGHBOURS | (FIRE_PLACE << PRODUCT1_SHIFT) | (WATERING << REACT2);
const BLOCK = UPDATE_BIT | HIGH_DENSITY;
const GAS = UPDATE_BIT | LOW_DENSITY | FLY | HIGH_SPREAD | (REACT_AS << FLAMMABLE) | FLUID;
const SEED = UPDATE_BIT | HIGH_DENSITY | GRAVITY | LOW_SPREAD | (REACT_AS << FLAMMABLE) | (SOIL << REACT2) | REACT_NEIGHBOURS | (TREE_PLACE << PRODUCT2_SHIFT) | (REACT_AS << DESTRUCTIBLE);
const TREE = UPDATE_BIT | HIGH_DENSITY | FLY | LOW_SPREAD | VOLATILE | (PERFORABLE << REACT1) | (WOOD_PLACE << PRODUCT1_SHIFT) | (REACT_AS << DESTRUCTIBLE);
const WOOD = UPDATE_BIT | HIGH_DENSITY | (REACT_AS << FLAMMABLE) | (REACT_AS << DESTRUCTIBLE) | REACT_NEIGHBOURS | (PERFORABLE << REACT2) | (LEAF_PLACE << PRODUCT2_SHIFT);
const LEAF = UPDATE_BIT | HIGH_DENSITY | REACT_NEIGHBOURS | (REACT_AS << FLAMMABLE) | (WATERING << REACT2) | (TREE_PLACE << PRODUCT2_SHIFT) | (REACT_AS << DESTRUCTIBLE);
const STONE = UPDATE_BIT | HIGH_DENSITY | GRAVITY | SLOW | (REACT_AS << DESTRUCTIBLE); // slow is set to have at least some vertical spread
const ACID = UPDATE_BIT | MEDIUM_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | REACT_NEIGHBOURS | DESTRUCTIBLE << REACT1 | DESTRUCTIBLE << REACT2 | REACT_AS << CHEMICAL;
const MAGMA = UPDATE_BIT | MEDIUM_DENSITY | GRAVITY | FLUID | MEDIUM_SPREAD | REACT_NEIGHBOURS | (REACT_AS << HOT) | (FLAMMABLE << REACT1) | (FIRE_PLACE << PRODUCT1_SHIFT) | (WATERING << REACT2) | (STONE_PLACE << PRODUCT2_SHIFT);
const ICE = UPDATE_BIT | HIGH_DENSITY | (REACT_AS << DESTRUCTIBLE) | REACT_NEIGHBOURS | (WATERING << REACT1) | (ICE_PLACE << PRODUCT1_SHIFT) | (HOT << REACT2) | (WATER_PLACE << PRODUCT2_SHIFT);
const RAINBOW1 = UPDATE_BIT | LOW_DENSITY | GRAVITY | SLOW | LOW_SPREAD | VOLATILE | (RAINBOW2_PLACE << PRODUCT2_SHIFT);
const RAINBOW2 = UPDATE_BIT | LOW_DENSITY | GRAVITY | SLOW | LOW_SPREAD | VOLATILE | (RAINBOW1_PLACE << PRODUCT2_SHIFT);

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
// var flags, pos, object, newPos, imgdata, update, md, mx, my, i, j, colour, reactGroup1, reactGroup2, imgData;
// currentType = 0;
evenLoop = currentType = md = mx = my = 0;

field = new Uint32Array(SIZE); // the main field holding all information
field.fill(EMPTY);

particleTypes = [EMPTY, DUST, WATER, FIRE, SEED, BLOCK, ACID, OIL, MAGMA, ICE, // placable
    WOOD, TREE, MUD, GAS, STONE, LEAF]; // not placable

// doing this calcualtion each step was terrible for performance
// therefore, calculate the colours now
pixelColours = {};
// RGB
pixelColours[DUST] = 0x88aabb;
pixelColours[MUD] = 0x557799;
pixelColours[WATER] = 0xff7722;
pixelColours[OIL] = 0x333377;
pixelColours[FIRE] = 0xdd;
pixelColours[BLOCK] = 0x888888;
pixelColours[GAS] = 0x6600;
pixelColours[TREE] = 0x9900;// should this be black?
pixelColours[SEED ] = 0x66aa66;
pixelColours[WOOD ] = 0x7788;
pixelColours[STONE ] = 0xbbbbbb;
pixelColours[ACID ] = 0xffff;
pixelColours[MAGMA ] = 0x33ff;
// pixelColours[RAINBOW1 ] = 0xff00ff;
// pixelColours[RAINBOW2 ] = 0xff00;
pixelColours[LEAF ] = 0x9900;
pixelColours[ICE ] = 0xffff77;


drawData = new ArrayBuffer(SIZE*4);
pixel32Array = new Uint32Array(drawData)
imgDataArray = new Uint8ClampedArray(drawData);

// right clicking used to give a problem because it sometimes triggers mousedown but not mouseup
// setting instead of adding should fix this
onmousedown = e => {md=1};// without brackets closure would add a return statement
onmouseup   = e => {md=0};
onmousemove = e => {mx = e.offsetX; my = e.offsetY};




// press the number keys to set the corresponding type of spawned particle
// letter keys work as well in the same order
// other keys might work as well
onwheel = e => {currentType += e.deltaY > 0 || NUM_PLACABLE_TYPES - 1}
// onkeydown = e => {currentType = e.which % 16}

// var startTime = Date.now();
// var totalSteps = 0;
// var updateEnd = Date.now();

//update = e => {
setInterval(e => {
    
//     var updateStart = Date.now();
    
    // set the alpha here so it doesn't need to be in the colours
    pixel32Array.fill(0xff000000);
    
    
    // This double for loop does two very different things
    for (y=DROP_SIZE;y-->-DROP_SIZE;){
        for (x=DROP_SIZE;x-->-DROP_SIZE;){
            // if the mouse is down the currentType particle will be dropped in a circle at the mouse position
            if (md){
                field[mx+my*WIDTH+x+y*WIDTH] = particleTypes[currentType % NUM_PLACABLE_TYPES] ^ evenLoop;
            }
            // show the possible elements in the left upper corner, selected element is lower
            for (i=NUM_PLACABLE_TYPES;--i;){
                pixel32Array[16*i+x+y*WIDTH+(i==currentType % NUM_PLACABLE_TYPES)*DROP_SIZE*WIDTH+DROP_SIZE*WIDTH] |= pixelColours[particleTypes[i]]
            }
        }
    }
    
    
    // toggle update bit of update
    evenLoop ^= UPDATE_BIT;
    
    
    for (pos=SIZE; pos--;){
        flags = field[pos];
        // bitwise xor also works as inequality test
        if (flags ^ EMPTY && (UPDATE_BIT & flags) == evenLoop){
            
            reactGroup1 = flags & REACTING1 && (1 << REAGENT_SHIFT) << ((flags >> REACTING1_SHIFT) & 7);
            reactGroup2 = flags & REACTING2 && (1 << REAGENT_SHIFT) << ((flags >> REACTING2_SHIFT) & 7);
            
            // the drawing is one frame behind on the physics, but I don't think that matters
            // this is way simpler
            pixel32Array[pos] |= pixelColours[flags|UPDATE_BIT];
            
            if (flags & VOLATILE && Math.random() < .1){
                flags = particleTypes[(flags>>PRODUCT2_SHIFT) & 15]^evenLoop;
            }
            
            if (flags & REACT_NEIGHBOURS){
                // select 2 random neighbouring positions and react with them
                // first half of this block should be exactly the same as 2nd half
                
                // this is not the same newPos as later, but reusing variables saves 20 bytes when crushed
                newPos = pos+[1, -1, WIDTH, -WIDTH][Math.random()*4|0];
                if (field[newPos] & reactGroup2){
                    flags = particleTypes[(flags>>PRODUCT2_SHIFT) & 15]^evenLoop;
                }
                if (field[newPos] & reactGroup1){
                    field[newPos] = particleTypes[(flags>>PRODUCT1_SHIFT) & 15]^evenLoop;
                }
                newPos = pos+[1, -1, WIDTH, -WIDTH][Math.random()*4|0];
                if (field[newPos] & reactGroup2){
                    flags = particleTypes[(flags>>PRODUCT2_SHIFT) & 15]^evenLoop;
                }
                if (field[newPos] & reactGroup1){
                    field[newPos] = particleTypes[(flags>>PRODUCT1_SHIFT) & 15]^evenLoop;
                }
            }
            
            
            // most probably go straight down, but there is a chance to go left or right depending on spread
            newPos = pos + ((Math.random() - .5) * (1+(flags & SPREAD))|0) + // should be the same as in the fluid check
                WIDTH*(!!(flags & GRAVITY) - (flags&SLOW && Math.random()>.5));
            
            
            
            // if the newPos is not solid, or this cell is fluid and the cell above newPos is not solid
            if(!(
                    newPos<SIZE && newPos>0 &&
                    (field[newPos] & DENSITY) < (flags & DENSITY) ||
                    flags & FLUID && (field[newPos = pos + ((Math.random() - .5) * (1+(flags & SPREAD))|0)] & DENSITY) < (flags & DENSITY)
            )){
                newPos = pos;
            }
            
            // react with newPos
            if (!(flags & REACT_NEIGHBOURS)){
                if (field[newPos] & reactGroup2){
                    flags = particleTypes[(flags>>PRODUCT2_SHIFT) & 15]^evenLoop;
                }
                if (field[newPos] & reactGroup1){
                    field[newPos] = particleTypes[(flags>>PRODUCT1_SHIFT) & 15]^evenLoop;
                }
            }
            
            // swap pos and newPos
            field[pos] = field[newPos];
            field[newPos] = flags ^ UPDATE_BIT;
        }
    }
    
    c.putImageData(new ImageData(imgDataArray, WIDTH, HEIGHT),0,0);
    
    
    
    
//     console.log((Date.now()-updateEnd));/*/-startTime)/++totalSteps);/**/
//     updateEnd = Date.now();
    
//     requestAnimationFrame(update);
},DELAY);

// update();
