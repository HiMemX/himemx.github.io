

class SnakePart{
    x;
    y;

    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Snake{
    snakeParts; // First element is head
    direction; // 0 is up, 1 is right, 2 is down, 3 is right
    newdirection;

    constructor(startx, starty){
        this.snakeParts = [new SnakePart(startx, starty), new SnakePart(startx-1, starty)];
        this.direction = 1;
        this.newdirection = -1;
    }

    Forward(maxx, maxy){ // Take the last element and make it the new head element (This will move the snake forward) // maxx and maxy inclusive
        let bodypart = this.snakeParts.pop();
        bodypart.x = this.snakeParts[0].x
        bodypart.y = this.snakeParts[0].y;

        if(this.newdirection != -1){
            this.direction = this.newdirection;
            this.newdirection = -1;
        }

        if(this.direction == 0){bodypart.y--;}
        if(this.direction == 2){bodypart.y++;}
        if(this.direction == 1){bodypart.x++;}
        if(this.direction == 3){bodypart.x--;}

        if(bodypart.y < 0){bodypart.y = maxy;}
        if(bodypart.x < 0){bodypart.x = maxx;}
        if(bodypart.y > maxy){bodypart.y = 0;}
        if(bodypart.x > maxx){bodypart.x = 0;}

        this.snakeParts.unshift(bodypart);
    }
}



class SnakeGame{
    canvas;
    ctx;
    gameSizeX;
    gameSizeY;
    squareSize; // In pixels
    squareMargin;
    squareColor;

    snake;
    snakeColor;

    food // SnakePart
    foodColor;

    lasttimestamp;
    elapsedms;
    moveafterms;


    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        
        this.gameSizeX = 1600;
        this.gameSizeY = 800;

        this.squareSize = 40;
        this.squareMargin = 1;
        this.squareColor = "rgb(30,30,30)";
        
        this.lasttimestamp = 0;
        this.elapsedms = 0;
        this.moveafterms = 75; // Move after n ms

        

        this.InitGame();
        this.SetupCanvas();
    }



    Gameloop(timestamp){
        let deltatime = timestamp - this.lasttimestamp;
        this.lasttimestamp = timestamp;

        this.elapsedms += deltatime;
        if(this.elapsedms >= this.moveafterms){
            this.elapsedms = 0;
            this.snake.Forward(this.gameSizeX/this.squareSize-1, this.gameSizeY/this.squareSize-1);
            this.CheckFoodEaten();

            if(this.CheckSnakeIntersection()){
                document.getElementById("GamesBody").hidden = false;
                this.canvas.width=0;
                this.canvas.height=0;
                return;
            }
        }

        this.Draw();



        window.requestAnimationFrame((timestamp) => {this.Gameloop(timestamp)});
    }


    Draw(){
        this.DrawBackground();
        this.DrawSnake();
        this.DrawFood();
    }

    DrawFood(){
        let [x,y] = this.GridToScreenCord(this.food.x, this.food.y);
        this.DrawRectFilled(x, y, this.squareSize, this.squareSize, this.foodColor);
    }

    DrawSnake(){
        for(let p=0; p<this.snake.snakeParts.length; p++){
            let part = this.snake.snakeParts[p];

            let [x,y] = this.GridToScreenCord(part.x, part.y, true);

            
            this.DrawRectFilled(x,y, this.squareSize-this.squareMargin, this.squareSize-this.squareMargin, this.snakeColor);
            
        }
    }






    DrawBackground(){
        this.DrawRectFilled(0, 0, this.canvas.width, this.canvas.height, "black");
        
        // Game Board
        let basex = this.canvas.width/2 - this.gameSizeX/2;
        let basey = this.canvas.height/2 - this.gameSizeY/2

        this.DrawRectStroke(basex, basey, this.gameSizeX, this.gameSizeY, "white");

        // Block pattern
        for(let x=0; x<this.gameSizeX/this.squareSize; x++){
            for(let y=0; y<this.gameSizeY/this.squareSize; y++){

                let [xpos, ypos] = this.GridToScreenCord(x, y, true)


                this.DrawRectFilled(xpos, ypos, this.squareSize-this.squareMargin*2, this.squareSize-this.squareMargin*2, this.squareColor);
            }
        }
    }


    GridToScreenCord(gridx, gridy, margin=false){
        let basex = this.canvas.width/2 - this.gameSizeX/2;
        let basey = this.canvas.height/2 - this.gameSizeY/2
        return [basex + gridx*(this.squareSize) + this.squareMargin*margin, basey + gridy*(this.squareSize) + this.squareMargin*margin]
    }


    SetupCanvas(){
        this.canvas.height = document.getElementById("MainBody").clientHeight;
        this.canvas.width = document.getElementById("MainBody").clientWidth;
        this.Draw();
    }

    DrawRectFilled(x, y, width, height, color){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x,y,width,height);
    }

    DrawRectStroke(x, y, width, height, color){
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(x,y,width,height);
    }
    


    NewFood(){
        return new SnakePart(getRandomInt(this.gameSizeX/this.squareSize), getRandomInt(this.gameSizeY/this.squareSize));
    }

    CheckFoodEaten(){
        if (Math.floor(this.snake.snakeParts[0].x) == Math.floor(this.food.x) && Math.floor(this.snake.snakeParts[0].y) == Math.floor(this.food.y)){
            this.food = this.NewFood();

            let lastpart = this.snake.snakeParts[this.snake.snakeParts.length-1];
            this.snake.snakeParts.push(new SnakePart(lastpart.x, lastpart.y));
        }
    }

    CheckSnakeIntersection(){
        let headx = Math.floor(this.snake.snakeParts[0].x);
        let heady = Math.floor(this.snake.snakeParts[0].y);

        for(let p=1; p<this.snake.snakeParts.length; p++){
            let partx = Math.floor(this.snake.snakeParts[p].x);
            let party = Math.floor(this.snake.snakeParts[p].y);
            
            if(headx == partx && heady == party){
                return true;
            }
        }
        return false;
    }

    InitGame(){
        this.snake = new Snake(10, 10);
        this.snakeColor = "lime";

        this.food = this.NewFood();
        this.foodColor = "red";
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  
function GetCanvas(){
    return document.querySelector("canvas");
}


function Run(){
    document.getElementById("GamesBody").hidden = true;

    let canvas = GetCanvas();
    game = new SnakeGame(canvas);

    var resizeHandler = function(){game.SetupCanvas()}

    addEventListener("resize", resizeHandler);

    addEventListener("keydown", (event) => {
        if(event.repeat){return;}
        if(event.key == "s" && game.snake.direction != 0){game.snake.newdirection = 2;}
        else if(event.key == "w" && game.snake.direction != 2){game.snake.newdirection = 0;}
        else if(event.key == "a" && game.snake.direction != 1){game.snake.newdirection = 3;}
        else if(event.key == "d" && game.snake.direction != 3){game.snake.newdirection = 1;}
        game.elapsedms = game.moveafterms; //ensures a forward move after keypress to improve responsiveness
    });

    window.requestAnimationFrame(((timestamp) => {game.Gameloop(timestamp);}));

    removeEventListener("resize", resizeHandler);
}

document.getElementById("SnakeButton").onclick = () => {Run();};