function initButtonPanel() {
    let currX = paramPad,
        butCont = new Container(),
        butPanel = new Graphics(),
        goalPanel = new Graphics(),
        buttons = [];

    butCont.addChild(createButton("Undo", undoLastAction));
    butCont.addChild(createButton("Reset", resetAll));
    butCont.addChild(createButton("Evaluate", evalButtonFunc)); 
    butCont.addChild(createButton("Menu", menuFunc));
    for (let but of butCont.children) {
        but.x = currX;
        but.y = 15;
        currX += buttonWidth + paramPad;
    }

    butPanel.beginFill(buttonPanelColour);
    butPanel.drawRoundedRect(0, 0, butCont.width+30, 60, 5);
    butPanel.endFill();
    butPanel.alpha = 0.8;
    butPanel.y = 10;
    butPanel.x = 10;

    goalPanel.x = butPanel.width+blockPad;
    goalPanel.y = 10;
    goalPanel.beginFill(buttonPanelColour);
    goalPanel.drawRoundedRect(0, 0, 160, 170, 5);
    goalPanel.endFill();
    goalPanel.alpha = 0.8;

    let goalBut = createButton("Goal", displayHelperWindow);
    goalBut.x += goalPanel.width/2-goalBut.width/2;
    goalBut.y += paramPad;
    goalPanel.addChild(goalBut);

    let b = levels[currentLevel].goalOutput,
        goalBlock = createBlock(b.params, b.output, b.func, 100, 80);

    goalBlock.cont.x += goalPanel.width/2-goalBlock.cont.width/2 + 2;
    goalBlock.cont.y += 33 + goalBut.height;
    goalBlock.cont.interactive = false;
    goalBlock.cont.alpha = 0.7;

    goalPanel.addChild(goalBlock.cont);

    butCont.y = butPanel.height/2 - butCont.height + 4;

    butPanel.addChild(butCont);
    app.stage.addChild(butPanel);
    app.stage.addChild(goalPanel);
}

function initBlocks() {
    let currX = blockPad,
        currY = blockPad + menuHeight,
        blocksOnRow = 0,
        lastFunc = null,
        blockCont = new Container();

    // load blocks from level
    for (var i = 0; i < levels[currentLevel].startingBlocks.length; i++) {
        let b = levels[currentLevel].startingBlocks[i],
            block = createBlock(b.params, b.output, b.func);        

        blocks.push(block);

        blocksOnRow += block.size;
        if (lastFunc === block.func.text) {
            blocksOnRow = 3;
            currX -= block.size*width;
            currY += clickDist + 5;
        } else if (blocksOnRow >= 3) {
            blocksOnRow = 0;
            currX = blockPad;
            currY += height + clickDist + 5;
        }
        block.cont.x = currX;
        block.cont.y = currY;

        lastFunc = block.func.text;

        currX += block.size*width + blockPad;
        blockCont.addChild(block.cont);
    }
    app.stage.addChild(blockCont);
    displayHelperWindow();
}

function createButton(text, clickFunc, w, h, fontSize) {
    let butCont = new Container(),
        but = new Graphics(),
        butWidth = w,
        butHeight = h;
    
    if (w === undefined) butWidth = buttonWidth;
    if (h === undefined) butHeight = buttonHeight;

    but.lineStyle(2, buttonLineColour, 1);
    but.beginFill(buttonColour);
    but.drawRoundedRect(0, 0, butWidth, butHeight-paramPad, 3)
    but.endFill();
    butCont.addChild(but);

    let butText = new Text(text, textStyle);
    if (fontSize !== undefined) butText.style.fontSize = fontSize;
    butCont.addChild(butText);
    butText.x += (butCont.width/2 - butText.width/2);
    butText.y += (butCont.height/2 - butText.height/2);

    butCont.buttonMode = true;
    butCont.interactive = true;

    butCont
        // events for drag start
        .on('mousedown', clickFunc)
        .on('touchstart', clickFunc);

    return butCont;
}

function createBlockParams(params, w, h) {
    let blockHeight = height,
        blockWidth = width;
        
    if (w !== undefined && h !== undefined) {
        blockWidth = w;
        blockHeight = h;
    }

    var blockParams = new Container();
    if (params.length == 0) {
        let line = new Graphics(); 
        line.lineStyle(lineThickness, lineColour, 1);
        line.moveTo(0, 0);
        line.lineTo(blockWidth, 0);
        blockParams.addChild(line);
    }   

    // create top lines and add params
    let lastX = 0;
    for (var i = 0; i < params.length; i++) {
        var paramContainer = new Container();
        let param = new Text(params[i], textStyle);

        let paramWidth = param.getBounds().width + paramPad;
        while (paramWidth > blockWidth - paramPad) {     
            param.style.fontSize -= 5;
            paramWidth = param.getBounds().width + paramPad;
        } 

        param.interactive = true;
        param
            // events for drag start
            .on('mousedown', onDragStart)
            .on('touchstart', onDragStart)
            // events for drag end
            .on('mouseup', onDragEnd)
            .on('mouseupoutside', onDragEnd)
            .on('touchend', onDragEnd)
            .on('touchendoutside', onDragEnd)
            // events for drag move
            .on('mousemove', onDragMove)
            .on('touchmove', onDragMove);

        paramWidth = param.getBounds().width + paramPad;
        topLineWidths = (blockWidth - paramWidth)/2;

        let line = new Graphics();
        line.lineStyle(lineThickness, lineColour, 1);
        line.moveTo(lastX, 0);
        line.lineTo(lastX+topLineWidths, 0);

        let paramPosX = lastX+topLineWidths+paramPad/2;
        let linkCircle = new Graphics();
        linkCircle.beginFill(0xdd4646);
        linkCircle.drawCircle(paramPosX+param.width/2, 0, paramWidth/2);
        linkCircle.endFill();
        linkCircle.alpha = 0;
        paramContainer.addChild(linkCircle);

        param.position.set(paramPosX, -param.height/2);
        paramContainer.addChild(param);

        lastX += topLineWidths + paramWidth;
        paramContainer.addChild(line);

        line = new Graphics(); 
        line.lineStyle(lineThickness, lineColour, 1);
        line.moveTo(lastX, 0);
        line.lineTo(lastX+topLineWidths, 0);
        lastX += topLineWidths;
        paramContainer.addChild(line);
        paramContainer.interactive = true;
        blockParams.addChild(paramContainer);
    }
    return blockParams;
}

function createBlockBottom(size, output, w, h) {
    let blockHeight = height,
        blockWidth = width;

    if (w !== undefined && h !== undefined) {
        blockWidth = w;
        blockHeight = h;
    }

    let blockBottomContainer = new Container();
    let blockOutput = new Text(output, textStyle);

    let paramWidth = blockOutput.getBounds().width + paramPad;
        while (paramWidth > blockWidth - paramPad) {     
            blockOutput.style.fontSize -= 5;
            paramWidth = blockOutput.getBounds().width + paramPad;
        } 

    paramWidth = blockOutput.getBounds().width + paramPad;

    var bottomLineWidths = size == 0 ? (blockWidth - paramWidth) / 2
                                  : (size*blockWidth - paramWidth) / 2;
    
    let paramPosX = bottomLineWidths+paramPad/2;
    blockOutput.position.set(paramPosX, blockHeight-blockOutput.height/2);

    let linkCircle = new Graphics();
    linkCircle.beginFill(0xdd4646);
    linkCircle.drawCircle(paramPosX+blockOutput.width/2, blockHeight, paramWidth/2);
    linkCircle.endFill();
    linkCircle.alpha = 0;
    blockBottomContainer.addChild(linkCircle);

    blockBottomContainer.addChild(blockOutput);

    // create bottom lines and add output
    var lastX = 0;
    for (var i = 0; i < 2; i++) {
        let line = new Graphics();
        line.lineStyle(lineThickness, lineColour, 1);
        line.moveTo(lastX, blockHeight);
        line.lineTo(lastX+bottomLineWidths, blockHeight);
        lastX += bottomLineWidths + paramWidth;
        blockBottomContainer.addChild(line);
    }
    return blockBottomContainer;
}

function createBlock(paramTexts, output, fn, w, h) {
    let parentContainer = new Container(),
        sides = new Container(), 
        n = paramTexts.length,
        blockWidth = width,
        blockHeight = height,
        parentRect = new Graphics();

    if (w !== undefined && h !== undefined) {
        blockWidth = w;
        blockHeight = h;
    }

    let originalBlockWidth = blockWidth;

    blockWidth = n == 0 ? blockWidth : n * blockWidth,

    parentRect.beginFill(backgroundColour);
    parentRect.drawRect(0, 0, blockWidth, blockHeight);
    parentRect.endFill();

    parentContainer.interactive = true;
    parentContainer.buttonMode = true;
    parentContainer
        // events for drag start
        .on('mousedown', onDragStart)
        .on('touchstart', onDragStart)
        // events for drag end
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        // events for drag move
        .on('mousemove', onDragMove)
        .on('touchmove', onDragMove);

    var blockParams = createBlockParams(paramTexts, w, h);

    var blockBottom = createBlockBottom(n, output, w, h);

    var pad = lineThickness/2;

    // create vertical lines
    let lhsLine = new Graphics();
    lhsLine.lineStyle(lineThickness, lineColour, 1);
    lhsLine.moveTo(0, -pad);
    lhsLine.lineTo(0, blockHeight+pad);
    sides.addChild(lhsLine);

    let rhsLine = new Graphics();
    rhsLine.lineStyle(lineThickness, lineColour, 1);
    rhsLine.moveTo(blockWidth, -pad);
    rhsLine.lineTo(blockWidth, blockHeight+pad);
    sides.addChild(rhsLine);

    let func = new Text(fn, funcTextStyle);

    let paramWidth = func.getBounds().width + paramPad,
        counter = 0;
    while (paramWidth > blockWidth - paramPad/2) {     
        func.style.fontSize -= 1;
        paramWidth = func.getBounds().width + paramPad;

        if (counter > 16) {
            func.style.wordWrap = true;
            func.style.wordWrapWidth = originalBlockWidth - paramPad;
            func.style.align = 'center';
        }
        counter++;
    } 
    let xcoord = (blockWidth - func.getBounds().width) / 2;
    let ycoord = (blockHeight - func.getBounds().height) / 2;
    func.position.set(xcoord, ycoord);

    blockParams.interactive = true;
    parentContainer.addChild(parentRect, sides, blockParams, blockBottom, func);
    
    let blockObj = {cont: parentContainer,
        rect: parentRect, 
        sides: sides, 
        func: func, 
        output: blockBottom, 
        params: blockParams,
        linkedParams: {},
        size: blockParams.children.length,
        hasParams: n > 0,
        linkedOutput: null,
        linkedParamIndex: null,
        paramCount: n,
        paramList: paramTexts.slice(0),
        arrow: [],
        curried: [],
        undoSteps: [],
        paramIndices: [...Array(paramTexts.length).keys()].map(x => [x, x]),
        initialOutputText: blockBottom.children[1].text,
        paramAt: function(i) { return this.params.children[i]; },
        paramTextAt: function(i) { return this.paramAt(i).children[1]; },
        hasParamText: function(paramText) { return this.params.children.findIndex(p => p.children[1] === paramText); },
        paramLinkIndicatorAt: function(i) { return this.paramAt(i).children[0]; },
        outputLinkIndicator: function() { return this.output.children[0]; },
        outputText: function() { return this.output.children[1]; },
        leftSide: function() { return this.sides.children[0]; },
        rightSide: function() { return this.sides.children[1]; }
    };
    return blockObj;
}
