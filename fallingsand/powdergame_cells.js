
const WIDTH = 800;
const HEIGHT = 500;
const OBJECTS = 100000;
const SIZE = WIDTH * HEIGHT;
const DELAY = 16; // 1000/FPS

const DROP_SIZE = 9;


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


const REACT_NEIGHBOURS = 1<<10; //REACT_ABOVE | REACT_SIDE | REACT_BELOW;


// those numbers refer to the index in particleTypes array
const NUM_PLACABLE_TYPES = 10;
const FIRE_PLACE = 3;
const RAINBOW1_PLACE = 9;
const WOOD_PLACE = 0 + NUM_PLACABLE_TYPES;
const TREE_PLACE = 1 + NUM_PLACABLE_TYPES;
const MUD_PLACE = 2 + NUM_PLACABLE_TYPES;
const GAS_PLACE = 3 + NUM_PLACABLE_TYPES;
const STONE_PLACE = 4 + NUM_PLACABLE_TYPES;
const RAINBOW2_PLACE = 5 + NUM_PLACABLE_TYPES;


/* Each element can have 2 reactions in which it plays as an actor
 * Reaction 1 changes the reactable it reacts with, reaction 2 changes itself
 * movement still proceeds as usual
 * Both reactions have a different reactable group. they have 3 bits to refer to this group
 * Having the reactable group at 0 means this reaction won't happen
 */


const REAGENT_SHIFT = 10;
const FLAMMABLE = 1;
const SOIL = 2;
const WATERING = 3;
const PERFORABLE = 4; // questionable use
const DESTROY = 5;
const CHEMICAL = 6;

const REACT_AS = 1<<REAGENT_SHIFT;


const REACTING1_SHIFT = 18;
const REACT1 = REACTING1_SHIFT;
// afther the PRODUCT_SHIFTth bit, the key for the product starts
// the PRODUCT number is the index of that type in the particleTypes array
const PRODUCT1_SHIFT = 21;
const REACTING1 = (1<<PRODUCT1_SHIFT) - (1<<REACTING1_SHIFT);

const REACTING2_SHIFT = 25;
const REACT2 = REACTING2_SHIFT;
const PRODUCT2_SHIFT = 28;
const REACTING2 = (1<<PRODUCT2_SHIFT) - (1<<REACTING2_SHIFT);



// particle types
const EMPTY = (REACT_AS << PERFORABLE);

const DUST = HIGH_DENSITY | GRAVITY | LOW_SPREAD | (REACT_AS << FLAMMABLE) | (REACT_AS << SOIL) | (WATERING << REACT2) | (MUD_PLACE << PRODUCT2_SHIFT) | (REACT_AS << DESTROY);
const MUD = HIGH_DENSITY | GRAVITY | LOW_SPREAD | (REACT_AS << SOIL) | SLOW | (REACT_AS << DESTROY);
const WATER = MEDIUM_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | (REACT_AS << WATERING) | (REACT_AS << PERFORABLE) | (REACT_AS << DESTROY);
const OIL = LOW_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | (REACT_AS << FLAMMABLE) | (REACT_AS << DESTROY) | (CHEMICAL << REACT2) | REACT_NEIGHBOURS | (GAS_PLACE << PRODUCT2_SHIFT);
const FIRE = LOW_DENSITY | FLY | HIGH_SPREAD | VOLATILE | (FLAMMABLE << REACT1) | REACT_NEIGHBOURS | (FIRE_PLACE << PRODUCT1_SHIFT) | (WATERING << REACT2);
const BLOCK = HIGH_DENSITY;
const GAS = LOW_DENSITY | FLY | HIGH_SPREAD | (REACT_AS << FLAMMABLE) | FLUID;
const SEED = HIGH_DENSITY | GRAVITY | LOW_SPREAD | (REACT_AS << FLAMMABLE) | (SOIL << REACT2) | REACT_NEIGHBOURS | (TREE_PLACE << PRODUCT2_SHIFT) | (REACT_AS << DESTROY);
const TREE = HIGH_DENSITY | FLY | LOW_SPREAD | VOLATILE | (PERFORABLE << REACT1) | (WOOD_PLACE << PRODUCT1_SHIFT) | (REACT_AS << DESTROY);
const WOOD = HIGH_DENSITY | (WATERING << REACT2) | REACT_NEIGHBOURS | (REACT_AS << FLAMMABLE) | (TREE_PLACE << PRODUCT2_SHIFT) | (REACT_AS << DESTROY);
const STONE = HIGH_DENSITY | GRAVITY | SLOW | (REACT_AS << DESTROY); // slow is set to have at least some vertical spread
const ACID = MEDIUM_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | REACT_NEIGHBOURS | DESTROY << REACT1 | DESTROY << REACT2 | REACT_AS << CHEMICAL;
const MAGMA = MEDIUM_DENSITY | GRAVITY | FLUID | MEDIUM_SPREAD | REACT_NEIGHBOURS | (FLAMMABLE << REACT1) | (FIRE_PLACE << PRODUCT1_SHIFT) | (WATERING << REACT2) | (STONE_PLACE << PRODUCT2_SHIFT);
const RAINBOW1 = LOW_DENSITY | GRAVITY | SLOW | LOW_SPREAD | VOLATILE | (RAINBOW2_PLACE << PRODUCT2_SHIFT);
const RAINBOW2 = LOW_DENSITY | GRAVITY | SLOW | LOW_SPREAD | VOLATILE | (RAINBOW1_PLACE << PRODUCT2_SHIFT);

// declaring variables as local allows closure to simplify the names
// remove these declarations after closure compiling
var flags, pos, object, newPos, imgdata, update, md, mx, my, i, j, colour, reactGroup1, reactGroup2;
var currentType = 0;
var evenLoop = UPDATE_BIT;

var field = new Uint32Array(SIZE); // the main field holding all information
field.fill(EMPTY);

var particleTypes = [EMPTY, DUST, WATER, FIRE, SEED, BLOCK, ACID, OIL, MAGMA, RAINBOW1, // placable
    WOOD, TREE, MUD, GAS, STONE, RAINBOW2]; // not placable

var colours = [];
// RGB
colours[DUST|UPDATE_BIT] = 'ba8';//0x88aabb;
colours[MUD|UPDATE_BIT] = '975';//0x7799bb;
colours[WATER|UPDATE_BIT] = '27f';//0xff2222;
colours[OIL|UPDATE_BIT] = '733';//0x333377;
colours[FIRE|UPDATE_BIT] = 'd00';//0x0000ff;
colours[BLOCK| UPDATE_BIT] = '888';//0x888888;
colours[GAS| UPDATE_BIT] = '060';//0x006600;
colours[TREE| UPDATE_BIT] = '0a0';//0x00aa00;
colours[SEED | UPDATE_BIT] = '6a6';//0x66aa66;
colours[WOOD | UPDATE_BIT] = '980';//0x008899;
colours[STONE | UPDATE_BIT] = 'bbb';
colours[ACID | UPDATE_BIT] = 'ff0';
colours[MAGMA | UPDATE_BIT] = 'f30';
colours[RAINBOW1 | UPDATE_BIT] = 'f0f';
colours[RAINBOW2 | UPDATE_BIT] = '0f0';

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
            
            reactGroup1 = flags & REACTING1 && (1 << REAGENT_SHIFT) << ((flags >> REACTING1_SHIFT) & 7);
            reactGroup2 = flags & REACTING2 && (1 << REAGENT_SHIFT) << ((flags >> REACTING2_SHIFT) & 7);
            
            // the drawing is one frame behind on the physics, but I don't think that matters
            // this is way simpler
            pixel32Array[pos] |= pixelColours[flags|UPDATE_BIT];
            
            if (flags & VOLATILE && Math.random() < .1){
                flags = particleTypes[(flags>>PRODUCT2_SHIFT) & 15]^evenLoop;//EMPTY;
            }
            
            if (flags & REACT_NEIGHBOURS){
                // closure can't compile for..of loops well.
                // it is probably easier to write this for loop and replace it in the compiled code than to replace the for..of workaround
                // keeping replaceMe as undeclared grobal variable prevents closure from renaming it
                // that should make this part easier to find
                // for (replaceMe=0; replaceMe<4; replaceMe++){
                    // i = [1, -1, WIDTH, -WIDTH][replaceMe];
                for (i of [1, -1, WIDTH, -WIDTH]){
                    j = field[pos+i]
                    if (j & reactGroup1){
                        field[pos+i] = particleTypes[(flags>>PRODUCT1_SHIFT) & 15]^evenLoop;
                    }
                    if (j & reactGroup2){
                        flags = particleTypes[(flags>>PRODUCT2_SHIFT) & 15]^evenLoop;
                    }
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
            if (!(flags & REACT_NEIGHBOURS)){
                if (field[newPos] & reactGroup1){
                    field[newPos] = particleTypes[(flags>>PRODUCT1_SHIFT) & 15]^evenLoop;
                }
                if (field[newPos] & reactGroup2){
                    flags = particleTypes[(flags>>PRODUCT2_SHIFT) & 15]^evenLoop;
                }
            }
            
            field[pos] = field[newPos];
            field[newPos] = flags ^ UPDATE_BIT;
        }
    }
    
    imgData = new ImageData(imgDataArray, WIDTH, HEIGHT);
    c.putImageData(imgData,0,0);
    
    for (i=NUM_PLACABLE_TYPES;--i;)
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
