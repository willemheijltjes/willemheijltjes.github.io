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
