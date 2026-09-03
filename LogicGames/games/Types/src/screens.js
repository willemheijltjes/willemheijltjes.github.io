function displayEvalWindow(resultBlock) {
    let evalWindow = new Container();
        backPanel  = new Graphics(),
        windowHeight = 330,
        windowWidth = 500,
        text = null,
        lowerText = null,
        but = null
        closeFunc = function() { app.stage.removeChild(evalWindow); },
        nextLevelFunc = function() { 
            if (levels.length-1 > currentLevel) {
                currentLevel++; 
                resetAll(); 
            }  
        }; 

    evalWindow.addChild(backPanel);

    if (resultBlock === null) {
       windowHeight = 170;
       text = new Text("Function has not been made.", evalTextStyle);
       lowerText = new Text("Try again!", evalTextStyle);
       but = createButton("Close", closeFunc);
    } else {
        resultBlock.cont.x = app.screen.width / 2 - resultBlock.cont.width / 2;
        resultBlock.cont.y = app.screen.height / 2 - resultBlock.cont.height / 2 - 15;

        if (resultBlock.func.text === levels[currentLevel].goalOutput.func) {
           text = new Text("You have made:", evalTextStyle);
           lowerText = new Text("This is correct! Go to the next level.", evalTextStyle);
           but = createButton("Next Level", nextLevelFunc);
        } else {
            text = new Text("You have made:", evalTextStyle);
            lowerText = new Text("Incorrect, try again!", evalTextStyle); 
            but = createButton("Close", closeFunc);
        }
        evalWindow.addChild(resultBlock.cont); 
    }

    backPanel.beginFill(evalPanelColour);
    backPanel.drawRoundedRect(0, 0, windowWidth, windowHeight, 1);
    backPanel.endFill();
    backPanel.alpha = 0.98;
    backPanel.x = app.screen.width / 2 - windowWidth / 2;
    backPanel.y = app.screen.height / 2 - windowHeight / 2;

    backPanel.addChild(text);
    backPanel.addChild(lowerText); 
    backPanel.addChild(but);

    text.x = backPanel.width / 2 - text.width / 2;
    text.y = blockPad;

    lowerText.x = backPanel.width / 2 - lowerText.width / 2;
    lowerText.y = backPanel.height - lowerText.height - blockPad - 50;

    but.x = backPanel.width / 2 - but.width / 2;
    but.y = backPanel.height - but.height - blockPad;

    app.stage.addChild(evalWindow); 
}

function displayEntryScreen() {
    let evalWindow = new Container();
        backPanel  = new Graphics(),
        windowHeight = 500,
        windowWidth = 700,
        text = null,
        headerText = null,
        but = null,
        closeFunc = function() { app.stage.removeChild(evalWindow); };

    evalWindow.addChild(backPanel);
    headerText = new Text("Teach Types", entryScreenHeaderStyle);
    text = new Text("Welcome to teach types. \n\n"
        + "The aim of the game is to click blocks together to create new blocks.\n\n"
        + "Various concepts will be introduced as you play, so get started and have fun!\n\n"
        + "The initial levels will explain the core mechanics.", evalTextStyle);
    text.style.wordWrap = true;
    text.style.wordWrapWidth = 500;
    text.style.align = 'center';

    but = createButton("First level", resetAll);
    menuBut = createButton("Level menu", menuFunc);

    windowHeight = text.height + 200;
    windowWidth = text.width + 50;      

    backPanel.beginFill(evalPanelColour);
    backPanel.drawRoundedRect(0, 0, windowWidth, windowHeight, 5);
    backPanel.endFill();
    backPanel.alpha = 0.98;
    backPanel.x = app.screen.width / 2 - windowWidth / 2;
    backPanel.y = app.screen.height / 2 - windowHeight / 2;

    backPanel.addChild(headerText);
    backPanel.addChild(text);
    backPanel.addChild(but);
    backPanel.addChild(menuBut);

    headerText.x = backPanel.width / 2 - headerText.width / 2;
    headerText.y = blockPad;

    text.x = backPanel.width / 2 - text.width / 2;
    text.y = headerText.height + 50;

    but.x = (backPanel.width / 2 - but.width / 2) - 75;
    but.y = backPanel.height - but.height - blockPad;

    menuBut.x = (backPanel.width / 2 - but.width / 2) + 75;
    menuBut.y = backPanel.height - menuBut.height - blockPad;

    app.stage.addChild(evalWindow); 
}

function displayMenuScreen(difficulty) {
    var difficultyRanks = ["Tutorial", "Beginner", "Intermediate"];

    let evalWindow = new Container();
        backPanel  = new Graphics(),
        windowHeight = 500,
        windowWidth = 700,
        headerText = null,
        levelButPanel = new Container(),
        nextBut = null,
        closeBut = null,
        closeFunc = function() { app.stage.removeChild(evalWindow); },
        nextMenuFunc = function() {
            if (difficulty < difficultyRanks.length-1) {
                closeFunc();
                displayMenuScreen(difficulty+1);
            }
        },
        prevMenuFunc = function() {
            if (difficulty > 0) {
                closeFunc();
                displayMenuScreen(difficulty-1);
            }
        };

    evalWindow.addChild(backPanel);
    headerText = new Text(difficultyRanks[difficulty] + " Levels", entryScreenHeaderStyle);

    let startIndex = difficulty * 6;
    let currY = 0;
    for (var i = 0; i < 4; i += 3) {
        let currX = 0;
        for (var j = 1; j < 4; j++) {
            var levelBut = createButton((i+j+startIndex).toString(), 
                function() {
                    currentLevel = parseInt(this.children[1].text)-1;
                    console.log(currentLevel);
                    resetAll();
                },
                100, 100, 32);
            levelBut.x = currX;
            levelBut.y = currY;
            levelButPanel.addChild(levelBut);
            currX += 130;
        }
        currY += 120;
    }

    prevMenuBut = createButton("Back", prevMenuFunc);
    nextMenuBut = createButton("Next", nextMenuFunc);
    menuBut = createButton("Close", closeFunc);

    windowHeight = levelButPanel.height + 200;
    windowWidth = levelButPanel.width + 100;      

    backPanel.beginFill(evalPanelColour);
    backPanel.drawRoundedRect(0, 0, windowWidth, windowHeight, 5);
    backPanel.endFill();
    backPanel.alpha = 0.98;
    backPanel.x = app.screen.width / 2 - windowWidth / 2;
    backPanel.y = app.screen.height / 2 - windowHeight / 2;

    backPanel.addChild(headerText);
    backPanel.addChild(levelButPanel);
    backPanel.addChild(prevMenuBut);
    backPanel.addChild(nextMenuBut);
    backPanel.addChild(menuBut);

    headerText.x = backPanel.width / 2 - headerText.width / 2;
    headerText.y = blockPad;

    levelButPanel.x = backPanel.width / 2 - levelButPanel.width / 2;
    levelButPanel.y = headerText.height + 50;

    prevMenuBut.x = (backPanel.width / 2 - prevMenuBut.width / 2) - 120;
    prevMenuBut.y = backPanel.height - prevMenuBut.height - blockPad;

    nextMenuBut.x = (backPanel.width / 2 - nextMenuBut.width / 2);
    nextMenuBut.y = backPanel.height - nextMenuBut.height - blockPad;

    menuBut.x = (backPanel.width / 2 - but.width / 2) + 120;
    menuBut.y = backPanel.height - menuBut.height - blockPad;

    app.stage.addChild(evalWindow); 
}


function displayHelperWindow() {
    let evalWindow = new Container();
        backPanel  = new Graphics(),
        windowHeight = 500,
        windowWidth = 700,
        text = null,
        but = null
        closeFunc = function() { app.stage.removeChild(evalWindow); },

    evalWindow.addChild(backPanel);
    text = new Text(levels[currentLevel].helperText, evalTextStyle);
    text.style.wordWrap = true;
    text.style.wordWrapWidth = 500;
    text.style.align = 'center';

    but = createButton("Close", closeFunc);

    windowHeight = text.height + but.height + blockPad * 3;
    windowWidth = text.width + blockPad * 2;      

    backPanel.beginFill(evalPanelColour);
    backPanel.drawRoundedRect(0, 0, windowWidth, windowHeight, 5);
    backPanel.endFill();
    backPanel.alpha = 0.98;
    backPanel.x = app.screen.width / 2 - windowWidth / 2;
    backPanel.y = app.screen.height / 2 - windowHeight / 2;

    backPanel.addChild(text);
    backPanel.addChild(but);

    text.x = backPanel.width / 2 - text.width / 2;
    text.y = blockPad;

    but.x = backPanel.width / 2 - but.width / 2;
    but.y = backPanel.height - but.height - blockPad;

    app.stage.addChild(evalWindow); 
}