

const WIDTH = 400;
const HEIGHT = 400;
const SIZE = WIDTH * HEIGHT;
const FPS = 30;

var field = []; // the main field holding all information



/*
 * binary flags:
 * 2: solid. Will block other particles trying to enter
 * 4: gravity loaded
 */

// add some random sand
for (i=0; i<10000;i++){
    field[Math.random()*SIZE|0] = 6;
}


// add a floor below the field
for (i=1; i<=WIDTH; i++){
    field[SIZE-i] = 2;
}


function update(){
    
    var updateStart = Date.now();
    
    c.clearRect(0,0,WIDTH , HEIGHT);
    for (i in field){
        i |= 0;
        c.fillRect(i%WIDTH,i/WIDTH|0,1,1);
        if (field[i]&4 && !(field[i+WIDTH]&2)){
            field[i+WIDTH] = field[i]^1;
            delete field[i];
        }
    }
    console.log(Date.now()-updateStart);
//     requestAnimationFrame(update);
}
// requestAnimationFrame(update);
setInterval(update,1000/FPS);
