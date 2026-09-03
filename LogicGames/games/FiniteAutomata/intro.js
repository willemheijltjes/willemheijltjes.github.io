// Minimal variables and functions needed as not interactive.
var canvas;
var ctx;
var crad = 25;
var part = 0;
var WIDTH = 700;
var HEIGHT = 500;
var angle;
var arrowHead;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

function redraw(){
	//clear canvas
	ctx.clearRect(0, 0, WIDTH, HEIGHT);

	ctx.fillStyle = "#FAF7F8";
	
	ctx.beginPath();
	ctx.rect(0,0,WIDTH,HEIGHT);
	ctx.closePath();
	ctx.fill();

	
	//draw start arrow
	ctx.strokeStyle = 'grey';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(15, 240);
	ctx.lineTo(75-(crad), 240);
	ctx.stroke();
	drawArrowHead(15,240,75-(crad),240,20);

	//draw start state
	ctx.lineWidth   = 3;
	ctx.beginPath();
	ctx.arc(75,240,crad,0,2*Math.PI);
	ctx.closePath();

	ctx.stroke();
}

function roundRect(x, y, w, h, r) {

	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	ctx.strokeStyle = "black";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	ctx.arcTo(x+w, y,   x+w, y+h, r);
	ctx.arcTo(x+w, y+h, x,   y+h, r);
	ctx.arcTo(x,   y+h, x,   y,   r);
	ctx.arcTo(x,   y,   x+w, y,   r);
	ctx.closePath();
	ctx.fillStyle="#FFA500";
	ctx.fill();
	ctx.stroke();
}

function drawArrowHead(fromx, fromy, tox, toy, arrowHead){
	angle = Math.atan2(toy-fromy,tox-fromx);
	
	ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-arrowHead*Math.cos(angle-Math.PI/6),toy-arrowHead*Math.sin(angle-Math.PI/6));
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(tox, toy);
    ctx.lineTo(tox-arrowHead*Math.cos(angle+Math.PI/6),toy-arrowHead*Math.sin(angle+Math.PI/6));
	ctx.stroke();
}

function drawArrowStraight(fromx, fromy, tox, toy){
    arrowHead = 20;

	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.stroke();
	
	drawArrowHead(fromx, fromy, tox, toy, arrowHead);
	halfX = (fromx+tox)/2;
	halfY = (fromy+toy)/2;
	ctx.lineWidth = 1;
}

function drawAlpha(xSpot, ySpot, letter){

	ctx.fillStyle = 'black';
	ctx.beginPath();
	ctx.arc(xSpot,ySpot,10,0,2*Math.PI);
	ctx.closePath();	
	ctx.fill();
	
	ctx.font="20px Georgia";
	ctx.fillStyle = 'white';
	ctx.textAlign="center"; 
	ctx.fillText(letter,xSpot,ySpot+5);
}

function blackStartState(){
	//draw start arrow
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(15, 240);
	ctx.lineTo(75-(crad), 240);
	ctx.stroke();
	drawArrowHead(15,240,75-(crad),240,20);

	//draw start state
	ctx.lineWidth   = 3;
	ctx.beginPath();
	ctx.arc(75,240,crad,0,2*Math.PI);
	ctx.closePath();

	ctx.stroke();
	
}

function nextBut(){
	part += 1;
	redraw();
	if (part==1){
		
		//disable first button
		document.getElementById("statesBut").src = "images/statesDis.png";
		//enable second button
		document.getElementById("arrowBut").src = "images/arrow.png";
		roundRect(80,50,200,100,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Select this tool to",90,80);
		ctx.fillText("create connections",90,105);
		ctx.fillText("between states.",90,130);
		drawArrowStraight(100,50,100,10);
		
	} else if (part == 2) {
		
		//disable second button
		document.getElementById("arrowBut").src = "images/arrowDis.png";
		//enable third button
		document.getElementById("binBut").src = "images/bin.png";
		roundRect(140,50,200,110,10);
		ctx.font="18px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Select this tool to remove",145,75);
		ctx.fillText("states/connections from",145,95);
		ctx.fillText("the board.",145,115);
		
		ctx.font="14px Calibri";
		ctx.fillText("(Removing a state also removes",145,135);
		ctx.fillText("all its connections!)",145,150);
		drawArrowStraight(160,50,160,10);
		
	} else if (part == 3){
		
		//disable third button
		document.getElementById("binBut").src = "images/binDis.png";
		//enable fourth button
		document.getElementById("clearBut").src = "images/clear.png";
		roundRect(200,50,200,75,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Clicking on this button",210,80);
		ctx.fillText("clears the board.",210,105);
		drawArrowStraight(220,50,220,10);
		
	} else if (part == 4){
		
		//disable fourth button
		document.getElementById("clearBut").src = "images/clearDis.png";
		//enable level text
		document.getElementById("levelText").style = "color:black";
		
		roundRect(280,50,200,75,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("This shows what level",290,80);
		ctx.fillText("you are on.",290,105);
		drawArrowStraight(300,50,300,10);
		
	} else if (part == 5){
		
		//disable level text
		document.getElementById("levelText").style = "color:grey";
		//enable target text
		document.getElementById("targetTitle").style="color:black;"
		document.getElementById("targetRect").style="color:black; height:50px; display:inline-block; width: auto; font-size: 30px;"
		
		roundRect(420,50,200,130,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("This is your target; the",425,80);
		ctx.fillText("regular expression that",425,105);
		ctx.fillText("your finite automaton",425,130);
		ctx.fillText("should represent.",425,155);
		drawArrowStraight(620,65,690,40);
		
	} else if (part == 6){
		
		//disable target text
		document.getElementById("targetTitle").style="color:grey;"
		document.getElementById("targetRect").style="color:grey; height:50px; display:inline-block; width: auto; font-size: 30px;"
		
		//enable guide text
		document.getElementById("guideTitle").style="color:black;"
		document.getElementById("guideRect").style="color:black; height:90px; width:200px; font-size:15px";
		
		
		roundRect(420,100,200,130,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("These are guide words",425,125);
		ctx.fillText("which you should check",425,150);
		ctx.fillText("are accepted by your",425,175);
		ctx.fillText("diagram before",425,200);
		ctx.fillText("submitting it.",425,222);
		drawArrowStraight(620,155,690,140);
		
		ctx.beginPath();
		ctx.moveTo(520, 230);
		ctx.lineTo(520, 260);
		ctx.stroke();
		
		roundRect(420,260,200,130,10);
		ctx.font="16px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Hint: Following the arrows",425,285);
		ctx.fillText("on your diagram, passing",425,305);
		ctx.fillText("the letters for each word,",425,325);
		ctx.fillText("then seeing if you reach a",425,345);
		ctx.fillText("final state at the end of",425,365);
		ctx.fillText("each word, can be useful!",425,382);
		drawArrowStraight(620,155,690,140);
		
	} else if (part == 7){
		//disable guide text
		document.getElementById("guideTitle").style="color:grey;"
		document.getElementById("guideRect").style="color:grey; height:90px; width:200px; font-size:15px";
		
		//enable submit button
		document.getElementById("doneBut").style.background='#5a8c81';
		
		roundRect(420,200,200,130,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Click this button when",425,225);
		ctx.fillText("you are happy that",425,250);
		ctx.fillText("your diagram matches",425,275);
		ctx.fillText("the target to have it",425,300);
		ctx.fillText("checked.",425,325);
		drawArrowStraight(620,260,690,270);
	
	} else if (part == 8){
		
		//disable submit button
		document.getElementById("doneBut").style.background='#cddcd9';
		
		roundRect(80,50,530,50,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Now let's have a quick look at building finite automata shall we?",85,80);
		
		//set next text to ok
		document.getElementById("nextBut").innerHTML='Ok!';
		
	} else if (part == 9){
		
		document.getElementById("nextBut").innerHTML='Next';
		
		roundRect(80,50,530,50,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Every diagram has a start state, seen here. It'll already be drawn",85,70);
		ctx.fillText("for you.",300,90);
		
		blackStartState();
		
	} else if (part == 10){
		roundRect(80,50,530,50,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Add states and connections to build up your diagram.",135,75);
		
		//start state
		blackStartState();
		
		//new state
		ctx.lineWidth   = 3;
		ctx.beginPath();
		ctx.arc(200,250,crad,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		
	} else if (part == 11){
		roundRect(80,50,530,50,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("To start our diagram off with an 'a', we need to make a",120,70);
		ctx.fillText("connection from the start state.",210,90);
		
		//start state
		blackStartState();
		
		//new state
		ctx.lineWidth   = 3;
		ctx.beginPath();
		ctx.arc(200,250,crad,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		
		//connection
		var fromx = 75;
		var tox = 200;
		var fromy = 240;
		var toy = 250;
		var angP = Math.atan((fromy-toy)/(tox-fromx));
		var changeinx = tox-fromx;
		var lineDiffY = Math.sin(angP)*(crad);
		var lineDiffX = Math.cos(angP)*(crad);
		if (changeinx<0){
			fromx = fromx-lineDiffX;	fromy = fromy+lineDiffY;
			tox = tox+lineDiffX;		toy = toy-lineDiffY;
		} else {
			fromx = fromx+lineDiffX;	fromy = fromy-lineDiffY;
			tox = tox-lineDiffX;		toy = toy+lineDiffY;
		}
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
		drawArrowHead(fromx, fromy, tox, toy, 10);
		halfX = (fromx+tox)/2;
		halfY = (fromy+toy)/2;
		drawAlpha(halfX,halfY,"a");
		
	} else if (part == 12){
		roundRect(80,50,530,50,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Each diagram needs at least one final state- to show a complete",345,70);
		ctx.fillText("word. Right click states to toggle between making them final.",345,90);
		
		//start state
		blackStartState();
		
		//new state
		ctx.lineWidth   = 3;
		ctx.beginPath();
		ctx.arc(200,250,crad,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(200,250,crad-5,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		
		//connection
		var fromx = 75;
		var tox = 200;
		var fromy = 240;
		var toy = 250;
		var angP = Math.atan((fromy-toy)/(tox-fromx));
		var changeinx = tox-fromx;
		var lineDiffY = Math.sin(angP)*(crad);
		var lineDiffX = Math.cos(angP)*(crad);
		if (changeinx<0){
			fromx = fromx-lineDiffX;	fromy = fromy+lineDiffY;
			tox = tox+lineDiffX;		toy = toy-lineDiffY;
		} else {
			fromx = fromx+lineDiffX;	fromy = fromy-lineDiffY;
			tox = tox-lineDiffX;		toy = toy+lineDiffY;
		}
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
		drawArrowHead(fromx, fromy, tox, toy, 10);
		halfX = (fromx+tox)/2;
		halfY = (fromy+toy)/2;
		drawAlpha(halfX,halfY,"a");
		
	} else if (part == 13){
		roundRect(80,50,530,50,10);
		ctx.font="16px Calibri";
		ctx.fillStyle = 'blue';
		
		ctx.fillText("Connections can also be drawn from final states, as words don't HAVE to",345,65);
		ctx.fillText("finish on them- they could carry on, so long as they",350,80);
		ctx.fillText("eventually finish on a final state.",360,95);
		
		//start state
		blackStartState();
		
		//new state
		ctx.lineWidth   = 3;
		ctx.beginPath();
		ctx.arc(200,250,crad,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(200,250,crad-5,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		
		//connection
		var fromx = 75;
		var tox = 200;
		var fromy = 240;
		var toy = 250;
		var angP = Math.atan((fromy-toy)/(tox-fromx));
		var changeinx = tox-fromx;
		var lineDiffY = Math.sin(angP)*(crad);
		var lineDiffX = Math.cos(angP)*(crad);
		if (changeinx<0){
			fromx = fromx-lineDiffX;	fromy = fromy+lineDiffY;
			tox = tox+lineDiffX;		toy = toy-lineDiffY;
		} else {
			fromx = fromx+lineDiffX;	fromy = fromy-lineDiffY;
			tox = tox-lineDiffX;		toy = toy+lineDiffY;
		}
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
		drawArrowHead(fromx, fromy, tox, toy, 10);
		halfX = (fromx+tox)/2;
		halfY = (fromy+toy)/2;
		drawAlpha(halfX,halfY,"a");
	
		//new state
		ctx.lineWidth   = 3;
		ctx.beginPath();
		ctx.arc(400,190,crad,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(400,190,crad-5,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		
		//connection
		fromx = 200;
		fromy = 250;
		tox = 400;
		toy = 190;
		
		angP = Math.atan((fromy-toy)/(tox-fromx));
		changeinx = tox-fromx;
		lineDiffY = Math.sin(angP)*(crad);
		lineDiffX = Math.cos(angP)*(crad);
		
		if (changeinx<0){
			fromx = fromx-lineDiffX;	fromy = fromy+lineDiffY;
			tox = tox+lineDiffX;		toy = toy-lineDiffY;
		} else {
			fromx = fromx+lineDiffX;	fromy = fromy-lineDiffY;
			tox = tox-lineDiffX;		toy = toy+lineDiffY;
		}
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
		drawArrowHead(fromx, fromy, tox, toy, 10);
		halfX = (fromx+tox)/2;
		halfY = (fromy+toy)/2;
		drawAlpha(halfX,halfY,"a");
	
	} else if (part == 14){
		roundRect(80,50,530,50,10);
		ctx.font="20px Calibri";
		ctx.fillStyle = 'blue';
		ctx.fillText("Enough talking about it, let's play!",345,70);
		
		document.getElementById("nextBut").innerHTML='Ok!';
		
		//start state
		blackStartState();
		
		//new state
		ctx.lineWidth   = 3;
		ctx.beginPath();
		ctx.arc(200,250,crad,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(200,250,crad-5,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		
		//connection
		var fromx = 75;
		var tox = 200;
		var fromy = 240;
		var toy = 250;
		var angP = Math.atan((fromy-toy)/(tox-fromx));
		var changeinx = tox-fromx;
		var lineDiffY = Math.sin(angP)*(crad);
		var lineDiffX = Math.cos(angP)*(crad);
		if (changeinx<0){
			fromx = fromx-lineDiffX;	fromy = fromy+lineDiffY;
			tox = tox+lineDiffX;		toy = toy-lineDiffY;
		} else {
			fromx = fromx+lineDiffX;	fromy = fromy-lineDiffY;
			tox = tox-lineDiffX;		toy = toy+lineDiffY;
		}
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
		drawArrowHead(fromx, fromy, tox, toy, 10);
		halfX = (fromx+tox)/2;
		halfY = (fromy+toy)/2;
		drawAlpha(halfX,halfY,"a");
	
		//new state
		ctx.lineWidth   = 3;
		ctx.beginPath();
		ctx.arc(400,190,crad,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(400,190,crad-5,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		
		//connection
		fromx = 200;
		fromy = 250;
		tox = 400;
		toy = 190;
		
		angP = Math.atan((fromy-toy)/(tox-fromx));
		changeinx = tox-fromx;
		lineDiffY = Math.sin(angP)*(crad);
		lineDiffX = Math.cos(angP)*(crad);
		
		if (changeinx<0){
			fromx = fromx-lineDiffX;	fromy = fromy+lineDiffY;
			tox = tox+lineDiffX;		toy = toy-lineDiffY;
		} else {
			fromx = fromx+lineDiffX;	fromy = fromy-lineDiffY;
			tox = tox-lineDiffX;		toy = toy+lineDiffY;
		}
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
		drawArrowHead(fromx, fromy, tox, toy, 10);
		halfX = (fromx+tox)/2;
		halfY = (fromy+toy)/2;
		drawAlpha(halfX,halfY,"a");
		
		
	} else if (part == 15){
		window.location.replace('webpage.html');
	}

}


redraw();

roundRect(20,50,200,100,10);
ctx.font="20px Calibri";
ctx.fillStyle = 'blue';
ctx.fillText("Clicking on this button",30,80);
ctx.fillText("adds a new state to ",30,105);
ctx.fillText("the board.",30,130);
drawArrowStraight(40,50,40,10);