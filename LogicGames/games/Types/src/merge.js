function resizeBlock(upperBlock, lowerBlock, paramIndex, toShrink) {
    if (typeof toShrink === 'undefined') toShrink = false;
    if (upperBlock.size > 1) {
        var sizeToAdd = upperBlock.size - 1;
        if (toShrink) sizeToAdd *= -1;
        resizeBlockParam(lowerBlock, paramIndex, sizeToAdd);
        var parentBlock = lowerBlock;
        while (parentBlock.linkedOutput != null) {
            parentBlock = parentBlock.linkedOutput
        }
        parentBlock.cont.x -= (sizeToAdd * width) / 2;
    }
}

function resizeBlockParam(lowerBlock, paramIndex, sizeToAdd) {
    if (lowerBlock.paramCount == 0) {
        let line = new Graphics(); 
        line.lineStyle(lineThickness, lineColour, 1);
        line.moveTo(0, 0);
        line.lineTo(width, 0);
        lowerBlock.params.addChild(line);
        return;
    }

    // resize parameter and move all subsequent parameter blocks
    for (var i = paramIndex+1; i < lowerBlock.paramCount; i++) {
        let widthToAdd = sizeToAdd * width;
        lowerBlock.paramAt(i).x += widthToAdd;
        // if this doesn't exist, don't add width.
        if (i in lowerBlock.linkedParams) {
            lowerBlock.linkedParams[i].cont.x += widthToAdd;
        }
    }
    
    // resize output for lower block
    lowerBlock.size += sizeToAdd;
    updateBlockBottom(lowerBlock, lowerBlock.outputText().text);

    // move right hand side of block to the edge of the func
    lowerBlock.rightSide().x += sizeToAdd * width;        

    // recenter the func text
    lowerBlock.func.x += sizeToAdd * width / 2;

    // redraw rect to  lowerBlock.size*width
    let parentRect = new Graphics();
    parentRect.beginFill(backgroundColour);
    parentRect.drawRect(0, 0, lowerBlock.size*width, height);
    parentRect.endFill();
    lowerBlock.cont.removeChild(lowerBlock.rect);
    lowerBlock.cont.addChildAt(parentRect, 0);
    lowerBlock.rect = parentRect;

    // adapt all lower and further on RHS blocks
    if (lowerBlock.linkedOutput != null) {
        let newLowerBlock = lowerBlock.linkedOutput;
        let newParamIndex = lowerBlock.linkedParamIndex;
        resizeBlockParam(newLowerBlock, newParamIndex, sizeToAdd);
    }
}

function unlinkBlock(block) {
    let pos = new Point();
    block.cont.getGlobalPosition(pos);
    let lowerBlock = block.linkedOutput;

    let param = lowerBlock.paramAt(block.linkedParamIndex);

    for (let child of param.children)
        child.visible = true;

    resizeBlock(block, lowerBlock, block.linkedParamIndex, true);

    lowerBlock.cont.removeChild(block.cont);
    delete lowerBlock.linkedParams[block.linkedParamIndex];
    block.linkedOutput = null;
    block.linkedParamIndex = null;
    block.cont.interactive = true;
    app.stage.children[2].addChild(block.cont);
    block.cont.x = pos.x;
    block.cont.y = pos.y-clickDist-5;

    if (block.hasParams) {
        for (var i = 0; i < block.paramCount; i++) {
            block.paramTextAt(i).interactive = true;
        }
    }

    for (var i = 0; i < lowerBlock.paramCount; i++) {
        lowerBlock.paramTextAt(i).interactive = true;
    }
}

function mergeBlocks(upperBlock, lowerBlock, paramIndex) {
    lowerBlock.cont.addChild(upperBlock.cont);
    lowerBlock.linkedParams[paramIndex] = upperBlock;
    upperBlock.linkedParamIndex = paramIndex;
    upperBlock.linkedOutput = lowerBlock;

    if (upperBlock.hasParams) {
        for (var i = 0; i < upperBlock.paramCount; i++) {
            upperBlock.paramTextAt(i).interactive = false;
        }
    }

    for (var i = 0; i < lowerBlock.paramCount; i++) {
        lowerBlock.paramTextAt(i).interactive = false;
    }

    let param = lowerBlock.paramAt(paramIndex);

    for (let child of param.children)
        child.visible = false;

    resizeBlock(upperBlock, lowerBlock, paramIndex);

    upperBlock.cont.interactive = false;

    var sumOfParamSizes = 0;
    for (let i = 0; i < paramIndex; i++) {
        if (i in lowerBlock.linkedParams) {
            sumOfParamSizes += lowerBlock.linkedParams[i].size;
        } else {
            sumOfParamSizes += 1;
        }
    } 
    upperBlock.cont.x = sumOfParamSizes * width;
    upperBlock.cont.y = -height;
    upperBlock.cont.alpha = 1;
    lowerBlock.cont.alpha = 1;
}

function centerPoint(text, point) {
    point.x += text.width/2;
    point.y += text.height/2;
    return point;
}

function toClicks(obj1, obj2) {
    let p1 = new Point();
    obj1.getGlobalPosition(p1);
    let p2 = new Point();
    obj2.getGlobalPosition(p2);

    return (p2.y - p1.y) <= clickDist 
        && (p2.y - p1.y) >= 0 
        && Math.abs(p1.x - p2.x) < (width-3)/2;
}

function distanceBetween(obj1, obj2) {
    let obj1Pos = new Point();
    obj1.getGlobalPosition(obj1Pos);
    obj1Pos = centerPoint(obj1, obj1Pos);
    let obj2Pos = new Point();
    obj2.getGlobalPosition(obj2Pos);
    obj2Pos = centerPoint(obj2, obj2Pos);

    return Math.hypot(Math.abs(obj1Pos.x - obj2Pos.x),
                      Math.abs(obj1Pos.y - obj2Pos.y));
}

function outputWithinParams(thisBlock, toLinkBlock) {
    for (var i = 0; i < toLinkBlock.paramCount; i++) {
        let param = toLinkBlock.paramTextAt(i);
        if (param.visible
                && toClicks(thisBlock.outputText(), param)) {
            return i;
        }
    }
    return -1;
}

function mergeBlocksIfClose(thisBlock, otherBlock) {
    let i = outputWithinParams(thisBlock, otherBlock);
    if (i != -1) {
        if (thisBlock.outputText().text == otherBlock.paramTextAt(i).text) {
            mergeBlocks(thisBlock, otherBlock, i);

            // if there is the bold logic, unbold it
            unboldText(thisBlock.outputText());
            unboldText(otherBlock.paramTextAt(i));

            undoActions.push(["merge", (_ => unlinkBlock(thisBlock))]);
            return true;
        }
    }
    return false;
}

function getIndexFromParamLoc(block, paramLoc) {
    return block.paramIndices.findIndex(e => snd(e) == paramLoc);
}

function arrowParam(block, paramIndex) {
    const removalType = "arrow";
    [_, paramLoc] = block.paramIndices[paramIndex];
    block.paramIndices[paramIndex] = [paramIndex, removalType];
    block.arrow.push(paramIndex);
    block.arrow.sort();
    removeParam(block, paramLoc);
}

function curryParam(block, paramIndex, curriedToIndex) {
    const removalType = "curried";
    [_, paramLoc] = block.paramIndices[paramIndex];
    block.paramIndices[paramIndex] = [paramIndex, removalType];
    
    var curriedToIndex = getIndexFromParamLoc(block, curriedToIndex);

    if (block.curried[curriedToIndex] === undefined) {
        block.curried[curriedToIndex] = [];
    }

    // if source param has been curried before, move those curried 
    // params to the new curried param
    if (block.curried[paramIndex] != undefined) {
        curriedToMove = block.curried[paramIndex];
        block.curried[curriedToIndex] = block.curried[curriedToIndex].concat(curriedToMove);
        block.curried[paramIndex] = undefined;
    }

    block.curried[curriedToIndex].push(paramIndex);
    block.curried[curriedToIndex].sort();

    removeParam(block, paramLoc);
}

function unarrowParam(block, paramLoc) {
    block.arrow = block.arrow.filter(x => x !== paramLoc);
    var paramIndex = addParam(block, paramLoc);
    resizeBlockParam(block, paramIndex, 1);
    const newArrowText = createOutputText(block);
    rebuildParams(block); 
    updateBlockBottom(block, newArrowText);
}

function uncurryParam(block, paramIndex, curriedToIndex) {
    block.curried[curriedToIndex] = block.curried[curriedToIndex].length == 1
                                    ? undefined
                                    : block.curried[curriedToIndex].filter(x => x !== paramIndex);
    addParam(block, paramIndex);
    resizeBlockParam(block, paramIndex, 1);
    rebuildParams(block); 
}

function addParam(block, paramLoc) {
    const paramIndex = block.paramIndices.filter(x => fst(x) < paramLoc && !isNaN(snd(x)))
                                         .length;

    block.paramIndices = block.paramIndices.map(([a, b]) => b >= paramIndex ? [a, b+1] : [a, b]);
    block.paramIndices[paramLoc] = [paramLoc, paramIndex];
    return paramIndex;
}


function removeParam(block, paramIndex) {
    block.paramIndices = block.paramIndices.map(([a, b]) => b > paramIndex ? [a, b-1] : [a, b]);
    block.paramAt(paramIndex).destroy();
}

function createCurriedText(block, paramIndex) {
    var curriedParams = [paramIndex].concat(block.curried[paramIndex]);
    curriedParams.sort();
    curriedParams = curriedParams.map(x => block.paramList[x])
    curriedParams = [head(curriedParams), ...tail(curriedParams).map(x => ", " + x)]

    const flattenedText = curriedParams.reduce((a,b) => a+b, []);
    const curriedText = "(" + flattenedText + ")";
    return curriedText;
}

function createOutputText(block) {
    var params = block.arrow.map(i => block.curried[i] === undefined 
        ? block.paramList[i] 
        : createCurriedText(block, i));

    if (params.length == 0) return block.initialOutputText;

    var arrowParams = params.map(i => i + " -> ");
    arrowParams.push(block.initialOutputText);
    const flattenedText = arrowParams.reduce((a,b) => a+b, []);
    const outputText = "(" + flattenedText + ")"

    return outputText;
}

function rebuildParams(block) {
    var oldParamCount = block.paramCount;
    block.cont.removeChild(block.params);

    var indexesToIgnore = block.paramIndices.filter(([_, y]) => isNaN(y))
                                            .map(fst);

    var params = [];
    for (var i = 0; i < block.paramList.length; i++) {
        if (indexesToIgnore.includes(i)) continue;

        var thisParam = block.paramList[i];
        if (block.curried[i] === undefined) {
            params.push(thisParam);
        } else {
            const curriedText = createCurriedText(block, i);
            params.push(curriedText);
        }
    }
    block.paramCount = params.length;

    var newParamBlock = createBlockParams(params);
    block.cont.addChild(newParamBlock);
    block.params = newParamBlock;

    return block.paramCount - oldParamCount;
}

function curryParams(block, paramIndex, curriedToIndex) {
    [_, paramLoc] = block.paramIndices[paramIndex];
    curryParam(block, paramIndex, curriedToIndex);
    rebuildParams(block);  
    resizeBlockParam(block, paramLoc, -1);
    undoActions.push(["curry", (_ => uncurryParam(block, paramIndex, curriedToIndex))]);
}

function createArrow(block, paramIndex) {
    [_, paramLoc] = block.paramIndices[paramIndex];
    arrowParam(block, paramIndex);
    rebuildParams(block);
    resizeBlockParam(block, paramLoc, -1);
    const arrowText = createOutputText(block);
    updateBlockBottom(block, arrowText);
    undoActions.push(["arrow", (_ => unarrowParam(block, paramIndex))]);
}