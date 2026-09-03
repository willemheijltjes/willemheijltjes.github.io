function getParentOfParam(paramObj) {
    return blocks.find(b => b.linkedOutput == null 
            && b.params.children.some(x => x.children[1] == paramObj));
}

function onDragStart(event)
{
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = this.data.getLocalPosition(this.parent);
    this.toReenable = null;
    this.oldPosX = null;
    this.oldPosY = null;
    this.isParam = false;
    
    var b = getParentOfParam(this);
    if (b != undefined) {
        b.cont.interactive = false;
        this.toReenable = b;
        this.oldPosX = this.x;
        this.oldPosY = this.y;
        this.isParam = true;
    }
}

function onDragEnd()
{
    this.alpha = 1;

    this.dragging = false;

    // set the interaction data to null
    this.data = null;

    // if it is a parameter being moved
    if (this.isParam) {
        this.toReenable.cont.interactive = true;
        this.toReenable = null;

        // add currying by:
        //   if param is over another param
        //   and there are two params

        const thisBlock = blocks.find(b => b.hasParams && b.hasParamText(this) != -1);
        const paramLoc = thisBlock.hasParamText(this);
        const paramIndex = getIndexFromParamLoc(thisBlock, paramLoc);
        const isOverParam = isBeingCurried(thisBlock, paramLoc);

        if (isOverParam > -1) {
            const overParamIndex = getIndexFromParamLoc(thisBlock, isOverParam);
            curryParams(thisBlock, paramIndex, overParamIndex);
        } else if (distanceBetween(this, thisBlock.outputText()) < clickDist) {
            createArrow(thisBlock, paramIndex);
        } else {
            this.x = this.oldPosX;
            this.y = this.oldPosY;
        }
    } else {
        var thisBlock = blocks.find(b => b.cont === this);

        for (a of blocks) {
            for (let b of blocks) {
                if (a.linkedOutput == null && b.hasParams) {
                    mergeBlocksIfClose(a, b);
                }
            }
        }
    }
    
}

function onDragMove()
{
    if (this.dragging)
    {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.position.x += (newPosition.x - this.dragging.x);
        this.position.y += (newPosition.y - this.dragging.y);
        this.dragging = newPosition;

        if (!this.isParam) {
            let anyBolded = false;
            for (a of blocks) {
                for (let b of blocks) {
                    if (a.linkedOutput == null && b.hasParams) {
                        let i = outputWithinParams(a, b);
                        if (i != -1) {
                            if (a.outputText().text == b.paramTextAt(i).text) {
                                if (this.mergefeedback == null) {
                                    this.mergefeedback = [];
                                }
                                var feedback = {};
                                feedback[0] = a.outputText();
                                feedback[1] = b.paramTextAt(i);
                                boldText(feedback[0]);
                                boldText(feedback[1]);
                                this.mergefeedback.push(feedback);
                                anyBolded = true;
                            }
                        }
                    }
                }
            }
            if (!anyBolded && this.mergefeedback != null) {
                for (let a of this.mergefeedback) {
                    unboldText(a[0]);
                    unboldText(a[1]);
                }
                this.mergefeedback = null;
            }// unbold texts if they were bolded
        }
    }

} 

function boldText(text) {
    text.style.fontWeight = 'bold';
    text.style.fontSize = textStyle.fontSize - 1.5;
}

function unboldText(text) {
    text.style.fontWeight = 'normal';
    text.style.fontSize = textStyle.fontSize;
}


function isWithinParam(upperBlock, lowerBlock) {
    for (var i = 0; i < lowerBlock.paramCount; i++) {
        if (lowerBlock.paramTextAt(i).visible
                && upperBlock.outputText().text != lowerBlock.paramTextAt(i).text) {
            var distance = distanceBetween(upperBlock.outputText(), lowerBlock.paramTextAt(i));
            if (distance < clickDist*2) {
                var indicatorAlpha = 1-distance/clickDist;
                lowerBlock.paramLinkIndicatorAt(i).alpha = indicatorAlpha;
                upperBlock.outputLinkIndicator().alpha = indicatorAlpha; 
                return;
            }
        }
    }
}

function isBeingCurried(block, paramIndex) {
    for (var i = 0; i < block.paramCount; i++) {
        if (i != paramIndex) {
            distBetweenParams = distanceBetween(block.paramTextAt(paramIndex), block.paramTextAt(i));
            if (distBetweenParams < clickDist) {
                return i;
            }
        }
    }
    return -1;
}

function checkOneBlockLeft() {
    var unlinkedBlocks = blocks.filter(b => b.linkedOutput == null);
    return unlinkedBlocks.length > 1 || unlinkedBlocks == null 
            ? null 
            : head(unlinkedBlocks);
}

function nextLevelFunc() { 
    if (levels.length-1 > currentLevel) {
        currentLevel++; 
        resetAll(); 
    }  
};

function menuFunc() {
    displayMenuScreen(0);
}

function evalButtonFunc() {
    var lastBlock = checkOneBlockLeft();
    
    if (lastBlock != null) {
        let result = evalBlock(lastBlock);
        if (lastBlock.outputText().text === "[Int]") {
            result = "[" + result + "]";
        } else if (lastBlock.outputText().text === "String") {
            result = "\"" + result + "\"";
        }
        resultBlock = createBlock([], lastBlock.outputText().text, result.toString());

        displayEvalWindow(resultBlock);
    } else {
        displayEvalWindow(null);
    }
}

function updateBlockBottom(block, text) {
    var blockBottom = createBlockBottom(block.size, text);
    block.cont.removeChild(block.output);
    block.cont.addChild(blockBottom);
    block.output = blockBottom;
}

function undoLastAction() {
    if (undoActions.length != 0) {
        [action, func] = undoActions.pop();
        func();
    }
}

function resetAll() {
    app.stage.removeChildren();
    blocks = [];
    mergedBlocks = [];
    undoActions = [];
    loader
        .load(initButtonPanel)
        .load(initBlocks);
}