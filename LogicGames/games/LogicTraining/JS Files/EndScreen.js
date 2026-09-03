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
