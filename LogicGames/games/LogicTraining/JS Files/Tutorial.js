var currentTutDialogue,
	tutDialogues = [
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
	var buttonInterval;
	function handleClick(){
		// Clear this dialogue box and the button interval.
		ctx1.clearRect(startx-3, starty-3, boxWidth+6, boxHeight+6);
		clearInterval(buttonInterval);
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
	buttonInterval = createTextButton(btnX, btnY, dlg.btnText, 18, "left", "#2A8958", handleClick, [screens.game]);
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
