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
