var SC; // Scale
var cvs1, ctx1, cvs2, ctx2;
var circuits;
var gates = Object.freeze({"blank":0, "and":1, "nand":2, "or":3, "nor":4, "xor":5, "xnor":6, "bulb":7});
var allowedGates;
var enableGateChanges;
var draggedGate = 0;
var selectedGate = null;
var drawDraggedInterval, updateSelectedInterval, drawInterval, updateInterval, gateChangeInterval, menuHoverInterval, restartHoverInterval;
var gateButtonIntervals = [];
var mousex, mousey;
var pause = false;
var scrollSpeed;
var level, levelIdx;
var currentScreen, screens = Object.freeze({"menu":0, "game":1, "gateIntro":2, "levelEnd":3});
var devMode;

function startGame(){
	// enterDevMode();
	createCanvases();
	document.body.onresize = handleResize;
	loadFontAwesome(drawMenu, 200);
}

function startLevel(lvlIdx) {
	currentScreen = screens.game;

	// Check for a bug where the canvas size is bigger than the window size.
	if (cvs1.width != window.innerWidth){
		handleResize();
	}

	// Assign event handlers.
	cvs2.onmousedown = handleMouseDown;
	cvs2.onmouseup = handleMouseUp;
	cvs2.onmousemove = handleMouseMove;

	// Initialise some variables.
	levelIdx = lvlIdx;
	level = levels[levelIdx];
	circuits = level.circuits;
	enableGateChanges = level.enableGateChanges;
	if (enableGateChanges){
		var gate1 = (Math.floor(Math.random()*3) * 2) + 1, // 1, 3 or 5.
			gate2 = gate1 + 1;
		allowedGates = [gate1, gate2];
	} else {
		allowedGates = level.allowedGates;
	}

	// Draw the menu bar and a rectangle around the game area.
	ctx1.clearRect(0, 0, cvs1.width, cvs1.height);
	drawMenuBar();
	ctx1.lineWidth = 2;
	ctx1.strokeStyle = "#000000";
	ctx1.strokeRect(1, (SC*6), cvs1.width-2, cvs1.height-(SC*6)-1);

	// Prepare the circuits and start the draw and update and gatechange intervals.
	pause = false;
	chooseCircuits();
	prepareCircuits();
	updateInterval = setInterval(updateGame, 1000/60);

	if (enableGateChanges && !level.introduceGateChanges){
		gateChangeInterval = setInterval(changeLockedGates, 20000);
	}

	// Assign hotkeys.
	document.onkeypress = function(event) {
		// If the key was a number, find which gate that number corresponds to.
		var gate = parseInt(event.key);
		if (gate > 0 && gate < 7){
			if (allowedGates.indexOf(gate) != -1){
				// If that gate is allowed to be used, set it as the dragged gate and start the necessary intervals.
				draggedGate = gate;
				if (drawDraggedInterval == undefined && updateSelectedInterval == undefined){
					drawDraggedInterval = setInterval(drawDraggedGate, 1000/60);
					updateSelectedInterval = setInterval(updateSelectedGate, 50);
				}
			}
		}

		// If in dev mode, allow pausing and changing the scroll speed
		if (devMode){
			if (event.key == " "){
				pause = !pause;
			} else if (event.key == "-"){
				scrollSpeed -= 1;
			} else if (event.key == "="){
				scrollSpeed += 1;
			} else if (event.key == "0"){
				scrollSpeed = Math.round(5*(cvs1.width/1100))/5;
			}
		}
	};

	// If this level introduces new gates, show the intro dialogue for those gates.
	if (level.newGates){
		pause = true;
		introduceGates(allowedGates[0]);
	} else if (level.introduceGateChanges){
		// Level 7 introduces gate changes, which is done by the introduceGates function, but with parameter 7.
		pause = true;
		introduceGates(7);
	}
}

// Waits for font awesome to load before continuing. This code is not mine - taken from https://stackoverflow.com/questions/35570801/how-to-draw-font-awesome-icons-onto-html-canvas
function loadFontAwesome(callback,failAfterMS){
	var c=document.createElement("canvas");
	var cctx=c.getContext("2d");
	var ccw,cch;
	var fontsize=36;
	var testCharacter='\uF047';
	ccw=c.width=fontsize*1.5;
	cch=c.height=fontsize*1.5;
	cctx.font=fontsize+'px fontawesome';
	cctx.textAlign='center';
	cctx.textBaseline='middle';
	var startCount=pixcount();
	var t1=performance.now();
	var failtime=t1+failAfterMS;

	requestAnimationFrame(fontOnload);

	function fontOnload(time){
		var currentCount=pixcount();
		if(time>failtime){
			callback();
		}else if(currentCount==startCount){
			requestAnimationFrame(fontOnload);
		}else{
			callback();
		}
	}

	function pixcount(){
		cctx.clearRect(0,0,ccw,cch);
		cctx.fillText(testCharacter,ccw/2,cch/2);
		var data=cctx.getImageData(0,0,ccw,cch).data;
		var count=0;
		for(var i=3;i<data.length;i+=4){
			if(data[i]>10){count++;}
		}
		return(count);
	}
}

// Create the canvases that the game will be drawn to.
function createCanvases(){
	// Create the main canvas.
	cvs1 = document.createElement("canvas");
	ctx1 = cvs1.getContext("2d");
	cvs1.width = window.innerWidth;
	cvs1.height = window.innerHeight;
	cvs1.style.position = "absolute";
	cvs1.style.left = 0;
	cvs1.style.top = 0;
	cvs1.style.zIndex = 0;
	cvs1.style.backgroundColor = "#D8F3E6";
	cvs1.style.border = "0px solid #D3D3D3";
	document.getElementById("container").appendChild(cvs1);

	// Create the layer 2 canvas - things on this canvas are drawn in front of canvas 1.
	cvs2 = document.createElement("canvas");
	ctx2 = cvs2.getContext("2d");
	cvs2.width = window.innerWidth;
	cvs2.height = window.innerHeight;
	cvs2.style.position = "absolute";
	cvs2.style.left = 0;
	cvs2.style.top = 0;
	cvs2.style.zIndex = 1;
	document.getElementById("container").appendChild(cvs2);
	cvs2.onmousemove = handleMouseMove;

	// Calculate the scale to use for the UI and the scroll speed based on the window size.
	SC = Math.round(Math.min(cvs1.height/48, cvs1.width/96));
	SC = Math.min(SC, 22);
	scrollSpeed = Math.round(5*(cvs1.width/1100))/5;
}

// Handles the window being resized.
function handleResize(){
	// Don't resize if we're mid-level. That breaks things. Just deal with the size problem, and resize when we get back to the menu.
	if (currentScreen == screens.menu){
		// Resize the canvases.
		cvs1.width = window.innerWidth;
		cvs1.height = window.innerHeight;
		cvs2.width = window.innerWidth;
		cvs2.height = window.innerHeight;

		// Calculate the scale to use for the UI and the scroll speed based on the window size.
		SC = Math.round(Math.min(cvs1.height/48, cvs1.width/96));
		SC = Math.min(SC, 22);
		scrollSpeed = Math.round(5*(cvs1.width/1100))/5;

		// Redraw menu.
		drawMenu()
	}
}

// A generic function for creating a button. Takes two functions, one to draw the button, and one to call when the button is clicked.
function createButton(drawButton, drawArgs, checkHover, handleClick, intendedScreens){
	// Draw the button.
	drawButton(drawArgs);

	// Function to check if the button is in the correct state, to be called on an interval.
	var highlight = false,
		buttonInterval,
		mouseHover,
		oldMouseDown;
	function updateButton(){
		// If we leave the intended screen, stop updating this button.
		if (intendedScreens.indexOf(currentScreen) == -1){
			clearInterval(buttonInterval);
		} else {
			mouseHover = checkHover();
			if (!highlight && mouseHover){
				// If the mouse is over the button and it isn't highlighted, highlight it.
				highlight = true;
				drawButton(drawArgs, true);
				oldMouseDown = cvs2.onmousedown;
				cvs2.onmousedown = handleClick;
			}
			else if (highlight && !mouseHover){
				// If the mouse isn't over the button and it's still highlighted, unhighlight it.
				highlight = false;
				drawButton(drawArgs, false);
				cvs2.onmousedown = oldMouseDown;
			}
		}
	}

	// Start the updateLevelButton function on an interval.
	buttonInterval = setInterval(updateButton, 1000/60);
	return buttonInterval;
}

// An extension of the createButton function, specifically for buttons that are plain text.
function createTextButton(btnX, btnY, text, fontSize, align, backgroundColor, handleClick, intendedScreens){
	// Measures the height and width the text will be, and where the x position is based on the alignment chosen.
	ctx1.save();
	ctx1.font = fontSize + "pt Impact";
	var width = ctx1.measureText(text).width,
		height = Math.round(1.05*fontSize),
		btnX = (align == "center") ? btnX-(width/2) : btnX;
	ctx1.restore();

	// Function to draw the button.
	function drawButton(args, highlight){
		// Fills over what was here before with the specified background colour.
		ctx1.save();
		ctx1.fillStyle = backgroundColor;
		ctx1.fillRect(btnX, btnY-1, width+2, height+2);

		// Writes the text in the specified size and alignment.
		ctx1.font = fontSize + "pt Impact";
		ctx1.textAlign = align;
		ctx1.fillStyle = (highlight) ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.6)";
		ctx1.fillText(text, btnX, btnY+height);
		ctx1.restore();
	}

	function checkHover(){
		return (mousex > btnX && mousex < btnX+width && mousey > btnY && mousey < btnY+height);
	}

	return createButton(drawButton, undefined, checkHover, handleClick, intendedScreens);
}

// Function for use with development and testing to unlock all the levels.
function enterDevMode(){
	devMode = true;
	for (var i = 0; i < levels.length; i++){
		levels[i].unlocked = true;
	}
	if (currentScreen == screens.menu){
		drawMenu();
	}
}
var levelButtonIntervals = [];

// Draws the whole menu screen.
function drawMenu(){
	// Set currentScreen to menu, and clear the area.
	currentScreen = screens.menu;
	ctx1.clearRect(0, 0, cvs1.width, cvs1.height);

	// If the window has been resized, correct the scale and canvas sizes now.
	if (cvs1.width != window.innerWidth){
		handleResize();
	} else {
		// Draw dark green background
		ctx1.fillStyle = "#184E32";
		ctx1.beginPath();
		ctx1.rect(0, 0, cvs1.width, cvs1.height);
		ctx1.fill();
		ctx1.stroke();
		ctx1.closePath();

		// Calculate the correct y positions for the title and the levels
		var levelRows = Math.ceil(levels.length / 6),
			levelsHeight = (levelRows*6*SC) + ((levelRows-1)*3*SC),
			titleHeight = 8*SC,
			titleY = Math.round((cvs1.height/2)-((levelsHeight+titleHeight)/2)+(4*SC)),
			levelsY = titleY + (4*SC);

		// Draw title
		ctx1.font = (3.4*SC) + "pt Impact";
		ctx1.textAlign = "center";
		ctx1.fillStyle = "#FFFFFF";
		ctx1.fillText("Logic Training", (cvs1.width/2) + 2, titleY + 2);
		ctx1.fillStyle = "#000000";
		ctx1.fillText("Logic Training", (cvs1.width/2), titleY);

		// Create a button for each level (and delete any existing ones).
		clearLevelButtonIntervals();
		createAllLevelButtons(levelsY);
	}
}

// Creates the buttons for all levels in the correct positions.
function createAllLevelButtons(starty){
	for (var i = 0; i < Math.ceil(levels.length / 6); i++){
		// For each row of levels, draw the individual levels.
		var levelCount = Math.min(6, levels.length-(i*6)),
			startx = Math.round((cvs1.width/2) - (((levelCount*6*SC) + ((levelCount-1)*3*SC))/2));
		for (var j = 0; j < levelCount; j++){
			var levelx = startx+(j*9*SC),
				levely = starty+(i*9*SC),
				levelIdx = (i*6)+j;
			if (levels[(i*6)+j].unlocked){
				createLevelButton(levelx, levely, levelIdx);
			} else {
				drawLevelButton([levelx, levely, levelIdx], false)
			}
		}
	}
}

function drawLevelButton(args, highlight){
	var x = args[0],
		y = args[1],
		levelIdx = args[2];
	// Draw over whatever is already here.
	ctx1.save();
	ctx1.fillStyle = "#184E32";
	ctx1.fillRect(x-4, y-4, (6*SC)+8, (6*SC)+8);

	// Draw the box, with a thicker border and lighter colour if highlighted.
	ctx1.strokeStyle = "#000000";
	if (highlight){
		ctx1.fillStyle = "#7D9C8D";
		ctx1.lineWidth = 2;
		ctx1.fillRect(x, y, 6*SC, 6*SC);
		ctx1.strokeRect(x-1, y-1, (6*SC)+2, (6*SC)+2);
	} else {
		ctx1.fillStyle = "#5D8370";
		ctx1.lineWidth = 1;
		ctx1.fillRect(x, y, 6*SC, 6*SC);
		ctx1.strokeRect(x-0.5, y-0.5, (6*SC)+1, (6*SC)+1);
	}
	// ctx1.lineWidth = (highlight) ? 3 : 1;
	// ctx1.fillStyle = (highlight) ? "#7D9C8D" : "#5D8370";
	// ctx1.strokeStyle = "#000000";
	// ctx1.fillRect(x+0.5, y+0.5, 6*SC, 6*SC);
	// ctx1.strokeRect(x+0.5, y+0.5, 6*SC, 6*SC);

	// Draw the TUTORIAL or LEVEL text.
	var level = levels[levelIdx],
		text = (level.tutorial) ? "TUTORIAL" : "LEVEL",
		fontSize = (level.tutorial) ? SC : 0.8*SC,
		texty = (level.tutorial) ? y+(3.4*SC) : y+(1.5*SC);
	ctx1.font = fontSize + "pt Impact";
	ctx1.fillStyle = "#000000";
	ctx1.textAlign = "center";
	ctx1.fillText(text, x+(3*SC), texty);

	if (!level.tutorial){
		// Draw the level number.
		ctx1.font = (2*SC) + "pt Impact";
		ctx1.fillStyle = "#000000";
		ctx1.fillText(levelIdx, x+(3*SC), y+(4.2*SC));

		// Draw the stars, filling in the ones which have been earned.
		ctx1.font = (0.8*SC) + "pt FontAwesome";
		ctx1.lineWidth = 1;
		for (var j = 0; j < 3; j++){
			if (j < levels[levelIdx].starsEarned){
				ctx1.fillStyle = "#ffff00";
				ctx1.fillText("\uF005", x+(1.6*SC)+(j*1.4*SC), y+(5.5*SC));
			}
			ctx1.strokeStyle = "#000000";
			ctx1.strokeText("\uF005", x+(1.6*SC)+(j*1.4*SC), y+(5.5*SC));
		}

		if (!levels[levelIdx].unlocked){
			// If the level is locked, draw a transparent grey box over it.
			ctx1.save();
			ctx1.fillStyle = "rgba(0, 0, 0, 0.6)";
			ctx1.fillRect(x, y, 6*SC, 6*SC);

			// Draw lock icon.
			ctx1.textAlign = "left";
			ctx1.font = 1.5*SC + "px FontAwesome";
			ctx1.fillStyle = "#000000";
			ctx1.fillText("\uf023", x+8, y+(1.5*SC)+2);
			ctx1.font = 1.5*SC + "px FontAwesome";
			ctx1.fillStyle = "#ffffff";
			ctx1.fillText("\uf023", x+6, y+(1.5*SC));
			ctx1.restore();
		}
	}

	ctx1.restore();
}

// Creates a level button, drawing it and creating an interval to handle mouse hovering and clicking.
function createLevelButton(x, y, levelIdx){
	// Function to check if the mouse is hovering over this button.
	function checkHover(){
		return (mousex > x && mousex < x+(6*SC) && mousey > y && mousey < y+(6*SC));
	}

	// Function to be called if this button is clicked.
	function handleClick(){
		cvs2.mousedown = undefined;
		clearLevelButtonIntervals();
		if (levels[levelIdx].tutorial){
			startTutorial();
		} else {
			startLevel(levelIdx);
		}
	}

	var buttonInterval = createButton(drawLevelButton, [x, y, levelIdx], checkHover, handleClick, [screens.menu]);
	levelButtonIntervals.push(buttonInterval);
}

// Clears the intervals controlling all the level buttons in the main menu.
function clearLevelButtonIntervals(){
	while (levelButtonIntervals.length != 0){
		clearInterval(levelButtonIntervals.pop());
	}
}
function updateGame(){
	// Move all circuits.
	for (var i = 0; i < circuits.length; i++){
		if (!pause){
			// Normal circuits move 1 pixel, star circuits move two pixels.
			if (circuits[i].startx > cvs1.width){
				circuits[i].startx -= scrollSpeed;
			} else {
				circuits[i].startx -= circuits[i].speedModifier * scrollSpeed;
			}

			// Start animations if the circuit moves on the screen.
			if ((circuits[i].startx < cvs1.width) && (circuits[i].animated == false)){
				startCircuitAnimation(circuits[i], ctx1);
				circuits[i].animated = true;
			}
		}
	}

	// When the last two circuits are on the screen, we need to start regularly checking if all the circuits are complete or scrolled off the screen, so we can end the game.
	if ((level.tutorial || circuits[circuits.length-2].startx <= 0)
	 	&& checkAllCircuitsComplete() && currentScreen != screens.levelEnd){
		endLevel();
	}
}

// Returns true if all the circuits in a level are complete or off the screen.
function checkAllCircuitsComplete(){
	for (var i = 0; i < circuits.length; i++){
		var gateSections = circuits[i].gateSections,
			bulb = gateSections[gateSections.length-1][0];
		if (bulb.outputVal == -1){
			if (circuits[i].startx + circuits[i].width < 0){
				bulb.outputVal == 0;
			} else {
				return false;
			}
		}
	}
	return true;
}

function updateSelectedGate(){
	var oldGate = selectedGate,
		newGate = getSelectedGate(mousex, mousey, 12);

	// If the mouse is no longer over the previously selected gate, make that gate visible again.
	if ((oldGate != null) && (newGate == null)){
		oldGate.invis = false;
		selectedGate = null;
	}
	// If the mouse isn't currently over a non-fixed gate, draw at the mouse position. Otherwise, draw in the gate, and set that gate to be invisible.
	else if ((oldGate == null) && (newGate != null)){
		newGate.invis = true;
	}

	selectedGate = newGate;
}

// Function to change which gates are locked, i.e. perform a gate change. Available gates will always consist of a single gate/!gate pair (e.g. AND/NAND, OR/NOR, XOR/XNOR) so that there is always a possible gate for every desired gate output.
function changeLockedGates(){
	var gate1 = -1, gate2;

	// Choose a random gate/!gate pair that isn't what we already have.
	while (gate1 == -1 || gate1 == allowedGates[0]){
		gate1 = (Math.floor(Math.random()*3) * 2) + 1; // 1, 3 or 5.
		gate2 = gate1 + 1;
	}

	var frame = -1,
	 	xOffset = Math.round(cvs1.width / 2) + (26*SC),
		yOffset = SC,
		opacity,
		id = setInterval(animateCountdown, 20);

	function animateCountdown(){
		frame++;
		if (won == undefined){
			// Fill over whatever is already there.
			ctx1.fillStyle = "#2A8958";
			ctx1.fillRect(xOffset-(4*SC), yOffset, (8*SC), (4*SC));

			if (frame != 150){
				// Draw the number.
				ctx1.textAlign = "center";
				opacity = 1-(frame%50)/50;
				ctx1.font = "italic " + (2*SC) + "pt Impact";
				ctx1.fillStyle = "rgba(180, 214, 197, " + opacity + ")";
				ctx1.fillText(3-Math.floor(frame/50), xOffset+2, yOffset+(3*SC)+2);
				ctx1.fillStyle = "rgba(17, 55, 35, " + opacity + ")";
				ctx1.fillText(3-Math.floor(frame/50), xOffset, yOffset+(3*SC));
				ctx1.textAlign = "left";
			}
		}
		if (frame == 150){
			// Update the allowed gates and redraw the menu bar, then display the "Gate change!" animation.
			clearInterval(id);
			if (won == undefined){
				allowedGates = [gate1, gate2];
				drawMenuBar();
			}
			frame = -1;
			id = setInterval(animateGateChange, 20);
		}
	}

	function animateGateChange(){
		frame++;
		if (won == undefined){
			// Fill over whatever is already there.
			ctx1.fillStyle = "#2A8958";
			ctx1.fillRect(xOffset-(10*SC), yOffset, (20*SC), (4*SC));

			if (frame != 75){
				// Draw "GATE CHANGE!".
				ctx1.textAlign = "center";
				opacity = (frame < 50) ? 1 : (75-frame)/25;
				ctx1.font = "italic " + (2*SC) + "pt Impact";
				ctx1.fillStyle = "rgba(180, 214, 197, " + opacity + ")";
				ctx1.fillText("GATE CHANGE!", xOffset+2, yOffset + (3*SC) + 2);
				ctx1.fillStyle = "rgba(17, 55, 35, " + opacity + ")";
				ctx1.fillText("GATE CHANGE!", xOffset, yOffset + (3*SC));
				ctx1.textAlign = "left";
			}
		}
		if (frame == 75){
			clearInterval(id);
		}
	}
}
// Function to start the animation of a circuit sliding across the screen.
function startCircuitAnimation(circuit, ctx){
	// Clear the area where the circuit was.
	function clearCircuit(){
		ctx1.clearRect(
			circuit.startx,
			circuit.starty+(10*SC)-(circuit.height/2)-2,
			circuit.width+4+(2*scrollSpeed),
			circuit.height+4
		);
	}

	// Redraws the 2 pixel lines on the edge of the screen if they were cleared or drawn over.
	function redrawBorder(circuit, ctx){
		if (circuit.startx < 2 || circuit.startx+circuit.width+4+(2*scrollSpeed) > cvs1.width - 2){
			ctx1.save();
			ctx1.lineWidth = 2;
			ctx1.strokeStyle = "#000000";
			ctx1.beginPath();
			if (circuit.startx < 4){
				// Draw the left edge.
				ctx1.moveTo(1, (SC*6)+1);
				ctx1.lineTo(1, cvs1.height-1);
			} else {
				// Draw the right edge.
				ctx1.moveTo(cvs1.width-1, (SC*6)+1);
				ctx1.lineTo(cvs1.width-1, cvs1.height);
			}
			ctx1.stroke();
			ctx1.closePath();
			ctx1.restore();
		}
	}

	// Draw the circuit.
	function drawCircuit(){
		if (circuit.endx > 0){
			clearCircuit();
			drawGates(circuit, ctx);
			drawWires(circuit, ctx);
			drawAnimations(circuit, ctx);
			redrawBorder(circuit, ctx);
			circuit.animationRef = window.requestAnimationFrame(drawCircuit);
		} else {
			stopWireAnimations(circuits[i]);
			clearCircuit();
			redrawBorder(circuit, ctx);
			circuit.animationRef = undefined;
		}
	}

	// Start the animation.
	circuit.animationRef = window.requestAnimationFrame(drawCircuit);
}

// Draws the menu bar at the top of the screen.
function drawMenuBar(){
	// Clear the menu area.
	ctx1.clearRect(0, 0, cvs1.width, (6*SC));

	// Draw outer box.
	ctx1.beginPath();
	ctx1.lineWidth = 2;
	ctx1.strokeStyle = "#000000";
	ctx1.fillStyle="#2A8958";
	ctx1.rect(1, 1, cvs1.width-2, (SC*6)-1);
	ctx1.fill();
	ctx1.stroke();
	ctx1.closePath();

	// Clear any existing gate button intervals.
	while (gateButtonIntervals.length > 0){
		clearInterval(gateButtonIntervals.pop());
	}

	// Create buttons for all the gates.
	var startx = Math.round((cvs1.width / 2) - (14.5*SC));
	for (var i = 0; i < 6; i++){
		createGateButton(startx + (i*5*SC), SC, i+1);
	}

	// Function to stop the game and return to the menu.
	function handleMenuButtonClick(){
		clearIntervals();
		resetGameState();
		drawMenu();
	}

	// Creates the menu button.
	clearInterval(menuHoverInterval);
	menuHoverInterval = createTextButton(0.5*SC, 0.5*SC, "MENU", SC+2, "left", "#2A8958", handleMenuButtonClick, [screens.gateIntro, screens.game]);

	// Function to restart the current level.
	function handleRestartButtonClick(){
		clearIntervals();
		resetGameState();
		if (level.tutorial){
			startTutorial();
		} else {
			startLevel(levelIdx);
		}
	}

	// Creates the restart button.
	clearInterval(restartHoverInterval);
	restartHoverInterval = createTextButton(0.5*SC, 2*SC, "RESTART", SC+2, "left", "#2A8958", handleRestartButtonClick, [screens.gateIntro, screens.game]);
}

function createGateButton(x, y, gate){
	var unlocked = (allowedGates.indexOf(gate) != -1);

	// Function to draw a gate button.
	function drawGateButton(args, highlight){
		// var x = Math.floor(args[0])+0.5,
		// 	y = Math.floor(args[1])+0.5,
		// 	gate = args[2];
		var x = args[0],
			y = args[1],
			gate = args[2];

		// Draw over whatever was already here.
		ctx1.save();
		ctx1.fillStyle="#2A8958";
		ctx1.fillRect(x-2, y-2, (4*SC)+4, (4*SC)+4);

		ctx1.strokeStyle = "#000000";
		ctx1.fillStyle = (highlight && unlocked) ? "#effaf5" : "#D8F3E6";
		ctx1.lineWidth = 2;
		ctx1.fillRect(x, y, 4*SC, 4*SC);
		ctx1.strokeRect(x, y, 4*SC, 4*SC);

		// Draw the gate.
		switch (gate){
			case gates.and:
				drawAND(x, y, 0, 0, 0, ctx1);
				break;
			case gates.nand:
				drawNAND(x, y, 0, 0, 0, ctx1);
				break;
			case gates.or:
				drawOR(x, y, 0, 0, 0, ctx1);
				break;
			case gates.nor:
				drawNOR(x, y, 0, 0, 0, ctx1);
				break;
			case gates.xor:
				drawXOR(x, y, 0, 0, 0, ctx1);
				break;
			case gates.xnor:
				drawXNOR(x, y, 0, 0, 0, ctx1);
				break;
		}

		// Draw the hotkey number.
		ctx1.textAlign = "left";
		ctx1.font = "8pt Arial";
		ctx1.fillStyle = "#000000";
		ctx1.fillText(gate, x+(4*SC)-10, y+(4*SC)-4);

		if (!unlocked){
			// Draw transparent grey box.
			ctx1.fillStyle = "rgba(0, 0, 0, 0.7)";
			ctx1.fillRect(x, y, 4*SC, 4*SC);

			// Draw lock icon.
			ctx1.textAlign = "center";
			ctx1.font = 2*SC + "px FontAwesome";
			ctx1.fillStyle = "#000000";
			ctx1.fillText("\uf023", x+(2*SC)+3, y+(2.7*SC)+3);
			ctx1.font = 2*SC + "px FontAwesome";
			ctx1.fillStyle = "#ffffff";
			ctx1.fillText("\uf023", x+(2*SC), y+(2.7*SC));
		}
		ctx1.restore();
	}

	// Function to check if the mouse is hovering over the button.
	function checkHover(){
		return (draggedGate == 0 && (mousex > x && mousex < x+(4*SC) && mousey > y && mousey < y+(4*SC)));
	}

	// Function to call when the button is clicked.
	function handleClick(){
		if (unlocked){
			// Sets draggedGate to the selected gate, and puts drawDraggedGate on an interval, so that it can be redrawn to snap to nearby gates even if the mouse doesn't move.
			draggedGate = gate;
			drawDraggedInterval = setInterval(drawDraggedGate, 1000/60);
			updateSelectedInterval = setInterval(updateSelectedGate, 50);
		}
	}

	gateButtonIntervals.push(createButton(drawGateButton, [x, y, gate], checkHover, handleClick, [screens.game, screens.gateIntro]));
}

// Draws the whole circuit.
function drawCircuit(circuit, ctx) {
	if (circuit.startx < cvs1.width && circuit.endx > 0){
		drawGates(circuit, ctx);
		drawWires(circuit, ctx);
		drawAnimations(circuit, ctx);
	}
}

// Draws all the lightning animations on the live wires.
function drawAnimations(circuit, ctx){
	for (var i = 0; i < circuit.wireSections.length; i++){
		var section = circuit.wireSections[i];
		for (var j = 0; j < section.length; j++){
			var group = section[j];
			for (var k = 0; k < group.wires.length; k++){
				var wire = group.wires[k];
				if (typeof(wire.animations) != "undefined"){
					for (var l = 0; l < wire.animations.length; l++){
						var bolt = wire.animations[l];
						drawBolt(bolt, circuit.startx, circuit.starty, ctx);
					}
				}
			}
		}
	}
}

function drawBolt(bolt, xOffset, yOffset, ctx){
	ctx.save();
	ctx.strokeStyle = "#00bfff";
	ctx.lineWidth = 1;
	ctx.beginPath();
	for (var i = 0; i < bolt.length; i++){
		ctx.moveTo(bolt[i].x1 + xOffset, bolt[i].y1 + yOffset);
		ctx.lineTo(bolt[i].x2 + xOffset, bolt[i].y2 + yOffset);
	}
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
}

// Clears the game area of all drawings
function clearGameArea(){
	for (var i = 0; i < circuits.length; i++){
		var startx = Math.max(circuits[i].startx, 1),
			endx = Math.min(circuits[i].endx, cvs1.width-1),
			starty = circuits[i].starty,
			width = circuits[i].width,
			height = circuits[i].height;
		if (startx < cvs1.width && endx > 1){
			ctx1.clearRect(
				startx,
				starty+(10*SC)-(height/2)-2,
				Math.min(width+2, cvs1.width-1-startx),
				height+4
			);
		}
	}
}
// Updates the values in a circuit after a particular gate has changed.
function updateCircuitVoltages(gateIdx){
	var gateSections = circuits[gateIdx[0]].gateSections,
		section = gateSections[gateIdx[1]],
		gate, oldOutput, newOutput, changed = false;

	// Recalculate all the gates in the section that changed, keeping track of whether any outputs changed.
	for (var i = 0; i < section.length; i++){
		gate = section[i];
		oldOutput = gate.outputVal;
		newOutput = updateGateOutput([gateIdx[0], gateIdx[1], i]);
		if (newOutput != oldOutput) { changed = true; }
	}

	// If the output of the updated gate changed, update all future gates too.
	if (changed){
		for (var i = gateIdx[1] + 1; i < gateSections.length; i++){
			for (var j = 0; j < gateSections[i].length; j++){
				updateGateOutput([gateIdx[0],i,j]);
			}
		}
	}
}

// Recalculates the output of a particular gate
function updateGateOutput(gateIdx){
	var circuit = circuits[gateIdx[0]],
		gate = circuit.gateSections[gateIdx[1]][gateIdx[2]],
		input1 = gate.inputs[0].val,
		input2 = (gate.inputs.length > 1) ? gate.inputs[1].val : undefined,
		oldOutput = gate.outputVal,
		newOutput;

	// If the gate is empty, or either input is inactive, the output is inactive.
	if (input1 == -1 || input2 == -1 || gate.type == 0){
		newOutput = -1;
	} else {
		newOutput = calculateGateOutput(gate, input1, input2);
	}

	// Update the wire section, and the input values of all the gates this one connects to.
	if (oldOutput != newOutput){
		gate.outputVal = newOutput;
		if (gate.type != gates.bulb){
			// If there is a wire group coming out of this gate, update it's value, and enable/disable animations.
			var wireGroup = circuit.wireSections[gateIdx[1]+1][gateIdx[2]];
			wireGroup.live = newOutput;
			for (var i = 0; i < wireGroup.wires.length; i++){
				var wire = wireGroup.wires[i];
				wire.animations = [];
				wire.live = newOutput;
				if (newOutput == 1){
					wire.animationId = setWireInterval(wire, circuit);
				} else {
					clearInterval(wire.animationId);
					wire.animationId = undefined;
				}
			}
			// Update the inputs of all gates this one connects to.
			for (var i = 0; i < gate.nextGates.length; i++){
				var nextGate = getGate(gate.nextGates[i].gateIdx),
					nextGateInputs = gate.nextGates[i].inputs;
				for (var j = 0; j < nextGateInputs.length; j++){
					nextGate.inputs[nextGateInputs[j]].val = newOutput;
				}
			}
		}
	}

	return gate.outputVal;
}

// Calculates the output of a gate, given its type and inputs.
function calculateGateOutput(gate, input1, input2){
	switch (gate.type){
		case gates.and:
			return (input1 && input2) ? 1 : 0;
		case gates.nand:
			return !(input1 && input2) ? 1 : 0;
		case gates.or:
			return (input1 || input2) ? 1 : 0;
		case gates.nor:
			return !(input1 || input2) ? 1 : 0;
		case gates.xor:
			return (input1 != input2) ? 1 : 0;
		case gates.xnor:
			return (input1 == input2) ? 1 : 0;
		case gates.bulb:
			return (input1 == 1) ? 1 : 0;
	}
}

// Takes an x and y coordinate and looks to see if that point is within the boundaries of one of the gates in the circuits. If it is, that gate index is returned.
function getSelectedGate(x, y, tol){
	if (y > 6*SC){
		// In y range of the whole circuit
		for (var i = 0; i < circuits.length; i++){
			if ((x > circuits[i].startx) && (x < circuits[i].endx)){
				// In x range of the whole circuit
				var circuit = circuits[i];
				for (var j = 0; j < circuit.gateSections.length; j++){
					var section = circuit.gateSections[j];
					if ((x > circuit.startx + section[0].xOffset - tol) && (x < circuit.startx + section[0].xOffset + (4*SC) + tol)){
						// In x range of gate section
						for (var k = 0; k < section.length; k++){
							var gate = section[k];
							if (!gate.fixed && (y > circuit.starty + gate.yOffset - tol) && (y < circuit.starty + gate.yOffset + (4*SC) + tol)){
								// In x and y range of gate
								return gate;
							}
						}
					}
				}
			}
		}
	}
	return null;
}

// Get the gate object for a given gate index.
function getGate(gateIdx){
	return circuits[gateIdx[0]].gateSections[gateIdx[1]][gateIdx[2]];
}

// Finds all the live wires and starts their animation interval
function startWireAnimations(circuit){
	for (var i = 0; i < circuit.wireSections.length; i++){
		var section = circuit.wireSections[i];
		for (var j = 0; j < section.length; j++){
			var group = section[j];
			for (var k = 0; k < group.wires.length; k++){
				var wire = group.wires[k];
				wire.animations = [];
				if (((typeof(group.live) != "undefined") && (group.live == 1)) || (typeof(wire.live) != "undefined") && (wire.live == 1)){
					wire.animationId = setWireInterval(wire, circuit);
				}
			}
		}
	}
	circuit.animated = true;
}

// Finds all the live wires and stops their animation interval
function stopWireAnimations(circuit){
	for (var i = 0; i < circuit.wireSections.length; i++){
		var section = circuit.wireSections[i];
		for (var j = 0; j < section.length; j++){
			var group = section[j];
			for (var k = 0; k < group.wires.length; k++){
				var wire = group.wires[k];
				clearInterval(wire.animationId);
				wire.animationId = undefined;
				wire.animations = [];
			}
		}
	}
	circuit.animated = false;
}

function setWireInterval(wire, circuit){
	// Do the first animation immediately, then start a timer to do it repeatedly.
	drawWireAnimation(wire, circuit);
	var length = Math.abs(wire.x1 - wire.x2) + Math.abs(wire.y1 - wire.y2);
	var interval = 50000 / length;
	return setInterval(drawWireAnimation, interval, wire, circuit);
}
// Prepares a circuit for drawing, by finding the positions of it's gates and wires.
function prepareCircuits(){
	for (var i = 0; i < circuits.length; i++){
		findGatePositions(i);
	}

	for (var i = 0; i < circuits.length; i++){
		findCircuitPosition(i);
		findWirePositions(circuits[i]);
		updateCircuitVoltages([i, 0, 0]);
		stopWireAnimations(circuits[i]);
	}
}

// Populates the circuits array for this level. Takes the order of the circuits for this level in terms of difficulty, and the circuit pool to choose from. For each circuit, chooses randomly from a pool of circuits of that difficulty.
function chooseCircuits(){
	// The JSON parse and stringify is a (slightly hacky) way of copying by val rather than by ref, so the original isn't changed.
	var difficulties = level.circuitDifficulties,
		allPools = JSON.parse(JSON.stringify(level.circuitPool)),
		diffPools = [],
		diff, diffPool, idx;
	circuits = [];

	diffPools[0] = allPools.diff1;
	diffPools[1] = allPools.diff2;
	diffPools[2] = allPools.diff3;
	diffPools[3] = allPools.diff4;
	diffPools[4] = allPools.diff5;

	for (var i = 0; i < difficulties.length; i++){
		// For each circuit, find the correct circuit pool to choose from based on the difficulty.
		diff = difficulties[i];
		diffPool = diffPools[diff-1];

		// Randomly chooses a circuit from diffPool, removes it from the pool, and adds it to circuits.
		idx = Math.floor(Math.random()*(diffPool.length));
		circuits.push(diffPool.splice(idx,1)[0]);

		// Circuits move at different speeds based on their difficulty, so calculate this now.
		circuits[i].speedModifier = (27-diff)/25;
	}

	// Circuits 4 and 8 are always fast circuits, so change these now.
	if (!level.tutorial){
		for (var i = 3; i <= 7; i += 4){
			circuits[i].fast = true;
			circuits[i].speedModifier = circuits[i].speedModifier * 1.5;
		}
	}
}

function findCircuitPosition(idx){
	var y, vertGap,
		circuit = circuits[idx],
		horzGap = 20*SC;

	// Calculate the x position.
	circuit.startx = (idx == 0) ? cvs1.width + 50 :
	 				 (circuits[idx-1].fast) ? circuits[idx-1].startx + 8*SC :
					 (idx == circuits.length-1) ? circuits[idx-1].endx + (2*horzGap) :
					 circuits[idx-1].endx + horzGap;
	circuit.endx = circuit.startx + circuit.width;

	// Calculate the circuit height.
	var height = 0;
	for (var i = 0; i < circuit.gateSections.length; i++){
		height = Math.max(height, circuit.gateSections[i].length);
	}
	height = (height*4*SC) + ((height-1)*4*SC);
	circuit.height = height;

	var isFast = (circuit.fast),
		oneBeforeFast = false,
		twoBeforeFast = false,
		afterFast = false;
	if (idx+1 < circuits.length){
		oneBeforeFast = (circuits[idx+1].fast);
	}
	if (idx+2 < circuits.length){
		twoBeforeFast = (circuits[idx+2].fast);
	}
	if (idx != 0){
		afterFast = (circuits[idx-1].fast);
	}

	var gameAreaHeight = cvs1.height - (6*SC) - 60;
	if (twoBeforeFast){
		do {
			y = Math.round((0.25+(0.5*Math.round(Math.random())))*gameAreaHeight)-(4*SC);
			vertGap = (idx != 0) ? Math.abs(circuits[idx-1].starty - y) : 1000;
		}
		while (vertGap < 6*SC);
	}
	else if (oneBeforeFast && idx != 0){
		y = circuits[idx-1].starty;
	}
	else if ((oneBeforeFast && idx == 0) || isFast){
		do {
			y = Math.round((0.25+(0.5*Math.round(Math.random())))*gameAreaHeight)-(4*SC);
		}
		while (isFast && y == circuits[idx-1].starty);
	}
	else {
		do {
			y = Math.round((0.25+(0.5*Math.random()))*gameAreaHeight)-(4*SC);
			vertGap = (idx != 0) ? Math.abs(circuits[idx-1].starty - y) : 1000;
		}
		while ((afterFast && vertGap < 15*SC) || (!afterFast && vertGap < 8*SC));
	}

	circuit.starty = y;
}

// Finds the x and y positions of every gate in the circuit, and the total width of the circuit.
function findGatePositions(circuitIdx){
	var circuit = circuits[circuitIdx],
		cols = circuit.gateSections;
	for (var i = 0; i < cols.length; i++){
		for (var j = 0; j < cols[i].length; j++){
			var gate = cols[i][j];
			gate.xOffset = (3*SC) + (i*8*SC);
			gate.yOffset = (cols[i].length == 3) ? (j*8*SC) :
						   (cols[i].length == 2) ? (j*8*SC) + (4*SC) :
						   (cols[i].length == 1) ? (8*SC) : 0;

			// While we're here, create/tweak some other properties needed for each gate.
			gate.type = (gate.fixed) ? gate.type : gates.blank;
			gate.invis = false;
			gate.outputVal = -1;
			for (var k = 0; k < gate.nextGates.length; k++){
				if (gate.nextGates[k].gateIdx.length < 3){
					gate.nextGates[k].gateIdx.unshift(circuitIdx);
				}
			}
			for (var k = 0; k < gate.inputs.length; k++){
				if (gate.inputs[k].type == "gate"){
					gate.inputs[k].val = -1;
				}
			}
			gate.idx = [circuitIdx, i, j];
		}
	}
	circuit.width = (cols.length * 8 * SC) - SC;
}

// Finds the x and y positions of every wire in the circuit, and organises them into groups based on which gate output they originate from.
function findWirePositions(circuit){
	var wireSections = [],
		gateSections = circuit.gateSections;

	// For each gate section...
	for (var i = 0; i < gateSections.length-1; i++){
		// Initialise some basic variables.
		var wireSection = [],
			firstWireCol = [],
			wireCols = [],
			signalGroup = {},
			xOffset = gateSections[i][0].xOffset;

		for (var j = 0; j < gateSections[i].length; j++){
			// Create a new group for each gate in this section.
			var gate = gateSections[i][j],
				group = {};
			group.outputGate = [i, j];
			group.live = gate.outputVal;
			group.wires = [];
			wireSection.push(group);
		}

		// Create a new group in this section for any signals.
		signalGroup.signals = [];
		signalGroup.wires = [];
		if (i != gateSections.length-1){
			for (var j = 0; j < gateSections[i+1].length; j++){
				var gate = gateSections[i+1][j];
				for (var k = 0; k < gate.inputs.length; k++){
					if (gate.inputs[k].type == "signal"){
						// Fill in the y positions of the signal and wire. The x position is based on how many columns of vertical wires are in this section, which we don't know yet. This is assigned later.
						var inputY = gate.yOffset + (1*SC) + (k*2*SC),
							signal = {},
							wire = {};

						signal.y = inputY+10;
						signal.val = gate.inputs[k].val;
						signalGroup.signals.push(signal);

						wire.y1 = inputY;
						wire.y2 = inputY;
						wire.x2 = xOffset + (8*SC);
						wire.live = gate.inputs[k].val;

						signalGroup.wires.push(wire);
					}
				}
			}
		}

		// Find all the vertical wires for each gate's wire group. The wireCol arrays are shared between all groups in this wire section, as the total amount of verticals affects the size of the horizontal gap between wires. They will later be split into groups based on the gate they originate from.
		for (var j = 0; j < gateSections[i].length; j++){
			var gate = gateSections[i][j],
				outputY = gate.yOffset + (2*SC),
				inputsY = [];
			// For each gate this output leads to...
			for (var k = 0; k < gate.nextGates.length; k++){
				var nextGate = getGate(gate.nextGates[k].gateIdx),
					nextGateInputs = gate.nextGates[k].inputs;
				// For each input in this gate that this output leads to (usually 1, but could be 2)...
				for (var l = 0; l < nextGateInputs.length; l++){
					if (nextGate.inputs.length != 1){
						// For each input this output leads to, we will need a vertical wire leading to that input's y position.
						var wire = {};
						wire.y2 = nextGate.yOffset + (nextGateInputs[l]*2*SC) + SC;
						wire.gate = j;

						// Checks if there is already a wire in the first column from this group.
						var firstColFree = true,
							firstColIdx;
						for (var m = 0; m < firstWireCol.length; m++){
							if (firstWireCol[m].gate == wire.gate){
								firstColFree = false;
								firstColIdx = m;
							}
						}

						// Finds the length of this wire, and compares it to the length of any wires already in the first column
						var similarLength;
						if (!firstColFree){
							similarLength = (((Math.abs(wire.y2 - outputY)) - (Math.abs(firstWireCol[firstColIdx].y2 - outputY))) < 5);
						}

						// If there is no wire from this group in the first column for this section, or if the gate this wire leads to is the same height as the gate we're starting from, use the first column. Else, create a new column for this wire.
						if (firstColFree || (gate.yOffset == nextGate.yOffset) || similarLength == true){
							firstWireCol.push(wire);
						} else {
							wireCols.push([wire]);
						}
					}
				}
			}
		}

		// Figure out the horizontal gap between vertical wires based on how many vertical wires there are, and if there are signals in this section.
		if (firstWireCol.length > 0){
			wireCols.unshift(firstWireCol);
		}
		var hasSignals = (signalGroup.signals.length > 0);
		var gap = (4*SC) / (wireCols.length+1);

		// Add horizontal wire leading out of gate to each group
		for (var j = 0; j < gateSections[i].length; j++){
			var gate = gateSections[i][j];
			var wire = {};
			wire.x1 = gate.xOffset + (4*SC);
			wire.y1 = gate.yOffset + (2*SC);
			wire.x2 = gate.xOffset + (4*SC) + gap;
			wire.y2 = gate.yOffset + (2*SC);
			wireSection[j].wires.push(wire);
		}

		// Now that we have decided the order in which the vertical wires will go in and the gap between them, calculate their exact positions.
		for (var j = 0; j < wireCols.length; j++){
			for (var k = 0; k < wireCols[j].length; k++){
				var wire = wireCols[j][k];
				// Add a gap between each group of verticals when assigning x position.
				wire.x1 = xOffset + (4*SC) + ((j+1)*gap);
				wire.x2 = xOffset + (4*SC) + ((j+1)*gap);

				// If first column in this section, y1 is the output of the gate. Else, y1 is the y2 of the previous vertical wire in this group.
				if (j == 0){
					wire.y1 = gateSections[i][wire.gate].yOffset + (2*SC);
				} else {
					var y1 = -1,
						count = 1;
					// Go back through previous wire columns in this section until we find a wire in this group.
					while (y1 == -1){
						if ((j-count) >= 0){
							for (var l = 0; l < wireCols[j-count].length; l++){
								if (wireCols[j-count][l].gate == wire.gate){
									y1 = wireCols[j-count][l].y2;
								}
							}
						} else {
							y1 = gateSections[i][wire.gate].yOffset + (2*SC);
						}
						count++;
					}
					wire.y1 = y1;
				}

				// Add this vertical wire to it's corresponding group.
				wireSection[wire.gate].wires.push(wire);

				// Create a horizontal wire leading from this wire's y2 (which is the height of one of the inputs this group must lead to) to the next gate, and add it to this wire's group.
				var hrzWire = {};
				hrzWire.x1 = wireCols[j][k].x1;
				hrzWire.y1 = wireCols[j][k].y2;
				hrzWire.x2 = xOffset + (8*SC);
				hrzWire.y2 = wireCols[j][k].y2;
				wireSection[wireCols[j][k].gate].wires.push(hrzWire);
			}
		}

		// Fill in the x positions of the wires and signals in the signalGroup.
		if (hasSignals){
			for (var j = 0; j < signalGroup.signals.length; j++){
				signalGroup.signals[j].x = xOffset+(8*SC)-gap-6;
				signalGroup.wires[j].x1 = xOffset+(8*SC)-gap+12;
			}
			wireSection.push(signalGroup);
		}

		// Push this section of wires to the circuit's wireSections.
		wireSections.push(wireSection);
	}

	// Remove leftover gate properties on wires.
	for (var i = 0; i < wireSections.length; i++){
		for (var j = 0; j < wireSections[i].length; j++){
			for (var k = 0; k < wireSections[i][j].wires.length; k++){
				if (typeof(wireSections[i][j].wires[k].gate) != "undefined"){
					delete wireSections[i][j].wires[k].gate;
				}
			}
		}
	}

	// Create the starting wire column (signals only) and add to the start of this circuit.
	var firstSection = [{signals : [], wires : []}];
	for (var i = 0; i < gateSections[0].length; i++){
		var gate = gateSections[0][i];
		for (var j = 0; j < 2; j++){
			var inputY = gate.yOffset + (1*SC) + (j*2*SC),
				signal = {},
				wire = {};

			signal.x = SC-6;
			signal.y = inputY+10;
			signal.val = gate.inputs[j].val;
			firstSection[0].signals.push(signal);

			wire.y1 = inputY;
			wire.x1 = SC+12;
			wire.y2 = inputY;
			wire.x2 = 3*SC;
			wire.live = gate.inputs[j].val;
			firstSection[0].wires.push(wire);
		}
	}
	wireSections.unshift(firstSection);

	// Assign the wireSections found to the circuit.
	circuit.wireSections = wireSections;
}
/*
For each output in previous gates column {
	- Find each input it goes to in the next gates column
	- Calculate which one is the closest distance in terms of height
	- Add the line to that input to verticals[0] (if two of same distance, add both)
	- Push the lines to any other inputs to verticals
}

For each item in verticals[0] {
	- Draw horizontal line from prev gate output to x: startx+((i+1)*((4*SC)/(verticals.length+1)))
	- Draw the vertical at that x
	- Draw horizontal line from there to next gate input
}

For all other items in verticals {
	- Draw the vertical at x: startx+((i+1)*((4*SC)/(verticals.length+1)))
	- Draw horizontal line from there to next gate input
}
*/

// Draws all the wire sections of a circuit.
function drawWires(circuit, ctx){
	var startx = circuit.startx;
	var starty = circuit.starty;
	for (var i = 0; i < circuit.wireSections.length; i++){
		var section = circuit.wireSections[i];
		for (var j = 0; j < section.length; j++){
			var group = section[j];
			if (typeof(group.signals) == "undefined"){
				// Draw non-signal groups.
				var live = group.live;
				for (var k = 0; k < group.wires.length; k++){
					var wire = group.wires[k];
					drawWire(
						wire.x1+startx,
						wire.y1+starty,
						wire.x2+startx,
						wire.y2+starty,
						live,
						ctx
					);
				}
			} else {
				// Draw signal group.
				for (var k = 0; k < group.wires.length; k++){
					var wire = group.wires[k];
					drawWire(
						wire.x1+startx,
						wire.y1+starty,
						wire.x2+startx,
						wire.y2+starty,
						wire.live,
						ctx
					);
					var sig = group.signals[k];
					drawSignal(sig.x+startx, sig.y+starty, sig.val, ctx);
				}
			}
		}
	}
}

// Draws a single wire between two points.
function drawWire(x1, y1, x2, y2, live, ctx){
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	switch (live){
		case -1:
			ctx.strokeStyle="#666666";
			ctx.lineWidth = 1;
			break;
		case 0:
			ctx.strokeStyle="#000000";
			ctx.lineWidth = 2;
			break;
		case 1:
			ctx.strokeStyle="#00bfff";
			ctx.lineWidth = 3;
			break;
	}
	ctx.stroke();
	ctx.strokeStyle="#000000";
	ctx.lineWidth = 1;
	ctx.closePath();
	ctx.restore();
}

// Draws an input signal.
function drawSignal(x, y, sig, ctx){
	ctx.save();
	ctx.textAlign = "left";
	ctx.font = "26px Arial";
	ctx.fillStyle = "#000000";
	ctx.fillText(sig, x, y);
	ctx.restore();
}

// Draws a lightning bolt for half a second at a random point along the wire.
function drawWireAnimation(wire, circuit){
	var xOffset, yOffset;
	if (wire.x1 == wire.x2){
		xOffset = wire.x1;
		yOffset = Math.min(wire.y1, wire.y2) + Math.round((Math.random()*Math.abs(wire.y1 - wire.y2)));
	}
	else {
		xOffset = Math.min(wire.x1, wire.x2) + Math.round((Math.random()*Math.abs(wire.x1 - wire.x2)));
		yOffset = wire.y1;
	}

	// Direction variable: 0 = up, 1 = down, 2 = left, 3 = right.
	var direction = Math.round(Math.random());
	direction = (wire.x1 == wire.x2) ? direction + 2 : direction;
	var line1 = {}, line2 = {}, line3 = {};

	if (direction == 0){
		line1.x2 = xOffset - 2;
		line1.y2 = yOffset - 2;
		line2.x2 = xOffset + 2;
		line2.y2 = yOffset - 6;
		line3.x2 = xOffset;
		line3.y2 = yOffset - 8;
	} else if (direction == 1){
		line1.x2 = xOffset + 2;
		line1.y2 = yOffset + 2;
		line2.x2 = xOffset - 2;
		line2.y2 = yOffset + 6;
		line3.x2 = xOffset;
		line3.y2 = yOffset + 8;
	} else if (direction == 2){
		line1.x2 = xOffset - 2;
		line1.y2 = yOffset - 2;
		line2.x2 = xOffset - 6;
		line2.y2 = yOffset + 2;
		line3.x2 = xOffset - 8;
		line3.y2 = yOffset;
	} else if (direction == 3){
		line1.x2 = xOffset + 2;
		line1.y2 = yOffset + 2;
		line2.x2 = xOffset + 6;
		line2.y2 = yOffset - 2;
		line3.x2 = xOffset + 8;
		line3.y2 = yOffset;
	}
	line1.x1 = xOffset;
	line1.y1 = yOffset;
	line2.x1 = line1.x2;
	line2.y1 = line1.y2;
	line3.x1 = line2.x2;
	line3.y1 = line2.y2;

	var lightning = [line1, line2, line3];

	setTimeout(startAnimation, Math.random()*1500)

	function startAnimation(){
		// Check the wire is live again, just in case it changed since the timeout delay.
		if (wire.live == 1){
			wire.animations.push(lightning);
			setTimeout(stopAnimation, 150);
		}
	}

	function stopAnimation(){
		for (var i = 0; i < wire.animations.length; i++){
			if ((wire.animations[i][0].x1 == xOffset) && (wire.animations[i][0].y1 == yOffset)){
				wire.animations.splice(i, 1);
			}
		}
	}
}
// Draws all the gate sections of a circuit.
function drawGates(circuit, ctx){
	for (var i = 0; i < circuit.gateSections.length; i++){
		var section = circuit.gateSections[i];
		for (var j = 0; j < section.length; j++){
			var gate = section[j],
				type = (gate.invis) ? 0 : gate.type;
			drawGate(
				circuit.startx+gate.xOffset,
				circuit.starty+gate.yOffset,
				type,
				gate.inputs,
				gate.outputVal,
				gate.fixed,
				ctx
			);
		}
	}
}

// Draws a logic gate with a dotted line box around it.
function drawGate(x, y, type, inputs, output, fixed, ctx) {
	// Draw the box around the gate.
	if (fixed == 1){
		drawFixedBox(x, y, ctx);
	} else if (fixed == 0) {
		drawDottedBox(x, y, ctx);
	}

	// Get the inputs.
	var input1, input2;
	input1 = inputs[0].val;
	if (inputs.length > 1){
		input2 = inputs[1].val;
	}

	// Draw the actual gate inside the box.
	switch (type){
		case gates.and:
			drawAND(x, y, input1, input2, output, ctx);
			break;
		case gates.nand:
			drawNAND(x, y, input1, input2, output, ctx);
			break;
		case gates.or:
			drawOR(x, y, input1, input2, output, ctx);
			break;
		case gates.nor:
			drawNOR(x, y, input1, input2, output, ctx);
			break;
		case gates.xor:
			drawXOR(x, y, input1, input2, output, ctx);
			break;
		case gates.xnor:
			drawXNOR(x, y, input1, input2, output, ctx);
			break;
		case gates.bulb:
			drawBulb(x, y, input1, ctx);
			break;
	}
}

function drawFixedBox(x, y, ctx){
	ctx.strokeStyle = "#666666";
	ctx.fillStyle = "#DADADA";
	ctx.lineWidth = 1;
	ctx.fillRect(x+0.5, y+0.5, 4*SC, 4*SC);
	ctx.strokeRect(x+0.5, y+0.5, 4*SC, 4*SC);
	ctx.strokeStyle = "#000000";
}

function drawDottedBox(x, y, ctx){
	ctx.strokeStyle = "#000000";
	ctx.setLineDash([5, 3]);
	ctx.lineWidth = 1;
	ctx.strokeRect(x+0.5, y+0.5, 4*SC, 4*SC);
	ctx.setLineDash([]);
}

// Draws the currently selected gate at the position of the mouse cursor, or snapped to a nearby gate.
function drawDraggedGate(){
	var x, y;

	if (selectedGate == null){
		x = mousex;
		y = mousey;
	} else {
		x = circuits[selectedGate.idx[0]].startx + selectedGate.xOffset + (2*SC);
		y = circuits[selectedGate.idx[0]].starty + selectedGate.yOffset + (2*SC);
	}

	// Clear the canvas and draw the correct gate.
	ctx2.clearRect(0, 0, cvs2.width, cvs2.height);
	switch(draggedGate){
		case gates.and:
			drawAND(x-(2*SC), y-(2*SC), 0, 0, 0, ctx2);
			break;
		case gates.nand:
			drawNAND(x-(2*SC), y-(2*SC), 0, 0, 0, ctx2);
			break;
		case gates.or:
			drawOR(x-(2*SC), y-(2*SC), 0, 0, 0, ctx2);
			break;
		case gates.nor:
			drawNOR(x-(2*SC), y-(2*SC), 0, 0, 0, ctx2);
			break;
		case gates.xor:
			drawXOR(x-(2*SC), y-(2*SC), 0, 0, 0, ctx2);
			break;
		case gates.xnor:
			drawXNOR(x-(2*SC), y-(2*SC), 0, 0, 0, ctx2);
			break;
	}
}

//#region - Functions to draw the specific gates.
function drawAND(x, y, input1, input2, output, ctx){
	// Draw the input wires and output wire.
	drawWire(x, y+SC, x+(0.6*SC), y+SC, input1, ctx);
	drawWire(x, y+(3*SC), x+(0.6*SC), y+(3*SC), input2, ctx);
	drawWire(x+(3.5*SC), y+(2*SC), x+(4*SC), y+(2*SC), output, ctx);

	// Draw the gate icon.
	ctx.save();
	ctx.lineWidth = 1.5;
	ctx.fillStyle = "#8080ff"; // blue
	ctx.beginPath();
	ctx.moveTo(x+(0.6*SC), y+(0.4*SC));
	ctx.lineTo(x+(1.6*SC), y+(0.4*SC));
	ctx.bezierCurveTo(x+(4.1*SC), y+(0.4*SC), x+(4.1*SC), y+(3.6*SC), x+(1.6*SC), y+(3.6*SC));
	ctx.lineTo(x+(0.6*SC), y+(3.6*SC));
	ctx.lineTo(x+(0.6*SC), y+(0.4*SC));
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Write the name of the gate.
	ctx.font = (0.8*SC) + "pt Impact";
	ctx.textAlign = "center";
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
	ctx.fillText("AND", x+(1.98*SC), y+(2.4*SC));
	ctx.restore();
}

function drawNAND(x, y, input1, input2, output, ctx){
	// Draw the input wires and output wire.
	drawWire(x, y+SC, x+(0.5*SC), y+SC, input1, ctx);
	drawWire(x, y+(3*SC), x+(0.5*SC), y+(3*SC), input2, ctx);
	drawWire(x+(3.75*SC), y+(2*SC), x+(4*SC), y+(2*SC), output, ctx);

	// Draw the gate icon.
	ctx.save();
	ctx.lineWidth = 1.5;
	ctx.fillStyle = "#ffd280"; // orange
	ctx.beginPath();
	ctx.moveTo(x+(0.5*SC), y+(0.4*SC));
	ctx.lineTo(x+(1.4*SC), y+(0.4*SC));
	ctx.bezierCurveTo(x+(3.9*SC), y+(0.4*SC), x+(3.9*SC), y+(3.6*SC), x+(1.4*SC), y+(3.6*SC));
	ctx.lineTo(x+(0.5*SC), y+(3.6*SC));
	ctx.lineTo(x+(0.5*SC), y+(0.4*SC));
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Draw the circle at the end.
	ctx.beginPath();
	ctx.arc(x+(3.5*SC), y+(2*SC), 0.25*SC, 0, 2*Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Write the name of the gate.
	ctx.font = (0.8*SC) + "pt Impact";
	ctx.textAlign = "center";
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
	ctx.fillText("NAND", x+(1.85*SC), y+(2.4*SC));
	ctx.restore();
}

function drawOR(x, y, input1, input2, output, ctx){
	// Draw the input wires and output wire.
	drawWire(x, y+SC, x+(0.8*SC), y+SC, input1, ctx);
	drawWire(x, y+(3*SC), x+(0.8*SC), y+(3*SC), input2, ctx);
	drawWire(x+(3.5*SC), y+(2*SC), x+(4*SC), y+(2*SC), output, ctx);

	// Draw the gate icon.
	ctx.save();
	ctx.lineWidth = 1.5;
	ctx.fillStyle = "#80ff80"; // green
	ctx.beginPath();
	ctx.moveTo(x+(0.3*SC), y+(0.4*SC));
	ctx.quadraticCurveTo(x+(3*SC), y+(0.4*SC), x+(3.5*SC), y+(2*SC));
	ctx.quadraticCurveTo(x+(3*SC), y+(3.6*SC), x+(0.3*SC), y+(3.6*SC));
	ctx.bezierCurveTo(x+(1.1*SC), y+(3*SC), x+(1.1*SC), y+(1*SC), x+(0.3*SC), y+(0.4*SC));
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Write the name of the gate.
	ctx.font = (0.8*SC) + "pt Impact";
	ctx.textAlign = "center";
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
	ctx.fillText("OR", x+(2.02*SC), y+(2.4*SC));
	ctx.restore();
}

function drawNOR(x, y, input1, input2, output, ctx){
	// Draw the input wires and output wire.
	drawWire(x, y+SC, x+(0.7*SC), y+SC, input1, ctx);
	drawWire(x, y+(3*SC), x+(0.7*SC), y+(3*SC), input2, ctx);
	drawWire(x+(3.75*SC), y+(2*SC), x+(4*SC), y+(2*SC), output, ctx);

	// Draw the gate icon.
	ctx.save();
	ctx.lineWidth = 1.5;
	ctx.fillStyle = "#ff8080"; // red
	ctx.beginPath();
	ctx.moveTo(x+(0.3*SC), y+(0.4*SC));
	ctx.quadraticCurveTo(x+(2.75*SC), y+(0.4*SC), x+(3.25*SC), y+(2*SC));
	ctx.quadraticCurveTo(x+(2.75*SC), y+(3.6*SC), x+(0.3*SC), y+(3.6*SC));
	ctx.bezierCurveTo(x+(1.1*SC), y+(3*SC), x+(1.1*SC), y+(1*SC), x+(0.3*SC), y+(0.4*SC));
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Draw the circle at the end.
	ctx.beginPath();
	ctx.arc(x+(3.5*SC), y+(2*SC), 0.25*SC, 0, 2*Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Write the name of the gate.
	ctx.font = (0.8*SC) + "pt Impact";
	ctx.textAlign = "center";
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
	ctx.fillText("NOR", x+(1.94*SC), y+(2.4*SC));
	ctx.restore();
}

function drawXOR(x, y, input1, input2, output, ctx){
	// Draw the input wires and output wire.
	drawWire(x, y+SC, x+(0.7*SC), y+SC, input1, ctx);
	drawWire(x, y+(3*SC), x+(0.7*SC), y+(3*SC), input2, ctx);
	drawWire(x+(3.5*SC), y+(2*SC), x+(4*SC), y+(2*SC), output, ctx);

	// Draw the gate icon.
	ctx.save();
	ctx.lineWidth = 1.5;
	ctx.fillStyle = "#ffff80"; // yellow
	ctx.beginPath();
	ctx.moveTo(x+(0.6*SC), y+(0.4*SC));
	ctx.quadraticCurveTo(x+(3*SC), y+(0.4*SC), x+(3.5*SC), y+(2*SC));
	ctx.quadraticCurveTo(x+(3*SC), y+(3.6*SC), x+(0.6*SC), y+(3.6*SC));
	ctx.bezierCurveTo(x+(1.4*SC), y+(3*SC), x+(1.4*SC), y+(1*SC), x+(0.6*SC), y+(0.4*SC));
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Draw the extra curved line at the start.
	ctx.beginPath();
	ctx.moveTo(x+(0.3*SC), y+(0.4*SC));
	ctx.bezierCurveTo(x+(1.1*SC), y+(1*SC), x+(1.1*SC), y+(3*SC), x+(0.3*SC), y+(3.6*SC));
	ctx.stroke();
	ctx.closePath();

	// Write the name of the gate.
	ctx.font = (0.8*SC) + "pt Impact";
	ctx.textAlign = "center";
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
	ctx.fillText("XOR", x+(2.25*SC), y+(2.4*SC));
	ctx.restore();
}

function drawXNOR(x, y, input1, input2, output, ctx){
	// Draw the input wires and output wire.
	drawWire(x, y+SC, x+(0.6*SC), y+SC, input1, ctx);
	drawWire(x, y+(3*SC), x+(0.6*SC), y+(3*SC), input2, ctx);
	drawWire(x+(3.75*SC), y+(2*SC), x+(4*SC), y+(2*SC), output, ctx);

	// Draw the gate icon.
	ctx.save();
	ctx.lineWidth = 1.5;
	ctx.fillStyle = "#ff80ff"; // purple
	ctx.beginPath();
	ctx.moveTo(x+(0.45*SC), y+(0.4*SC));
	ctx.quadraticCurveTo(x+(2.65*SC), y+(0.4*SC), x+(3.25*SC), y+(2*SC));
	ctx.quadraticCurveTo(x+(2.65*SC), y+(3.6*SC), x+(0.45*SC), y+(3.6*SC));
	ctx.bezierCurveTo(x+(1.15*SC), y+(3*SC), x+(1.15*SC), y+(1*SC), x+(0.45*SC), y+(0.4*SC));
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Draw the extra curved line at the start.
	ctx.beginPath();
	ctx.moveTo(x+(0.2*SC), y+(0.4*SC));
	ctx.bezierCurveTo(x+(0.9*SC), y+(1*SC), x+(0.9*SC), y+(3*SC), x+(0.2*SC), y+(3.6*SC));
	ctx.stroke();
	ctx.closePath();

	// Draw the circle at the end.
	ctx.beginPath();
	ctx.arc(x+(3.5*SC), y+(2*SC), 0.25*SC, 0, 2*Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Write the name of the gate.
	ctx.font = (0.65*SC) + "pt Impact";
	ctx.textAlign = "center";
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
	ctx.fillText("XNOR", x+(2.05*SC), y+(2.32*SC));
	ctx.restore();
}

function drawBulb(x, y, live, ctx){
	ctx.lineWidth = 2;
	ctx.fillStyle = (live == 1) ? "#FFFF00" : "#F2F2F2";

	ctx.beginPath();
	ctx.moveTo(x+(1.5*SC), y+(2.9*SC));
	ctx.bezierCurveTo(x+(1.5*SC), y+(2.3*SC), x+(1*SC), y+(2.3*SC), x+(1*SC), y+(1.6*SC));
	ctx.arc(x+(2*SC), y+(1.6*SC), 1*SC, Math.PI, 0);
	ctx.bezierCurveTo(x+(3*SC), y+(2.3*SC), x+(2.5*SC), y+(2.3*SC), x+(2.5*SC), y+(2.9*SC));
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.lineWidth = 4;
	ctx.fillStyle = "#CCCCCC";
	ctx.rect(x+(1.4*SC)+1, y+(2.9*SC)+1, (1.2*SC)-2, (0.5*SC)-2);
	ctx.stroke();
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.fillStyle = "#000000";
	ctx.closePath();

	if (live == 1){
		ctx.beginPath();
		ctx.lineWidth = 4;
		ctx.strokeStyle = "#FFFF00";

		// Right side lines
		ctx.moveTo(x+(3.1*SC), y+(1*SC));
		ctx.lineTo(x+(3.6*SC), y+(0.8*SC));
		ctx.moveTo(x+(3.2*SC), y+(1.75*SC));
		ctx.lineTo(x+(3.7*SC), y+(1.75*SC));
		ctx.moveTo(x+(3.1*SC), y+(2.5*SC));
		ctx.lineTo(x+(3.6*SC), y+(2.7*SC));

		// Left side lines
		ctx.moveTo(x+(0.9*SC), y+(1*SC));
		ctx.lineTo(x+(0.4*SC), y+(0.8*SC));
		ctx.moveTo(x+(0.8*SC), y+(1.75*SC));
		ctx.lineTo(x+(0.3*SC), y+(1.75*SC));
		ctx.moveTo(x+(0.9*SC), y+(2.5*SC));
		ctx.lineTo(x+(0.4*SC), y+(2.7*SC));

		ctx.stroke();
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#000000";
		ctx.closePath();
	}
}
//#endregion
// Checks if the user clicked on a gate in the menu bar, and if so, set draggedGate to that gate.
function handleMouseDown(){
	// If player is already holding a gate without holding the mouse down, i.e. they used a hotkey, place that gate.
	if (draggedGate != 0){
		updateSelectedGate();
		handleMouseUp();
	}
}

// Checks if the user is currently dragging a gate, and if they released the mouse over a non-fixed gate in a circuit. If so, update that gate's type and update the circuit's values.
function handleMouseUp(){
	if (draggedGate != 0){
		var gate = getSelectedGate(mousex, mousey, 12),
			chosenGate = draggedGate;

		// Clear all the gate dragging intervals, and clear whatever dragged gate is being drawn.
		clearInterval(updateSelectedInterval);
		clearInterval(drawDraggedInterval);
		updateSelectedInterval = undefined;
		drawDraggedInterval = undefined;
		draggedGate = 0;
		ctx2.clearRect(0, 0, cvs2.width, cvs2.height);

		// If there is a gate at this position, update it with the selected gate.
		if (gate != null){
			gate.type = chosenGate;
			gate.invis = false;
			gate.fixed = true;
			updateCircuitVoltages(gate.idx);
		}

		// Check if all the circuits are now complete, and end the game if so.
		if (currentScreen != screens.gateIntro && checkAllCircuitsComplete()){
			endLevel();
		}
	}
	selectedGate = null;
}

function handleMouseMove(event){
	mousex = event.clientX;
	mousey = event.clientY;
}
var won;

// Checks if the player won or lost, and how many stars they earned, then displays the relevant end dialogue.
function endLevel(){
	if (level.tutorial && circuits[0].gateSections[0][0].outputVal == 1){
		// If in the tutorial level, don't show the endscreen, just continue the tutorial.
		pause = true;
		clearInterval(updateInterval);
		updateInterval = undefined;
		handleTestCircuit();
	} else {
		// Wait for the game to draw one more frame, just to make sure the last circuit has been updated.
		window.requestAnimationFrame(function(){
			window.requestAnimationFrame(function(){
				callback();
			})
		});
	}

	function callback(){
		// Clear all intervals.
		clearIntervals();
		currentScreen = screens.levelEnd;;

		// Counts how many circuits the player got correct.
		circuitsSolved = 0;
		for (var i = 0; i < circuits.length; i++){
			var gateSections = circuits[i].gateSections,
				bulb = gateSections[gateSections.length-1][0];
			if (bulb.outputVal == 1){
				circuitsSolved++;
			}
		}

		// Calculate how many stars the player earned.
		var starsEarned = (level.tutorial) ? 0 :
						  (circuitsSolved == circuits.length) ? 3 :
						  (circuitsSolved >= circuits.length - 2) ? 2 :
						  (circuitsSolved >= circuits.length - 4) ? 1 : 0
		won = (starsEarned > 0);

		if (won){
			// Unlock the next level if they won.
			if (levelIdx < levels.length-1){
				levels[levelIdx+1].unlocked = true;
			}
			// If they earned more stars than they had previously earned for this level, update the stars gained.
			if (level.starsEarned < starsEarned){
				level.starsEarned = starsEarned;
			}
		}

		showEndScreen(circuitsSolved, starsEarned);
	}
}

function showEndScreen(circuitsSolved, starsEarned){
	// Animation to slowly fade the screen.
	var frame = -1;
	var id = setInterval(fadeScreen, 1000/60);

	function fadeScreen(){
		frame++;
		if (frame < 40){
			ctx2.clearRect(0, 0, cvs1.width, cvs1.height);
			ctx2.fillStyle = "rgba(0, 0, 0, " + ((frame/40)*0.8) + ")";
			ctx2.fillRect(0, 0, cvs1.width, cvs1.height);
		} else if (frame == 40){
			ctx2.clearRect(0, 0, cvs1.width, cvs1.height);
			ctx1.fillStyle = "rgba(0, 0, 0, 0.8)";
			ctx1.fillRect(0, 0, cvs1.width, cvs1.height);
		} else if (frame == 80){
			clearInterval(id);
			frame = -1;
			id = setInterval(slideEndMessage, 1000/60);
		}
	}

	var width = won ? 400 : 350;
		height = (starsEarned == 0) ? 240 :
			 	 (starsEarned < 3) ? 304 : 280;
		x = (cvs1.width/2) - (width/2);
		y = -height;
	function slideEndMessage(){
		frame++;
		y = (frame/50) * ((cvs1.height/2)+(height/2)) - height;
		ctx2.clearRect(0, 0, cvs1.width, cvs1.height);
		if (frame < 50){
			drawEndMessage(x, y, circuitsSolved, starsEarned, ctx2);
		} else if (frame == 50){
			drawEndMessage(x, y, circuitsSolved, starsEarned, ctx1);
			clearInterval(id);
			if (won){
				frame = -1;
				starX = x+0.3*width;
				starY = y+height-122;
				ctx2.fillStyle = "#FFFF00";
				ctx2.strokeStyle = "#000000";
				ctx2.lineWidth = 1.5;
				if (starsEarned > 0){
					id = setInterval(animateStars, 1000/60);
				}
			}
		}
	}

	var starX = (cvs1.width/2) - (0.2*width),
		starY = (cvs1.height/2) + (height/2) - 102,
		size;
	function animateStars(){
		// If the user clicks one of the buttons before the animation finishes, clear the interval.
		if (currentScreen != screens.levelEnd){
			clearInterval(id);
		}

		frame++;
		ctx1.save();
		if (frame == 25 || frame == 50 || frame == 75){
			if (starsEarned > frame/25){
				starX += 0.2*width;
			} else {
				clearInterval(id);
			}
		}
		size = (((frame % 25)+1)/25) * 40;
		ctx1.font = size + "pt FontAwesome";
		ctx1.fillStyle = "#FFFF00";
		ctx1.textAlign = "center";
		ctx1.fillText("\uF005", starX, starY+(size/2));
		if (size == 40){
			ctx1.strokeStyle = "#000000";
			ctx1.strokeText("\uF005", starX, starY+(size/2));
		}
		ctx1.restore()
	}
}

function drawEndMessage(x, y, circuitsSolved, starsEarned, ctx){
	var width = won ? 400 : 350;
		height = (starsEarned == 0) ? 240 :
				 (starsEarned < 3) ? 304 : 280;

	// Draw the box.
	ctx.save();
	ctx.lineWidth = 2;
	ctx.fillStyle = "#184E32";
	ctx.beginPath();
	ctx.rect(Math.round(x), Math.round(y), width, height);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// Write the win or lose message.
	var text = won ? "LEVEL " + levelIdx + " COMPLETE!" : "GAME OVER";
	ctx.textAlign = "center";
	ctx.font = "30pt Impact";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(text, x+(width/2)+1, y+71);
	ctx.fillStyle = "#000000";
	ctx.fillText(text, x+(width/2), y+70);

	// Write how many circuits they got right, and how many they need to get right to get the next star.
	ctx.font = "14pt Arial";
	text = "You solved " + circuitsSolved + "/" + circuits.length + " circuits.";
	text = (starsEarned == 0) ? text + " Keep trying!" :
		   (starsEarned == 1) ? text + " Not bad!" :
		   (starsEarned == 2) ? text + " Good job!" : text + " Great work!";
	ctx.fillText(text, x+(width/2), y+112);
	if (circuitsSolved < circuits.length - 4){
		text = "You need " + (circuits.length-4-circuitsSolved) + " more to win the level.";
	}
	else if (circuitsSolved < circuits.length - 2){
		text = "You need " + (circuits.length-2-circuitsSolved) + " more for the next star.";
	}
	else if (circuitsSolved < circuits.length){
		text = "You need " + (circuits.length-circuitsSolved) + " more for the next star.";
	}
	if (starsEarned != 3 && !level.tutorial){
		ctx.fillText(text, x+(width/2), y+134);
	}

	// If the game was won, draw the number of stars earned (empty for now).
	if (won){
		ctx.textAlign = "center";
		ctx.lineWidth = 1.5;
		ctx.font = "40pt FontAwesome"
		for (var i = 0; i < 3; i++){
			ctx.strokeText("\uF005", x+(0.3*width)+(i*0.2*width), y+height-102);
		}
	}

	// Calculate the positions of the retry, menu, and next level buttons.
	ctx.font = "20pt Impact";
	var retryWidth = Math.round(ctx.measureText("RETRY").width) + 20,
		menuWidth = Math.round(ctx.measureText("MENU").width) + 20,
		nextWidth = Math.round(ctx.measureText("NEXT LEVEL").width) + 20,
		retryx, menux, nextx, yOffset;
	if (won && levelIdx != levels.length-1){
		retryx = x + ((width-retryWidth-menuWidth-nextWidth)/4);
		menux = retryx + retryWidth + ((width-retryWidth-menuWidth-nextWidth)/4);
		nextx = menux + menuWidth + ((width-retryWidth-menuWidth-nextWidth)/4);
	} else {
		retryx = x + ((width-retryWidth-menuWidth)/3);
		menux = retryx + retryWidth + ((width-retryWidth-menuWidth)/3);
	}
	yOffset = height - 70.5;

	// Draw the buttons.
	if (ctx == ctx2){
		// If we are using ctx2, this means the box is still in the sliding animation, so just draw the button.
		drawEndScreenButton(["RETRY", retryx, y+yOffset, ctx], false);
		drawEndScreenButton(["MENU", menux, y+yOffset, ctx], false);
		if (won && levelIdx != levels.length-1){
			drawEndScreenButton(["NEXT LEVEL", nextx, y+yOffset, ctx], false);
		}
	} else if (ctx == ctx1){
		// If we are using ctx1, the animation has finished and we want to be able to interact with the buttons. So we create them instead of just drawing.
		createEndScreenButton("RETRY", retryx, y+yOffset);
		createEndScreenButton("MENU", menux, y+yOffset);
		if (won && levelIdx != levels.length-1){
			createEndScreenButton("NEXT LEVEL", nextx, y+yOffset);
		}
	}
	ctx.restore();
}

function drawEndScreenButton(args, selected){
	// Get the values out of the args.
	var text = args[0],
		x = args[1],
		y = args[2],
		ctx = args[3];

	// Calculate the width of this button.
	ctx.save();
	ctx.font = "20pt Impact";
	var btnWidth = Math.round(ctx.measureText(text).width) + 20;

	// Fill over whatever was here before.
	ctx.fillStyle = "#184E32";
	ctx.fillRect(x-4, y-4, btnWidth+8, 48);

	// Draw the retry or menu button.
	ctx.fillStyle = selected ? "#7D9C8D" : "#5D8370";
	ctx.lineWidth = selected ? 3 : 1;
	ctx.fillRect(Math.floor(x)+0.5, Math.floor(y)+0.5, btnWidth, 40);
	ctx.strokeRect(Math.floor(x)+0.5, Math.floor(y)+0.5, btnWidth, 40);
	ctx.textAlign = "center";
	ctx.fillStyle = "#000000";
	ctx.fillText(text, x+(btnWidth/2), y+30);
	ctx.restore();
}

function createEndScreenButton(text, x, y){
	// Calculate the button width.
	ctx1.font = "20pt Impact";
	var btnWidth = Math.round(ctx1.measureText(text).width) + 20;

	// Function to check if the mouse is hovering over this button.
	function checkHover(){
		return (mousex > x && mousex < x+btnWidth && mousey > y && mousey < y+40);
	}

	// Function to be called if this button is clicked.
	function handleClick(){
		// Reset the game state in preparation for the next level.
		resetGameState();
		cvs2.mousedown = undefined;

		// Do what the button says.
		if (text == "RETRY"){
			if (level.tutorial){
				startTutorial();
			} else {
				startLevel(levelIdx);
			}
		} else if (text == "MENU"){
			drawMenu();
		} else if (text == "NEXT LEVEL"){
			startLevel(levelIdx+1);
		}
	}

	// Create the button.
	buttonInterval = createButton(drawEndScreenButton, [text, x, y, ctx1], checkHover, handleClick, [screens.levelEnd]);
}

function clearIntervals(){
	// Clears all circuit animations queued for the next frame.
	for (var i = 0; i < circuits.length; i++){
		if (circuits[i].animationRef != undefined){
			window.cancelAnimationFrame(circuits[i].animationRef);
			circuits[i].animationRef = undefined;
		}
	}

	// Cancel all the intervals and handlers
	while (gateButtonIntervals.length > 0){
		clearInterval(gateButtonIntervals.pop());
	}
	clearInterval(updateSelectedInterval);
	clearInterval(drawDraggedInterval);
	clearInterval(updateInterval);
	clearInterval(gateChangeInterval);
	clearInterval(menuHoverInterval);
	clearInterval(restartHoverInterval);
	updateSelectedInterval = undefined;
	drawDraggedInterval = undefined;
	drawInterval = undefined;
	updateInterval = undefined;
	gateChangeInterval = undefined;
	menuHoverInterval = undefined;
	restartHoverInterval = undefined;
	cvs2.onmousedown = undefined;
	cvs2.onmouseup = undefined;
	document.onkeypress = undefined;
}

function resetGameState(){
	starsEarned = 0;
	draggedGate = 0;
	won = undefined;
	selectedGate = null;
	ctx1.clearRect(0, 0, cvs1.width, cvs1.height);
	ctx2.clearRect(0, 0, cvs1.width, cvs1.height);
	ctx1.textAlign = "left";
}
var tutDialogues = [
	{
		idx : 0,
		topText : "Welcome to Logic Training! This tutorial will teach you what logic gates are, and how to play the game.",
		botText : "This is an empty circuit. The lines either side of the box are wires, each of which has a voltage. The blue wires have voltage 1, and the black wires have voltage 0.",
		drawDiagram : function(x, y){
			drawSignal(x, y+SC+9, 0, ctx1);
			drawSignal(x, y+(3*SC)+9, 1, ctx1);
			drawDottedBox(x+(2*SC), y, ctx1);
			drawWire(x+16, y+SC, x+(2*SC), y+SC, 0, ctx1);
			drawWire(x+16, y+(3*SC), x+(2*SC), y+(3*SC), 1, ctx1);
			drawWire(x+(6*SC), y+(2*SC), x+(8*SC), y+(2*SC), -1, ctx1);
		},
		getDiagramWidth : function () { return (8*SC); },
		getDiagramHeight : function () { return (4*SC); },
		btnText : "CONTINUE"
	},
	{
		idx : 1,
		topText : "So we have two 0 or 1 inputs. To get an output, we need to complete the circuit by putting a logic gate in the empty box. You can click and drag these from the top of the screen, or use numbers 1-6 as hotkeys.",
		botText : "This is what that circuit looks like after we put a gate in it. The output will be either 0 or 1, depending on which gate we used. You'll learn which gates give which outputs later.",
		drawDiagram : function(x, y){
			drawSignal(x, y+SC+9, 0, ctx1);
			drawSignal(x, y+(3*SC)+9, 1, ctx1);
			drawFixedBox(x+(2*SC), y, ctx1);
			drawWire(x+16, y+SC, x+(2*SC), y+SC, 0, ctx1);
			drawWire(x+16, y+(3*SC), x+(2*SC), y+(3*SC), 1, ctx1);
			drawOR(x+(2*SC), y, 0, 1, 1, ctx1);
			drawWire(x+(6*SC), y+(2*SC), x+(8*SC), y+(2*SC), 1, ctx1);
		},
		getDiagramWidth : function () { return (8*SC); },
		getDiagramHeight : function () { return (4*SC); },
		btnText : "CONTINUE"
	},
	{
		idx : 2,
		topText : "Circuits have lightbulbs at the end of them. To turn the lightbulb on and solve the circuit, the wire leading into it must be a 1.",
		botText : "In each level, circuits will slide across the screen from the right. You have to solve 6 to pass, 8 for two stars, and 10 for all three stars! Lets give it a go.",
		drawDiagram : function(x, y){
			drawSignal(x, y+SC+9, 0, ctx1);
			drawSignal(x, y+(3*SC)+9, 1, ctx1);
			drawFixedBox(x+(2*SC), y, ctx1);
			drawWire(x+16, y+SC, x+(2*SC), y+SC, 0, ctx1);
			drawWire(x+16, y+(3*SC), x+(2*SC), y+(3*SC), 1, ctx1);
			drawOR(x+(2*SC), y, 0, 1, 1, ctx1);
			drawWire(x+(6*SC), y+(2*SC), x+(10*SC), y+(2*SC), 1, ctx1);
			drawFixedBox(x+(10*SC), y, ctx1);
			drawBulb(x+(10*SC), y, 1, ctx1);
		},
		getDiagramWidth : function () { return (14*SC); },
		getDiagramHeight : function () { return (4*SC); },
		btnText : "I'M READY"
	},
	{
		idx : 3,
		text : "Drag this gate into the circuit!"
	},
	{
		idx : 4,
		text : "Nice one! When you drag a gate into a circuit, that gate becomes fixed and can't be changed again. This means you only get one attempt per circuit, so think hard before you put a gate in!",
		btnText : "CONTINUE"
	},
	{
		idx : 5,
		topText : "Circuits will often have more than one gate in them, and some that are already fixed. In the circuit below, the output of the first gate is the input for the second gate, which is fixed.",
		botText : "To solve these circuits, think about what output you want the fixed gate to have, and which inputs the fixed gate needs in order to get that output.",
		drawDiagram : function(x, y){
			drawSignal(x, y+SC+9, 0, ctx1);
			drawWire(x+16, y+SC, x+(2*SC), y+SC, 0, ctx1);
			drawSignal(x, y+(3*SC)+9, 1, ctx1);
			drawWire(x+16, y+(3*SC), x+(2*SC), y+(3*SC), 1, ctx1);
			drawDottedBox(x+(2*SC), y, ctx1);
			drawWire(x+(6*SC), y+(2*SC), x+(8*SC), y+(2*SC), -1, ctx1);
			drawWire(x+(8*SC), y+(2*SC), x+(8*SC), y+(1*SC), -1, ctx1);
			drawWire(x+(8*SC), y+(1*SC), x+(10*SC), y+(1*SC), -1, ctx1);
			drawSignal(x+(8*SC)-2, y+(3*SC)+9, 1, ctx1);
			drawWire(x+(8*SC)+12, y+(3*SC), x+(10*SC), y+(3*SC), 1, ctx1);
			drawFixedBox(x+(10*SC), y, ctx1);
			drawAND(x+(10*SC), y, -1, 1, -1, ctx1);
			drawWire(x+(14*SC), y+(2*SC), x+(18*SC), y+(2*SC), -1, ctx1);
			drawFixedBox(x+(18*SC), y, ctx1);
			drawBulb(x+(18*SC), y, -1, ctx1);
		},
		getDiagramWidth : function () { return (22*SC); },
		getDiagramHeight : function () { return (4*SC); },
		btnText : "CONTINUE"
	},
	{
		idx : 6,
		text : "That's all there is to it. You're now ready for level 1, where you'll learn about the AND and NAND gates!",
		btnText : "END TUTORIAL"
	}
]

function startTutorial(){
	startLevel(0);
	pause = true;
	displayTutorialDialogue(0);
}

// Function which writes text to the canvas, wrapping at the desired width. If noPrint is specified, it instead just returns the height of the block of text this function would produce.
function wrapText(ctx, text, x, y, maxWidth, lineHeight, noPrint) {
	var words = text.split(" "),
		line = "",
		lineCount = 1;

	for (var i = 0; i < words.length; i++) {
		var testLine = line + words[i] + " ",
			metrics = ctx.measureText(testLine),
			testWidth = metrics.width;
		if (testWidth > maxWidth && i > 0) {
		  	if (!noPrint) { ctx.fillText(line, x, y); }
		  	line = words[i] + " ";
		  	y += lineHeight;
			lineCount++;
		}
		else {
	  		line = testLine;
		}
	}
	if (!noPrint) { ctx.fillText(line, x, y); }
	return lineCount * lineHeight;
}

// Function to display the tutorial dialogues.
function displayTutorialDialogue(dlgIdx){
	var dlg = tutDialogues[dlgIdx];

	// Calculate the height the dialogue box should be.
	var topTextHeight, botTextHeight, textHeight, boxHeight,
		boxWidth = (dlg.getDiagramWidth == undefined) ? 600 : Math.max(dlg.getDiagramWidth() + 80, 600);
	ctx1.font = "14pt Arial";
	if (dlg.drawDiagram != undefined){
		// If the dialogue box features a diagram and two text boxes, we need to include the height of all of these in the height of the box.
		topTextHeight = wrapText(ctx1, dlg.topText, 0, 0, (0.95*boxWidth), 24, true);
		botTextHeight = wrapText(ctx1, dlg.botText, 0, 0, (0.95*boxWidth), 24, true);
		boxHeight = 15 + topTextHeight + 35 + dlg.getDiagramHeight() + 25 + botTextHeight + 68;
	} else {
		// If the dialogue box doesn't have a diagram, we only need to measure the one text box.
		textHeight = wrapText(ctx1, dlg.text, 0, 0, (0.95*boxWidth), 24, true);
		boxHeight = 15 + textHeight + 58;
	}

	// Calculate the start position of the dialogue box.
	var startx = Math.round((cvs1.width/2) - (boxWidth/2)),
		starty = Math.round((cvs1.height/2) - (boxHeight/2));

	// Draw the rectangle.
	ctx1.beginPath();
	ctx1.lineWidth = 1;
	ctx1.fillStyle = "#2A8958";
	ctx1.rect(startx+0.5, starty+0.5, boxWidth, boxHeight);
	ctx1.fill();
	ctx1.stroke();
	ctx1.closePath();

	// Write the tutorial messages.
	ctx1.font = "14pt Arial";
	ctx1.fillStyle = "#000000";
	ctx1.textAlign = "left";
	if (dlg.text == undefined){
		wrapText(ctx1, dlg.topText, startx+(0.04*boxWidth), starty+39, 0.95*boxWidth, 24);
		wrapText(ctx1, dlg.botText, startx+(0.04*boxWidth), starty+30+topTextHeight+35+dlg.getDiagramHeight()+25+24, 0.95*boxWidth, 24);
	} else {
		wrapText(ctx1, dlg.text, startx+(0.04*boxWidth), starty+39, 0.95*boxWidth, 24);
	}

	// Draw the diagram if there is one.
	if (dlg.drawDiagram != undefined){
		var dgrmX = Math.round(startx+(boxWidth/2)-(dlg.getDiagramWidth()/2)),
			dgrmY = Math.round(starty+20+topTextHeight+35+4);
		ctx1.clearRect(dgrmX-20, dgrmY-20, dlg.getDiagramWidth()+40, dlg.getDiagramHeight()+40);
		ctx1.strokeStyle = "#000000";
		ctx1.lineWidth = 1;
		ctx1.strokeRect(dgrmX-20.5, dgrmY-20.5, dlg.getDiagramWidth()+40, dlg.getDiagramHeight()+40);
		dlg.drawDiagram(dgrmX, dgrmY);
	}

	// Function to call if the button is clicked.
	var btnInterval;
	function handleClick(){
		// Clear this dialogue box and the button interval.
		clearInterval(btnInterval);
		ctx1.clearRect(startx-3, starty-3, boxWidth+6, boxHeight+6);
		cvs2.onmousedown = handleMouseDown;

		if (dlgIdx+1 == 3){
			// If the next dialogue is the 4th one, start the test circuit instead.
			startTestCircuit();
		} else if (dlgIdx+1 < tutDialogues.length){
			// If there is another dialogue, display that.
			displayTutorialDialogue(dlgIdx+1);
		} else {
			// If this is the last dialogue, end the tutorial.
			clearIntervals();
			resetGameState();
			levels[1].unlocked = true;
			drawMenu();
		}
	}

	// Calculate the button width and position.
	ctx1.font = "18pt Impact";
	var btnWidth = ctx1.measureText(dlg.btnText).width,
		btnX = startx + boxWidth - btnWidth - 10,
		btnY = starty + boxHeight - 30;

	// Create the button.
	btnInterval = createTextButton(btnX, btnY, dlg.btnText, 18, "left", "#2A8958", handleClick, [screens.game]);
}

// Scroll a single test circuit across the screen, and show prompts for the player.
function startTestCircuit(){
	dlg = tutDialogues[3];
	// Calculate where the dialogue box should be.
	ctx1.font = "14pt Arial";
	textWidth = ctx1.measureText(dlg.text).width;
	boxWidth = textWidth + 40;
	var startx = Math.floor((cvs1.width/2) - (2.5*SC) - (boxWidth/2)),
		starty = Math.floor((6*SC) + 40);

	// Draw the dialogue box.
	ctx1.beginPath();
	ctx1.lineWidth = 1;
	ctx1.fillStyle = "#2A8958";
	ctx1.rect(startx+0.5, starty+0.5, boxWidth, 34);
	ctx1.fill();
	ctx1.stroke();
	ctx1.closePath();

	// Draw the text in the dialogue box.
	ctx1.fillStyle = "#000000";
	ctx1.textAlign = "left";
	ctx1.fillText(dlg.text, startx + 20, starty + 24);

	// Draw an arrow pointing to the OR gate in the menu bar.
	var x = Math.floor((cvs1.width/2) - (2.5*SC))+0.5,
		y = Math.floor(5.3*SC)+0.5;
	ctx1.fillStyle = "#ff0000";
	ctx1.beginPath();
	ctx1.moveTo(x, y);
	ctx1.lineTo(x-20, y+20);
	ctx1.lineTo(x-8, y+20);
	ctx1.lineTo(x-8, Math.floor(5.6*SC)+40.5);
	ctx1.lineTo(x+8, Math.floor(5.6*SC)+40.5);
	ctx1.lineTo(x+8, y+20);
	ctx1.lineTo(x+20, y+20);
	ctx1.lineTo(x,y);
	ctx1.fill();
	ctx1.stroke();

	// Start moving the circuit
	var gameAreaHeight = cvs1.height - (6*SC) - 60;
	circuits[0].starty = Math.round((0.5*gameAreaHeight)-(4*SC));
	pause = false;
}

// Function to be called when the test circuit is complete - calls the next dialogue rather than ending the level.
function handleTestCircuit(){
	ctx1.clearRect((cvs1.width/2)-200, 6*SC, 400, 100);
	drawMenuBar();
	displayTutorialDialogue(4);
}

// Displays dialogues to introduce and explain any of the 3 gate pairs.
function introduceGates(gate){
	currentScreen = screens.gateIntro;

	// The explanations of the different gates.
	var gateExplanations = [,
		"The AND gate only outputs 1 if both of the inputs are 1. If any of the inputs are 0, the output is 0.",
		"The NAND gate does the exact opposite of the AND gate. If any of the inputs are 0, the output is 1.",
		"The OR gate outputs 1 if either of the inputs are 1. It only outputs 0 if both inputs are 0.",
		"The NOR gate does the exact opposite of the OR gate. It only outputs 1 if both inputs are 0.",
		"The XOR gate only outputs 1 if both the inputs are different. If they are both 0 or both 1, the output is 0.",
		"The XNOR gate does the exact opposite of the XOR gate. It outputs 1 if both inputs are the same.",
		"Congrats on getting to the final level! You'll need to think fast, as the gates you are allowed to use will change as you play. This one is tough, good luck!"
	];

	// Clear the update interval. We're messing with the circuits variable later, and we don't want the game to think we've won or lost because of it.
	clearInterval(updateInterval);
	updateInterval = undefined;

	// Calculate box size and position.
	ctx1.font = "14pt Arial";
	var width = (gate != 7) ? 380 + (18*SC) : 550,
		textHeight = wrapText(ctx1, gateExplanations[gate], 500, 500, 0.9*width, 26, true),
		height = (gate != 7) ? 210+textHeight+(18*SC) : 146+textHeight,
		startx = Math.round((cvs1.width/2)-(width/2)),
		starty = Math.round((cvs1.height/2)-(height/2));

	// Draw the rectangle.
	ctx1.fillStyle = "#2A8958";
	ctx1.lineWidth = 2;
	ctx1.fillRect(startx, starty, width, height);
	ctx1.strokeRect(startx, starty, width, height);

	// Draw the title.
	var name = Object.keys(gates)[gate].toUpperCase(),
		text = (gate != 7) ? "New gate: " + name : "New mechanic: GATE CHANGES";
	ctx1.font = "30pt Impact";
	ctx1.textAlign = "center";
	ctx1.fillStyle = "#FFFFFF";
	ctx1.fillText(text, (cvs1.width/2)+1, starty+63);
	ctx1.fillStyle = "#000000";
	ctx1.fillText(text, (cvs1.width/2), starty+62);

	if (gate != 7){
		// Store the heights and widths of the icon, table, and examples.
		var iconWidth = 4*SC,
			iconHeight = 4*SC,
			tableWidth = 160,
			tableHeight = 146,
			examplesWidth = 18*SC,
			examplesHeight = 18*SC;

		// Calculate the positions of the icon, table, and examples.
		var tableX = Math.round(startx + ((width-tableWidth-examplesWidth)/3)),
			examplesX = Math.round(tableX + tableWidth + ((width-tableWidth-examplesWidth)/3)),
			iconX = Math.round(tableX + ((tableWidth-iconWidth)/2)),
			examplesY = Math.round(starty + 100),
			iconY = Math.round(examplesY + ((examplesHeight+22-iconHeight-tableHeight-40)/3)),
			tableY = Math.round(iconY + iconHeight + 22 + ((examplesHeight+22-iconHeight-tableHeight-40)/3));

		// Draw the gate icon.
		ctx1.lineWidth = 1;
		ctx1.clearRect(iconX, iconY, 4*SC, 4*SC);
		ctx1.strokeRect(iconX-0.5, iconY-0.5, (4*SC)+1, (4*SC)+1);
		drawGate(iconX, iconY, gate, [{val:0}, {val:0}], 0, -1, ctx1);
		ctx1.font = "12pt Arial";
		ctx1.fillStyle = "#000000";
		ctx1.fillText("Icon", iconX+(iconWidth/2), iconY+iconHeight+22);

		// Draw the truth table
		drawTruthTable(tableX, tableY, gate);
		ctx1.font = "12pt Arial";
		ctx1.fillText("Truth Table", tableX+(tableWidth/2), tableY+tableHeight+22);

		// Draw the example circuits.
		drawExampleCircuits(gate, examplesX, examplesY);
		ctx1.font = "12pt Arial";
		ctx1.fillText("Examples", examplesX+(examplesWidth/2), examplesY+examplesHeight+22);
	}

	// Write the explanation of how the gate works.
	ctx1.font = "14pt Arial";
	ctx1.fillStyle = "#000000";
	ctx1.textAlign = "center";
	wrapText(ctx1, gateExplanations[gate], cvs1.width/2, starty+height-textHeight-36, 0.9*width, 26)

	// Function to call when the button is clicked.
	var buttonInterval;
	function handleClick(){
		// Clear the dialogue box and this interval.
		ctx1.clearRect(startx-3, starty-3, width+6, height+6);
		clearInterval(buttonInterval);

		// Display the next gate introduction, or start the game.
		if (gate % 2 == 1 && !level.introduceGateChanges){
			introduceGates(gate+1);
		} else {
			// We changed this levels circuits when drawing the examples, so we need to reset them.
			chooseCircuits();
			prepareCircuits();

			// Start the game.
			currentScreen = screens.game;
			cvs2.onmousedown = handleMouseDown;
			updateInterval = setInterval(updateGame, 1000/60);
			pause = false;
			if (level.introduceGateChanges){
				gateChangeInterval = setInterval(changeLockedGates, 18000);
			}
		}
	}

	// Calculate the button width and position.
	ctx1.font = "18pt Impact";
	var text = (gate % 2 == 0 || level.introduceGateChanges) ? "START LEVEL" : "CONTINUE",
		btnWidth = ctx1.measureText(text).width,
		btnX = startx + width - btnWidth - 10,
		btnY = starty + height - 30;

	// Create the button.
	buttonInterval = createTextButton(btnX, btnY, text, 18, "left", "#2A8958", handleClick, [screens.gateIntro]);
}

function drawTruthTable(x, y, gate){
	// Clear a rectangle.
	ctx1.lineWidth = 1;
	ctx1.clearRect(x, y, 160, 146);
	ctx1.strokeRect(x-0.5, y-0.5, 161, 147);

	// Draw the separating lines.
	ctx1.beginPath();
	ctx1.moveTo(x, y+30.5);
	ctx1.lineTo(x+160, y+30.5);
	ctx1.moveTo(x+80.5, y);
	ctx1.lineTo(x+80.5, y+146);
	ctx1.stroke();
	ctx1.closePath();

	// Draw the inputs and outputs text.
	ctx1.font = "14pt Arial";
	ctx1.textAlign = "center";
	ctx1.fillStyle = "#000000";
	ctx1.fillText("Inputs", x+40, y+22);
	ctx1.fillText("Output", x+120, y+22);

	// Fill in the inputs.
	ctx1.fillText("1     1", x+40, y+54);
	ctx1.fillText("1     0", x+40, y+81);
	ctx1.fillText("0     1", x+40, y+108);
	ctx1.fillText("0     0", x+40, y+135);

	// Fill in the outputs.
	var output1 = (gate == gates.and || gate == gates.or || gate == gates.xnor) ? 1 : 0,
		output2 = (gate == gates.or || gate == gates.nand || gate == gates.xor) ? 1 : 0,
		output3 = (gate == gates.nand || gate == gates.nor || gate == gates.xnor) ? 1 : 0;
	ctx1.fillText(output1, x+120, y+54);
	ctx1.fillText(output2, x+120, y+81);
	ctx1.fillText(output2, x+120, y+108);
	ctx1.fillText(output3, x+120, y+135);
}

// Draw 3 example circuits with the given gate.
function drawExampleCircuits(gateType, x, y){
	// Clear the rectangle where the circuits will be drawn.
	ctx1.clearRect(x, y, 18*SC, 18*SC);
	ctx1.lineWidth = 1;
	ctx1.strokeStyle = "#000000";
	ctx1.strokeRect(x-0.5, y-0.5, (18*SC)+1, (18*SC)+1);

	// We need some circuit objects to draw, so we copy them from the difficulty 1 pool.
	circuits = [
		JSON.parse(JSON.stringify(circuitPools[0].all[0])),
		JSON.parse(JSON.stringify(circuitPools[0].all[3])),
		JSON.parse(JSON.stringify(circuitPools[0].all[4])),
	]

	// Do all the calculations on how to draw these circuits.
	prepareCircuits();

	// Move the circuits into the correct position.
	circuits[0].startx = x+SC;
	circuits[0].starty = y-(7*SC);
	circuits[1].startx = x+SC;
	circuits[1].starty = y-SC;
	circuits[2].startx = x+SC;
	circuits[2].starty = y+(5*SC);

	// Put the correct gates into the circuits and update them.
	for (var i = 0; i < 3; i++){
		var gate = circuits[i].gateSections[0][0];
		gate.type = gateType;
		gate.fixed = true;
		updateCircuitVoltages(gate.idx);
	}

	// Draw the circuits.
	drawCircuit(circuits[0], ctx1);
	drawCircuit(circuits[1], ctx1);
	drawCircuit(circuits[2], ctx1);
}
// This contains all of the potential circuits that can appear in the game. They are grouped by difficulty, then subdivided further based on which gates they contain. Each level specifies which pool of circuits to pick from for each difficulty.
var circuitPools = [
	//#region Difficulty 1
	{
		all : [
			//#region - Circuit, 1 Gate
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 1 Gate
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 1 Gate
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 1 Gate
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 1 Gate
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 1 Gate
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
		]
	},
	//#endregion
	//#region Difficulty 2
	{
		andNand : [
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
		],
		orNor : [
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
		],
		xorXnor : [
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.xnor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "gate",
							gate : [0, 0],
						}],
						type : gates.xnor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 2 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.xnor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
		],
		getAndNandOrNor : function(){
			return circuitPools[1].andNand.concat(circuitPools[1].orNor);
		},
		getAll : function(){
			return circuitPools[1].getAndNandOrNor().concat(circuitPools[1].xorXnor);
		}
	},
	//#endregion
	//#region Difficulty 3
	{
		andNand : [
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
		],
		orNor : [
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
		],
		xorXnor : [
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.xnor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.xnor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0],
						}, {
							type : "gate",
							gate : [0, 1],
						}],
						type : gates.xnor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
		],
		getAndNandOrNor : function(){
			return circuitPools[2].andNand.concat(circuitPools[2].orNor);
		},
		getAll : function(){
			return circuitPools[2].getAndNandOrNor().concat(circuitPools[2].xorXnor);
		}
	},
	//#endregion
	//#region Difficulty 4
	{
		onlyAndNand : [
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1,
						}, {
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "gate",
							gate : [0, 0]
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}, {
							type : "signal",
							val : 1,
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1,
						}, {
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "gate",
							gate : [0, 0]
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}, {
							type : "signal",
							val : 1,
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1,
						}, {
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "gate",
							gate : [0, 0]
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [1, 0],
						}, {
							type : "signal",
							val : 1,
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			}
			//#endregion
		],
		mixedAndNandOrNor : [
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 0,
						}, {
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 0,
						}, {
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1,
						}, {
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region - Circuit, 3 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}], [{
						inputs : [{
							type : "signal",
							val : 1,
						}, {
							type : "gate",
							gate : [1, 0],
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}], [{
						inputs : [{
							type : "gate",
							gate : [2, 0],
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
		],
		getMixedAll : function(){
			return circuitPools[3].mixedAndNandOrNor.concat([
				//#region - Circuit, 3 Gates
				{
					gateSections : [
						[{
							inputs : [{
								type : "signal",
								val : 1
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.blank,
							fixed : false,
							nextGates : [{
								gateIdx : [1, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [0, 0]
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.xnor,
							fixed : true,
							nextGates : [{
								gateIdx : [2, 0],
								inputs : [1]
							}]
						}], [{
							inputs : [{
								type : "signal",
								val : 0,
							}, {
								type : "gate",
								gate : [1, 0],
							}],
							type : gates.or,
							fixed : true,
							nextGates : [{
								gateIdx : [3, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [2, 0],
							}],
							type : gates.bulb,
							fixed : true,
							nextGates : []
						}]
					]
				},
				//#endregion
				//#region - Circuit, 3 Gates
				{
					gateSections : [
						[{
							inputs : [{
								type : "signal",
								val : 0
							}, {
								type : "signal",
								val : 0
							}],
							type : gates.blank,
							fixed : false,
							nextGates : [{
								gateIdx : [1, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [0, 0]
							}, {
								type : "signal",
								val : 0
							}],
							type : gates.xor,
							fixed : true,
							nextGates : [{
								gateIdx : [2, 0],
								inputs : [1]
							}]
						}], [{
							inputs : [{
								type : "signal",
								val : 0,
							}, {
								type : "gate",
								gate : [1, 0],
							}],
							type : gates.nor,
							fixed : true,
							nextGates : [{
								gateIdx : [3, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [2, 0],
							}],
							type : gates.bulb,
							fixed : true,
							nextGates : []
						}]
					]
				},
				//#endregion
				//#region - Circuit, 3 Gates
				{
					gateSections : [
						[{
							inputs : [{
								type : "signal",
								val : 0
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.blank,
							fixed : false,
							nextGates : [{
								gateIdx : [1, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [0, 0]
							}, {
								type : "signal",
								val : 0
							}],
							type : gates.nor,
							fixed : true,
							nextGates : [{
								gateIdx : [2, 0],
								inputs : [1]
							}]
						}], [{
							inputs : [{
								type : "signal",
								val : 0,
							}, {
								type : "gate",
								gate : [1, 0],
							}],
							type : gates.xor,
							fixed : true,
							nextGates : [{
								gateIdx : [3, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [2, 0],
							}],
							type : gates.bulb,
							fixed : true,
							nextGates : []
						}]
					]
				},
				//#endregion
				//#region - Circuit, 3 Gates
				{
					gateSections : [
						[{
							inputs : [{
								type : "signal",
								val : 0
							}, {
								type : "signal",
								val : 0
							}],
							type : gates.blank,
							fixed : false,
							nextGates : [{
								gateIdx : [1, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [0, 0]
							}, {
								type : "signal",
								val : 0
							}],
							type : gates.or,
							fixed : true,
							nextGates : [{
								gateIdx : [2, 0],
								inputs : [1]
							}]
						}], [{
							inputs : [{
								type : "signal",
								val : 1,
							}, {
								type : "gate",
								gate : [1, 0],
							}],
							type : gates.xnor,
							fixed : true,
							nextGates : [{
								gateIdx : [3, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [2, 0],
							}],
							type : gates.bulb,
							fixed : true,
							nextGates : []
						}]
					]
				},
				//#endregion
				//#region - Circuit, 3 Gates
				{
					gateSections : [
						[{
							inputs : [{
								type : "signal",
								val : 1
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.blank,
							fixed : false,
							nextGates : [{
								gateIdx : [1, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [0, 0]
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.nand,
							fixed : true,
							nextGates : [{
								gateIdx : [2, 0],
								inputs : [1]
							}]
						}], [{
							inputs : [{
								type : "signal",
								val : 0,
							}, {
								type : "gate",
								gate : [1, 0],
							}],
							type : gates.xor,
							fixed : true,
							nextGates : [{
								gateIdx : [3, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [2, 0],
							}],
							type : gates.bulb,
							fixed : true,
							nextGates : []
						}]
					]
				},
				//#endregion
				//#region - Circuit, 3 Gates
				{
					gateSections : [
						[{
							inputs : [{
								type : "signal",
								val : 0
							}, {
								type : "signal",
								val : 0
							}],
							type : gates.blank,
							fixed : false,
							nextGates : [{
								gateIdx : [1, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [0, 0]
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.and,
							fixed : true,
							nextGates : [{
								gateIdx : [2, 0],
								inputs : [1]
							}]
						}], [{
							inputs : [{
								type : "signal",
								val : 0,
							}, {
								type : "gate",
								gate : [1, 0],
							}],
							type : gates.xnor,
							fixed : true,
							nextGates : [{
								gateIdx : [3, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [2, 0],
							}],
							type : gates.bulb,
							fixed : true,
							nextGates : []
						}]
					]
				},
				//#endregion
				//#region - Circuit, 3 Gates
				{
					gateSections : [
						[{
							inputs : [{
								type : "signal",
								val : 0
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.blank,
							fixed : false,
							nextGates : [{
								gateIdx : [1, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [0, 0]
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.xnor,
							fixed : true,
							nextGates : [{
								gateIdx : [2, 0],
								inputs : [1]
							}]
						}], [{
							inputs : [{
								type : "signal",
								val : 1,
							}, {
								type : "gate",
								gate : [1, 0],
							}],
							type : gates.and,
							fixed : true,
							nextGates : [{
								gateIdx : [3, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [2, 0],
							}],
							type : gates.bulb,
							fixed : true,
							nextGates : []
						}]
					]
				},
				//#endregion
				//#region - Circuit, 3 Gates
				{
					gateSections : [
						[{
							inputs : [{
								type : "signal",
								val : 0
							}, {
								type : "signal",
								val : 0
							}],
							type : gates.blank,
							fixed : false,
							nextGates : [{
								gateIdx : [1, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [0, 0]
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.xor,
							fixed : true,
							nextGates : [{
								gateIdx : [2, 0],
								inputs : [1]
							}]
						}], [{
							inputs : [{
								type : "signal",
								val : 1,
							}, {
								type : "gate",
								gate : [1, 0],
							}],
							type : gates.nand,
							fixed : true,
							nextGates : [{
								gateIdx : [3, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [2, 0],
							}],
							type : gates.bulb,
							fixed : true,
							nextGates : []
						}]
					]
				},
				//#endregion
			])
		}
	},
	//#endregion
	//#region Difficulty 5
	{
		mixedAll : [
			//#region Circuit, 5 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}, {
							gateIdx : [1, 1],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 1],
							inputs : [1]
						}, {
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "gate",
							gate : [0, 1]
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "gate",
							gate : [0, 1]
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [1, 0]
						}, {
							type : "gate",
							gate : [1, 1]
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [2, 0]
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region Circuit, 5 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}, {
							gateIdx : [1, 1],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 1],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "gate",
							gate : [0, 0]
						}],
						type : gates.xnor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "gate",
							gate : [0, 1]
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [1, 0]
						}, {
							type : "gate",
							gate : [1, 1]
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [2, 0]
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region Circuit, 5 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0, 1]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 1],
							inputs : [0]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "gate",
							gate : [0, 0]
						}],
						type : gates.xnor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [1, 0]
						}, {
							type : "gate",
							gate : [1, 1]
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [2, 0]
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region Circuit, 5 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}, {
							gateIdx : [1, 1],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 1],
							inputs : [1]
						}, {
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "gate",
							gate : [0, 1]
						}],
						type : gates.nand,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "gate",
							gate : [0, 1]
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [1, 0]
						}, {
							type : "gate",
							gate : [1, 1]
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [2, 0]
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region Circuit, 5 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [0]
						}, {
							gateIdx : [1, 1],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 1
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 1],
							inputs : [1]
						}, {
							gateIdx : [1, 0],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "gate",
							gate : [0, 1]
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "gate",
							gate : [0, 1]
						}],
						type : gates.and,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [1, 0]
						}, {
							type : "gate",
							gate : [1, 1]
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [2, 0]
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			},
			//#endregion
			//#region Circuit, 5 Gates
			{
				gateSections : [
					[{
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 0],
							inputs : [1]
						}, {
							gateIdx : [1, 1],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "signal",
							val : 0
						}, {
							type : "signal",
							val : 0
						}],
						type : gates.blank,
						fixed : false,
						nextGates : [{
							gateIdx : [1, 1],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "signal",
							val : 1
						}, {
							type : "gate",
							gate : [0, 0]
						}],
						type : gates.nor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [0]
						}]
					}, {
						inputs : [{
							type : "gate",
							gate : [0, 0]
						}, {
							type : "gate",
							gate : [0, 1]
						}],
						type : gates.xor,
						fixed : true,
						nextGates : [{
							gateIdx : [2, 0],
							inputs : [1]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [1, 0]
						}, {
							type : "gate",
							gate : [1, 1]
						}],
						type : gates.or,
						fixed : true,
						nextGates : [{
							gateIdx : [3, 0],
							inputs : [0]
						}]
					}],
					[{
						inputs : [{
							type : "gate",
							gate : [2, 0]
						}],
						type : gates.bulb,
						fixed : true,
						nextGates : []
					}]
				]
			}
			//#endregion
		]
	}
	//#endregion
]

// Contains all the information about the levels: Whether it is unlocked or not; how many stars have been earned for that level; which gates are allowed; whether gate changes are enabled; whether the level introduces new gates; how difficult each circuit is, and which pools of circuits to choose from.
var levels = [
	//#region Level 0 - Tutorial
	{
		tutorial : true,
		unlocked : true,
		allowedGates : [3],
		circuitDifficulties : [1],
		circuitPool : {
			diff1 : [
				//#region - Tutorial Circuit
				{
					gateSections : [
						[{
							inputs : [{
								type : "signal",
								val : 1
							}, {
								type : "signal",
								val : 1
							}],
							type : gates.blank,
							fixed : false,
							nextGates : [{
								gateIdx : [1, 0],
								inputs : [0]
							}]
						}], [{
							inputs : [{
								type : "gate",
								gate : [0, 0],
							}],
							type : gates.bulb,
							fixed : true,
							nextGates : []
						}]
					]
				}
				//#endregion
			]
		}
	},
	//#endregion

	//#region Level 1 - AND/NAND, Easy
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [1, 2],
		newGates : true,
		circuitDifficulties : [1, 1, 1, 2, 1, 2, 1, 2, 1, 3],
		circuitPool : {
			diff1 : circuitPools[0].all,
			diff2 : circuitPools[1].andNand,
			diff3 : circuitPools[2].andNand
		}
	},
	//#endregion

	//#region Level 2 - AND/NAND, Medium
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [1, 2],
		circuitDifficulties : [2, 2, 2, 3, 2, 3, 2, 3, 2, 4],
		circuitPool : {
			diff2 : circuitPools[1].andNand,
			diff3 : circuitPools[2].andNand,
			diff4 : circuitPools[3].onlyAndNand
		}
	},
	//#endregion

	//#region Level 3 - OR/NOR, Easy
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [3,4],
		newGates : true,
		circuitDifficulties : [1, 1, 1, 2, 1, 2, 1, 2, 1, 3],
		circuitPool : {
			diff1 : circuitPools[0].all,
			diff2 : circuitPools[1].orNor,
			diff3 : circuitPools[2].orNor
		}
	},
	//#endregion

	//#region Level 4 - OR/NOR, Medium
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [3,4],
		circuitDifficulties : [2, 2, 2, 3, 2, 3, 2, 3, 2, 4],
		circuitPool : {
			diff2 : circuitPools[1].getAndNandOrNor(),
			diff3 : circuitPools[2].getAndNandOrNor(),
			diff4 : circuitPools[3].mixedAndNandOrNor,
		}
	},
	//#endregion

	//#region Level 5 - XOR/XNOR, Easy
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [5,6],
		newGates : true,
		circuitDifficulties : [1, 1, 1, 2, 1, 2, 1, 2, 1, 3],
		circuitPool : {
			diff1 : circuitPools[0].all,
			diff2 : circuitPools[1].xorXnor,
			diff3 : circuitPools[2].xorXnor
		}
	},
	//#endregion

	//#region Level 6 - XOR/XNOR, Medium
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [5,6],
		circuitDifficulties : [2, 2, 2, 3, 2, 3, 2, 3, 2, 4],
		circuitPool : {
			diff2 : circuitPools[1].getAll(),
			diff3 : circuitPools[2].getAll(),
			diff4 : circuitPools[3].getMixedAll()
		}
	},
	//#endregion

	//#region Level 7 - AND/NAND, Hard
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [1,2],
		circuitDifficulties : [3, 3, 3, 4, 2, 3, 3, 4, 2, 5],
		circuitPool : {
			diff2 : circuitPools[1].getAll(),
			diff3 : circuitPools[2].getAll(),
			diff4 : circuitPools[3].getMixedAll(),
			diff5 : circuitPools[4].mixedAll
		}
	},
	//#endregion

	//#region Level 8 - OR/NOR, Hard
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [3,4],
		circuitDifficulties : [3, 3, 3, 4, 2, 3, 3, 4, 2, 5],
		circuitPool : {
			diff2 : circuitPools[1].getAll(),
			diff3 : circuitPools[2].getAll(),
			diff4 : circuitPools[3].getMixedAll(),
			diff5 : circuitPools[4].mixedAll
		}
	},
	//#endregion

	//#region Level 9 - XOR/XNOR, Hard
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [5,6],
		circuitDifficulties : [3, 3, 3, 4, 2, 3, 3, 4, 2, 5],
		circuitPool : {
			diff2 : circuitPools[1].getAll(),
			diff3 : circuitPools[2].getAll(),
			diff4 : circuitPools[3].getMixedAll(),
			diff5 : circuitPools[4].mixedAll
		}
	},
	//#endregion

	//#region Level 10 - Gate changes, Hard
	{
		unlocked : false,
		starsEarned : 0,
		allowedGates : [1,2,3,4,5,6],
		introduceGateChanges : true,
		enableGateChanges : true,
		circuitDifficulties : [3, 3, 3, 4, 2, 3, 3, 4, 2, 5],
		circuitPool : {
			diff2 : circuitPools[1].getAll(),
			diff3 : circuitPools[2].getAll(),
			diff4 : circuitPools[3].getMixedAll(),
			diff5 : circuitPools[4].mixedAll
		}
	},
	//#endregion
]
