var movingTile = -1;
var currentLevel = 0;
var topLevelTiles = [];
var refreshButtonX = -1;
var refreshButtonY = -1;
var hintButtonX = -1;
var hintButtonY = -1;
var showHints = false;
var baseTypes = ["Int", "[Int]", "Bool", "[Bool]", "Char", "[Char]"];
var levelReponseTimes = [];
var levelAttempts = 0;
var levelStartTime = Math.round(new Date().getTime() / 1000);

function startGame() {
    myGameArea.start();
    loadCurrentLevel();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 600;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[2]);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function loadCurrentLevel() {

    if (currentLevel === questions.length) return;

    topLevelTiles = [];
    movingTile = -1;

    randomiseQuestionTiles();

    let questionText = questions[currentLevel].question.split("\n");

    let blockX = 10;
    let blockY = questionText.length * 20 + 60;

    // create the every block needed in the question
    questions[currentLevel].blocks.forEach(blockData => {
        let newTile = new block(blockData, blockX, blockY);
        topLevelTiles.push(newTile);
        newTile.resizeTile();

        if (blockX + newTile.width > myGameArea.canvas.width - 30) {
            blockY += newTile.height + 10;
            blockX = 10;
            newTile.updatePositionByOffsets(blockX - newTile.x, blockY - newTile.y);
        }

        blockX += newTile.width + 10;
    });

    drawCanvas();
}

function drawCanvas() {

    if (currentLevel === questions.length) return;

    myGameArea.clear();

    let ctx = myGameArea.context;
    // split the question into lines
    let questionText = questions[currentLevel].question.split("\n");

    // draw backgrounds for question and answer areas
    ctx.fillStyle = "white";
    ctx.fillRect(5, 5, myGameArea.canvas.width - 10, questionText.length * 20 + 40);
    ctx.fillRect(10, myGameArea.canvas.height - 80, myGameArea.canvas.width - 20, 70);
    // draw borders for question, work and answer areas
    ctx.strokeStyle = "black";
    ctx.strokeRect(5, 5, myGameArea.canvas.width - 10, questionText.length * 20 + 40);
    ctx.strokeRect(5, 15 + questionText.length * 20 + 40, myGameArea.canvas.width - 10, (myGameArea.canvas.height - 5) - (15 + questionText.length * 20 + 40));
    ctx.strokeRect(10, myGameArea.canvas.height - 80, myGameArea.canvas.width - 20, 70);
    // add label texts for titles
    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.fillText("Level " + (currentLevel+1) + " - Recreate the following function using the blocks provided:", 8, 25);
    ctx.fillText("func' = ", 15, myGameArea.canvas.height - 40);

    let img = document.getElementById("hint");
    ctx.drawImage(img, myGameArea.canvas.width - 80, 15 + questionText.length * 20 + 45, 30, 30);
    hintButtonX = myGameArea.canvas.width - 80;
    hintButtonY = 15 + questionText.length * 20 + 45;

    img = document.getElementById("refresh");
    ctx.drawImage(img, myGameArea.canvas.width - 40, 15 + questionText.length * 20 + 45, 30, 30);
    refreshButtonX = myGameArea.canvas.width - 40;
    refreshButtonY = 15 + questionText.length * 20 + 45;
    // add question text
    ctx.font = "16px Arial";
    questionText.forEach((text, idx) => ctx.fillText(text, 10, 50 + idx * 20));
    // resize and draw the blocks
    for (let i=0; i<topLevelTiles.length; i++) topLevelTiles[i].draw();
}

function randomiseQuestionTiles() {
    let blocks = [];

    while (questions[currentLevel].blocks.length > 0) {
        let idx = Math.floor(Math.random() * questions[currentLevel].blocks.length);
        blocks.push(questions[currentLevel].blocks[idx]);
        questions[currentLevel].blocks.splice(idx, 1);
    }

    questions[currentLevel].blocks = blocks;
}

function block(blockData, x, y) {
    this.width = blockData.style === 0 ? 30 : 20;
    this.height = showHints ? 60 : 40;
    this.color = blockData.style === 0 ? "#ABABAB" : "white";
    this.x = x;
    this.y = y;
    this.yOffset = (showHints ? 20 : 0);
    this.textColor = "black";
    this.active = false;
    this.argTiles = [];
    this.text = blockData.text;
    this.style = blockData.style;
    this.textOffset = 10;
    this.type = blockData.type;
    this.originalMGT = blockData.type;
    this.typeLetter = blockData.typeLetter;

    for (let i = 0; i < blockData.args; i++) {
        let argTile = new block({ "text": "", "args": 0, "style": 0, "type": [] }, 0, 0);
        this.argTiles.push(argTile);
    }

    this.draw = function() {
        let ctx = myGameArea.context;
        // draw block with border
        ctx.fillStyle = this.active ? "#5DD141" : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        // draw text
        ctx.fillStyle = this.textColor;
        ctx.font = "30px Arial";
        ctx.fillText(this.text, this.x + this.textOffset, this.y + this.yOffset + 28);

        if (showHints && (topLevelTiles.indexOf(this) !== -1 || this === movingTile)) {
            ctx.font = "12px Arial";
            let hintWidth = ctx.measureText(this.type).width * 0.5;
            // let type = this.getTypeForDisplay();
            ctx.fillText(this.type, this.x + 0.5*this.width - hintWidth, this.y + 14);
        }
        // draw each argument block
        for (let i=0; i<this.argTiles.length; i++) {
            this.argTiles[i].draw();

            if (this.style === 2 && i !== (this.argTiles.length-1)) {
                ctx.font = "30px Arial";
                ctx.fillText(this.text, this.argTiles[i].x + this.argTiles[i].width + 5, this.y + this.yOffset + 28);
            }
        }
    }
    this.pointLiesInside = function(px, py) {
        return (px > this.x && px < this.x + this.width && py > this.y && py < this.y + this.height);
    }
    this.getType = function(params) {
        
        if (this.style === 2) {

            if (this.typeLetter !== undefined) {
                let outputType = this.argTiles.length;
                this.originalMGT = [];

                for (let i=0; i<this.argTiles.length; i++) {
                    this.originalMGT.push(this.typeLetter + (outputType - (i+1)) + ' -> ' + this.typeLetter + (outputType - i));
                }

                this.originalMGT.push(this.typeLetter + (outputType - this.argTiles.length));
                this.originalMGT.push(this.typeLetter + (outputType));
            }
            else {
                let outputType = 97 + this.argTiles.length;
                this.originalMGT = [];

                for (let i=0; i<this.argTiles.length; i++) {
                    this.originalMGT.push(String.fromCharCode(outputType - (i+1)) + ' -> ' + String.fromCharCode(outputType - i));
                }

                this.originalMGT.push(String.fromCharCode(outputType - this.argTiles.length));
                this.originalMGT.push(String.fromCharCode(outputType));
            }
        }

        let newType = [];
        let extraArgs = [];
        let prevArgInput = undefined;

        for (let i=0; i<this.originalMGT.length; i++) {
            if (this.argTiles[i] !== undefined) {
                // There is an argument
                if (this.argTiles[i].style === 0) {
                    extraArgs.push(this.originalMGT[i]);
                }
                else {
                    let argTileTypeParams = {"requiredArgs": [], "type": [], "substitutions": params.substitutions, "outputArgType": prevArgInput};
                    let argThings = this.argTiles[i].getType(argTileTypeParams);
                    params.substitutions = argThings.substitutions;
                    if (argThings === -1) {
                        this.type = "Invalid Type";
                        return -1;
                    }

                    let argTypes = argThings.type;
                    let expectedArgTypes = this.originalMGT[i].split(" -> ");

                    extraArgs = extraArgs.concat(argThings.requiredArgs);

                    if (argTypes.length < expectedArgTypes.length) {
                        if (argTypes[argTypes.length-1].indexOf(' -> ') !== -1) {
                            let outputTypes = argTypes[argTypes.length-1].split(' -> ');
                            argTypes[argTypes.length-1] = outputTypes[0];

                            let k = 1;
                            while (k < outputTypes.length) {
                                argTypes.push(outputTypes[k]);
                                k++;
                            }
                        }
                        if (argTypes.length < expectedArgTypes.length) {
                            this.type = "Invalid Type";
                            return -1;
                        }
                    }

                    if (argTypes.length > expectedArgTypes.length) {
                        let newArgTypes = []

                        while (newArgTypes.length < expectedArgTypes.length-1) {
                            newArgTypes.push(argTypes[0]);
                            argTypes.splice(0, 1);
                        }

                        newArgTypes.push(argTypes.join(' -> '));
                        argTypes = newArgTypes;
                    }

                    for (let j=0; j<expectedArgTypes.length; j++) {
                        if (params.substitutions[expectedArgTypes[j]] === undefined) {
                            params.substitutions[expectedArgTypes[j]] = argTypes[j];
                        }
                        else {
                            if (baseTypes.indexOf(params.substitutions[expectedArgTypes[j]]) !== -1) {
                                // if what is currently being substituted is not a base type, check new substitution matches
                                if (argTypes[j] !== params.substitutions[expectedArgTypes[j]]) {
                                    this.type = "Invalid Type";
                                    return -1;
                                }
                            }
                            else {

                            }
                        }
                    }

                    if (this.style === 2) {
                        prevArgInput = argThings.type[argThings.type.length-2];
                    }

                }
            }
            else {
                if (params.outputArgType !== undefined && i === this.originalMGT.length-1) {
                    if (params.substitutions[this.originalMGT[i]] === undefined) {
                        params.substitutions[this.originalMGT[i]] = params.outputArgType;
                    }
                    else {
                        if (baseTypes.indexOf(params.substitutions[this.originalMGT[i]]) !== -1) {
                            // if what is currently being substituted is not a base type, check new substitution matches
                            if (params.outputArgType !== params.substitutions[this.originalMGT[i]]) {
                                this.type = "Invalid Type";
                                return -1;
                            }
                        }
                        else {

                        }
                    }
                }
                newType.push(this.originalMGT[i]);
            }
        }

        for (let i=0; i<newType.length; i++) {
            let newTypeArr = newType[i].split(" -> ");
            let newTypeI = "";

            for (let j=0; j<newTypeArr.length; j++) {
                for (let key in params.substitutions) {
                    let old = newTypeArr[j]
                    newTypeArr[j] = newTypeArr[j].replace(new RegExp("\\b" + key.replace('[', '\\[').replace(']', '\\]') + "\\b", "g"), params.substitutions[key]);
                }

                if (newTypeArr[j].indexOf("->") !== -1 && j !== newTypeArr.length-1) {
                    newTypeI += "(" + newTypeArr[j] + ")";
                } 
                else {
                    newTypeI += newTypeArr[j];
                }

                if (j !== newTypeArr.length - 1) newTypeI += " -> ";                
            }

            newType[i] = newTypeI;
        }

        for (let i=0; i<extraArgs.length; i++) {
            let newTypeArr = extraArgs[i].split(" -> ");
            let newTypeI = "";

            for (let j=0; j<newTypeArr.length; j++) {
                for (let key in params.substitutions) {
                    newTypeArr[j] = newTypeArr[j].replace(new RegExp("\\b" + key + "\\b", "g"), params.substitutions[key]);
                }

                if (newTypeArr[j].indexOf("->") !== -1 && j !== newTypeArr.length-1) {
                    newTypeI += "(" + newTypeArr[j] + ")";
                } 
                else {
                    newTypeI += newTypeArr[j];
                }

                if (j !== newTypeArr.length - 1) newTypeI += " -> ";                
            }

            extraArgs[i] = newTypeI;
        }

        params.type = newType;
        params.requiredArgs = params.requiredArgs.concat(extraArgs)
        newType = extraArgs.concat(newType);

        return params;
    }
    this.getTypeWrapper = function() {
        let thisType = this.getType({"requiredArgs": [], "type": [], "substitutions": {}})

        if (thisType === -1) {
            this.type = "Invalid Type";
            return;
        }
        thisType.type = thisType.requiredArgs.concat(thisType.type);

        this.type = "";

        for (let i=0; i<thisType.type.length; i++) {
            if (thisType.type[i].indexOf("->") !== -1 && i !== thisType.type.length-1) {
                this.type += "(" + thisType.type[i] + ")";
            } 
            else {
                this.type += thisType.type[i];
            }

            if (i !== thisType.type.length - 1) this.type += " -> ";
        }
    }
    this.updateArgTile = function(argIdx, newArgTile) {
        if (this.style === 2 && newArgTile.style === 2) {
            // this block and new arg block are both composition blocks
            this.argTiles[argIdx] = newArgTile.argTiles[newArgTile.argTiles.length-1];

            for (let i=newArgTile.argTiles.length-2; i>=0; i--) {
                this.argTiles.splice(argIdx, 0, newArgTile.argTiles[i]);
            }
        }
        else {
            this.argTiles[argIdx] = newArgTile;
        }
        // this.resizeTile();
    }
    this.updatePositionByOffsets = function(dx, dy) {
        this.x += dx;
        this.y += dy;

        this.argTiles.forEach(argTile => argTile.updatePositionByOffsets(dx, dy));
    }
    this.getHaskell = function() {
        let haskell = '';
        if (this.style === 2) {
            for (let i=0; i<this.argTiles.length; i++) {
                haskell += '(' + this.argTiles[i].getHaskell() + ')';
                if (i !== this.argTiles.length - 1) haskell += ' ' + this.text + ' ';
            }
        }
        else {
            haskell += this.text;

            this.argTiles.forEach(argTile => haskell += ' (' + argTile.getHaskell() + ')');
        }

        return haskell;
    }
    this.deactivate = function() {
        this.active = false;
        this.argTiles.forEach(argTile => argTile.deactivate());
    }
    this.resizeTile = function() {
        this.getTypeWrapper();
        let ctx = myGameArea.context;
        ctx.font = "30px Arial";

        let argStartX = this.x + 10;

        this.yOffset = (showHints && topLevelTiles.indexOf(this) !== -1) ? 20 : 0;
        this.height = (showHints && topLevelTiles.indexOf(this) !== -1) ? 60 : 40;
        this.width = (this.style === 0 ? 30 : 20);

        if (this.style === 2) 
        {
            // first resize all blocks
            for (let i = 0; i < this.argTiles.length; i++) this.argTiles[i].resizeTile();

            this.width = 10;

            for (let i = 0; i < this.argTiles.length; i++) {
                ctx.font = "30px Arial";

                if (i === 0) this.textOffset = 10 + this.argTiles[i].width + 5;
                
                this.argTiles[i].updatePositionByOffsets(argStartX - this.argTiles[i].x, (this.y + this.yOffset) - this.argTiles[i].y);         
                this.width += this.argTiles[i].width + ctx.measureText(this.text).width + 10;
                argStartX += this.argTiles[i].width + ctx.measureText(this.text).width + 10;
            }
        }
        else {
            this.textOffset = 10;

            for (let i = 0; i < this.argTiles.length; i++) this.argTiles[i].resizeTile();

            ctx.font = "30px Arial";
            this.width += ctx.measureText(this.text).width;
            argStartX += ctx.measureText(this.text).width + 10;

            for (let i = 0; i < this.argTiles.length; i++) {
                this.argTiles[i].updatePositionByOffsets(argStartX - this.argTiles[i].x, (this.y + this.yOffset) - this.argTiles[i].y);
                this.width += this.argTiles[i].width + 10;
                argStartX += this.argTiles[i].width + 10;
            }
        }

        if (showHints && (topLevelTiles.indexOf(this) !== -1 || this === movingTile)) {
            ctx.font = "12px Arial";

            if (ctx.measureText(this.type).width + 10 > this.width) {
                let dWidth = ((ctx.measureText(this.type).width + 10) - this.width) * 0.5;
                this.textOffset += dWidth;
                for (let i=0; i<this.argTiles.length; i++) this.argTiles[i].updatePositionByOffsets(dWidth, 0);
                this.width = ctx.measureText(this.type).width + 10;
            }
        }
    }
}

function getInnerMostTilePointIsWithin(block, px, py) {
    var innerMostTile = null;

    block.argTiles.forEach(argTile => {
        if (argTile.pointLiesInside(px, py)) innerMostTile = argTile;
    });

    return innerMostTile;
}

function getIndexOfArgPointIsWithin(block, px, py) {
    var idx = -1;

    block.argTiles.forEach((argTile, index) => {
        if (argTile.pointLiesInside(px, py)) idx = index;
    });

    return idx;
}

function deactivateAllTiles() {
    topLevelTiles.forEach(block => block.deactivate());
}

function blockDroppedInAnswerBox(mseX, mseY) {
    return (mseX > 5 && mseX < myGameArea.canvas.width - 10 && mseY > myGameArea.canvas.height - 75 && mseY < myGameArea.canvas.height - 5);
}

function checkSolution(block) {
    let solution = block.getHaskell();
    levelAttempts++;

    if (questions[currentLevel].solutions.indexOf(solution) !== -1) {
        setTimeout(() => {
            let alertMessage = "Well Done - That's correct!"; 

            if (currentLevel >= questions.length) alertMessage += "\nYou've completed all the levels";

            levelReponseTimes[currentLevel+1] = {
                "time": (Math.round(new Date().getTime() / 1000)) - levelStartTime,
                "levelAttempts": levelAttempts
            }

            alert(alertMessage);

            levelStartTime = Math.round(new Date().getTime() / 1000);
            levelAttempts = 0;
            currentLevel++;
            loadCurrentLevel();
        }, 200);
    }
    else {
        block.updatePositionByOffsets(0, (myGameArea.canvas.height - (95 + block.height)) - block.y);
        alert("That's not quite right, try again.");
    }
}

function copyResponseTimes() {
    /* Get the text field */
    var copyText = document.getElementById("response-times");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/

    /* Copy the text inside the text field */
    document.execCommand("copy");
}

function isMouseOverRefreshButton(mseX, mseY) {
    return(mseX > refreshButtonX && mseX < refreshButtonX + 30 && mseY > refreshButtonY && mseY < refreshButtonY + 30);
}

function isMouseOverHintButton(mseX, mseY) {
    return(mseX > hintButtonX && mseX < hintButtonX + 30 && mseY > hintButtonY && mseY < hintButtonY + 30);
}

function mouseMoved(event)
{
    document.body.style.cursor = "default";

    if (movingTile === -1) {
        if (isMouseOverRefreshButton(event.offsetX, event.offsetY) || isMouseOverHintButton(event.offsetX, event.offsetY)) { 
            document.body.style.cursor = "pointer";
        }
        return;
    }

    deactivateAllTiles();

    let dx = (event.offsetX - movingTile.x) + movingTile.mseXOffset;
    let dy = (event.offsetY - movingTile.y) + movingTile.mseYOffset;

    movingTile.updatePositionByOffsets(dx, dy);

    topLevelTiles.forEach(function(block) {
        if (block.pointLiesInside(event.offsetX, event.offsetY)) {
            let innerMostTile = block;

            while (innerMostTile !== null && innerMostTile.style !== 0) {
                innerMostTile = getInnerMostTilePointIsWithin(innerMostTile, event.offsetX, event.offsetY);
            }

            if (innerMostTile !== null && innerMostTile.style === 0) {
                innerMostTile.active = true;
            }
        }
    });
    
    drawCanvas();
    // update moving block last so it will always be top
    movingTile.draw();
}

function mouseDown(event) {

    var blockToRemove = -1;
    // check each block for intersection
    topLevelTiles.forEach(function(element, idx) {
        if (element.pointLiesInside(event.offsetX, event.offsetY)) {
            movingTile = element;
            movingTile.mseXOffset = movingTile.x - event.offsetX;
            movingTile.mseYOffset = movingTile.y - event.offsetY;
            blockToRemove = idx;
        }
    });

    if (blockToRemove !== -1) {
        topLevelTiles.splice(blockToRemove, 1);
    } 
    else {
        if (isMouseOverRefreshButton(event.offsetX, event.offsetY)) { 
            loadCurrentLevel();
        }

        if (isMouseOverHintButton(event.offsetX, event.offsetY)) { 
            showHints = !showHints;
            for (let i=0; i < topLevelTiles.length; i++) topLevelTiles[i].resizeTile();
            drawCanvas();
        }
    }
}

function mouseUp(event) {

    if (movingTile === -1) return;

    var innerMostTile = null;
    var mseX = event.offsetX;
    var mseY = event.offsetY;

    topLevelTiles.forEach(element => {
        if (element.pointLiesInside(mseX, mseY)) {

            innerMostTile = element;

            while (getIndexOfArgPointIsWithin(innerMostTile, mseX, mseY) !== -1) {
                let idx = getIndexOfArgPointIsWithin(innerMostTile, mseX, mseY);

                if (innerMostTile.argTiles[idx].style === 0) break;
                else innerMostTile = innerMostTile.argTiles[idx];
            }
        }
    });

    if (innerMostTile !== null && getIndexOfArgPointIsWithin(innerMostTile, mseX, mseY) !== -1) {
        if (innerMostTile.argTiles[getIndexOfArgPointIsWithin(innerMostTile, mseX, mseY)].style === 0) {
            innerMostTile.updateArgTile(getIndexOfArgPointIsWithin(innerMostTile, mseX, mseY), movingTile);
        }
        else {
            topLevelTiles.push(movingTile);    
        }
    }
    else {
        topLevelTiles.push(movingTile);
    }

    if (blockDroppedInAnswerBox(mseX, mseY)) {
        checkSolution(movingTile);
    }

    movingTile = -1;

    topLevelTiles.forEach(block => block.resizeTile());
    drawCanvas();
}

// add event listeners
myGameArea.canvas.addEventListener('mousedown', mouseDown);
myGameArea.canvas.addEventListener('mouseup', mouseUp);
myGameArea.canvas.addEventListener('mousemove', mouseMoved);

/**
    QUESTION DATA BELOW:
    Tile Styles:
    0 => empty argument block
    1 => draggable block which may contain arguments
    2 => composition block - arg1 . arg2
*/
var questions = [
    {
        "solutions": ["map ((+1))"],
        "question": "func :: [Integer] -> [Integer]\nfunc [] = []\nfunc (x:xs) = (x+1):(func xs)",
        "blocks": [
            {
                "text": "map",
                "args": 1,
                "style": 1,
                "type": ["a0 -> a1", "[a0]", "[a1]"]
            },
            {
                "text": "(+1)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int"]
            }
        ]
    },
    {
        "solutions": ["((*4)) . ((+3))"],
        "question": "func :: Int -> Int\nfunc x = (x + 3) * 4",
        "blocks": [
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": []
            },
            {
                "text": "(*4)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int"]
            },
            {
                "text": "(+3)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int"]
            }
        ]
    },
    {
        "solutions": ["map (((+2)) . ((*5)))"],
        "question": "func :: [Int] -> [Int]\nfunc [] = []\nfunc (x:xs) = ((x * 5) + 2) : func xs",
        "blocks": [
            {
                "text": "map",
                "args": 1,
                "style": 1,
                "type": ["a0 -> a1", "[a0]", "[a1]"]
            },
            {
                "text": "(+2)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int"]
            },
            {
                "text": "(*5)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int"]
            },
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": []
            }
        ]
    },
    {
        "solutions": ["foldr ((+)) (0)"],
        "question": "func :: [Int] -> Int\nfunc [] = 0\nfunc (x:xs) = x + func xs",
        "blocks": [
            {
                "text": "foldr",
                "args": 2,
                "style": 1,
                "type": ["a0 -> a1 -> a1", "a1", "[a0]", "a1"]
            },
            {
                "text": "(+)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int", "Int"]
            },
            {
                "text": "0",
                "args": 0,
                "style": 1,
                "type": ["Int"]
            }
        ]
    },
    {
        "solutions": ["foldl ((-)) (0)"],
        "question": "func :: [Int] -> Int\nfunc [] = 0\nfunc (x:xs) = x - func xs",
        "blocks": [
            {
                "text": "foldl",
                "args": 2,
                "style": 1,
                "type": ["a0 -> a1 -> a1", "a1", "[a0]", "a1"]
            },
            {
                "text": "foldr",
                "args": 2,
                "style": 1,
                "type": ["b0 -> b1 -> b1", "b1", "[b0]", "b1"]
            },
            {
                "text": "(-)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int", "Int"]
            },
            {
                "text": "0",
                "args": 0,
                "style": 1,
                "type": ["Int"]
            }
        ]
    },
    {
        "solutions": ["(intToChar) . ((+3)) . (charToInt)"],
        "question": "func :: Char -> Char\nfunc x = intToChar((charToInt x) + 3)\n\n-- charToInt converts a character to an integer e.g. a -> 1, b -> 2.\n-- intToChar does the inverse",
        "blocks": [
            {
                "text": "intToChar",
                "args": 0,
                "style": 1,
                "type": ["Int", "Char"]
            },
            {
                "text": "charToInt",
                "args": 0,
                "style": 1,
                "type": ["Char", "Int"]
            },
            {
                "text": "(+3)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int"]
            },
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": [],
                "typeLetter": "a"
            },
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": [],
                "typeLetter": "b"
            }
        ]
    },
    {
        "solutions": ["((>0)) . (foldr ((+)) (0))"],
        "question": "func :: [Int] -> Bool\nfunc xs = 0 < sum xs",
        "blocks": [
            {
                "text": "(>0)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Bool"]
            },
            {
                "text": "0",
                "args": 0,
                "style": 1,
                "type": ["Int"]
            },
            {
                "text": "(+)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int", "Int"]
            },
            {
                "text": "foldr",
                "args": 2,
                "style": 1,
                "type": ["a0 -> a1 -> a1", "a1", "[a0]", "a1"]
            },
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": []
            }
        ]
    },
    {
        "solutions": ["((==) (0)) . (mod (2)) . (foldr ((+)) (0))"],
        "question": "func :: [Int] -> Bool\nfunc xs = (sum xs `mod` 2) == 0",
        "blocks": [
            {
                "text": "(==)",
                "args": 1,
                "style": 1,
                "type": ["Int", "Int", "Bool"]
            },
            {
                "text": "mod",
                "args": 1,
                "style": 1,
                "type": ["Int", "Int", "Int"]
            },
            {
                "text": "2",
                "args": 0,
                "style": 1,
                "type": ["Int"]
            },
            {
                "text": "0",
                "args": 0,
                "style": 1,
                "type": ["Int"]
            },
            {
                "text": "0",
                "args": 0,
                "style": 1,
                "type": ["Int"]
            },
            {
                "text": "(+)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int", "Int"]
            },
            {
                "text": "foldr",
                "args": 2,
                "style": 1,
                "type": ["a0 -> a1 -> a1", "a1", "[a0]", "a1"]
            },
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": []
            },
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": []
            }
        ]
    },
    {
        "solutions": ["(foldr ((&&)) (True)) . (map ((>5)))", "foldr (((&&)) . ((>5))) (True)"],
        "question": "func :: [Integer] -> Bool\nfunc [] = True\nfunc (x:xs) = (x > 5) && func xs",
        "blocks": [
            {
                "text": "map",
                "args": 1,
                "style": 1,
                "type": ["a0 -> a1", "[a0]", "[a1]"]
            },
            {
                "text": "(>5)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Bool"]
            },
            {
                "text": "True",
                "args": 0,
                "style": 1,
                "type": ["Bool"]
            },
            {
                "text": "(&&)",
                "args": 0,
                "style": 1,
                "type": ["Bool", "Bool", "Bool"]
            },
            {
                "text": "foldr",
                "args": 2,
                "style": 1,
                "type": ["b0 -> b1 -> b1", "b1", "[b0]", "b1"]
            },
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": []
            }
        ]
    },
    {
        "solutions": ["(foldr ((+)) (0)) . (map (((*2)) . ((+7))))", "foldr (((+)) . ((*2)) . ((+7))) (0)"],
        "question": "func :: [Integer] -> Integer\nfunc [] = 0\nfunc (x:xs) = ((x+7)*2) + func xs",
        "blocks": [
            {
                "text": "map",
                "args": 1,
                "style": 1,
                "type": ["a0 -> a1", "[a0]", "[a1]"]
            },
            {
                "text": "(*2)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int"]
            },
            {
                "text": "(+7)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int"]
            },
            {
                "text": "0",
                "args": 0,
                "style": 1,
                "type": ["Int"]
            },
            {
                "text": "(+)",
                "args": 0,
                "style": 1,
                "type": ["Int", "Int", "Int"]
            },
            {
                "text": "foldr",
                "args": 2,
                "style": 1,
                "type": ["b0 -> b1 -> b1", "b1", "[b0]", "b1"]
            },
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": [],
                "typeLetter": "c"
            },
            {
                "text": ".",
                "args": 2,
                "style": 2,
                "type": [],
                "typeLetter": "d"
            }
        ]
    }
];
