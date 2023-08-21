

class Arm{
    posx;
    posy;
    length;
    angle;

    constructor(posx, posy, length, angle){
        this.posx = posx;
        this.posy = posy;
        this.length = length;
        this.angle = angle;
    }

    DrawToCanvas(ctx){
        ctx.beginPath();
        ctx.moveTo(this.posx, this.posy);
        ctx.lineTo(this.posx + Math.cos(this.angle)*this.length, this.posy - Math.sin(this.angle)*this.length);
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}


class Application{
    canvas;
    ctx;

    mousePos;

    jointDist;
    jointCount;
    joints;

    movepoints;
    currpoint;

    capture;

    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.SetupCanvas();

        this.mousePos = {x: 0, y: 0};
        this.capture = false;
        window.addEventListener("mousemove", (event) => {
            this.mousePos = {x: event.clientX, y: event.clientY};
            if(this.capture){
                this.movepoints.push([this.mousePos.x, this.mousePos.y]);
                this.currpoint++;
            }
        });
    
        this.jointCount = 5;
        
        let urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has("joints")){
            this.jointCount = urlParams.get("joints");
            if(this.jointCount < 5){this.jointCount = 5;}
        }
        
        this.jointDist = Math.sqrt(this.canvas.width**2 + this.canvas.height**2)/(2*(this.jointCount-1));
        this.joints = [];

        for(let i=0; i<this.jointCount; i++){
            this.joints.push([this.canvas.width/2 + i*this.jointDist, this.canvas.height/2]);
        }

        this.movepoints = GetPoints(this.canvas.width, this.canvas.height); // Placeholder
        //for(let i=0; i<380; i+=5){
        //    this.movepoints.push([i, 400]);
        //}
        this.currpoint = 0;

        window.addEventListener("keydown", (event) => {
            this.capture = (event.key=="s") ^ (this.capture);
            if(!this.capture){console.log(this.movepoints);}
        })
    }

    
    UpdateArms(){
        let startpoint = [this.canvas.width/2, this.canvas.height/2];
        let endpoint = [...this.movepoints[this.currpoint]];//[this.mousePos.x, this.mousePos.y];

        let diffx;
        let diffy;
        let dist;

        for(let i=0; i<50; i++){
            this.joints[this.jointCount-1] = endpoint;

            for(let j=this.jointCount-2; j>=0; j--){
                diffx = this.joints[j][0]-this.joints[j+1][0];
                diffy = this.joints[j][1]-this.joints[j+1][1];
                dist = Math.sqrt(diffx**2 + diffy**2);

                this.joints[j][0] -= diffx*(1-this.jointDist/dist);
                this.joints[j][1] -= diffy*(1-this.jointDist/dist);
            }

            this.joints[0] = startpoint;

            for(let j=1; j<this.jointCount; j++){
                diffx = this.joints[j][0]-this.joints[j-1][0];
                diffy = this.joints[j][1]-this.joints[j-1][1];
                dist = Math.sqrt(diffx**2 + diffy**2);

                this.joints[j][0] -= diffx - diffx*this.jointDist/dist;
                this.joints[j][1] -= diffy - diffy*this.jointDist/dist;
            }
        }
    }

    DrawArms(){
        this.ctx.beginPath();
        for(let j=0; j<this.jointCount-1; j++){
            this.ctx.moveTo(this.joints[j][0], this.joints[j][1]);
            this.ctx.lineTo(this.joints[j+1][0], this.joints[j+1][1]);
        }
        this.ctx.strokeStyle = "cyan";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    Gameloop(){
        
        if(this.currpoint!=-1){this.UpdateArms()};

        this.DrawRectFilled(0, 0, this.canvas.width, this.canvas.height, "black");
        this.DrawArms();
        //this.DrawRectFilled(this.mousePos.x-5, this.mousePos.y-5, 10, 10, "white");
        
        if(this.currpoint!=-1){
            this.ctx.beginPath();
            this.ctx.moveTo(this.movepoints[0][0], this.movepoints[0][1]);
            for(let m=1; m<=this.currpoint-1; m+=2){
                this.ctx.lineTo(this.movepoints[m][0], this.movepoints[m][1]);
            }
            this.ctx.lineTo(this.movepoints[this.currpoint][0], this.movepoints[this.currpoint][1])
            this.ctx.strokeStyle = "white";
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
            
        if(!this.capture){this.currpoint++};
        if(this.currpoint == this.movepoints.length){this.currpoint--; this.capture = true;}
        

        window.requestAnimationFrame(() => {this.Gameloop()});
    }

    DrawRectFilled(x, y, width, height, color){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x,y,width,height);
    }

    DrawRectStroke(x, y, width, height, color){
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(x,y,width,height);
    }

    SetupCanvas(){
        this.canvas.height = document.querySelector("body").clientHeight;
        this.canvas.width = document.querySelector("body").clientWidth;
    }
}


function GetCanvas(){
    return document.querySelector("canvas");
}

canvas = GetCanvas();

app = new Application(canvas);
app.Gameloop();