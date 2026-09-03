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
