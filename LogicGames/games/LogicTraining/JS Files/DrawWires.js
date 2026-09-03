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
