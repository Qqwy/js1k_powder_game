

/*
 * This code is made to be first compiled by the google closure compiler,
 * Then edited by this replacing code:
 * var arg = code.match(/function\((\w+)\)/)[1]; result = code.replace(/function\(\w*\)/g,arg+"=>").replace(/\{return ([^\}]*)\}/g,"$1").replace(/\b(\d{4,})/g, (_, intStr) => '0x'+Number.parseInt(intStr).toString(16))
 * and then regpack'ed
 */


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
    colours,
    reactGroup1,
    reactGroup2,
    drawData,
    currentType,
    evenLoop,
    field,
    placableTypes,
    productTypes,
    particleTypes,
    pixelColours,
    imgDataArray,
    pixel32Array;



const WIDTH = 800;
const HEIGHT = 450;
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


const REACT_NEIGHBOURS = 1<<15; //REACT_ABOVE | REACT_SIDE | REACT_BELOW;
const REACT_ABOVE = 1<<30


/* Each element can have 2 reactions in which it plays as an actor
 * Reaction 1 changes the reactable it reacts with, reaction 2 changes itself
 * movement still proceeds as usual
 * Both reactions have a different reactable group. they have 3 bits to refer to this group
 * Having the reactable group at 0 means this reaction won't happen
 */


const REAGENT_SHIFT = 7;
const DESTRUCTIBLE = 1;
const FLAMMABLE = 2;
const HOT = 3;
const SOIL = 4;
const PERFORABLE = 5; // questionable use
const WATERING = 6;
const CHEMICAL = 7;

const REACT_AS = 1<<REAGENT_SHIFT;


const REACTING1_SHIFT = 23;
const REACT1 = REACTING1_SHIFT;
// afther the PRODUCT_SHIFTth bit, the key for the product starts
// the PRODUCT number is the index of that type in the productTypes array
const PRODUCT1_SHIFT = 26;
const REACTING1 = (1<<(PRODUCT1_SHIFT)) - (1<<REACTING1_SHIFT);

const REACTING2_SHIFT = 16;
const REACT2 = REACTING2_SHIFT;
const PRODUCT2_SHIFT = 19;
const REACTING2 = (1<<(PRODUCT2_SHIFT)) - (1<<REACTING2_SHIFT);



// those numbers refer to the index in productTypes array
const NUM_PLACABLE_TYPES = 12;

const PLACABLE_BEGIN = 0;
const PRODUCT_BEGIN = 8//NUM_PLACABLE_TYPES;


// PRODUCT_BEGIN is added to this
const EMPTY_PLACE = 3;
const WATER_PLACE = 0;
const FIRE_PLACE = 1;
const STONE_PLACE = 2;

const ICE_PLACE = 4;
const WOOD_PLACE = 5;
const TREE_PLACE = 6;
const MUD_PLACE = 7;
const GAS_PLACE = 8;
const LEAF_PLACE = 9;
const RAINBOW1_PLACE = 10;
const RAINBOW2_PLACE = 11;
const RAINBOW3_PLACE = 12;
const VIRUS_PLACE = 13;
const EXPLOSION_PLACE = 14;
const HYDROGEN_PLACE = 15;

// particle types
const EMPTY = REACT_AS << PERFORABLE | EMPTY_PLACE << PRODUCT1_SHIFT;

const DUST = UPDATE_BIT | HIGH_DENSITY | GRAVITY | LOW_SPREAD | REACT_NEIGHBOURS | REACT_AS << FLAMMABLE | REACT_AS << SOIL | WATERING << REACT2 | MUD_PLACE << PRODUCT2_SHIFT | REACT_AS << DESTRUCTIBLE;
const MUD = UPDATE_BIT | HIGH_DENSITY | GRAVITY | LOW_SPREAD | REACT_AS << SOIL | SLOW | REACT_AS << DESTRUCTIBLE;
const WATER = UPDATE_BIT | MEDIUM_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | REACT_AS << WATERING | REACT_AS << PERFORABLE | REACT_AS << DESTRUCTIBLE | REACT_NEIGHBOURS | CHEMICAL << REACT2 | HYDROGEN_PLACE << PRODUCT2_SHIFT;
const OIL = UPDATE_BIT | LOW_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | REACT_AS << FLAMMABLE | REACT_AS << DESTRUCTIBLE | REACT_NEIGHBOURS | CHEMICAL << REACT2 | GAS_PLACE << PRODUCT2_SHIFT;
const FIRE = UPDATE_BIT | LOW_DENSITY | FLY | HIGH_SPREAD | VOLATILE | REACT_AS << HOT | REACT_NEIGHBOURS | FLAMMABLE << REACT1 | FIRE_PLACE << PRODUCT1_SHIFT | WATERING << REACT2 | EMPTY_PLACE << PRODUCT2_SHIFT;
const BLOCK = UPDATE_BIT | HIGH_DENSITY | REACT_AS << PERFORABLE;
const GAS = UPDATE_BIT | LOW_DENSITY | FLY | HIGH_SPREAD | REACT_AS << FLAMMABLE | FLUID;
const SEED = UPDATE_BIT | HIGH_DENSITY | GRAVITY | LOW_SPREAD | REACT_AS << FLAMMABLE | REACT_NEIGHBOURS | SOIL << REACT2 | TREE_PLACE << PRODUCT2_SHIFT | REACT_AS << DESTRUCTIBLE;
const TREE = UPDATE_BIT | HIGH_DENSITY | FLY | LOW_SPREAD | REACT_AS << DESTRUCTIBLE | VOLATILE | PERFORABLE << REACT1 | WOOD_PLACE << PRODUCT1_SHIFT | EMPTY_PLACE << PRODUCT2_SHIFT;
const WOOD = UPDATE_BIT | HIGH_DENSITY | REACT_AS << FLAMMABLE | REACT_AS << DESTRUCTIBLE | REACT_NEIGHBOURS | PERFORABLE << REACT2 | LEAF_PLACE << PRODUCT2_SHIFT | CHEMICAL << REACT1 | VIRUS_PLACE << PRODUCT1_SHIFT;
const LEAF = UPDATE_BIT | HIGH_DENSITY | REACT_NEIGHBOURS | REACT_ABOVE | REACT_AS << FLAMMABLE | WATERING << REACT2 | TREE_PLACE << PRODUCT2_SHIFT | REACT_AS << DESTRUCTIBLE;
const STONE = UPDATE_BIT | HIGH_DENSITY | GRAVITY | SLOW | REACT_AS << DESTRUCTIBLE; // slow is set to have at least some vertical spread
const ACID = UPDATE_BIT | MEDIUM_DENSITY | GRAVITY | FLUID | HIGH_SPREAD | REACT_NEIGHBOURS | REACT_AS << CHEMICAL | DESTRUCTIBLE << REACT1 | EMPTY_PLACE << PRODUCT1_SHIFT | DESTRUCTIBLE << REACT2 | EMPTY_PLACE << PRODUCT2_SHIFT;
const MAGMA = UPDATE_BIT | MEDIUM_DENSITY | GRAVITY | FLUID | MEDIUM_SPREAD | REACT_NEIGHBOURS | REACT_AS << HOT | FLAMMABLE << REACT1 | FIRE_PLACE << PRODUCT1_SHIFT | WATERING << REACT2 | STONE_PLACE << PRODUCT2_SHIFT;
const ICE = UPDATE_BIT | HIGH_DENSITY | REACT_AS << DESTRUCTIBLE | REACT_NEIGHBOURS | WATERING << REACT1 | ICE_PLACE << PRODUCT1_SHIFT | HOT << REACT2 | WATER_PLACE << PRODUCT2_SHIFT;
const RAINBOW1 = UPDATE_BIT | MEDIUM_DENSITY | FLY | LOW_SPREAD | VOLATILE | RAINBOW2_PLACE << PRODUCT2_SHIFT | CHEMICAL << REACT1 | ICE_PLACE << PRODUCT1_SHIFT;
const RAINBOW2 = UPDATE_BIT | MEDIUM_DENSITY | GRAVITY | LOW_SPREAD | VOLATILE | RAINBOW3_PLACE << PRODUCT2_SHIFT;
const RAINBOW3 = UPDATE_BIT | MEDIUM_DENSITY | GRAVITY | LOW_SPREAD | VOLATILE | RAINBOW1_PLACE << PRODUCT2_SHIFT;
const VIRUS = UPDATE_BIT | HIGH_DENSITY | GRAVITY | LOW_SPREAD | REACT_AS << DESTRUCTIBLE | REACT_NEIGHBOURS | DESTRUCTIBLE << REACT1 | VIRUS_PLACE << PRODUCT1_SHIFT | HOT << REACT2 | RAINBOW1_PLACE << PRODUCT2_SHIFT;
const EXPLOSION = UPDATE_BIT | HIGH_DENSITY | GRAVITY | HIGH_SPREAD | REACT_NEIGHBOURS | VOLATILE | PERFORABLE << REACT1 | FIRE_PLACE << PRODUCT1_SHIFT | FIRE_PLACE << PRODUCT2_SHIFT;
const HYDROGEN = UPDATE_BIT | LOW_DENSITY | HIGH_SPREAD | FLY | REACT_NEIGHBOURS | HOT << REACT1 | EXPLOSION_PLACE << PRODUCT1_SHIFT | HOT << REACT2 | EXPLOSION_PLACE << PRODUCT2_SHIFT;
const THUNDER = UPDATE_BIT | LOW_DENSITY | GRAVITY | MEDIUM_SPREAD | REACT_NEIGHBOURS | VOLATILE | REACT_AS << CHEMICAL | FLAMMABLE << REACT1 | EXPLOSION_PLACE << PRODUCT1_SHIFT | EMPTY_PLACE << PRODUCT2_SHIFT;
const GUNPOWDER = UPDATE_BIT | MEDIUM_DENSITY | GRAVITY | SLOW | LOW_SPREAD | REACT_AS << DESTRUCTIBLE | REACT_NEIGHBOURS | REACT_AS << FLAMMABLE | HOT << REACT1 | EXPLOSION_PLACE << PRODUCT1_SHIFT | HOT << REACT2 | EXPLOSION_PLACE << PRODUCT2_SHIFT;

// it is possible to leave out mx and my
// js will give an error when you try to place something without moving the mouse, but that won't be noticable
// nothing is on the screen anyways
md = mx = my = evenLoop = currentType = 0;

field = new Uint32Array(SIZE); // the main field holding all information
field.fill(EMPTY);

particleTypes = [
    DUST, SEED, BLOCK, ACID, OIL, MAGMA, THUNDER, GUNPOWDER, // only placable
    WATER, FIRE, STONE, EMPTY, // placable and product
    ICE, WOOD, TREE, MUD, GAS, LEAF, RAINBOW1, RAINBOW2, RAINBOW3, VIRUS, EXPLOSION, HYDROGEN // product only
];
// colours = [0x88aabb, 0x77aa77, 0x777777, 0xffff, 0x333377, 0x33ff, 0x0, 0xff7700, 0xdd, 0xaaaaaa, 0xffff77, 0x7777, 0x9900, 0x557799, 0x7700, 0x9900, 0xff00ff, 0xffff00, 0xffff, 0xff00aa];

// each 3 letters are the colour for one of the particles
// the order is the same as in the list
colours = "ba87a7777df0733f30ff744407fd00aaa0007ff730090975070090f0f0ffff0a0ffa7105"

pixelColours = {};
// BBGGRR
for (i in colours){
    pixelColours[particleTypes[i/3|0]] |= ('0x'+colours[i]+colours[i] | 0) << 8 * (i%3);
}


drawData = new ArrayBuffer(SIZE*4);
pixel32Array = new Uint32Array(drawData)
imgDataArray = new Uint8ClampedArray(drawData);


a.onmousedown = e => md=1;
onmouseup   = e => md=0;
a.onmousemove = e => {mx = e.offsetX; my = e.offsetY};




// press the number keys to set the corresponding type of spawned particle
// letter keys work as well in the same order
// other keys might work as well
onwheel = e => currentType += e.deltaY > 0 || NUM_PLACABLE_TYPES - 1
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
            for (i=NUM_PLACABLE_TYPES;i--;){
                pixel32Array[16+16*i+x+y*WIDTH+(i==currentType % NUM_PLACABLE_TYPES)*DROP_SIZE*WIDTH+DROP_SIZE*WIDTH] |= pixelColours[particleTypes[i]]
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
                flags = particleTypes[((flags>>PRODUCT2_SHIFT) & 15)+PRODUCT_BEGIN]^evenLoop;
            }
            
            if (flags & REACT_NEIGHBOURS){
                if (flags & REACT_ABOVE){
                    newPos = pos - WIDTH;
                    if (field[newPos] & reactGroup2){
                        flags = particleTypes[((flags>>PRODUCT2_SHIFT) & 15)+PRODUCT_BEGIN]^evenLoop;
                    }
                    if (field[newPos] & reactGroup1){
                        field[newPos] = particleTypes[((flags>>PRODUCT1_SHIFT) & 15)+PRODUCT_BEGIN]^evenLoop;
                    }
                } else {
                    // select 2 random neighbouring positions and react with them
                    // first half of this block should be exactly the same as 2nd half
                    
                    // this is not the same newPos as later, but reusing variables saves 20 bytes when crushed
                    newPos = pos+[1, -1, WIDTH, -WIDTH][Math.random()*4|0];
                    if (field[newPos] & reactGroup2){
                        flags = particleTypes[((flags>>PRODUCT2_SHIFT) & 15)+PRODUCT_BEGIN]^evenLoop;
                    }
                    if (field[newPos] & reactGroup1){
                        field[newPos] = particleTypes[((flags>>PRODUCT1_SHIFT) & 15)+PRODUCT_BEGIN]^evenLoop;
                    }
                    
                    // without re-checking, the reaction for a product might happen again immedeately,
                    // even though the conditions for this reaction are not valid
//                     reactGroup1 = flags & REACTING1 && (1 << REAGENT_SHIFT) << ((flags >> REACTING1_SHIFT) & 7);
                    reactGroup2 = flags & REACTING2 && (1 << REAGENT_SHIFT) << ((flags >> REACTING2_SHIFT) & 7);
                    
                    newPos = pos+[1, -1, WIDTH, -WIDTH][Math.random()*4|0];
                    if (field[newPos] & reactGroup2){
                        flags = particleTypes[((flags>>PRODUCT2_SHIFT) & 15)+PRODUCT_BEGIN]^evenLoop;
                    }
                    if (field[newPos] & reactGroup1){
                        field[newPos] = particleTypes[((flags>>PRODUCT1_SHIFT) & 15)+PRODUCT_BEGIN]^evenLoop;
                    }
                }
            }
            
            
            // most probably go straight down, but there is a chance to go left or right depending on spread
            newPos = pos + ((Math.random() - .5) * (1+(flags & SPREAD))|0) + // should be the same as in the fluid check
                WIDTH*((flags & GRAVITY && 1) - (flags&SLOW && Math.random()>.5));
            
            
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
                    flags = particleTypes[((flags>>PRODUCT2_SHIFT) & 15)+PRODUCT_BEGIN]^evenLoop;
                }
                if (field[newPos] & reactGroup1){
                    field[newPos] = particleTypes[((flags>>PRODUCT1_SHIFT) & 15)+PRODUCT_BEGIN]^evenLoop;
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
