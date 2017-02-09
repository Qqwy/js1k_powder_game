
const DEFAULT_PRESSURE = 0
const DIFFUSION_MATRIX = new Grid(3, 3, [ // example values. Must sum to 1
    .025, .1  , .025,
    .1  , .5  , .1  ,
    .025, .1  , .025]);
const PRESSURE_TO_VELOCITY_FACTOR = .001;
const VELOCITY_TO_PRESSURE_FACTOR = 500;

class Air {
    
    constructor(width, height, pressure=null){
        
        
        this.width = width;
        this.height = height;
        
        this.pressure = new Grid(width, height, pressure || 0);
        this.velocityX = new Grid(width, height, 0);
        this.velocityY = new Grid(width, height, 0);
    }
    
    update(){
        this.velocityAffectsPressure();
        this.pressureAffectsVelocity();
        this.diffusePressure();
        this.diffuseVelocity()
    }
    
    velocityAffectsPressure(){
        var self = this;
        this.pressure.forAny(function(_pressure, [x,y]){
            var veloX = self.velocityX.get(x,y);
            var veloY = self.velocityY.get(x,y);
            var veloDiff = 0;
            if (x-1>=0){
                veloDiff += self.velocityX.get(x-1, y) - veloX;
            }
            if (x+1<self.width){
                veloDiff += veloX - self.velocityX.get(x+1, y);
            }
            if (y-1>=0){
                veloDiff += self.velocityY.get(x, y-1) - veloY;
            }
            if (y+1<self.width){
                veloDiff += veloY - self.velocityY.get(x, y+1);
            }
            self.pressure.set(x, y, _pressure + veloDiff*VELOCITY_TO_PRESSURE_FACTOR);
        });
    }
    
    pressureAffectsVelocity(){
        var self = this;
        this.pressure.forAny(function(pressure, [x,y]){
            var pressDiffX = 0;
            var pressDiffY = 0;
            if (x-1>=0){
                pressDiffX += self.pressure.get(x-1, y) - pressure;
            }
            if (x+1<self.width){
                pressDiffX += pressure - self.pressure.get(x+1, y);
            }
            if (y-1>=0){
                pressDiffY += self.pressure.get(x, y-1) - pressure;
            }
            if (y+1<self.width){
                pressDiffY += pressure - self.pressure.get(x, y+1);
            }
            self.velocityX.set(x, y, self.velocityX.get(x, y) + pressDiffX*PRESSURE_TO_VELOCITY_FACTOR);
            self.velocityY.set(x, y, self.velocityY.get(x, y) + pressDiffY*PRESSURE_TO_VELOCITY_FACTOR);
        });
    }
    
    diffusePressure(){
        this.pressure = this.pressure.diffused(DIFFUSION_MATRIX);
    }
    
    diffuseVelocity(){
        this.velocityX = this.velocityX.diffused(DIFFUSION_MATRIX);
        this.velocityY = this.velocityY.diffused(DIFFUSION_MATRIX);
    }
    
}
