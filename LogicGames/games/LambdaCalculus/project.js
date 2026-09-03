//state of game
var state;
var depth;
var phase;

//nodes
var nodeCount;
var nodeList;

//tiles
var tileList;

//clicked on tile
var selectedTile;

//mouse coord
var start;

//level 2
var colourBox;
var savedColours;

//continue?
var cursorColour;
var tileColours;

//UI Buttons
var homeButton;
var checkButton;
var resetButton;

//solution of a level
var solution;
var locked;

//pre-loaded tree layout
var setTree;
var tileCount;

//beta-reduction tools
var moveButton;
var copyButton;
var deleteButton;
var cursorButton;

//dragging tree
var movingTreeTileList;
var movingTreeClickableList;

//renaming
var renamingButton;
var renameVal;

//image
var questionImage;

//undo and redo
var undoButton;
var redoButton;
var tileHistory;
var nodeHistory;
var colourHistory;

var redexHistory;
var phaseHistory;

var wrongListHistory;
var revealHistory;

var tileRedo;
var nodeRedo;
var colourRedo;

var redexRedo;
var phaseRedo;

var revealRedo;

var wrongListRedo;

//topic levels
var levelList;
var level1ButtonList;
var level2ButtonList;
var level3ButtonList;
var redexList;

var currentLevel;
var currentDiff;

var redexDim;
var reduceButton;
var finishButton;

var bin;

var wrongList;

var tutorialButton1;
var tutorialButton2;
var tutorialButton3;
var tutorialButton4;

var displayBox;
var closeDisplay;
var displayText;
var displaySubText;
var displaySubText2;

var correctTiles;

var variables;

var destinationList;

var fadeOutAnimate;
var moveTreeAnimate;

var backgroundColour;
var topColour;
var nodeColour;
var correctColour;
var wrongColour;
var redexColour;
var menuColour;

var helpButton;
var toggleHelp;

var helpImage;
var helpToggle;
var backButton;

var hintButton;
var revealButton;

function assignColours() {
    backgroundColour = color(205, 248, 250);
//    backgroundColour = color(181, 208, 255);
//    menuColour = color(135, 177, 255);
    menuColour = color(205, 248, 250);
    topColour = color(95, 222, 227);
//    topColour = color(135, 177, 255);
    nodeColour = color(178, 232, 250);
    correctColour = '#bcffb0';
    wrongColour = color(255,0,0);
    redexColour = color(150, 238, 255);
}

function loadCorrectPhase1Display() {
    displayBox = true;
    displayText = 'Correct!';
    displaySubText = 'Now you must rename each coloured group of';
    displaySubText2 = 'bound variables such that each is unique';
    closeDisplay = new Clickable(1750,100);
    closeDisplay.cornerRadius = 0;
    closeDisplay.text = 'X';
    closeDisplay.textSize = 22;
    closeDisplay.resize(30,30);
    closeDisplay.onPress = function() {
        displayBox = false;
    }
}

function loadReduceRedexDisplay() {
    displayBox = true;
    displayText = 'Good Job!';
    displaySubText = 'Now you must beta-reduce the';
    displaySubText2 = 'selected redex';
    closeDisplay = new Clickable(1750,100);
    closeDisplay.cornerRadius = 0;
    closeDisplay.text = 'X';
    closeDisplay.textSize = 22;
    closeDisplay.resize(30,30);
    closeDisplay.onPress = function() {
        displayBox = false;
    }
}

function loadContinueDisplay(val) {
    displayBox = true;
    
    displayText = 'Good Job!';
    
    closeDisplay = new Clickable(1750,100);
    closeDisplay.cornerRadius = 0;
    closeDisplay.text = 'X';
    closeDisplay.textSize = 22;
    closeDisplay.resize(30,30);
    closeDisplay.onPress = function() {
        displayBox = false;
    }
    
    if (phase == 12) {
        displaySubText = 'Now you must highlight bound variables within';
        displaySubText2 = 'the area, and keep free variables white';
    }
    else if (phase == 13) {
        displaySubText = 'Now you must beta-reduce';
        displaySubText2 = 'the redex';
    }
    else if (phase == 14) {
        displaySubText = 'Now you must beta-reduce the redex,';
        displaySubText2 = 'remember to avoid variable capture';
    }
    else if (firstTime == false && phase == 1) {
        displaySubText = 'Now you must identify if there are any';
        displaySubText2 = 'more redexes to reduce';
    }
    
    
}

function loadCorrectDisplay() {
    displayBox = true;
    displayText = 'Correct!';
    if (state == 'Level-1' && currentLevel >= level1ButtonList.length-1) {
        displaySubText = 'You have completed the last level!';
        displaySubText2 = 'Press the following button to return home';
    }
    else if (state == 'Level-2' && currentLevel >= level2ButtonList.length-1) {
        displaySubText = 'You have completed the last level!';
        displaySubText2 = 'Press the following button to return home';
    }
    else if (state == 'Level-3' && currentLevel >= level3ButtonList.length-1) {
        displaySubText = 'You have completed the last level!';
        displaySubText2 = 'Press the following button to return home';
    }
    else if (state == 'Level-3') {
        displaySubText = 'You have reduced the expression';
        displaySubText2 = 'to normal form!';
    }
    else if (state == 'Level-2' && currentLevel < 2) {
        displaySubText = 'You have correctly coloured all variables!';
        displaySubText2 = '';
    }
    else if (state == 'Level-2') {
        displaySubText = 'You have correctly alpha-converted';
        displaySubText2 = 'all bound variables to a unique variable!';
    }
    else if (state = 'Level-1') {
        displaySubText = 'You have correctly built the';
        displaySubText2 = 'lambda expression!';
    }
    else {
        displaySubText = 'Press the following button to continue';
        displaySubText2 = 'to the next level!';
    }

}

function loadWrongDisplay(val) {
    displayBox = true;
    closeDisplay = new Clickable(1750,100);
    closeDisplay.cornerRadius = 0;
    closeDisplay.text = 'X';
    closeDisplay.textSize = 22;
    closeDisplay.resize(30,30);
    closeDisplay.onPress = function() {
        displayBox = false;
    }
    displayText = 'Not Quite!';
    displaySubText = '';
    displaySubText2 = '';
    if (state == 'Level-1' && val == 1337) {
        displayText = 'Help';
        displaySubText = 'A correct tile has been placed';
        displaySubText2 = 'for you';
    }
    else if (state == 'Level-1' && val == 1338) {
        displayText = 'Help';
        displaySubText = 'Some correct tiles have been placed';
        displaySubText2 = 'for you';
    }
    else if (state == 'Level-1' && val > 1) {
        displaySubText = 'But you correctly placed ' + val.toString() + ' new tiles!';
        temp = checkReveal();
        if (temp > -1) {
            displaySubText2 = 'Would you like help?';
        }
    }
    else if (state == 'Level-1' && val > 0) {
        displaySubText = 'But you correctly placed ' + val.toString() + ' new tile!';
        temp = checkReveal();
        if (temp > -1) {
            displaySubText2 = 'Would you like help?';
        }
    }
    else if (state == 'Level-1' && val <= 0) {
        temp = checkReveal();
        if (temp > -1) {
            displaySubText2 = 'Would you like help?';
        }
    }
    else if (state == 'Level-2') {
        if (phase == 1) {
            if (val == 101) {
                displayText = 'Error';
                displaySubText = 'You can only colour variables';
            }
            else if (val == 0) {
                //text?
            }
            else if (val == -1) {
                displaySubText = 'But you correctly coloured all free';
                displaySubText2 = 'variables white';
            }
            else if (val == -2) {
                displaySubText = 'But you correctly coloured 1 group of bound';
                displaySubText2 = 'variables, as well as all free variables white';
            }
            else if (val < -2) {
                displaySubText = 'But you correctly coloured ' + (-1 + val.toString() * -1) + ' groups of bound';
                displaySubText2 = 'variables, as well as all free variables white';
            }
            else if (val == 1) {
                displaySubText = 'But you correctly coloured 1 group of';
                displaySubText2 = 'bound variables';
            }
            else if (val > 1) {
                displaySubText = 'But you correctly coloured ' + val.toString() + ' groups of';
                displaySubText2 = 'bound variables';
            }
        }
        else if (phase == 2) {
            if (val == 2) {
                displaySubText = 'You have a name clash between at least 2';
                displaySubText2 = 'of your bound variables';
            }
            else if (val == 1) {
                displaySubText = 'You have a name clash between a';
                displaySubText2 = 'bound variable and a free variable';
            }
            else if (val == 3) {
                displaySubText = 'You have a name clash between a bound variable and';
                displaySubText2 = 'a free variable, as well as between some bound variables';
            }
            else if (val == 100) {
                displayText = 'Error';
                displaySubText = 'You cannot rename free variables, try';
                displaySubText2 = 'renaming a bound variable';
            }
            else if (val == 101) {
                displaySubText = 'Error';
                displaySubText = 'You can only rename bound variables';
            }
        }
    }
    else if (state == 'Level-3') {
        if (phase == 1 || phase == 0) {
            if (val == 1) {
//                displayText = 'Error';
                displaySubText = 'The selected tree is not a redex';
            }
            else if (val == 2) {
                displayText = 'Error';
                displaySubText = 'Select a node within the tree first';
            }
            else if (val == 50) {
                displaySubText = 'It is not yet in normal form, try';
                displaySubText2 = 'selecting another redex within the tree';
            }
            else {
                displaySubText = 'Try using the undo tool to find';
                displaySubText2 = 'where you went wrong';
            }
        }
        else if (phase == 2) {
            if (val == 13) {
                displayText = 'Error';
                displaySubText = 'You can only substitute into variables';
            }
        }
        else if (phase == 12) {
            if (val == 22) {
                displaySubText = '';
                displaySubText2 = '';
            }
            else if (val == 31) {
                displayText = 'Error';
                displaySubText = 'You must colour within the highlighted area';
            }
            else if (val == 32) {
                displayText = 'Error';
                displaySubText = 'You can only colour variables';
            }
            else if (val == 160) {
                displaySubText = 'You have not coloured the redex';
                displaySubText2 = 'parameter';
            }
            else if (val == 161) {
                displaySubText = 'You have not correctly coloured all bound';
                displaySubText2 = 'occurrences of the parameter';
            }
            else if (val == 162) {
                displaySubText = 'You have correctly coloured the parameter, but';
                displaySubText2 = 'there are additional bound variables to consider';
            }
            else if (val == 163) {
                displaySubText = 'You have incorrectly coloured a free variable';
            }
        }
        else if (phase >= 13) {
            if (val == 100) {
                displaySubText = 'You have not subtituted the argument in for';
                displaySubText2 = 'all bound occurrences of the parameter';
            }
            else if (val == 110) {
                displaySubText = 'A free variable has become captured, you';
                displaySubText2 = 'must rename the clashing bound variable';
            }
            else if (val == 90) {
                displayText = 'Error';
                displaySubText = 'You must drag the top of the highlighted tree';
            }
            else if (val == 91) {
                displayText = 'Error';
                displaySubText = 'You must drag the highlighted area';
            }
            else if (val == 80) {
                displayText = 'Error';
                displaySubText = 'You can only rename variables';
            }
            else if (val == 81) {
                displayText = 'Error';
                displaySubText = 'You cannot rename free variables';
                displaySubText2 = 'Try renaming a bound/binding variable'; 
            }
            else if (val == 82) {
                displayText = 'Error';
                displaySubText = 'You can only rename within the';
                displaySubText2 = 'selected redex';
            }
            else if (val == 83) {
                displayText = 'Error';
                displaySubText = 'You cannot rename variables in the';
                displaySubText2 = 'highlighted area';
            }
            else if (val == 66) {
                displayText = 'Error';
                displaySubText = 'You can only substitute the tree into variables';
                displaySubText2 = 'that are bound to the redex parameter';
            }
        }
    }
}

class level {
    constructor(displayImage,setTree,solution, vars) {
        this.displayImage = displayImage;
        this.setTree = setTree;
        this.solution = solution;
        this.tool = vars;
    }
}
class coord {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class node {
    constructor(pos) {
        this.pos = pos;
        this.occupied = -1;
    }
}

class tile {
    constructor(x,y,label,assignment,defaultX,defaultY) {
        this.pos = new coord(x,y);
        this.label = label;
        this.assignment = assignment;
        this.defaultPos = new coord(defaultX,defaultY);
    }
}

var lambda;

function createLevels() {
    levelList = new Array(3);
    
    //TOPIC 1 LEVELS
    //------------------------------------------------------------------------------------
    
    levelList[0] = new Array(16);
    revealList = new Array(16);
    //EASY LEVELS
    levelList[0][0] = new level(
        'assets/A1.png',
        ['\\','Z','n'],
        ['-','-','Z'],
    );
    revealList[0] = [[]];
    levelList[0][1] = new level(
        'assets/A2.png',
        ['n','X','n'],
        ['\\','-','Y'],
    );
    revealList[1] = [[]];
    levelList[0][2] = new level(
        'assets/A3.png',
        ['n','n','Z'],
        ['@','X','-'],
    );
    revealList[2] = [[]];
    levelList[0][3] = new level(
        'assets/A4.png',
        ['@','@'], 
        ['-','-','Z','X','Y','n','n'],
    );
    revealList[3] = [[]];
    levelList[0][4] = new level(
        'assets/A5.png',
        [],
        ['\\','X','@','n','n','X','X'],
    );
    revealList[4] = [[0],[1],[2]];
    levelList[0][5] = new level(
        'assets/A6.png',
        [],
        ['\\','X','@','n','n','X','@','n','n','n','n','n','n','V','Y'],
    );
    revealList[5] = [[0,2],[1,6]];
    //MEDIUM LEVELS
    levelList[0][6] = new level(
        'assets/A7.png',
        [],
        ['@','@','\\','Y','X','X','@','n','n','n','n','n','n','W','Z'],
    );
    revealList[6] = [[0,1],[2,5,6]];
    levelList[0][7] = new level(
        'assets/A8.png',
        [],
        ['@','\\','\\','X','@','Y','@','n','n','X','Y','n','n','Y','X'],
    );
    revealList[7] = [[0],[1,2],[4,6]];
    levelList[0][8] = new level(
        'assets/A9.png',
        [],
        ['@','@','V','W','\\','n','n','n','n','Y','@','n','n','n','n','n','n','n','n','n','n','W','Z','n','n','n','n','n','n','n','n'],
    );
    revealList[8] = [[0,1],[2,4],[10]];
    levelList[0][9] = new level(
        'assets/A10.png',
        [],
        ['\\','Z','@','n','n','Z','\\','n','n','n','n','n','n','X','@','n','n','n','n','n','n','n','n','n','n','n','n','n','n','Z','X']
    );
    revealList[9] = [[0,2],[6],[14]];
    levelList[0][10] = new level(
        'assets/A11.png',
        [],
        ['@','\\','\\','Y','@','X','\\','n','n','X','Y','n','n','Y','@','n','n','n','n','n','n','n','n','n','n','n','n','n','n','Z','Y']
    );
    revealList[10] = [[0,1],[2,4],[6],[14]];
    levelList[0][11] = new level(
        'assets/A12.png',
        [],
        ['@','@','Z','@','\\','n','n','X','Y','Z','@','n','n','n','n','n','n','n','n','n','n','X','Y','n','n','n','n','n','n','n','n']
    );
    revealList[11] = [[0,1],[2,3],[4]];
    //HARD LEVELS
    levelList[0][12] = new level(
        'assets/A13.png',
        [],
        ['@','@','@','\\','\\','\\','@','X','@','Y','@','V','@','V','X','n','n','X','X','n','n','Y','Z','n','n','V','X','n','n','n','n']
    );
    revealList[12] = [[0,1],[2,5],[3,4,6]];
    levelList[0][13] = new level(
        'assets/A14.png',
        [],
        ['\\','Y','\\','n','n','Z','@','n','n','n','n','n','n','@','\\','n','n','n','n','n','n','n','n','n','n','n','n','@','Z','X','@','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','Y','Z','n','n','n','n','X','Y']
    );
    revealList[13] = [[0,2],[6,14],[13,27]];
    levelList[0][14] = new level(
        'assets/A15.png',
        [],
        ['\\','Y','@','n','n','\\','@','n','n','n','n','Z','\\','\\','W','n','n','n','n','n','n','n','n','n','n','Y','@','W','@','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','Z','X','n','n','Z','X','n','n','n','n']
    );
    revealList[14] = [[0,2],[5,6],[12,13]];
    levelList[0][15] = new level(
        'assets/A16.png',
        [],
        ['@','@','\\','\\','\\','Z','@','X','\\','Y','@','n','n','@','\\','n','n','Z','@','n','n','X','Y','n','n','n','n','Z','W','Z','@','n','n','n','n','n','n','Z','Y','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','X','V']
    );
    revealList[15] = [[0,1],[2],[6,14]];
    
    
    //TOPIC 2 LEVELS
    //------------------------------------------------------------------------------------
    levelList[1] = new Array(6);
    levelList[1][0] = new level(
        'assets/q2a.png',
        ['\\','X','@','n','n','X','Y'],
        [-1,1,-1,1,0],
        ['X','Y','Z']
    );
    levelList[1][2] = new level(
        'assets/q2b.png',
        ['@','\\','\\','X','X','X','X'],
        [-1,-1,-1,1,1,2,2],
        ['X','Y','Z']
    );
    levelList[1][1] = new level(
        'assets/q2c.png',
        ['\\','F','\\','n','n','G','@','n','n','n','n','n','n','F','G'],
        [-1,1,-1,2,-1,1,2],
        ['F','G','H']
    );
    levelList[1][3] = new level(
        'assets/q2d.png',
        ['\\','Y','\\','n','n','Y','@','n','n','n','n','n','n','X','Y'],
        [-1,1,-1,2,-1,0,2],
        ['X','Y','Z']
    );
    levelList[1][4] = new level(
        'assets/q2e.png',
        ['@','\\','\\','F','G','G','F'],
        [-1,-1,-1,1,0,2,0],
        ['F','G','H','I']
    );
    levelList[1][5] = new level(
        'assets/q2f.png',
        ['\\','Z','@','n','n','Z','\\','n','n','n','n','n','n','Z','@','n','n','n','n','n','n','n','n','n','n','n','n','n','n','Z','Y'],
        [-1,1,-1,1,-1,2,-1,2,0],
        ['X','Y','Z']
    );
    levelList[1][6] = new level(
        'assets/q2g.png',
        ['@','\\','\\','X','@','X','\\','n','n','X','Y','n','n','Y','X'],
        [-1,-1,-1,1,-1,2,-1,1,0,3,2],
        ['W','X','Y','Z']
    );
    levelList[1][7] = new level(
        'assets/q2h.png',
        ['@','\\','@','F','\\','@','Z','n','n','G','H','F','G','n','n'],
        [-1,-1,-1,1,-1,-1,0,2,0,0,0],
        ['F','G','H','X','Y','Z']
    );
    levelList[1][8] = new level(
        'assets/q2i.png',
        ['\\','F','@','n','n','\\','\\','n','n','n','n','X','@','F','@','n','n','n','n','n','n','n','n','n','n','F','X','n','n','F','X'],
        [-1,1,-1,-1,-1,2,-1,3,-1,1,2,3,0],
        ['F','G','H','X']
    );
    levelList[1][9] = new level(
        'assets/q2j.png',
        ['@','@','\\','\\','\\','Z','@','X','@','Y','@','n','n','Z','Z','n','n','X','Y','n','n','X','Y','n','n','n','n','n','n','n','n'],
        [-1,-1,-1,-1,-1,1,-1,2,-1,3,-1,1,1,2,0,0,3],
        ['V','W','X','Y','Z']
    );
    levelList[1][10] = new level(
        'assets/q2k.png',
        ['@','\\','\\','X','@','X','@','n','n','@','\\','n','n','@','\\','n','n','n','n','Y','X','X','X','n','n','n','n','Y','X','X','X'],
        [-1,-1,-1,1,-1,2,-1,-1,-1,-1,-1,0,1,3,3,0,2,4,4],
        ['F','G','X','Y','Z']
    );
    levelList[1][11] = new level(
        'assets/q2l.png',
        ['@','@','@','\\','\\','\\','\\','Z','@','V','@','Y','@','Y','@','n','n','W','Z','n','n','V','X','n','n','Z','Y','n','n','Y','V'],
        [-1,-1,-1,-1,-1,-1,-1,1,-1,2,-1,3,-1,4,-1,0,1,2,0,0,3,4,0],
        ['F','G','H','V','W','X','Y','Z']
    );
    levelList[1][12] = new level(
        'assets/q2k.png',
        ['@','\\','\\','X','@','W','@','n','n','\\','\\','n','n','W','X','n','n','n','n','Y','@','Z','@','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','X','Y','n','n','Z','Z','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        [-1,-1,-1,1,-1,2,-1,-1,-1,2,-0,3,-1,4,-1,1,3,4,4],
        ['V','W','X','Y','Z']
    );
    levelList[1][13] = new level(
        'assets/q2l.png',
        ['\\','W','@','n','n','\\','@','n','n','n','n','W','@','\\','@','n','n','n','n','n','n','n','n','n','n','W','\\','W','@','W','Z','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','Y','Y','n','n','Y','X','n','n','n','n'],
        [-1,1,-1,-1,-1,2,-1,-1,-1,2,-1,3,-1,1,0,4,4,0,0],
        ['A','B','C','V','W','X','Y','Z']
    );
    levelList[1][14] = new level(
        'assets/q2m.png',
        ['@','@','\\','\\','\\','F','@','X','@','Y','\\','n','n','@','F','n','n','@','X','n','n','Z','@','n','n','n','n','X','@','n','n','n','n','n','n','X','Z','n','n','n','n','n','n','n','n','Y','Z','n','n','n','n','n','n','n','n','n','n','H','Y','n','n','n','n'],
        [-1,-1,-1,-1,-1,1,-1,2,-1,3,-1,-1,1,-1,2,4,-1,0,-1,2,0,3,4,0,0],
        ['F','G','H','V','W','X','Y','Z']
    );
    levelList[1][15] = new level(
        'assets/q2n.png',
        ['@','@','\\','\\','\\','Z','@','X','\\','Y','@','n','n','@','\\','n','n','X','@','n','n','X','Y','n','n','n','n','Z','W','Z','@','n','n','n','n','n','n','X','X','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','Z','W'],
        [-1,-1,-1,-1,-1,1,-1,2,-1,3,-1,-1,-1,4,-1,0,3,1,0,5,-1,4,4,5,0],
        ['F','G','V','W','X','Y','Z']
    );
    
    //TOPIC 3 LEVELS
    //------------------------------------------------------------------------------------
    levelList[2] = new Array(14);
    levelList[2][0] = new level(
        'assets/q3a.png',
        ['@','\\','Y','X','X','n','n'],
        []
    );
    levelList[2][1] = new level(
        'assets/q3b.png',
        ['@','\\','@','Y','Y','Y','Z','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][2] = new level(
        'assets/q3c.png',
        ['@','@','@','X','\\','\\','Z','n','n','Z','Z','X','X','n','n'],
        []
    );
    levelList[2][3] = new level(
        'assets/q3d.png',
        ['@','\\','Y','X','\\','n','n','n','n','Z','Z','n','n','n','n'],
        []
    );
    levelList[2][4] = new level(
        'assets/q3e.png',
        ['@','\\','@','X','@','Y','X','n','n','X','X','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][5] = new level(
        'assets/q3f.png',
        ['@','@','@','\\','Z','\\','Z','Y','Y','n','n','Y','Y','n','n'],
        []
    );
    levelList[2][6] = new level(
        'assets/q3g.png',
        ['@','\\','Y','X','\\','n','n','n','n','Y','X','n','n','n','n'],
        []
    );
    levelList[2][7] = new level(
        'assets/q3h.png',
        ['@','\\','@','X','X','\\','Z','n','n','n','n','Y','@','n','n','n','n','n','n','n','n','n','n','n','n','Y','Y','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][8] = new level(
        'assets/q3i.png',
        ['@','\\','@','X','\\','W','Y','n','n','X','@','n','n','n','n','n','n','n','n','n','n','X','X','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][9] = new level(
        'assets/q3j.png', ['@','\\','@','X','\\','A','A','n','n','A','@','n','n','n','n','n','n','n','n','n','n','X','A','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][10] = new level(
        'assets/q3k.png',
        ['@','\\','@','Z','@','\\','Y','n','n','@','Z','X','X','n','n','n','n','n','n','X','Y','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][11] = new level(
        'assets/q3l.png',
        ['@','\\','@','X','@','Y','Z','n','n','\\','@','n','n','n','n','n','n','n','n','Y','Y','X','Y','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][12] = new level(
        'assets/q3m.png',
        ['@','@','A','\\','A','n','n','X','\\','n','n','n','n','n','n','n','n','A','@','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','X','A','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][13] = new level(
        'assets/q3n.png',
        ['@','\\','\\','X','@','X','@','n','n','X','X','n','n','X','Y','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][14] = new level(
        'assets/q3o.png', ['@','\\','@','X','@','\\','\\','n','n','\\','@','Z','@','X','X','n','n','n','n','Y','Y','Y','W','n','n','Z','W','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        []
    );
    levelList[2][15] = new level(
        'assets/q3p.png', ['@','\\','\\','X','@','Y','Y','n','n','@','X','n','n','n','n','n','n','n','n','X','X','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n','n'],
        []
    )
}

var display1;
var display2;
var display3;
var back;
var homepic;
var binpic;

function setup() {
    createCanvas(1800, 900);
    
    assignColours();
        
    createLevels();
    loadStartUp();
    
    loadHelpImages();
    
    lambda = loadImage('assets/lam.png');
    display1 = loadImage('assets/display1.png');
    display2 = loadImage('assets/display2.png');
    display3 = loadImage('assets/display3.png');
    back = loadImage('assets/back.png');
    homepic = loadImage('assets/home.png');
    binpic = loadImage('assets/bin.png');
    
    font1 = loadFont('assets/DK Coal Brush.otf')
//    font1 = loadFont('assets/Modern Fantasy DEMO.otf');
//    font3 = loadFont('assets/Regular.otf');
    font3 = 'Helvetica';
} 

function loadHelpImages() {
    helpImage = new Array(3);
    
    helpImage[0] = new Array(4);
    helpImage[0][0] = loadImage('assets/Help1a.png');
    helpImage[0][1] = loadImage('assets/Help1b.png');
    helpImage[0][2] = loadImage('assets/Help1c.png');
    helpImage[0][3] = loadImage('assets/Help1d.png');
    
    helpImage[1] = new Array(2);
    helpImage[1][0] = loadImage('assets/Help2a.png');
    helpImage[1][1] = loadImage('assets/Help2b.png');
    
    helpImage[2] = new Array(3);
    helpImage[2][0] = loadImage('assets/Help3a.png');
    helpImage[2][1] = loadImage('assets/Help3b.png');
    helpImage[2][2] = loadImage('assets/Help3c.png');
}

function loadStartUp() {
//    state = 'Start-Up';
    state = 'Menu';
    currentLevel = 'N/A';
    loadLevelButtons();
    helpToggle = '';
}

function draw() {
    cursor('Default');
    stroke(0); 
    background(backgroundColour);
    
    if (state == 'Menu') {
        drawMenu();
    }
    else if (state == 'Menu-1' || state == 'Menu-1P') {
        drawMenu1();
    }
    else if (state == 'Menu-2' || state == 'Menu-2P') {
        drawMenu2();
    }
    else if (state == 'Menu-3' || state == 'Menu-3P') {
        drawMenu3();
    }
    else if (state == 'Level-1') {
        drawLevel1();
    }
    else if (state == 'Level-2') {
        drawLevel2();
    }
    else if (state == 'Level-3') {
        drawLevel3();
    }
    
}

function drawMenu() {
    tint(255);
    textAlign(CENTER,BOTTOM);
    textSize(108);
    fill(50);
    noStroke();
    textFont(font1);
    text('Lambda Calculus',885,140);
    textSize(72);
    text('Logic Game',890,220);
    textSize(22);
    textFont(font3);
    fill(25);
    text('Welcome to my logic game for helping learn and practice Lambda Calculus.',900,350);
    text('Please select the topic that you would like to play.',900,380);
//    stroke(100);
//    strokeWeight(2);
//    line(500,240,1300,240);
    
//    fill(125, 155, 209);
//    stroke(0);
//    noStroke();
//    rect(250,400,1300,400);
    
    fill(235);
    stroke(16, 40, 148);
    textSize(30);
    textAlign(CENTER,TOP);
    
    if (mouseX > 299 && mouseX <= 600 && mouseY > 499 && mouseY <= 800) {
        strokeWeight(8);
    }
    else {
        strokeWeight(2);
    }
    rect(300,500,300,300);
    image(display1,302,502);
    
    if (mouseX > 749 && mouseX <= 1050 && mouseY > 499 && mouseY <= 800) {
        strokeWeight(8);
    }
    else {
        strokeWeight(2);
    }
    rect(750,500,300,300);
    image(display2,752,502);
    
    if (mouseX > 1199 && mouseX <= 1500 && mouseY > 499 && mouseY <= 800) {
        strokeWeight(8);
    }
    else {
        strokeWeight(2);
    }
    rect(1200,500,300,300);
    image(display3,1202,502);
    
    noStroke();
    fill(26);
    textFont(font1);
    text('1. Lambda Expressions',440,468);
    text('2. Alpha-Conversion',890,468);
    text('3. Beta-Reduction',1340,468);
    
}

function drawMenu1() {
    tint(255);
//    fill(255,0,0);
//    rect(25,25,110,85);
    
    textSize(84);
    textAlign(CENTER,TOP);
    fill(0);
    noStroke();
    textFont(font1);
    
    text('Lambda Expressions',890,50);
    textFont(font3);
    textSize(24);
    text('This topic is about understanding the definition and structure of lambda expressions.',900,150);
    textSize(52);
    textFont(font1);
    text('Tutorials',890,230);
    text('Level Selection',890,525);
    textFont(font3);
    textSize(18);
    text('Easy',530,590);
    text('Medium',900,590);
    text('Hard',1215,590);
    
    for (i = 0; i < level1ButtonList.length; i++) {
        level1ButtonList[i].draw();
    }
    
    tutorialButton1.draw();
    tutorialButton2.draw();
    tutorialButton3.draw();
    tutorialButton4.draw();
    
    drawHelp();
    image(back,25,25);
}

function loadHelp(num) {
    helpToggle = num;
    backButton = new Clickable(10,10);
    backButton.text = 'Back to Menu';
    backButton.resize(250,60);
    backButton.textSize = 32;
    backButton.color = '#faff96';
    backButton.onPress = function() {
        helpToggle = '';
    }
}

function drawHelp() {
    if (helpToggle != '') {
        image(helpImage[helpToggle[0]][helpToggle[1]],0,0);
    }
}

function drawMenu2() {
    tint(255);
//    fill(255,0,0);
//    rect(25,25,100,100);
    image(back,25,25);
    
    textSize(84);
    textAlign(CENTER,TOP);
    fill(0);
    noStroke();
    textFont(font1);
    
    text('Alpha-Conversion',890,50);
    textSize(24);
    textFont(font3);
    text('This topic is about understanding how alpha-conversion works by identifying and renaming bound variables.',900,150);
    textSize(52);
    textFont(font1);
    text('Tutorials',890,230);
    text('Level Selection',890,525);
    textSize(18);
    textFont(font3);
    text('Easy',530,590);
    text('Medium',900,590);
    text('Hard',1215,590);
    
    for (i = 0; i < level2ButtonList.length; i++) {
        level2ButtonList[i].draw();
    }
    
    tutorialButton1.draw();
    tutorialButton2.draw();
    
    drawHelp();
    image(back,25,25);
}

function drawMenu3() {
    tint(255);
//    fill(255,0,0);
//    rect(25,25,100,100);
    image(back,25,25);
    
    textSize(84);
    textAlign(CENTER,TOP);
    fill(0);
    noStroke();
    textFont(font1);
    
    text('Beta-Reduction',890,50);
    textSize(24);
    textFont(font3);
    text('This topic is about understanding how beta-reduction works by reducing expressions into normal form.',900,150);
    textSize(52);
    textFont(font1);
    text('Tutorials',890,230);
    text('Level Selection',890,525);
    textSize(18);
    textFont(font3);
    text('Easy',530,590);
    text('Medium',900,590);
    text('Hard',1215,590);
    
    for (i = 0; i < level3ButtonList.length; i++) {
        level3ButtonList[i].draw();
    }
    
    tutorialButton1.draw();
    tutorialButton2.draw();
    tutorialButton3.draw();
    
    drawHelp();
    image(back,25,25);
}

function drawLevel1() {
    
    drawUI();
        
    drawLines3();
    drawNodes();
    drawDefaultIcons();
    
    fill(200);
    
    image(binpic,bin[0]+3,bin[1]);
    
    drawTilesNew();
    
    if (toggleHelp) {
        drawHelp1();
    }
    else if (currentLevel == 3) {
        fill(255);
        stroke(100);
        strokeWeight(2);
        rect(80,250,366,58);
        
        textAlign(LEFT,BOTTOM);
        textSize(22);
        fill(0);
        noStroke();
        text("Not all tiles may need to be filled!",100,290);
    }

    image(questionImage,487,95);
    
    if (locked == false && selectedTile > -1) {
        cursor('Grabbing');
    }
    else if (locked == false && selectedTile == -1) {
        cursor('Grab');
    }
    else {
        cursor('Default');
    }
}

function drawHelp1() {
    
    fill(255);
    stroke(100);
    strokeWeight(2);
    rect(380,750,489,58);
    rect(1080,760,332,58);
    rect(80,250,366,58);
    
    noStroke();
    fill(0);
    textSize(22);
    textAlign(LEFT,BOTTOM);
    text('Drag these tiles onto the nodes within the tree',400,790);
    text("The '@' icon represents Apply",1100,800);
    text("Not all tiles may need to be filled!",100,290);
    
}

function drawLevel2() {
    
    for (i = 0; i < wrongList.length; i++) {
        
        if (phase == 1) {
            fill(0,255,0);
            noStroke();
            rect(tileList[wrongList[i]].pos.x-5,tileList[wrongList[i]].pos.y-5,50,50);
        }
        else if (phase == 2) {
            fill(wrongColour);
            noStroke();
            rect(tileList[wrongList[i]].pos.x-5,tileList[wrongList[i]].pos.y-5,50,50);
        }
    }
    
    drawLines3();
    drawTilesNew();

    drawUI();
    image(questionImage,487,-14);        

    if (phase == 1 || phase == 4) {
        drawColourBoxes();
        drawFillColour();
        if (toggleHelp) {
            drawHelp2a();
        }
    }
    else if (phase == 2) {
        for (i = 0; i < renamingButton.length; i++) {
            renamingButton[i].draw();
        }
        if (toggleHelp) {
            drawHelp2b();
        }
    }
}

function drawHelp2a() {
    fill(255);
    stroke(100);
    strokeWeight(2);
    rect(642,750,514,58);
    rect(250,320,530,58);
    
    noStroke();
    fill(0);
    textSize(22);
    textAlign(LEFT,BOTTOM);
    text('Click a colour box to change the cursor fill colour',662,790);
    text("Click a variable within the tree to change its colour",270,360);
}

function drawHelp2b() {
    fill(255);
    stroke(100);
    strokeWeight(2);
    rect(622,750,550,58);
    rect(200,370,750,58);
    
    noStroke();
    fill(0);
    textSize(22);
    textAlign(LEFT,BOTTOM);
    text('Click a variable box to change the renaming variable',642,790);
    text("Click a bound variable within the tree to rename it to the selected variable",220,410);
}

function drawLevel3() {
    
    fill(redexColour);
    noStroke();
    rect(redexDim[1],redexDim[2],redexDim[3]-redexDim[1],redexDim[4]-redexDim[2]);
    
    if (fadeOutAnimate) {
        var tree = getTree(nodeList[redexDim[0]].occupied); //get all tile indexes below the root
        for (j = 0; j < tree.length; j++) {
            i = tree[j]; 
            if (i > -1 && opacity <= 15) {
                tileClickableList[i].stroke = '#0000000' + opacity.toString(16);
                tileClickableList[i].textColor = '#0000000' + opacity.toString(16);
                if (tileClickableList[i].color == 200) {
                    tileClickableList[i].color = '#C8C8C80';
                }
                tileClickableList[i].color = tileClickableList[i].color.substring(0,7) + '0' + opacity.toString(16);
            }
            else if (i > -1) {
                tileClickableList[i].stroke = '#000000' + opacity.toString(16);
                tileClickableList[i].textColor = '#000000' + opacity.toString(16);
                if (tileClickableList[i].color == 200) {
                    tileClickableList[i].color = '#C8C8C8';
                }
                tileClickableList[i].color = tileClickableList[i].color.substring(0,7) + opacity.toString(16);
            }
        }
        opacity -= 5;
        if (opacity == -5) {
            fadeOutAnimate = false;
            deleteTree(nodeList[redexDim[0]].occupied);
            setMovingDestination(redexDim[0]);
            moveTreeAnimate = true;
            percentage = 0;
            opacity = 255;
        }
    }
    else if (moveTreeAnimate) {
        var j = 0;
        var destinationCoord;
        for (i = 0; i < movingTreeTileList.length; i++) {
            if (movingTreeTileList[i].assignment > -1) {
                destinationCoord = destinationList[j];
                movingTreeClickableList[j].x += (destinationCoord.x - nodeList[movingTreeTileList[i].assignment].pos.x)/100
                movingTreeClickableList[j].y += (destinationCoord.y - nodeList[movingTreeTileList[i].assignment].pos.y)/100
                j += 1;
            }
        }
        percentage += 1
        if (percentage == 101) {
            firstTime = false;
            moveTreeAnimate = false;
            overwrite(redexDim[0]);
            redexDim = [-1,-1,-1,-1,-1];
//            for (i = 0; i < tileCount; i++) {
//                tileClickableList[i].color = '#FFFFFF';
//            }
            phase = 1;
            locked = false;
//            undoButton.color = 255;
            loadContinueDisplay();
        }
    }
    
    for (i = 0; i < wrongList.length; i++) {
        fill('#FF0000');
        noStroke();
        rect(tileClickableList[nodeList[wrongList[i]].occupied].x-5,tileClickableList[nodeList[wrongList[i]].occupied].y-5,50,50);
    }
    
    drawLines3();
    drawTilesNew();
    
    if (redexDim[0] > -1 && (phase == 2 || phase == 13 || phase == 14)) {
        var topOfDraggable = nodeList[redexDim[0]].right;
        stroke(250,0,0);
        strokeWeight(2);
        line(getLeftMost(topOfDraggable),nodeList[topOfDraggable].pos.y-10,getRightMost(topOfDraggable),nodeList[topOfDraggable].pos.y-10);
        line(getLeftMost(topOfDraggable),nodeList[topOfDraggable].pos.y-10,getLeftMost(topOfDraggable),getLowest(topOfDraggable));
        line(getRightMost(topOfDraggable),nodeList[topOfDraggable].pos.y-10,getRightMost(topOfDraggable),getLowest(topOfDraggable));
        line(getLeftMost(topOfDraggable),getLowest(topOfDraggable),getRightMost(topOfDraggable),getLowest(topOfDraggable));
    }
    
    drawMovingLines();
    drawMovingTree();

    drawUI();
    image(questionImage,487,-14);
    drawToolButtons();
//    if (toggleHelp) {
//        if (phase == 1) {
//            drawHelp3a();
//        }
//        else if (phase == 2) {
//            drawHelp3b();
//        }
//    }
    if (phase == 13 && locked == false){
        if (selectedTile > -1) {
            cursor('Grabbing');
        }
        else {
            cursor('Grab');
        }
    }
    else if (phase == 14 && locked == false && tool == 2) {
        if (selectedTile > -1) {
            cursor('Grabbing');
        }
        else {
            cursor('Grab');
        }
    }
    else if (phase == 14 && locked == false && tool == 5) {
        cursor('Hand');
    }
    else {
        cursor('Default');
    }
    
}

function drawHelp3a() {
    fill(255);
    stroke(100);
    strokeWeight(2);
    rect(1060,670,570,58);
    rect(220,250,453,58);
    rect(110,710,880,58);
    
    line(1170+630/2,670+58,1680,815);
    line(390+880/2,710+58,900,815);
    
    noStroke();
    fill(0);
    textSize(22);
    textAlign(LEFT,BOTTOM);
    text('Click this button when the expression is in normal form',1080,710);
    text('Select a node within the tree to highlight it',240,290);
    text('When a redex has been selected, click this button to enter the beta-reduction process',130,750);
}

function drawHelp3b() {
    fill(255);
    stroke(100);
    strokeWeight(2);
    rect(910,610,820,58);
    rect(130,250,512,104);
//    rect(530,750,470,58);
    if (currentDiff != 'Easy') {
        rect(1073,730,378,83);
    }
    rect(51,730,336,83);
    
    line(910+540,610+58,1680,815);
    
    noStroke();
    fill(0);
    textSize(22);
    textAlign(LEFT,BOTTOM);
    text('Click this button to finish the reduction once you have performed all substitutions',930,650);
    text('The red box is highlighting the moveable tree,',161,290);
    text('click and drag the root of this tree to substitute it',150,315);
    text('into other variables',300,340);
//    text('This button toggles the move tool on and off',550,790);
    if (currentDiff != 'Easy') {
        text('Click a variable box to toggle and',1100,770);
        text('change the renaming variable tool',1093,795);
    }
    text('Click a colour box to toggle',80,770);
    text('and change the colour fill tool',71,795);
}

//========================================================================================================
//                                    START UP
//========================================================================================================

function extractLevel(lvl) {
    questionImage = loadImage(lvl.displayImage);
    setTree = lvl.setTree;
    solution = lvl.solution;
    currentDiff = lvl.difficulty;
    if (state == 'Level-1') {
        labels = lvl.tool;
    }
    else {
        variables = lvl.tool;
//        alert(variables);
    }
}

function loadLevelButtons() {
    level1ButtonList = new Array(levelList[0].length);
    for (i = 0; i < 6; i++) {
        levelList[0][i].difficulty = 'Easy';
        if (i < 3) {
            level1ButtonList[i] = new Clickable(370+ i*110,615);
        }
        else {
            level1ButtonList[i] = new Clickable(370+ (i-3)*110,675);
        }
        level1ButtonList[i].text = (i+1).toString();
        level1ButtonList[i].onPress = function() {
            if (state == 'Menu-1' && helpToggle == '') {
                state = 'Level-1';
                currentLevel = parseInt(this.text)-1;
                extractLevel(levelList[0][parseInt(this.text)-1]);
                loadLevel();
            }
        }
        level1ButtonList[i].color = '#b0ffab';
        level1ButtonList[i].textSize = 24;
    }
    for (i = 6; i < 12; i++) {
        levelList[0][i].difficulty = 'Medium';
        if (i < 9) {
            level1ButtonList[i] = new Clickable(740+ (i-6)*110,615);
        }
        else {
            level1ButtonList[i] = new Clickable(740+ (i-9)*110,675);
        }
        level1ButtonList[i].text = (i+1).toString();
        level1ButtonList[i].onPress = function() {
            if (state == 'Menu-1' && helpToggle == '') {
                state = 'Level-1';
                currentLevel = parseInt(this.text)-1;
                extractLevel(levelList[0][parseInt(this.text)-1]);
                loadLevel();
            }
        }
        level1ButtonList[i].color = '#ffe0a1';
        level1ButtonList[i].textSize = 24;
    }
    for (i = 12; i < 16; i++) {
        levelList[0][i].difficulty = 'Hard';
        if (i < 14) {
            level1ButtonList[i] = new Clickable(1110+ (i-12)*110,615);
        }
        else {
            level1ButtonList[i] = new Clickable(1110+ (i-14)*110,675);
        }
        level1ButtonList[i].text = (i+1).toString();
        level1ButtonList[i].onPress = function() {
            if (state == 'Menu-1' && helpToggle == '') {
                state = 'Level-1';
                currentLevel = parseInt(this.text)-1;
                extractLevel(levelList[0][parseInt(this.text)-1]);
                loadLevel();
            }
        }
        level1ButtonList[i].color = '#fca4a4';
        level1ButtonList[i].textSize = 24;
    }
    
    level2ButtonList = new Array(levelList[1].length);
    
    for (i = 0; i < 6; i++) {
        levelList[1][i].difficulty = 'Easy';
        if (i < 3) {
            level2ButtonList[i] = new Clickable(370+ i*110,615);
        }
        else {
            level2ButtonList[i] = new Clickable(370+ (i-3)*110,675);
        }
        level2ButtonList[i].text = (i+1).toString();
        level2ButtonList[i].onPress = function() {
            if (state == 'Menu-2' && helpToggle == '') {
                state = 'Level-2';
                currentLevel = parseInt(this.text)-1;
                extractLevel(levelList[1][parseInt(this.text)-1]);
                loadLevel();
            }

        }
        level2ButtonList[i].color = '#b0ffab';
        level2ButtonList[i].textSize = 24;
    }
    for (i = 6; i < 12; i++) {
        levelList[1][i].difficulty = 'Medium';
        if (i < 9) {
            level2ButtonList[i] = new Clickable(740+ (i-6)*110,615);
        }
        else {
            level2ButtonList[i] = new Clickable(740+ (i-9)*110,675);
        }
        level2ButtonList[i].text = (i+1).toString();
        level2ButtonList[i].onPress = function() {
            if (state == 'Menu-2' && helpToggle == '') {
                state = 'Level-2';
                currentLevel = parseInt(this.text)-1;
                extractLevel(levelList[1][parseInt(this.text)-1]);
                loadLevel();
            }
        }
        level2ButtonList[i].color = '#ffe0a1';
        level2ButtonList[i].textSize = 24;
    }
    for (i = 12; i < 16; i++) {
        levelList[1][i].difficulty = 'Hard';
        if (i < 14) {
            level2ButtonList[i] = new Clickable(1110+ (i-12)*110,615);
        }
        else {
            level2ButtonList[i] = new Clickable(1110+ (i-14)*110,675);
        }
        level2ButtonList[i].text = (i+1).toString();
        level2ButtonList[i].onPress = function() {
            if (state == 'Menu-2' && helpToggle == '') {
                state = 'Level-2';
                currentLevel = parseInt(this.text)-1;
                extractLevel(levelList[1][parseInt(this.text)-1]);
                loadLevel();
            }
        }
        level2ButtonList[i].color = '#fca4a4';
        level2ButtonList[i].textSize = 24;
    }
    
    level3ButtonList = new Array(levelList[2].length);
    
    for (i = 0; i < 6; i++) {
        levelList[2][i].difficulty = 'Easy';
        if (i < 3) {
            level3ButtonList[i] = new Clickable(370+ i*110,615);
        }
        else {
            level3ButtonList[i] = new Clickable(370+ (i-3)*110,675);
        }
        level3ButtonList[i].text = (i+1).toString();
        level3ButtonList[i].onPress = function() {
            if (state == 'Menu-3' && helpToggle == '') {
                state = 'Level-3';
                currentLevel = parseInt(this.text)-1;
                extractLevel(levelList[2][parseInt(this.text)-1]);
                loadLevel();
            }

        }
        level3ButtonList[i].color = '#b0ffab';
        level3ButtonList[i].textSize = 24;
    }
    for (i = 6; i < 12; i++) {
        levelList[2][i].difficulty = 'Medium';
        if (i < 9) {
            level3ButtonList[i] = new Clickable(740+ (i-6)*110,615);
        }
        else {
            level3ButtonList[i] = new Clickable(740+ (i-9)*110,675);
        }
        level3ButtonList[i].text = (i+1).toString();
        level3ButtonList[i].onPress = function() {
            if (state == 'Menu-3' && helpToggle == '') {
                state = 'Level-3';
                currentLevel = parseInt(this.text)-1;
                extractLevel(levelList[2][parseInt(this.text)-1]);
                loadLevel();
            }
        }
        level3ButtonList[i].color = '#ffe0a1';
        level3ButtonList[i].textSize = 24;
    }
    for (i = 12; i < 16; i++) {
        levelList[2][i].difficulty = 'Hard';
        if (i < 14) {
            level3ButtonList[i] = new Clickable(1110+ (i-12)*110,615);
        }
        else {
            level3ButtonList[i] = new Clickable(1110+ (i-14)*110,675);
        }
        level3ButtonList[i].text = (i+1).toString();
        level3ButtonList[i].onPress = function() {
            if (state == 'Menu-3' && helpToggle == '') {
                state = 'Level-3';
                currentLevel = parseInt(this.text)-1;
                extractLevel(levelList[2][parseInt(this.text)-1]);
                loadLevel();
            }
        }
        level3ButtonList[i].color = '#fca4a4';
        level3ButtonList[i].textSize = 24;
    }
}

function loadLevel() {
    locked = false;
    toggleHelp = false;
    correctTiles = 0;
    opacity = 255;
    selectedTile = -1;
    
    if (state == 'Level-1') {
        depth = getLog(2,solution.length+1);
    }
    else if (state == 'Level-2') {
        wrongList = new Array();
        depth = getLog(2,setTree.length+1);
        phase = 1;
    }
    else if (state == 'Level-3') {
        wrongList = new Array();
        depth = getLog(2,setTree.length+1);
//        phase = 1;
        phase = 12;
        redexDim = [-1,-1,-1,-1,-1];
        disabled = false;
        fadeOutAnimate = false;
        moveTreeAnimate = false;
        firstTime = true;
    }
    
    loadTree();
    loadUIButtons();
}

function loadTree() {
    loadNodes();
    if (state == 'Level-1') {
        loadTiles();
    }
    else if (state == 'Level-2' || state == 'Level-3') {
        loadTiles2();
    }
}

function loadUIButtons() {
    if (state == 'Level-1') {
        loadHintButton();
    }
    loadHomeButton();
    loadCheckButtonNew();
    loadResetButton();
    loadRedoButton();
    loadUndoButton();
    loadContinueButton();
    loadHelpButton();
    displayBox = false;
    
    
    if (state == 'Level-1') {
        bin = [1705,705];
    }
    else if (state == 'Level-2') {
        loadColourBoxes();
        
        loadLevel2RenameButtons();
    }
    else if (state == 'Level-3') {
        loadToolButtons();
    }
}

function loadHintButton() {
    revealFlag = false
    hintButton = new Clickable(1040,10);
    hintButton.textSize = 20;
    hintButton.resize(220,60);
    hintButton.text = 'Show Correct Layout';
    hintButton.onPress = function() {
        if (locked == false) {
            if (revealFlag) {
                saveState();
                this.text = 'Show Correct Layout';
                this.color = '#FFFFFF';
                revealFlag = false;
                for (i = 0; i < nodeList.length; i++) {
                    if (nodeList[i].occupied == -2) {
                        nodeList[i].occupied = -1;
                    }
                }
            }
            else {
                saveState();
                this.text = 'Hide Correct Layout';
                this.color = '#faff96';
                revealFlag = true;
                for (i = 0; i < solution.length; i++) {
                    if (solution[i] == 'n') {
                        if (nodeList[i].occupied > -1) {
                            for (j = (nodeList[i].occupied)+1; j < tileCount; j++) {
                                nodeList[tileList[j].assignment].occupied -= 1;
                            }
                            tileList.splice(nodeList[i].occupied,1)
                            tileClickableList.splice(nodeList[i].occupied,1);
                            tileCount -= 1;
                        }
                        nodeList[i].occupied = -2;
                    }
                }
            }
        }
    }
    revealButton = new Clickable(1480,230);
    revealButton.textSize = 20;
    revealButton.text = 'Hint';
    revealButton.onPress = function() {
        temp = checkReveal();
        saveState();
        counter = 0;
        for (i = 0; i < revealList[currentLevel][temp].length; i++) {
            j = revealList[currentLevel][temp][i];
            if (nodeList[j].occupied > -1) {
                //delete existing and then add new correct tile
                if (tileClickableList[nodeList[j].occupied].color == '#FFFFFF') {
                    counter += 1;
                    tileList[nodeList[j].occupied].label = solution[j];
                    if (solution[j] == '\\') {
                        tileClickableList[nodeList[j].occupied].text = '';
                    }
                    else {
                        tileClickableList[nodeList[j].occupied].text = solution[j];
                    }
                    tileClickableList[nodeList[j].occupied].color = '#bcffb0';
                }
            }
            else {
                //add new correct tile on node
                counter += 1;
                tileClickableList.push(createNewTileClickable(nodeList[j].pos.x,nodeList[j].pos.y,solution[j]));
                tileClickableList[tileClickableList.length-1].color = '#bcffb0';
                tileCount+= 1;
                tileList.push(new tile(nodeList[j].pos.x,nodeList[j].pos.y,solution[j],j,-1,-1));
                nodeList[j].occupied = tileCount - 1;
            }
        }
        correctTiles += counter;
        if (counter == 1) {
            loadWrongDisplay(1337);
        }
        else {
            loadWrongDisplay(1338);
        }
    }
}

function loadHelpButton() {
    helpButton = new Clickable(1610,10);
    helpButton.text = '?';
    helpButton.textSize = 40;
    helpButton.resize(60,60);
    helpButton.onPress = function() {
        if (toggleHelp) {
            toggleHelp = false;
            this.color = '#FFFFFF';
        }
        else {
            toggleHelp = true;
            this.color = '#faff96';
        }
    }
}

function loadLevel2RenameButtons() {
//    variables = ['F','G','H','W','V','X','Y','Z'];
    renamingButton = new Array(variables.length);
    for (i = 0; i < renamingButton.length; i++) {
        renamingButton[i] = createNewTileClickable((920 - 40 * variables.length)+i*80,830,variables[i]);
        renamingButton[i].onPress = function() {
            renameVal = this.text;
            this.color = 200;
            for (j = 0; j < renamingButton.length; j++) {
                if (renamingButton[j].text != this.text) {
                    renamingButton[j].color = 250;
                }
            }
        }
    }
    renamingButton[0].color = 200;
    renameVal = renamingButton[0].text;
}

//========================================================================================================
//                                          UI
//========================================================================================================

var firstTime

function drawUI() {
    fill (topColour);
    noStroke();
    rect(0,800,1800,100);
    rect(0,0,1800,80);

    stroke(0);
    strokeWeight(2);
    line(0,80,1800,80);
    line(1800,800,0,800);

    drawText();
    drawMessageBox();
    drawUIButtons();
        
}

function drawText() {
    fill(0);
    noStroke();
    textSize(18);
    textAlign(LEFT,CENTER);
    if (state == 'Level-1') {
        text('Lambda Expressions',80,20);
        textSize(30);
        textFont(font1);
        text('Objective:',22,105);
        textFont(font3);
        textSize(22);
        if (setTree.length > 0) {
            text('Finish building the following lambda expression',20,140);
        }
        else {
            text('Build the following lambda expression',20,140);
        }
        
        strokeWeight(1);
        stroke(0);
        line(20,118,139,118);
        if (locked) {
            if (setTree.length > 0) {
                line(20,140,480,140);
            }
            else {
                line(20,140,390,140);
            }
        }
    }
    else if (state == 'Level-2') {
        text('Alpha-Conversion',80,20);
        textSize(30);
        textFont(font1);
        text('Objectives:',22,105);
        textFont(font3);
        textSize(22);
        text('1. Highlight each binding variable and its bound variables in a unique colour',20,140);
        text('2. Highlight free variables in white',20,170);
        if (phase == 2) {
            text('3. Rename each coloured group of bound variables',20,200);
            text('    such that each uses a unique variable',20,225);
        }
        
        strokeWeight(1);
        stroke(0);
        line(20,118,150,118);
        if (phase >= 2) {
            line(20,140,758,140);
            line(20,170,351,170);
            if (locked && phase != 4) {
                line(20,200,522,200);
                line(41,225,416,225);
            }
        }
        noStroke();
        
    }
    else if (state == 'Level-3') {
        text('Beta-Reduction',80,20);
        textSize(30);
        textFont(font1);
        text('Objectives:',22,105);
        textFont(font3);

        textSize(22);
        if (phase == 1) {
            text('- Reduce the expression to normal form by',20,140);
            text('  selecting and reducing redexes within the tree',20,165);
        }
        else if (phase == 12) {
            text('- Colour each group of bound variables in a unique colour',20,140);
            text('- Colour free variables white',20,165);
        }
        else if (phase == 13 || (phase == 3 && currentLevel < 6)) {
            text('- Reduce the selected redex',20,140)
        }
        else if (phase == 14 || (phase == 3 && currentLevel > 5)) {
            text('- Reduce the selected redex',20,140);
            text('- Alpha-convert bound variables to avoid variable capture',20,165);
            
        }
        
        strokeWeight(1);
        stroke(0);
        line(20,118,150,118);

        
        fill(0);
        noStroke();
        textSize(28);
        textAlign(CENTER,CENTER);
        if (phase == 12) {
            text('Click a variable to colour it',900,780);
        }
        else if (phase == 13) {
            text('Drag the highlighted area',900,780);
        }
        else if (phase == 14) {
            if (tool == 2) {
                text('Drag the highlighted area',900,780);
            }
            else if (tool == 5) {
//                text('Renaming to Variable ' + renameVal,900,780);
                text('Click a Bound Variable to Rename to ' + renameVal,900,780);
            }
        }
        else if (phase == 0 || phase == 1) {
            text('Select a Redex to Reduce',900,780);
        }
        
    }
    textAlign(LEFT,CENTER);
    textSize(18);
    noStroke(0);
    text('Level:',80,40);
    text(currentLevel+1,130,40);
    text('Difficulty:',80,60);
    text(currentDiff,156,60);
}

function drawMessageBox() {
    if (displayBox) {
        strokeWeight(2);
        stroke(0);
        fill(255);
        if (displayText == 'Correct!') {
            if (displaySubText == 'Now you must rename each coloured group of') {
                rect(1280,100,500,135);
                closeDisplay.draw();
            }
            else {
                rect(1280,100,500,130);             
            }
        }
        else if (state == 'Level-2' || state == 'Level-3') {
            rect(1280,100,500,135);
            if (displayText == 'Note') {
                closeDisplay.draw();
            }
        }
        else {
            if (displaySubText2 == 'Would you like help?') {
                rect(1280,100,500,200);
                revealButton.draw();
            }
            else {
                rect(1280,100,500,120);            
            }
        }

        fill(0);
        noStroke();
        textAlign(CENTER,CENTER);
        textSize(36);
        if (displayText != 'Help') {
            text(displayText,1530,140);
        }
        if (displaySubText == 'Now you must rename each coloured group of') {
            textSize(20);
        }
        else if (displaySubText == 'You have a name clash between a bound variable and') {
            textSize(18);
        }
        else {
            textSize(22);    
        }
        if (displayText == 'Help') {
            text(displaySubText,1530,145);
            text(displaySubText2,1530,173); 
        }
        else {
            text(displaySubText,1530,175);
            if (displaySubText2 == 'Would you like help?') {
                text(displaySubText2,1530,208);
            }
            else {
                text(displaySubText2,1530,203);       
            }     
        }
        if (displayText == 'Not Quite!' || displayText == 'Error' || displayText == 'Help') {
            closeDisplay.draw();
        }
        if (displayText == 'Good Job!') {
            closeDisplay.draw();
        }
    }
}

function drawUIButtons() {
//    homeButton.draw();
    resetButton.draw();
    redoButton.draw();
    undoButton.draw();
    if (state == 'Level-1' || state == 'Level-2') {
        helpButton.draw();
    }
    if (state == 'Level-1' && currentLevel > 2) {
        hintButton.draw();
    }
    tint(255);
    image(homepic,10,10);
    if (state != 'Level-3' || (phase == 1 && firstTime == false && redexDim[0] == -1)) {
        checkButton.draw();
    }
//    if (tileHistory.length > 1 && locked == false) {
//        undoButton.color = 250;
//    }
//    else {
//        undoButton.color = 150;
//    }
//    if (tileRedo.length > 0) {
//        redoButton.color = 250;
//    }
//    else {
//        redoButton.color = 150;
//    }
    if (locked && phase != 3 && phase != 14 && phase != 13) {
        continueButton.draw();
    }
}

function drawFillColour() {
    stroke(0);
    fill(cursorColour);
    ellipse(mouseX,mouseY,15);
}

var validDrop;

function assignValidDrop(i) {
    if (tileList[nodeList[i].occupied].label != '\\' && tileList[nodeList[i].occupied].label != '@') {
        validDrop.push(i);
    }
    if (nodeList[i].left > -1) {
        if (nodeList[nodeList[i].left].occupied > -1) {
            assignValidDrop(nodeList[i].left);
        }
        if (nodeList[nodeList[i].right].occupied > -1) {
            assignValidDrop(nodeList[i].right);
        }
    }
}

function loadReduceButton() {
    reduceButton = new Clickable (1580,815);
    reduceButton.text = 'Reduce Redex';
    reduceButton.textSize = 24;
    reduceButton.resize(200,70);
    reduceButton.onPress = function() {
        if (redexDim[0] > -1 && locked == false) {
            if (checkRedex(redexDim[0])) {
                saveState();
                if (currentLevel < 6) {
                    phase = 13;
                }
                else {
                    phase = 14;
                }
                tool = 2;
                copyButton.color = 200;
                for (i = 0; i < renamingButton.length; i++) {
                    renamingButton[i].color = '#FFFFFF';
                }
                validDrop = new Array();

                assignBound();
                bindingColour = tileClickableList[nodeList[nodeList[nodeList[redexDim[0]].left].left].occupied].color;
                for (i = 0 ; i < bound.length; i++) {
                    for (j = 0; j < bound[i].length; j++) {
                        if (tileClickableList[nodeList[bound[i][j]].occupied].color == bindingColour) {
                            validDrop.push(bound[i][j]);
                        }
                    }
                }
//                tileClickableList[nodeList[redexDim[0]].occupied].color = 200;
//                tileClickableList[nodeList[nodeList[redexDim[0]].left].occupied].color = 200;
                helpButton.color = '#FFFFFF';
                toggleHelp = false;
                
                loadContinueDisplay();
                
            }
            else {
                loadWrongDisplay(1);
            }
        }
        else if (locked == false) {
            loadWrongDisplay(2);
        }
    }
}

function loadFinishButton() {
    finishButton = new Clickable(1580,815);
    finishButton.text = 'Done';
    finishButton.textSize = 24;
    finishButton.resize(200,70);
    finishButton.onPress = function() {
        if (phase == 2) {
            saveState();
            phase = 3;
            tool = 2;
            assignMovingTree(nodeList[nodeList[redexDim[0]].left].right);
            fadeOutAnimate = true;
            locked = true;
//            opacity = 255;
            displayBox = false;
            toggleHelp = false;
            helpButton.color = '#FFFFFF';
//            undoButton.color = 150;
//            redoButton.color = 150;
        }
        else if (phase == 12) {
            if (checkColours()) {
                phase = 1;
                tool = 0;
            }
            else {
                loadWrongDisplay();
            }
            
        }
        else if (phase == 13) {
            wrongList = new Array();
            if (checkMovements()) {
                saveState();
                if (currentLevel < 6) {
                    saveState();
                    assignMovingTree(nodeList[nodeList[redexDim[0]].left].right);
                    fadeOutAnimate = true;
                    locked = true;
        //            opacity = 255;
                    displayBox = false;
                    toggleHelp = false;
                    helpButton.color = '#FFFFFF';
        //            undoButton.color = 150;
        //            redoButton.color = 150;
                    phase = 3;
                    tool = 0;
                }
            }
            else {
                loadWrongDisplay(100);
            }
        }
        else if (phase == 14) {
            wrongList = new Array();
            if (checkMovements()) {
                if (checkCapture()) {
                    saveState();
                    assignMovingTree(nodeList[nodeList[redexDim[0]].left].right);
                    fadeOutAnimate = true;
                    locked = true;
        //            opacity = 255;
                    displayBox = false;
                    toggleHelp = false;
                    helpButton.color = '#FFFFFF';
        //            undoButton.color = 150;
        //            redoButton.color = 150;
                    phase = 3;
                    tool = 0;
                }
                else {
                    loadWrongDisplay(110);
                }
            }
            else {
                loadWrongDisplay(100);
            }
        }
    }
}

function checkCapture() {
    flag = true;
    searchBody3(0);
    return flag;
}

function searchBody3(i) {
    if (i == redexDim[0]) {
        searchBody3(nodeList[nodeList[i].left].right);
    }
    else if (tileList[nodeList[i].occupied].label == '\\') {
        temp2 = true;
        searchBody2(tileList[nodeList[nodeList[i].left].occupied].label,nodeList[i].right);
        if (temp2 == false) {
            for (j = 0; j < tileCount; j++) {
                if (tileClickableList[j].color == tileClickableList[nodeList[nodeList[i].left].occupied].color) {
                    wrongList.push(tileList[j].assignment);
                }
            }
        }
    }
    else if (tileList[nodeList[i].occupied].label == '@') {
        searchBody3(nodeList[i].left);
        searchBody3(nodeList[i].right);
    }
}

function searchBody2(x,i) {
    if (tileList[nodeList[i].occupied].label == x) {
        if (tileClickableList[nodeList[i].occupied].color == '#FFFFFF') {
            flag = false;
            temp2 = false;
        }
    }
    else if (tileList[nodeList[i].occupied].label == '\\') {
        if (tileClickableList[nodeList[nodeList[i].left].occupied].color == bindingColour) {
            searchBody2(x,nodeList[i].right);
        }
        else if (tileList[nodeList[nodeList[i].left].occupied].label != x) {
            searchBody2(x,nodeList[i].right);
        } 
    }
    else {
        if (nodeList[i].left > -1) {
            if (nodeList[nodeList[i].left].occupied > -1) {
                searchBody2(x,nodeList[i].left);
            }
            if (nodeList[nodeList[i].right].occupied > -1) {
                searchBody2(x,nodeList[i].right);
            }
        }
    }
}

function checkMovements() {
    flag = true;
    for (i = 0; i < validDrop.length; i++) {
        if (tileClickableList[nodeList[validDrop[i]].occupied].color != '#FFFFFF') {
            flag = false;
            wrongList.push(validDrop[i]);
        }
    }
    
    
    return flag;
}

function assignBound() {
    search = getTree(nodeList[0].occupied);
    
    binding = new Array();
    bound = new Array();
    free = new Array();
    
    for (i = 0; i < search.length; i++) {
        if (tileList[search[i]].label == '\\') {
            binding.push(nodeList[nodeList[tileList[search[i]].assignment].left].occupied);
            bound.push([]);
            searchBody(tileList[binding[binding.length-1]].label,nodeList[tileList[search[i]].assignment].right);
        }
    }
    for (i = 0; i < search.length; i++) {
        if (tileList[search[i]].label != '\\' && tileList[search[i]].label != '@') {
            temp = false;
            if (binding.includes(search[i])) {
                temp = true;
            }
            else {
                for (j = 0; j < binding.length; j++) {
                    if (bound[j].includes(tileList[search[i]].assignment)) {
                        temp = true;
                    }
                }                
            }
            if (temp == false) {
                free.push(search[i]);
            }
        }
    }
}

function checkColours() {
    
    search = getTree(nodeList[0].occupied);
    
    binding = new Array();
    bound = new Array();
    free = new Array();
    
    for (i = 0; i < search.length; i++) {
        if (tileList[search[i]].label == '\\') {
            binding.push(nodeList[nodeList[tileList[search[i]].assignment].left].occupied);
            bound.push([]);
            searchBody(tileList[binding[binding.length-1]].label,nodeList[tileList[search[i]].assignment].right);
        }
    }
    for (i = 0; i < search.length; i++) {
        if (tileList[search[i]].label != '\\' && tileList[search[i]].label != '@') {
            temp = false;
            if (binding.includes(search[i])) {
                temp = true;
            }
            else {
                for (j = 0; j < binding.length; j++) {
                    if (bound[j].includes(tileList[search[i]].assignment)) {
                        temp = true;
                    }
                }                
            }
            if (temp == false) {
                free.push(search[i]);
            }
        }
    }
    flag = true;
    for (i = 0; i < free.length; i++) {
        if (tileClickableList[free[i]].color != '#FFFFFF') {
            flag = false;
        }
    }
    bindingColour = new Array();
    for (i = 0; i < binding.length; i++) {
        if (tileClickableList[binding[i]].color != '#FFFFFF') {
            if (bindingColour.includes(tileClickableList[binding[i]].color)) {
                flag = false;
            }
            else {
                bindingColour.push(tileClickableList[binding[i]].color);
                for (j = 0; j < bound[i].length; j++) {
                    if (tileClickableList[nodeList[bound[i][j]].occupied].color != bindingColour[bindingColour.length-1]) {
                        flag = false;
                    }
                }
            }
        }
        else {
            flag = false;
        }
    }
    
    return flag;
}

function searchBody(x,i) {
    if (tileList[nodeList[i].occupied].label == x) {
        bound[bound.length-1].push(i);
    }
    else if (tileList[nodeList[i].occupied].label == '\\') {
        if (tileList[nodeList[nodeList[i].left].occupied].label != x) {
            searchBody(x,nodeList[i].right);
        } 
    }
    else {
        if (nodeList[i].left > -1) {
            if (nodeList[nodeList[i].left].occupied > -1) {
                searchBody(x,nodeList[i].left);
            }
            if (nodeList[nodeList[i].right].occupied > -1) {
                searchBody(x,nodeList[i].right);
            }
        }
    }
}

function loadCopyButton() {
    copyButton = new Clickable(640,815);
    copyButton.resize(100,70);
    copyButton.text = 'Move Tool';
    copyButton.textSize = 22;
    copyButton.onPress = function() {
        tool = 2;
        this.color = 200;
        for (i = 0; i < renamingButton.length;i++) {
            renamingButton[i].color = 250;
        }
    }
}

function loadLevel3Colours() {
    colourBox = new Array(4);
    var colours = ['#f76868','#f7f068','#85f28d','#8f9af7','#FFFFFF'];
    for (i = 0; i < 5; i++) {
        colourBox[i] = new Clickable (760+i*60,830);
        colourBox[i].text = '';
        colourBox[i].resize(40,40);
        colourBox[i].color = colours[i];
        colourBox[i].onPress = function() {
            copyButton.color = 250;
            for (i = 0; i < renamingButton.length; i++) {
                renamingButton[i].length = 250;
            }
            tool = 4;
            cursorColour = this.color;
        }
    }
    cursorColour = '#FFFFFF';
}

var skipButton;

function loadToolButtons() {
    tool = 0;
    movingTreeClickableList = new Array();
    movingTreeTileList = new Array();
    loadReduceButton();
    loadCopyButton();
    loadLevel3Colours();
    loadRenamingTools();
    loadFinishButton();
    loadSkipButton();
}

function loadSkipButton() {
    skipButton = new Clickable(20,815);
    skipButton.resize(200,70);
    skipButton.text = 'Skip Colouring';
    skipButton.textSize = 24;
    skipButton.onPress = function() {
        saveState();
        assignBound();
        for (i = 0; i < free.length; i++) {
            tileClickableList[free[i]].color = '#FFFFFF';
        }
        colours = ["#f7f068","#85f28d","#fa9bf8","#8f9af7","#f76868","#95f0e8"];
        for (i = 0; i < binding.length;i++) {
            tileClickableList[binding[i]].color = colours[i];
            for (j = 0; j < bound[i].length; j++) {
                tileClickableList[nodeList[bound[i][j]].occupied].color = colours[i];
            }
        }
        tool = 0;
        phase = 1;
    }
}

function checkRedex(i) {
    if (tileList[nodeList[i].occupied].label == '@') {
        if (nodeList[i].left > -1) {
            if (nodeList[nodeList[i].left].occupied > -1) {
                if (tileList[nodeList[nodeList[i].left].occupied].label == '\\') {
                    return true;
                }
            }
        }
    }
    return false;
}

function loadRenamingTools() {
    var variables = ['W','V','X','Y','Z'];
    renamingButton = new Array(variables.length);
    for (i = 0; i < renamingButton.length; i++) {
        renamingButton[i] = createNewTileClickable(930+i*60,830,variables[i]);
        renamingButton[i].onPress = function() {
            tool = 5;
            renameVal = this.text;
            this.color = 200;
            for (j = 0; j < renamingButton.length; j++) {
                if (renamingButton[j].text != this.text) {
                    renamingButton[j].color = 255;
                }
            }
            copyButton.color = 255;
        }
    }
}

function drawToolButtons() {
    
    if (phase == 1) {
        drawReduceButton();
    }
    else if (phase == 2) {
        copyButton.draw();
        for (i = 0; i < colourBox.length; i++) {
            colourBox[i].draw();
        }
        if (currentDiff != 'Easy') {
            for (i = 0; i < renamingButton.length; i++) {
                renamingButton[i].draw();
            }
        }
        if (tool == 4) {
            drawFillColour();
        }
        finishButton.draw();
    }
    else if (phase == 12) {
        finishButton.draw();
        skipButton.draw();
        for (i = 0; i < colourBox.length; i++) {
            colourBox[i].draw();
        }
        drawFillColour();
    }
    else if (phase == 13) {
        finishButton.draw();
    }
    else if (phase == 14) {
        for (i = 0; i < renamingButton.length; i++) {
            renamingButton[i].draw();
        }
        copyButton.draw();
        finishButton.draw();
    }
}

function drawReduceButton() {
    reduceButton.color = 150;
    if (redexDim[0] > -1) {
//        if (checkRedex(redexDim[0])) {
        reduceButton.color = '#FFFFFF';
//        }
    }
    if (redexDim[0] > -1) {
        reduceButton.draw();
    }
    else if (firstTime) {
        reduceButton.draw();
    }
}

function loadResetButton() {
    resetButton = new Clickable(1680,10);
    resetButton.text = 'Restart';
    resetButton.resize(100,60)
    resetButton.textSize = 22;
    resetButton.onPress = function() {
        correctTiles = 0;
        if (locked) {
            locked = false;
            checkButton.color = '#FFFFFF';
            checkButton.text = 'Check Answer';
        }
        if (state == 'Level-3') {
            loadLevel();
        }
        else {
            if (state == 'Level-2') {
                wrongList = new Array();
            }
            else if (state == 'Level-1') {
                loadHintButton();
            }
            loadTree(depth);
            loadUndoButton();
        }
    }
}

function loadColourBoxes() {
    colourBox = new Array(7);
    var colours = ["#f76868","#f7f068","#85f28d","#95f0e8","#fa9bf8","#8f9af7","#FFFFFF"];
    for (i = 0; i < 7; i++) {
        colourBox[i] = new Clickable(640+i*80,830)
        colourBox[i].resize(40,40);
        colourBox[i].text = "";
        colourBox[i].color = colours[i];
        colourBox[i].onPress = function() {
            cursorColour = this.color;
        }
    }
    cursorColour = colours[6];
}

function drawColourBoxes() {
    for (i = 0; i < 7; i++) {
        colourBox[i].draw();
    }
}

function loadHomeButton() {
    homeButton = new Clickable(10,10);
    homeButton.resize(60,60);
    homeButton.text = 'Home';
    homeButton.onPress = function() {
//        state = 'Start-Up';
        if (state == 'Level-1') {
            state = 'Menu-1';
        }
        else if (state == 'Level-2') {
            state = 'Menu-2';
        }
        else if (state == 'Level-3') {
            state = 'Menu-3';
        }
        currentLevel = 'N/A';
    }
}

function loadContinueButton() {
    continueButton = new Clickable(1580,815);
    continueButton.resize(200,70);
    continueButton.textSize = 28;
    if (state == 'Level-1' && currentLevel >= level1ButtonList.length-1) {
        continueButton.text = 'Return Home';
    }
    else if (state == 'Level-2' && currentLevel >= level2ButtonList.length-1) {
        continueButton.text = 'Return Home';
    }
    else if (state == 'Level-3' && currentLevel >= level3ButtonList.length-1) {
        continueButton.text = 'Return Home';
    }
    else {
        continueButton.text = 'Next Level';
    }
    continueButton.onPress = function() {
        if (this.text == 'Return Home') {
            if (state == 'Level-1') {
                state = 'Menu-1';
            }
            else if (state == 'Level-2') {
                state = 'Menu-2';
            }
            else if (state == 'Level-3') {
                state = 'Menu-3';
            }
        }
        else if (state == 'Level-1' && currentLevel < level1ButtonList.length-1) {
            currentLevel += 1;
            extractLevel(levelList[0][currentLevel]);
            loadLevel();
        }
        else if (state == 'Level-2' && currentLevel < level2ButtonList.length-1) {
            currentLevel += 1;
            extractLevel(levelList[1][currentLevel]);
            loadLevel();
        }
        else if (state == 'Level-3' && currentLevel < level3ButtonList.length-1) {
            currentLevel += 1;
            extractLevel(levelList[2][currentLevel]);
            loadLevel();
        }
    }
}

function updateCorrect() {
    var oldCorrect = correctTiles;
    correctTiles = 0;
    for (i = 0; i < tileCount; i++) {
        if (tileClickableList[i].color == '#bcffb0') {
            correctTiles += 1;
        }
    }
    return correctTiles - oldCorrect;
}

function loadCheckButtonNew() {
    checkButton = new Clickable(1580,815);
    checkButton.resize(200,70);
    checkButton.textSize = 24;
    checkButton.text = 'Check Answer';
    if (state == 'Level-3') {
        checkButton.text = 'Done';
    }
    checkButton.onPress = function() {
        if (state == 'Level-1') {
            if (checkAnswer()) {
                this.text = 'Correct!';
                locked = true;
                loadCorrectDisplay();
                this.color = '#bcffb0';
                undoButton.color = 150;
                helpButton.color = '#FFFFFF';
                toggleHelp = false;
            }
            else {
                loadWrongDisplay(updateCorrect());
            }
        }
        else if (state == 'Level-2') {
            var wrongBefore = wrongList.slice();
            if (phase == 1 && checkAnswer2()) {
                phase = 2;
                saveColours();
                loadUndoButton();
                loadCorrectPhase1Display();
                undoButton.color = 150;
                if (checkAnswer2()) {
                    this.text = 'Correct!';
                    locked = true;
                    loadCorrectDisplay();
                    this.color = '#bcffb0';
                    undoButton.color = 150;
                    phase = 4;
                }
            }
            else if (phase == 2 && checkAnswer2()) {
                this.text = 'Correct!';
                locked = true;
                loadCorrectDisplay();
                this.color = '#bcffb0';
                undoButton.color = 150;
            }
            else {
                var groups = new Array();
                var errorCode = 1;
                if (phase == 1) {
                    for (i = 0; i < wrongList.length; i++) {
                        if (groups.includes(tileClickableList[wrongList[i]].color) == false) {
                            groups.push(tileClickableList[wrongList[i]].color);
                        }
                    }
                    if (groups.includes('#FFFFFF')) {
                        loadWrongDisplay(-1 * groups.length);
                    }
                    else {
                        loadWrongDisplay(groups.length);
                    }
                }
                else {
                    for (i = 0; i < wrongList.length; i++) {
                        if (tileClickableList[wrongList[i]].color == '#FFFFFF') {
                            errorCode = 2;
                        }
                        else if (groups.includes(tileList[wrongList[i]].label) == false) {
                            groups.push(tileList[wrongList[i]].label);
                        }
                    }
                    for (j = 0; j < groups.length; j++) {
                        var val = '';
                        for (i = 0; i < wrongList.length; i++) {
                            if (tileList[wrongList[i]].label == groups[j] && tileClickableList[wrongList[i]].color != '#FFFFFF') {
                                if (val == '') {
                                    val = tileClickableList[wrongList[i]].color;
                                }
                                else if (val != tileClickableList[wrongList[i]].color) {
                                    if (errorCode < 3) {
                                        errorCode = errorCode * 3;
                                    }
                                }
                            }
                        }
                    }
                    if (errorCode == 2) {
                        loadWrongDisplay(1)
                    }
                    else if (errorCode == 3) {
                        loadWrongDisplay(2);
                    }
                    else if (errorCode == 6) {
                        loadWrongDisplay(3);
                    }
                }
                var updateWrong = false;
                if (wrongList.size != wrongBefore.size) {
                    updateWrong - true;
                }
                else {
                    for (i = 0; i < wrongBefore.size; i++) {
                        if (wrongBefore[i] != wrongList[i]) {
                            updateWrong = true;
                        }
                    }
                }
                if (updateWrong) {
                    wrongListHistory.pop();
                    wrongListHistory.push([]);
                    for (i = 0; i < wrongList.length; i++) {
                        wrongListHistory[wrongListHistory.length-1].push(wrongList[i]);
                    }
                }
            }
        }
        else if (state == 'Level-3' && phase == 1) {
            if (checkAnswer3()) {
                redexDim = [-1,-1,-1,-1,-1];
                this.text = 'Correct!';
                locked = true;
                loadCorrectDisplay();
                reduceButton.color = 150;
                this.color = '#bcffb0';
                undoButton.color = 150;
            }
            else {
                loadWrongDisplay(50);
            }
        }
    }
}

function checkReveal() {
    list = revealList[currentLevel];
    revealStep = -1;
    for (i = 0; i < list.length && revealStep == -1;i++) {
        for (j = 0; j < list[i].length && revealStep == -1; j++) {
            if (nodeList[list[i][j]].occupied > -1) {
                if (tileClickableList[nodeList[list[i][j]].occupied].color == '#FFFFFF') {
                    revealStep = i;
                }
            }
            else {
                revealStep = i;
            }
        }
    }
    return revealStep;
}

//========================================================
//                      UNDO/REDO
//========================================================

function loadUndoButton() {
    tileHistory = new Array();
    nodeHistory = new Array();
    colourHistory = new Array();
    
    redexHistory = new Array();
    phaseHistory = new Array();
    
    wrongListHistory = new Array();
    
    revealHistory = new Array();
    
    undoButton = new Clickable(1350,10);
    undoButton.text = 'Undo';
    undoButton.textSize = 22;
    undoButton.resize(75,60);
    undoButton.color = 150;
    undoButton.onPress = function() {
        if (tileHistory.length > 1 && locked == false) {
            displayBox = false;
            addToRedo();
            var lastTile = tileHistory.pop();
            var lastNode = nodeHistory.pop();
            var lastTileColours = colourHistory.pop();
            tileClickableList = new Array(lastTile.length);
            tileList = new Array(lastTile.length);
            for (i = 0; i < lastTile.length; i++) {
                tileList[i] = new tile(lastTile[i].pos.x,lastTile[i].pos.y,lastTile[i].label,lastTile[i].assignment,lastTile[i].defaultPos.x,lastTile[i].defaultPos.y);
                tileClickableList[i] = createNewTileClickable(lastTile[i].pos.x,lastTile[i].pos.y,lastTile[i].label);
                tileClickableList[i].color = lastTileColours[i];
            }
            for (i = 0; i < nodeList.length; i++) {
                nodeList[i].occupied = lastNode[i];
            }
            tileCount = lastTile.length;
            if (state == 'Level-3') {
                var lastPhase = phaseHistory.pop();
                if (phase == 2 && lastPhase == 1) {
                    tool = 0;
                    phase = 1;
                }
                else if (phase == 1 && lastPhase == 2) {
                    tool = 2;
                    phase = 2;
                    copyButton.color = 200;
                    for (i = 0; i < renamingButton.length; i++) {
                        renamingButton[i].color = 250;
                    }
                }
                else if (phase == 14 && lastPhase == 14) {
                    
                }
                else {
                    phase = lastPhase;
                    if (phase == 12) {
                        tool = 4;
                    }
                    else if (phase == 13) {
                        tool = 2;
                    }
                    else if (phase == 14) {
                        tool = 2;
                        copyButton.color = 200;
                        for (i = 0; i < renamingButton.length; i++) {
                            renamingButton[i].color = 255;
                        }
                    }
                    else if (phase == 1) {
                        tool = 0;
                    }
                    else if (phase == 0) {
                        tool = 0;
                    }
                }
                var lastRedex = redexHistory.pop();
                for (i = 0; i < 5; i++) {
                    redexDim[i] = lastRedex[i];
                }
                var lastList = wrongListHistory.pop();
                wrongList = new Array(lastList.length);
                for (i = 0; i < lastList.length; i++) {
                    wrongList[i] = lastList[i];
                }
            }
            else if (state == 'Level-2') {
                var lastList = wrongListHistory.pop();
                wrongList = new Array(lastList.length);
                for (i = 0; i < lastList.length; i++) {
                    wrongList[i] = lastList[i];
                }
            }
            else if (state == 'Level-1') {
                var lastReveal = revealHistory.pop();
                if (lastReveal == false && revealFlag == true) {
                    hintButton.color = '#FFFFFF';
                    hintButton.text = 'Show Correct Layout';
                }
                else if (lastReveal == true && revealFlag == false) {
                    hintButton.color = '#faff96';
                    hintButton.text = 'Hide Correct Layout';
                }
                revealFlag = lastReveal;
            }
            if (tileHistory.length == 1) {
                this.color = 150;
            }
        }
    }
    
    saveState();
}

function loadRedoButton() {
    tileRedo = new Array();
    nodeRedo = new Array();
    colourRedo = new Array();
    redexRedo = new Array();
    phaseRedo = new Array();
    revealRedo = new Array();
    
    redoButton = new Clickable(1435,10);
    redoButton.text = 'Redo';
    redoButton.textSize = 22;
    redoButton.color = 150;
    redoButton.resize(75,60);
    redoButton.onPress = function() {
        if (tileRedo.length > 0) {
            displayBox = false;
            addToUndo();
            var lastTile = tileRedo.pop();
            var lastNode = nodeRedo.pop();
            var lastTileColours = colourRedo.pop();
            tileClickableList = new Array(lastTile.length);
            tileList = new Array(lastTile.length);
            for (i = 0; i < lastTile.length; i++) {
                tileList[i] = new tile(lastTile[i].pos.x,lastTile[i].pos.y,lastTile[i].label,lastTile[i].assignment,lastTile[i].defaultPos.x,lastTile[i].defaultPos.y);
                tileClickableList[i] = createNewTileClickable(lastTile[i].pos.x,lastTile[i].pos.y,lastTile[i].label);
                tileClickableList[i].color = lastTileColours[i];
            }
            for (i = 0; i < nodeList.length; i++) {
                nodeList[i].occupied = lastNode[i];
            }
            tileCount = lastTile.length;
            if (state == 'Level-3') {
                var lastPhase = phaseRedo.pop();
                if (phase == 2 && lastPhase == 1) {
                    tool = 0;
                    phase = 1;
                }
                else if (phase == 1 && lastPhase == 2) {
                    tool = 2;
                    phase = 2;
                }
                else if (phase == 14 && phase == 14) {
                    
                }
                else {
                    phase = lastPhase;
                    if (phase == 12) {
                        tool = 4;
                    }
                    else if (phase == 13) {
                        tool = 2;
                    }
                    else if (phase == 14) {
                        tool = 2;
                        copyButton.color = 200;
                        for (i = 0; i < renamingButton.length; i++) {
                            renamingButton[i].color = 255;
                        }
                    }
                    else if (phase == 1 || phase == 0) {
                        tool = 0;
                    }
                }
                var lastRedex = redexRedo.pop();
                for (i = 0; i < 5; i++) {
                    redexDim[i] = lastRedex[i];
                }
                var lastList = wrongListRedo.pop();
                wrongList = new Array(lastList.length);
                for (i = 0; i < wrongList.length; i++) {
                    wrongList[i] = lastList[i];
                }
            }
            else if (state == 'Level-2') {
                var lastList = wrongListRedo.pop();
                wrongList = new Array(lastList.length);
                for (i = 0; i < wrongList.length; i++) {
                    wrongList[i] = lastList[i];
                }
            }
            else if (state == 'Level-1') {
                var lastReveal = revealRedo.pop();
                if (lastReveal == false && revealFlag == true) {
                    hintButton.color = '#ffffff';
                    hintButton.text = 'Show Correct Layout';
                }
                else if (lastReveal == true && revealFlag == false) {
                    hintButton.color = '#faff96';
                    hintButton.text = 'Hide Correct Layout';
                }
                revealFlag = lastReveal;
            }
            if (tileRedo.length == 0) {
                this.color = 150;
            }
        }
    }
}

function saveState() {
    if (displayBox) {
        displayBox = false;
    }
    tileRedo = new Array();
    nodeRedo = new Array();
    colourRedo = new Array();
    if (state == 'Level-3') {
        redexRedo = new Array();
        phaseRedo = new Array();
        wrongListRedo = new Array();
    }
    else if (state == 'Level-2') {
        wrongListRedo = new Array();
    }
    else if (state == 'Level-1') {
        revealRedo = new Array();
    }
    redoButton.color = 150;
    addToUndo();
}

function addToUndo() {
    tileHistory.push([]);
    nodeHistory.push([]);
    colourHistory.push([]);
    for (i = 0; i < tileCount; i++) {
        tileHistory[tileHistory.length-1].push(new tile(tileList[i].pos.x,tileList[i].pos.y,tileList[i].label,tileList[i].assignment,tileList[i].defaultPos.x,tileList[i].defaultPos.y));
        colourHistory[tileHistory.length-1].push(tileClickableList[i].color);
    }
    for (i = 0; i < nodeList.length; i++) {
        nodeHistory[nodeHistory.length-1].push(nodeList[i].occupied);
    }
    if (state == 'Level-3') {
        redexHistory.push([]);
        phaseHistory.push(phase);
        for (i = 0; i < 5; i++) {
            redexHistory[redexHistory.length-1].push(redexDim[i]);
        }
        wrongListHistory.push([]);
        for (i = 0; i < wrongList.length; i++) {
            wrongListHistory[wrongListHistory.length-1].push(wrongList[i]);
        }
    }
    else if (state == 'Level-2') {
        wrongListHistory.push([]);
        for (i = 0; i < wrongList.length; i++) {
            wrongListHistory[wrongListHistory.length-1].push(wrongList[i]);
        }
    }
    else if (state == 'Level-1') {
        revealHistory.push(revealFlag);
    }
    if (tileHistory.length > 1) {
        undoButton.color = 255;
    }
}

function addToRedo() {
    tileRedo.push([]);
    nodeRedo.push([]);
    colourRedo.push([]);
    for (i = 0; i < tileCount; i++) {
        tileRedo[tileRedo.length-1].push(new tile(tileList[i].pos.x,tileList[i].pos.y,tileList[i].label,tileList[i].assignment,tileList[i].defaultPos.x,tileList[i].defaultPos.y));
        colourRedo[colourRedo.length-1].push(tileClickableList[i].color);
    }
    for (i = 0; i < nodeList.length; i++) {
        nodeRedo[nodeRedo.length-1].push(nodeList[i].occupied);
    }
    if (state == 'Level-3') {
        redexRedo.push([]);
        for (i = 0; i < 5; i++) {
            redexRedo[redexRedo.length-1].push(redexDim[i]);
        }
        phaseRedo.push(phase);
        wrongListRedo.push([]);
        for (i = 0; i < wrongList.length; i++) {
            wrongListRedo[wrongListRedo.length-1].push(wrongList[i]);
        }
    }
    else if (state == 'Level-2') {
        wrongListRedo.push([]);
        for (i = 0; i < wrongList.length; i++) {
            wrongListRedo[wrongListRedo.length-1].push(wrongList[i]);
        }
    }
    else if (state == 'Level-1') {
        revealRedo.push(revealFlag);
    }
    redoButton.color = 255;
}

//========================================================================================================
//                                   UNIVERSAL MECHANICS
//========================================================================================================

function loadNodes() {
    nodeCount = (2 ** depth) - 1;
    nodeList = new Array(nodeCount);
    
    partlength = round(700/(depth+1));
    
    var y = 110;
    var index = 0;
    var counter;

    if (depth > 0) {
        y += partlength;
        nodeList[index] = new node(new coord(875,y));
        index += 1;
    }
    if (depth > 1) {
        y += partlength;
        counter = 475;
        for (i = 0; i < 2; i++) {
            nodeList[index] = new node(new coord(counter,y));
            index += 1;
            counter += 800;
        }
    }
    if (depth > 2) {
        y += partlength;
        counter = 275;
        for (i = 0; i < 4; i++) {
            nodeList[index] = new node(new coord(counter,y));
            index += 1;
            counter += 400;
        }
    }
    if (depth > 3) {
        y += partlength;
        counter = 175;
        for (i = 0; i < 8; i++) {
            nodeList[index] = new node(new coord(counter,y));
            index += 1;
            counter += 200;
        }
    }
    if (depth > 4) {
        y += partlength;
        counter = 125;
        for (i = 0; i < 16; i++) {
            nodeList[index] = new node(new coord(counter,y));
            index += 1;
            counter += 100;
        }
    }
    if (depth > 5) {
        y += partlength;
        counter = 100;
        for (i = 0; i < 32; i++) {
            nodeList[index] = new node(new coord(counter,y));
            index += 1;
            counter += 50;
        }
    }
    assignLeftRights();
}
function drawNodes() {
    for (i = 0; i < nodeList.length; i++) {
        if (((state == 'Level-1' && nodeList[i].occupied > -2) || nodeList[i].occupied > -1) && locked == false) {
            stroke(150);
            strokeWeight(1);
            fill(178, 232, 250);
            rect(nodeList[i].pos.x,nodeList[i].pos.y,40,40);
        }
    }
}
function drawTilesNew() {
    if (state == 'Level-2' || state == 'Level-3') {
        for (i = 0; i < tileCount; i++) {
//            if (tileList[i].visible) {
                tileClickableList[i].draw();
                if (tileList[i].label == '\\') {
                    if (tileClickableList[i].color == '#FFFFFF') {
                        tint(255);
                    }
                    else {
                        tint(255,opacity);
                    }
                    image(lambda,tileList[i].pos.x+6,tileList[i].pos.y+6);
                }
//            }
        }
    }
    else if (state == 'Level-1') {
        for (i = 0; i < tileCount; i++) {
            if (i != selectedTile) {
                tileClickableList[i].draw();
                if (tileList[i].label == '\\') {
                    image(lambda,tileList[i].pos.x+6,tileList[i].pos.y+6);
                }
            }
        }
        if (selectedTile > -1) {
            tileClickableList[selectedTile].draw();
            if (tileList[selectedTile].label == '\\') {
                image(lambda,tileClickableList[selectedTile].x+6,tileClickableList[selectedTile].y+6);
            }
        }
    }
}
function createNewTileClickable(x,y,label) {
    var temp = new Clickable(x,y);
    temp.cornerRadius = 1;
    if (label == '\\') {
        temp.text = '';
    }
    else {
        temp.text = label;
    }
    temp.resize(40,40);
    temp.textSize = 20;
    return temp;
}

//========================================================================================================
//                                    LEVEL 3 MECHANICS
//========================================================================================================

function drawLines3() {
    var end;
    end = 1;
    for (i = 0; i < (2 ** (depth-1)) - 1; i++) {
        for (j = 0; j < 2; j++) {
            //draw line from nodeList[i] to nodeList[end]
            if ((state == 'Level-1' && nodeList[i].occupied > -2 && nodeList[end].occupied > -2 && locked == false) || (nodeList[i].occupied > -1 && nodeList[end].occupied > -1)) {
                stroke(140);
                if (fadeOutAnimate) {
                    var tree = getTree(nodeList[redexDim[0]].occupied);
                    if ((tree.includes(nodeList[i].occupied) || tree.includes(nodeList[end].occupied)) && (end != redexDim[0])) {
                        if (opacity <= 15) {
                            stroke('#8C8C8C0' + opacity.toString(16));
                        }
                        else {
                            stroke('#8C8C8C' + opacity.toString(16));
                        }
                    }
                }
                strokeWeight(2);
                line(nodeList[i].pos.x+20,nodeList[i].pos.y+40,nodeList[end].pos.x+20,nodeList[end].pos.y);  
            }
            else if (moveTreeAnimate) {
                if (end == redexDim[0]) {
                    stroke(140);
                    line(nodeList[i].pos.x+20,nodeList[i].pos.y+40,nodeList[end].pos.x+20,nodeList[end].pos.y);
                }
            }
            end += 1;
        }
    }
}
function assignLeftRights() {
    for (i = 0; i < nodeCount; i++) {
        if ((i+1)*2 < 2 ** depth) {
            nodeList[i].left = ((i+1)*2)-1;
            nodeList[i].right = (i+1)*2;
        }
        else {
            nodeList[i].left = -1;
            nodeList[i].right = -1;
        }
    }
}
function getTree(i) {
    var result = [i];
    var leftNode;
    var rightNode;
    if (nodeList[tileList[i].assignment].left > -1) {
        if (nodeList[nodeList[tileList[i].assignment].left].occupied > -1) {
            result = result.concat(getTree(nodeList[nodeList[tileList[i].assignment].left].occupied));
        }
        if (nodeList[nodeList[tileList[i].assignment].right].occupied > -1) {
            result = result.concat(getTree(nodeList[nodeList[tileList[i].assignment].right].occupied));
        }
    }
    return result;
}

function getFreeVars(i) {
    var leftNode;
    var rightNode;
    
    if (tileList[i].label == '\\') {
        return getFreeVars(nodeList[nodeList[tileList[i].assignment].right].occupied);
    }
    else if (tileList[i].label == '@') {
        return getFreeVars(nodeList[nodeList[tileList[i].assignment].left].occupied).concat(getTree(nodeList[nodeList[tileList[i].assignment].right].occupied));
    }
    else {
        return [i];
    }
}

function deleteTree(top) {
    var tree = getTree(top); //get all tile indexes below the root
    //alert(tree);
    for (i = tileCount-1; i > -1; i--) {
        if (tree.includes(i)) {
            nodeList[tileList[i].assignment].occupied = -1;
            for (j = i + 1; j < tileCount; j++) {
                nodeList[tileList[j].assignment].occupied -= 1;
                
            }
            tileList.splice(i,1);
            tileClickableList.splice(i,1);
            tileCount -= 1;
        }
    }
}
function drawMovingTree() {
    for (i = 0; i < movingTreeClickableList.length; i++) {
        movingTreeClickableList[i].draw();
        if (movingTreeTileList[i].label == '\\') {
            tint(255,255);
            image(lambda,movingTreeClickableList[i].x+6,movingTreeClickableList[i].y+6);
        }
    }
}
function drawMovingLines() {
    var index = 1;
    var start = 0;
    var end = 1;
    for (i = 0; i < (2 ** (getLog(2,movingTreeTileList.length+1)-1)) - 1; i++) {
        if (movingTreeTileList[i].assignment > -1) {
            for (j = 0; j < 2; j++) {
                //draw line from nodeList[start] to nodeList[end]
                if (movingTreeTileList[index].assignment > -1) {
                    stroke(140);
                    line(movingTreeClickableList[start].x+20,movingTreeClickableList[start].y+40,movingTreeClickableList[end].x+20,movingTreeClickableList[end].y);
                    end += 1; 
                }
                index += 1;
            }
            start += 1;
        }
        else {
            index += 2;
        }
    
    }
}
function getLog(x,y) {
    return Math.log(y) / Math.log(x);
}

function checkAnswer3() {
    flag = true
    for (i = 0; i < nodeList.length; i++) {
        if (nodeList[i].occupied > -1) {
            if (checkRedex(i)) {
                flag = false;
            }
        }
    }
    return flag;
}

//========================================================================================================
//                                    LEVEL 2 MECHANICS
//========================================================================================================

function loadTiles2() {
    tileCount = getTileCount();
    tileClickableList = new Array(tileCount);
    tileList = new Array(tileCount);
    var index = 0;
    for (i = 0; i < setTree.length; i++) {
        if (setTree[i] != 'n') {
            tileList[index] = new tile(nodeList[i].pos.x,nodeList[i].pos.y,setTree[i],i,-50,-50);
            tileClickableList[index] = createNewTileClickable(nodeList[i].pos.x,nodeList[i].pos.y,setTree[i]);
            if (state == 'Level-2') {
                if ((phase == 1) && (setTree[i] == '@' || setTree[i] == '\\')) {
                    tileClickableList[index].color = 200;
                }
                else if (phase == 2) {
                    tileClickableList[index].color = savedColours[index];
                }
            }
            nodeList[i].occupied = index;
            index += 1;
        }
    }
}

function saveColours() {
    savedColours = new Array(tileCount);
    for (i = 0; i < tileCount; i++) {
        savedColours[i] = tileClickableList[i].color;
    }
}

function getTileCount() {
    var count = 0;
    for (i = 0; i < setTree.length; i++) {
        if (setTree[i] != 'n') {
            count += 1;
        }
    }
    return count;
}
function checkAnswer2() {
    var flag = true;
    var checker = ['#FFFFFF','','','','','',''];
    var freeVariables = new Array();
    var colourUsed;
    wrongList = new Array();
    var clash = new Array();
    for (i = 0; i < solution.length; i++) {
        if (solution[i] > 0) {
            if (phase == 1) {
                colourUsed = tileClickableList[i].color;
            }
            else if (phase == 2) {
                colourUsed = tileClickableList[i].text;
            }
            if (checker[solution[i]] == '') {
                if (colourUsed == '#FFFFFF') {
                    checker[solution[i]] = 'WRONG';
                    if (clash.includes(colourUsed) == false) {
                        clash.push(colourUsed);
                    }
                    flag = false;
                }
                else if (checker.includes(colourUsed)) {
                    if (clash.includes(colourUsed) == false) {
                        clash.push(colourUsed);
                    }
                    flag = false;
                }
                checker[solution[i]] = colourUsed;
            }
            else if (checker[solution[i]] != colourUsed) {
                if (clash.includes(colourUsed) == false) {
                    clash.push(colourUsed);
                }
                if (phase == 1 && clash.includes(checker[solution[i]]) == false) {
                    clash.push(checker[solution[i]]);
                }
                flag = false;
            }
            if (freeVariables.includes(tileClickableList[i].text)) {
                if (clash.includes(colourUsed) == false) {
                    clash.push(colourUsed);
                }
                flag = false;
            }
        }
        else if (solution[i] == 0) {
            if (phase == 1 && tileClickableList[i].color != '#FFFFFF') {
                if (clash.includes(tileClickableList[i].color) == false) {
                    clash.push(tileClickableList[i].color);
                    clash.push('#FFFFFF');
                }
                flag = false; 
            }
            else if (phase == 2) {
                freeVariables.push(tileClickableList[i].text);
                if (checker.includes(tileClickableList[i].text)) {
                    flag = false;
                    if (clash.includes(tileClickableList[i].text) == false) {
                        clash.push(tileClickableList[i].text);
                    }
                }
            }
        }
    }
    if (flag == false && phase == 2) {
        for (i = 0; i < tileCount; i++) {
            if (tileClickableList[i].color != 200) {
                if (clash.includes(tileList[i].label)) {
                    wrongList.push(i);
                }
            }
        }
    }
    else if (flag == false && phase == 1) {
        for (i = 0; i < tileCount; i++) {
            if (tileClickableList[i].color != '#FFFFFA' && tileClickableList[i].color != 200) {
                if (clash.includes(tileClickableList[i].color) == false) {
                    wrongList.push(i);
                }
            }
        }
    }
    return flag;
}

//========================================================================================================
//                                    LEVEL 1
//========================================================================================================

function checkAnswer() {
    var flag = true;
    for (i = 0; i < nodeCount; i++) {
        if (nodeList[i].occupied == -1) {
            if (solution[i] != 'n') {
                flag = false;
            }
        }
        else if (nodeList[i].occupied > -1) {
            if (solution[i] == '-') {
                //ignore
            }
            else if (tileList[nodeList[i].occupied].label != solution[i]) {
                flag = false;
            }
            else {
                tileClickableList[nodeList[i].occupied].color = '#bcffb0';
            }
        }
    }
    return flag;
}
function loadTiles() {
    var temp = getLabels();
    var labels = new Array();
    if (temp.includes('V')) {
        labels.push('V');
    }
    if (temp.includes('W')) {
        labels.push('W');
    }
    if (temp.includes('X')) {
        labels.push('X');
    }
    if (temp.includes('Y')) {
        labels.push('Y');
    }
    if (temp.includes('Z')) {
        labels.push('Z');
    }
    if (temp.includes('\\')) {
        labels.push('\\');
    }
    if (temp.includes('@')) {
        labels.push('@');
    }
    tileList = new Array(labels.length);
    tileClickableList = new Array(labels.length);
    tileCount = labels.length;
    defaultIcons = new Array(labels.length);
    for (i = 0; i < labels.length; i++) {
        tileList[i] = new tile(880 - 40*(labels.length-1)+i*80,830,labels[i],labels[i],880 - 40*(labels.length-1)+i*80,830);
        tileClickableList[i] = createNewTileClickable(880 - 40*(labels.length-1)+i*80,830,labels[i]);
        defaultIcons[i] = createNewTileClickable(880 - 40*(labels.length-1)+i*80,830,labels[i]);       
    }

    for (i = 0; i < setTree.length; i++) {
        if (setTree[i] != 'n') {
            tileList.push(new tile(nodeList[i].pos.x,nodeList[i].pos.y,setTree[i],i,-50,-50));
            tileClickableList.push(createNewTileClickable(nodeList[i].pos.x,nodeList[i].pos.y,setTree[i]));
            tileClickableList[tileClickableList.length-1].color = 200;
            nodeList[i].occupied = tileList.length-1;
            tileCount += 1;
        }
    }
    
}

function getLabels() {
    temp = new Array(0);
    for (i = 0; i < solution.length; i++) {
        if (solution[i] != 'n') {
            if (temp.includes(solution[i]) == false) {
                temp.push(solution[i]);
            }
        }
    }
    return temp;
}

function drawDefaultIcons() {
    for (i = 0; i < defaultIcons.length; i++) {
        defaultIcons[i].draw();
        if (defaultIcons[i].text == '') {
            image(lambda,defaultIcons[i].x+6,defaultIcons[i].y+6);
        }
    }
}

//========================================================================================================
//                                    EVENT FUNCTIONS
//========================================================================================================

function mousePressed() {
    if (state == 'Level-1' && locked == false) {
        selectedTile = checkOverTile3();
        if (selectedTile > -1) {
            start = new coord(mouseX,mouseY);
        }
    }
    else if (state == 'Level-2' && locked == false) {
        selectedTile = checkOverTile3();
        if (phase == 1 && selectedTile > -1) {
            if (tileClickableList[selectedTile].color != cursorColour && tileList[selectedTile].label != '\\' && tileList[selectedTile].label != '@') {
                saveState();
                for (i = wrongList.length-1; i > -1; i--) {
                    var col = tileClickableList[wrongList[i]].color;
                    if (col == cursorColour || col == tileClickableList[selectedTile].color) {
                        wrongList.splice(i,1);
                    }
                }
                tileClickableList[selectedTile].color = cursorColour;
            }
        }
        else if (phase == 2 && selectedTile > -1) {
            if (tileClickableList[selectedTile].color == '#FFFFFF') {
                loadWrongDisplay(100);
            }
            else if (tileList[selectedTile].label != renameVal && tileClickableList[selectedTile].color != 200 && tileClickableList[selectedTile].color != '#FFFFFF') {
                saveState();
                if (wrongList.includes(selectedTile)) {
                    var free = new Array();
                    var extra = new Array();
                    var remove = new Array();
                    for (i = 0; i < wrongList.length; i++) {
                        if (tileList[wrongList[i]].label == tileList[selectedTile].label) {
                            if (tileClickableList[wrongList[i]].color == tileClickableList[selectedTile].color) {
                                remove.push(i);
                            }
                            else if (tileClickableList[wrongList[i]].color == '#FFFFFF') {
                                free.push(i);
                            }
                            else if (extra.includes(tileClickableList[wrongList[i]].color) == false) {
                                extra.push(tileClickableList[wrongList[i]].color);
                            }
                        }
                    }
                    if (extra.length == 0) {
                        remove = joinTwo(remove,free);
                    }
                    else if (extra.length == 1 && free.length == 0) {
                        for (i = 0; i < wrongList.length; i++) {
                            if (extra.includes(tileClickableList[wrongList[i]].color)) {
                                remove = joinTwo(remove,[i]);
                            }
                        }
                    }
                    for (i = remove.length-1; i > -1; i--) {
                        wrongList.splice(remove[i],1);
                    }
                }
                renameAll(tileClickableList[selectedTile].color,renameVal);
            }
        }
    }
    else if (state == 'Level-3' && locked == false) {
        selectedTile = checkOverTile3();
        if (selectedTile > -1) {
            if (phase == 1) {
                if (tool == 0) {
                    displayBox = false;
                    assignHighlight(tileList[selectedTile].assignment);
                }
            }
            else if (phase == 12) {
                if (tileList[selectedTile].label == '@' || tileList[selectedTile].label == '\\') {
                    
                }
                else if (tileClickableList[selectedTile].color != cursorColour) {
                    saveState();
                    tileClickableList[selectedTile].color = cursorColour;
                }
            }
            else if (phase == 13) {
                if (tileList[selectedTile].assignment == nodeList[redexDim[0]].right) {
                    assignMovingTree(tileList[selectedTile].assignment);
                    start = new coord(mouseX,mouseY);
                    displayBox = false;
                }
                else {
                    temp = getTree(nodeList[nodeList[redexDim[0]].right].occupied);
                    if (temp.includes(selectedTile)) {
                        loadWrongDisplay(90);
                    }
                    else {
                        loadWrongDisplay(91);
                    }
                    selectedTile = -1;
                }
            }
            else if (phase == 14) {
                if (tool == 2) {
                    if (tileList[selectedTile].assignment == nodeList[redexDim[0]].right) {
                        assignMovingTree(tileList[selectedTile].assignment);
                        start = new coord(mouseX,mouseY);
                        displayBox = false;
                    }
                    else {
                        temp = getTree(nodeList[nodeList[redexDim[0]].right].occupied);
                        if (temp.includes(selectedTile)) {
                            loadWrongDisplay(90);
                        }
                        else {
                            loadWrongDisplay(91);
                        }
                        selectedTile = -1;
                    }
                }
                else if (tool = 5) {
                    if (tileList[selectedTile].assignment == nodeList[redexDim[0]].right) {
                        copyButton.color = 200;
                        for (i = 0; i < renamingButton.length; i++) {
                            renamingButton[i].color = 255;
                        }
                        tool = 2;
                        assignMovingTree(tileList[selectedTile].assignment);
                        start = new coord(mouseX,mouseY);
                        displayBox = false;
                    }
                    else if (tileList[selectedTile].label == '\\' || tileList[selectedTile].label == '@') {
                        //lambda or apply tile
                        loadWrongDisplay(80);
                    }
                    else if (tileClickableList[selectedTile].color == '#FFFFFF') {
                        //free variable
                        loadWrongDisplay(81);
                    }
                    else if (tileList[selectedTile].label != renameVal) {
                        saveState();
                        for (i = 0; i < tileCount; i++) {
                            if (tileClickableList[selectedTile].color == tileClickableList[i].color) {
                                tileList[i].label = renameVal;
                                tileClickableList[i].text = renameVal;
                                if (wrongList.includes(tileList[i].assignment)) {
                                    for (j = 0; j < wrongList.length; j++) {
                                        if (wrongList[j] == tileList[i].assignment) {
                                            wrongList.splice(j,1);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else if (state == 'Menu') {
        if (mouseX > 300 && mouseX < 600 && mouseY > 499 && mouseY < 801) {
            state = 'Menu-1P';
            loadLevel1Tutorials();
        }
        else if (mouseX > 750 && mouseX < 1050 && mouseY > 499 && mouseY < 801) {
            state = 'Menu-2P';
            loadLevel2Tutorials();
        }
        else if (mouseX > 1200 && mouseX < 1500 && mouseY > 499 && mouseY < 801) {
            state = 'Menu-3P';
            loadLevel3Tutorials();
        }
    }
    else if (state == 'Menu-1' || state == 'Menu-2' || state == 'Menu-3') {
        if (mouseX >= 25 && mouseX <= 135 && mouseY >= 25 && mouseY <= 110) {
            if (helpToggle == '') {
                state = 'Menu';
            }
            else if (helpToggle == '01' || helpToggle == '00' || helpToggle == '02' || helpToggle == '03') {
                helpToggle = '';
            }
            else if (helpToggle == '10' || helpToggle == '11') {
                helpToggle = '';
            }
            else if (helpToggle == '20' || helpToggle == '21' || helpToggle == '22') {
                helpToggle = '';
            }
        }
    }
    if (mouseX <= 70 && mouseX >= 10 && mouseY >= 10 && mouseY <= 70) {
        if (state == 'Level-1') {
            state = 'Menu-1';
        }
        else if (state == 'Level-2') {
            state = 'Menu-2';
        }
        else if (state == 'Level-3') {
            state = 'Menu-3';
        }
    }
}

function joinTwo(A,B) {
    var ap = 0;
    var bp = 0;
    var result = new Array();
    while (true) {
        if (ap == A.length && bp == B.length) {
            return result;
        }
        else if (ap == A.length) {
            result.push(B[bp]);
            bp += 1;
        }
        else if (bp == B.length) {
            result.push(A[ap]);
            ap += 1;
        }
        else if (A[ap] < B[bp]) {
            result.push(A[ap]);
            ap += 1;
        }
        else if (A[ap] > B[bp]) {
            result.push(B[bp]);
            bp += 1;
        }
    }
    
}

function loadLevel1Tutorials() {
    tutorialButton1 = new Clickable(695,300);
    tutorialButton1.text = '1. What are Lambda Expressions?';
    tutorialButton1.color = '#dfe6e9';
    tutorialButton1.stroke = '#787878';
    tutorialButton1.resize(200,70);
    tutorialButton1.cornerRadius = 20;
    tutorialButton1.textSize = 17;
    tutorialButton1.onPress = function() {
        if (helpToggle == '') {
            helpToggle = '00';
        }
    }
    
    tutorialButton2 = new Clickable(905,300);
    tutorialButton2.text = '2. What are Variables?';
    tutorialButton2.color = '#dfe6e9';
    tutorialButton2.stroke = '#787878';
    tutorialButton2.resize(200,70);
    tutorialButton2.cornerRadius = 20;
    tutorialButton2.textSize = 17;
    tutorialButton2.onPress = function() {
        if (helpToggle == '') {
            helpToggle = '01';
        }
    }
    
    tutorialButton3 = new Clickable(695,380);
    tutorialButton3.text = '3. How to Build an Abstraction';
    tutorialButton3.color = '#dfe6e9';
    tutorialButton3.stroke = '#787878';
    tutorialButton3.resize(200,70);
    tutorialButton3.cornerRadius = 20;
    tutorialButton3.textSize = 17;
    tutorialButton3.onPress = function() {
        if (helpToggle == '') {
            helpToggle = '02';
        }
    }
    
    tutorialButton4 = new Clickable(905,380);
    tutorialButton4.text = '4. How to Build an Application';
    tutorialButton4.color = '#dfe6e9';
    tutorialButton4.stroke = '#787878';
    tutorialButton4.resize(200,70);
    tutorialButton4.cornerRadius = 20;
    tutorialButton4.textSize = 17;
    tutorialButton4.onPress = function() {
        if (helpToggle == '') {
            helpToggle = '03';
        }
    }
}

function loadLevel2Tutorials() {
    
    tutorialButton1 = new Clickable(785,300);
    tutorialButton1.text = '1. How to Identify Bound and Free Variables';
    tutorialButton1.color = '#dfe6e9';
    tutorialButton1.stroke = '#787878';
    tutorialButton1.resize(230,70);
    tutorialButton1.textSize = 18;
    tutorialButton1.cornerRadius = 20;
    tutorialButton1.onPress = function() {
        if (helpToggle == '') {
            helpToggle = '10';
        }
    }
    
    tutorialButton2 = new Clickable(785,380);
    tutorialButton2.text = '2. How to Rename Bound Variables';
    tutorialButton2.color = '#dfe6e9';
    tutorialButton2.stroke = '#787878';
    tutorialButton2.resize(230,70);
    tutorialButton2.textSize = 18;
    tutorialButton2.cornerRadius = 20;
    tutorialButton2.onPress = function() {
        if (helpToggle == '') {
            helpToggle = '11';
        }
    }
}

function loadLevel3Tutorials() {
    tutorialButton1 = new Clickable(800,300);
    tutorialButton1.text = '1. What are Redexes?';
    tutorialButton1.color = '#dfe6e9';
    tutorialButton1.stroke = '#787878';
    tutorialButton1.resize(200,45);
    tutorialButton1.textSize = 18;
    tutorialButton1.cornerRadius = 30;
    tutorialButton1.onPress = function() {
        if (helpToggle == '') {
           helpToggle = '20';
        }
    }
    
    tutorialButton2 = new Clickable(770,355);
    tutorialButton2.text = '2. How to Reduce a Redex';
    tutorialButton2.color = '#dfe6e9';
    tutorialButton2.stroke = '#787878';
    tutorialButton2.resize(260,45);
    tutorialButton2.textSize = 18;
    tutorialButton2.cornerRadius = 30;
    tutorialButton2.onPress = function() {
         if (helpToggle == '') {
            helpToggle = '21';
        }
    }
    
    tutorialButton3 = new Clickable(740,410);
    tutorialButton3.text = '3. How to Avoid Variable Capture';
    tutorialButton3.color = '#dfe6e9';
    tutorialButton3.stroke = '#787878';
    tutorialButton3.resize(320,45);
    tutorialButton3.textSize = 18;
    tutorialButton3.cornerRadius = 30;
    tutorialButton3.onPress = function() {
         if (helpToggle == '') {
            helpToggle = '22';
        }
    }
}

function renameAll(col,val) {
    for (i = 0; i < tileCount; i++) {
        if (tileClickableList[i].color == col) {
            tileClickableList[i].text = val;
            tileList[i].label = val;
        }
    }
}

function assignHighlight(i) {
    if (redexDim[0] != i) {
        redexDim = [i,getLeftMost(i),nodeList[i].pos.y-10,getRightMost(i),getLowest(i)];
    }
    else {
        redexDim = [-1,-1,-1,-1,-1];
    }
}

function updateHighlight() {
    redexDim = [i,getLeftMost(i),nodeList[i].pos.y-10,getRightMost(i),getLowest(i)];
}

function getLeftMost(i) {
    var leftNode = nodeList[i].left;
    if (leftNode > -1) {
        if (nodeList[leftNode].occupied > -1) {
            return getLeftMost(leftNode);
        }
    }
    return nodeList[i].pos.x - 10;
}

function getRightMost(i) {
    var rightNode = nodeList[i].right;
    if (rightNode > -1) {
        if (nodeList[rightNode].occupied > -1) {
            return getRightMost(rightNode);
        }
    }
    return nodeList[i].pos.x + 50;
}

function getLowest(i) {
    var leftNode = nodeList[i].left;
    var rightNode = nodeList[i].right;
    var leftDepth;
    var rightDepth;
    if (leftNode > -1) {
        if (nodeList[leftNode].occupied > -1) {
            leftDepth = getLowest(leftNode);
        }
        else {
            leftDepth = nodeList[i].pos.y + 50;
        }
        if (nodeList[rightNode].occupied > -1) {
            rightDepth = getLowest(rightNode);
        }
        else {
            rightDepth = nodeList[i].pos.y + 50;
        }
        if (leftDepth > rightDepth) {
            return leftDepth;
        }
        else {
            return rightDepth;
        }
    }
    else {
        return nodeList[i].pos.y + 50;
    }
}

function assignMovingTree(i) {
    var temp;
    var multiplier = 1;
    var number = 1;
    
    var flag = true;
    while (flag) {
        flag = false;
        for (x = multiplier*(i+1) - 1; x < multiplier*(i+1) - 1 + number; x++) {
            if (x < 2 ** depth - 1 && nodeList[x].occupied > -1) {
                flag = true;
                temp = new tile(tileList[nodeList[x].occupied].pos.x,tileList[nodeList[x].occupied].pos.y,tileList[nodeList[x].occupied].label,x,-50,-50);
                movingTreeTileList.push(temp);
                temp = tileList[nodeList[x].occupied];
                movingTreeClickableList.push(createNewTileClickable(temp.pos.x,temp.pos.y,temp.label));
                movingTreeClickableList[movingTreeClickableList.length-1].color = tileClickableList[nodeList[x].occupied].color;
//                if (tool == 1) {
//                    tileList[nodeList[x].occupied].visible = false;
//                }
            }
            else {
                movingTreeTileList.push(new tile(-1,-1,'n',-1,-1,-1));
            }
        }
        multiplier = multiplier * 2;
        number = number * 2;
    }
    movingTreeTileList.splice(movingTreeTileList.length-number/2,number/2);
}

function checkOverTile3() {
    for (i = 0; i < tileCount; i++) {
        if (state == 'Level-3') {
            if (mouseX > tileList[i].pos.x-15 && mouseX < (tileList[i].pos.x+40+15) && mouseY > tileList[i].pos.y-15 && mouseY < (tileList[i].pos.y+40+15)) {
                return i;
            }
        }
        else if (mouseX > tileList[i].pos.x-15 && mouseX < (tileList[i].pos.x+40+15) && mouseY > tileList[i].pos.y-15 && mouseY < (tileList[i].pos.y+40+15)) {
            if (tileClickableList[i].color != '#bcffb0' && tileClickableList[i].color != 200) {
                return i;
            }
            else if (state == 'Level-2') {
                loadWrongDisplay(101);
            }
        }
    }
    return -1;
}

function mouseDragged() {
    if (state == 'Level-1') {
        if (selectedTile > -1) {
            tileClickableList[selectedTile].locate(tileList[selectedTile].pos.x + mouseX - start.x,tileList[selectedTile].pos.y + mouseY - start.y);
        }
    }
    else if (state == 'Level-3') {
        if (selectedTile > -1) {
            for (i = 0; i < movingTreeClickableList.length; i++) {
                movingTreeClickableList[i].locate(movingTreeClickableList[i].x + mouseX - start.x,movingTreeClickableList[i].y + mouseY - start.y);
            }
            start = new coord(mouseX,mouseY);
        }
    }
}

function mouseReleased() {
    if (state == 'Level-1') {
        if (selectedTile > -1) {
            var nodeSelected = checkOverNode();
            //if the user has released over a tree node
            if (nodeSelected > -1) {
                if (nodeList[nodeSelected].occupied == -1) {
                    if (tileList[selectedTile].assignment > -1) {
                        //move tile to overwrite selected node
                        saveState();
                        tileList[selectedTile].pos = new coord(nodeList[nodeSelected].pos.x,nodeList[nodeSelected].pos.y);
                        tileClickableList[selectedTile].locate(nodeList[nodeSelected].pos.x,nodeList[nodeSelected].pos.y);
                        nodeList[tileList[selectedTile].assignment].occupied = -1;
                        tileList[selectedTile].assignment = nodeSelected;
                        nodeList[nodeSelected].occupied = selectedTile;
                    }
                    else {
                        //create new tile in selected node
                        saveState();
                        tileList.push(new tile(nodeList[nodeSelected].pos.x,nodeList[nodeSelected].pos.y,tileList[selectedTile].label,nodeSelected,tileList[selectedTile].defaultPos.x,tileList[selectedTile].defaultPos.y));
                        tileClickableList.push(createNewTileClickable(nodeList[nodeSelected].pos.x,nodeList[nodeSelected].pos.y,tileList[selectedTile].label));
                        nodeList[nodeSelected].occupied = tileCount;
                        tileCount += 1;
                        tileClickableList[selectedTile].locate(tileList[selectedTile].defaultPos.x,tileList[selectedTile].defaultPos.y);
                    }
                }
                else if (tileClickableList[nodeList[nodeSelected].occupied].color == 200 || nodeList[nodeSelected].occupied == selectedTile) {
                    tileClickableList[selectedTile].locate(tileList[selectedTile].pos.x,tileList[selectedTile].pos.y);
                }
                else {
                    saveState();
                    tileClickableList[nodeList[nodeSelected].occupied].text = tileList[selectedTile].label;
                    tileList[nodeList[nodeSelected].occupied].label = tileList[selectedTile].label;
                    
                    if (tileList[selectedTile].assignment > -1) {
                        nodeList[tileList[selectedTile].assignment].occupied = -1;
                        for (j = selectedTile+1; j < tileCount; j++) {
                            nodeList[tileList[j].assignment].occupied -= 1;
                        }
                        tileList.splice(selectedTile,1);
                        tileClickableList.splice(selectedTile,1);
                        tileCount -= 1;
                    }
                    else {
                        tileClickableList[selectedTile].locate(tileList[selectedTile].defaultPos.x,tileList[selectedTile].defaultPos.y);
                    }
                    
                    
                    
                }
            }
            //if the user has released over a tile's default box
            else if (((mouseX > tileList[selectedTile].defaultPos.x && mouseX < tileList[selectedTile].defaultPos.x+40 && mouseY > tileList[selectedTile].defaultPos.y && mouseY < tileList[selectedTile].defaultPos.y+40) || (mouseX > bin[0] && mouseX < bin[0]+90 && mouseY > bin[1] && mouseY < bin[1]+90)) && selectedTile >= defaultIcons.length) {
                saveState();
                nodeList[tileList[selectedTile].assignment].occupied = -1;
                for (j = selectedTile+1; j < tileCount; j++) {
                    nodeList[tileList[j].assignment].occupied -= 1;
                }
                tileList.splice(selectedTile,1);
                tileClickableList.splice(selectedTile,1);
                tileCount -= 1;
            }
            //if the user has released in empty space
            else {
                tileClickableList[selectedTile].locate(tileList[selectedTile].pos.x,tileList[selectedTile].pos.y);
            }
            selectedTile = -1;
        }
    }
    else if (state == 'Level-3') {
        if (tool == 2 && selectedTile > -1 && (phase == 2 || phase == 13 || phase == 14)) {
            var pickedUpTiles = getTree(selectedTile);
            
            if (checkOverTile3() > -1) {
                var temp = tileList[checkOverTile3()].assignment;
            
                if (tileClickableList[nodeList[temp].occupied].color != '#FFFFFF' && validDrop.includes(temp) && validHeight(temp)) {
                    saveState();
                    if (wrongList.includes(temp)) {
                        for (i = 0; i < wrongList.length; i++) {
                            if (wrongList[i] == temp) {
                                wrongList.splice(i,1);
                            }
                        }
                    }
                    deleteTree(nodeList[temp].occupied);
                    overwrite(temp);
                    
                    search = getTree(nodeList[temp].occupied);
                    for (i = 0; i < search.length; i++) {
                        if (tileList[search[i]].label == '\\') {
                            colour = tileClickableList[nodeList[nodeList[tileList[search[i]].assignment].left].occupied].color;
                            newColour = getNewColour();
                            for (j = 0; j < search.length; j++) {
                                if (tileClickableList[search[j]].color == colour) {
                                    tileClickableList[search[j]].color = newColour;
                                }
                            }
                        }
                    }
                    
                    redexDim = [redexDim[0],getLeftMost(redexDim[0]),nodeList[redexDim[0]].pos.y-10,getRightMost(redexDim[0]),getLowest(redexDim[0])];
                }
                else {
                    //empty the moving tree and don't move/copy anything
                    while (movingTreeTileList.length > 0) {
                        if (movingTreeTileList[movingTreeTileList.length-1].assignment > -1) {
//                            tileList[nodeList[movingTreeTileList[movingTreeTileList.length-1].assignment].occupied].visible = true;
                            movingTreeClickableList.pop();
                        }
                        movingTreeTileList.pop();
                    }
                    if (selectedTile != nodeList[temp].occupied) {
                        loadWrongDisplay(66);
                    }
                }
            }
            else {
                //empty the moving tree and don't move/copy anything
                while (movingTreeTileList.length > 0) {
                    if (movingTreeTileList[movingTreeTileList.length-1].assignment > -1) {
//                        tileList[nodeList[movingTreeTileList[movingTreeTileList.length-1].assignment].occupied].visible = true;
                        movingTreeClickableList.pop();
                    }
                    movingTreeTileList.pop();
                }
            }
            selectedTile = -1;
        }
    }
    else if (state == 'Menu-1P') {
        state = 'Menu-1';
    }
    else if (state == 'Menu-2P') {
        state = 'Menu-2';
    }
    else if (state == 'Menu-3P') {
        state = 'Menu-3';
    }
}

function getNewColour() {
    colours = ["#f7f068","#85f28d","#fa9bf8","#8f9af7","#f76868","#95f0e8"];
    used = new Array();
    for (i = 0; i < tileCount; i++) {
        if (used.includes(tileClickableList[i].color) == false) {
            used.push(tileClickableList[i].color);
        }
    }
    for (i = 0; i < colours.length;i++) {
        if (used.includes(colours[i]) == false) {
            return colours[i];
        }
    }
}

function validHeight(top) {
    var test = movingTreeTileList.length+1;
    var height = 1;
    while (test > 2) {
        test = test/2;
        height += 1;
    }
    while (height > 1) {
        top = (top * 2) + 1;
        height -= 1;
    }
    if (top < (2 ** depth) - 1) {
        return true;
    }
    else {
        return false;
    }
}

function setMovingDestination(top) {
    var limit = 1;
    var column = 0;
    var index = top;
    var i = 0;
    var temp;
    destinationList = new Array();
    while (i < movingTreeTileList.length) {
        while (column < limit) {
            temp = movingTreeTileList[i];
            if (temp.assignment > -1) {
                destinationList.push(new coord(nodeList[index].pos.x,nodeList[index].pos.y));
            }
            i += 1;
            index += 1;
            column += 1;

        }
        index = ((index - limit) * 2) + 1;
        column = 0;
        limit = limit * 2;
    }
} 

function overwrite(top) {
    var limit = 1;
    var column = 0;
    var index = top;
    var temp;
    flag = false;
    while (movingTreeTileList.length > 0) {
        while (column < limit) {
            temp = movingTreeTileList.shift();
            
            if (temp.assignment > -1) {
                nodeList[index].occupied = tileList.length;
                tileList.push(new tile(nodeList[index].pos.x,nodeList[index].pos.y,temp.label,index,-1,-1));
                tileClickableList.push(createNewTileClickable(nodeList[index].pos.x,nodeList[index].pos.y,temp.label));
                tileClickableList[tileClickableList.length - 1].color = (movingTreeClickableList.shift()).color;
                tileCount += 1;
            }
            index += 1;
            column += 1;

        }
        index = ((index - limit) * 2) + 1;
        column = 0;
        limit = limit * 2;
    }
}

function checkOverNode() {
    for (i = 0; i < nodeCount; i++) {
        if (i > 30 && nodeList[i].occupied > -2){
            if (mouseX > nodeList[i].pos.x-8 && mouseX < nodeList[i].pos.x+50 && mouseY > nodeList[i].pos.y-8 && mouseY < nodeList[i].pos.y+50) {
                return i;
            }
        }
        else if (nodeList[i].occupied > -2){
            if (mouseX > nodeList[i].pos.x-30 && mouseX < nodeList[i].pos.x+70 && mouseY > nodeList[i].pos.y-20 && mouseY < nodeList[i].pos.y+60) {
                return i;
            }
        }
    }
    return -1;
}