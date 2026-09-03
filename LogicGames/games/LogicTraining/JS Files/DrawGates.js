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
