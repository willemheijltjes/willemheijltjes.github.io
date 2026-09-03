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
