

const WIDTH = 400;
const HEIGHT = 400;
const SIZE = WIDTH * HEIGHT;
const PIXELS_PER_CELL = 1;
const FPS = 60;

var field = []; // the main field holding all information

var objects = [];

var flags, pos, object;


/*
 * binary flags:
 * 1: solid. Will block other particles trying to enter
 * 2: gravity loaded
 */

// add some random sand
for (i=0; i<10000;i++){
    objects[i] = [3, Math.random()*SIZE|0];
}


// add a floor below the field
for (i=0; i<WIDTH; i++){
    field[SIZE+i] = 1;
}


function update(){
    
    var updateStart = Date.now();
    c.clearRect(0,0,WIDTH, HEIGHT);
    for (object of objects){
        [flags, pos] = object;
        c.fillRect(pos%WIDTH,pos/WIDTH|0,1,1);
        if ((flags & 2) && (!(field[pos + WIDTH] & 1))){
            field[pos + WIDTH] = flags;
            field[pos] = 0;
            object[1] += WIDTH
        }
    }
    console.log((Date.now()-updateStart));
//     requestAnimationFrame(update);
}
// requestAnimationFrame(update);
setInterval(update,1000/FPS);
