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
