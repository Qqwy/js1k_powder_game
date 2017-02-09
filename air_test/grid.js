


// a data type for a 2d array
class Grid{
    
    constructor(width, height, defaultValue){
        this.width = width;
        this.height = height;
        
        if (typeof defaultValue === "object" && defaultValue.length == this.width*this.height){
            this.values = defaultValue;
        } else {
            this.values = [];
            if (typeof defaultValue !== "undefined"){
                for (let i=0,l=width*height; i<l; i++){
                    this.values[i] = defaultValue;
                }
            }
        }
    }
    
    copy(){
        var g = new Grid(this.width, this.height);
        g.setAll(this.getAll());
    }
    
    get(x, y){
        if (this.isValid(x,y)){
            return this.values[x + y*this.width];
        } else {
            return null;
        }
    }
    
    getPart(xmin, ymin, width, height){
        var part = new Grid(width, height);
        for (let x=0; x<width; x++){
            for (let y=0; y<height; y++){
                var value = this.get(
                    clamp(x+xmin, 0, this.width-1),
                    clamp(y+ymin, 0, this.height-1));
                part.set(x, y, value);
            }
        }
        return part;
    }
    
    set(x, y, value){
        if (this.isValid(x, y)){
            this.values[x + y * this.width] = value;
        } else {
            throw new RangeError("trying to set value outside grid bounds");
        }
    }
    
    setAll(values){
        this.values = values;
    }
    
    getAll(){
        return this.values;
    }
    
    
    getValues(){
        return this.values.concat();
    }
    
    isValid(x, y){
        return (x>=0 && y>=0 && x<this.width && y<this.height);
    }
    
    
    // almost like foreach over a list, but this 2nd argument is a 2-value array with the x and y
    // and it can be broken by returning true
    forAny(callback){
        for (let x=0; x<this.width; ++x){
            for (let y=0; y<this.height; ++y){
                if (callback(
                        this.get(x,y),
                        [x, y],
                        this)){
                    return true;
                }
            }
        }
        return false;
    }
    
    
    
    
    // numeric grid functions
    
    // similar to get, but allows non-integer indices
    // the resulting value is an interpolation of the 4 closest points
    // checking whether this is in the grid boundaries is the users responsability
    getBetween(x, y){
        var xmin = x | 0; // simpler way of flooring
        var xmax = xmin + 1;
        var ymin = y | 0
        var ymax = ymin + 1;
        return (
            this.get(xmin, ymin) * (xmax - x) * (ymax - y) + 
            this.get(xmax, ymin) * (x - xmin) * (ymax - y) + 
            this.get(xmin, ymax) * (xmax - x) * (y - ymin) + 
            this.get(xmax, ymax) * (x - xmin) * (y - ymin) );
    }
    
    
    // perform elementwise multiplication with a grid of the same dimensions
    multGrid(grid){
        var self = this;
        grid.forAny(function(value, [x,y]){
            self.set(x, y, self.get(x, y) * value);
        });
    }
    
    sum(){
        var sum = 0;
        this.forAny(function(value){
            sum += value;
        });
        return sum;
    }
    
    // the diffusionMatrix shoud be a grid with odd width and height.
    // the sum of this grid should be 1
    diffused(diffusionMatrix){
        var diffusedGrid = new Grid(this.width, this.height);
        this.forAny(function(value, [x,y], self){
            // set each cell to the weighted average of it's 9 neighbours (including itself)
            // the weights for each cell are determined by the diffusion matrix
            var part = self.getPart(x - (diffusionMatrix.width>>1), y - (diffusionMatrix.height>>1), diffusionMatrix.width, diffusionMatrix.height);
            part.multGrid(diffusionMatrix);
            diffusedGrid.set(x, y, part.sum());
        });
        return diffusedGrid;
    }
}
