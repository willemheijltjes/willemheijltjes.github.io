/**
	@summary Corresponding javascript file for the Finite Automata Game.
    @author Freya Johnson <freya02@hotmail.co.uk>
 */

//VARIABLES

//Drawing on the board
var canvas;
var ctx;
var xPlace = 60;	//where to draw the next state added
var cx = 75;
var cy = 240;
var crad = 25;		//global variable for radius of states
var WIDTH = 700;	//of canvas / rect
var HEIGHT = 500;	//of canvas / rect
var dragok = false;
var xdiff = 0;		//how far the mouse has moved between press & release
var ydiff = 0;
var circleHit=0;
var distancesquared;
var mouseDownX;
var mouseDownY;
var connectingState; //where a connection being made has originated
var mouseX;
var mouseY;
var clickDiffX;
var clickDiffY;

//Counters & other useful re-usables
var i;
var each;
var ID;
var halfX;
var halfY;
var toReturn;
var index;

//for converting NFA to DFA
var j;
var k;
var s;
var DFAstates;
var rowsDone;
var DFA;
var DFAconnections;
var statesToLookThrough;
var stateNameLocs;
var finalState;
	
//for creating intersect
var dest1;
var dest2;
var newState;

//for correctness
var dfa1;
var dfa2;
var iSect;
var finalFound;
var state1;
var state2;
var reason;

//for going onto next level
var myText;
var connectCount;

//for drawing arrows
var angP;
var angR;
var lineDiffY;
var lineDiffX;
var curvePointerX;
var curvePointerY;
var mX;
var mY;
var XcurveDiff;
var YcurveDiff;
var letter;
var myOrder;
var count;

//for the pop-up
var blanket;
var popUpDiv;
var showing;

//Modes & arrays & current level info
var binMode = false;
var states = [[75,240,0]];
var connections = [];
var alphaLocs = [];
var arrowMode = false;
var connecting = false;
var currentLevel = 1
var alphabet;
// each level in array is [level, r.e, dfa, guides, alphabet]
var levels = [[1, "a",
					[[[0,0],1,""],[[1,1],"",""]],
					["a"],
					["a","b"]],
				[2, "ab",
					[[[0,0],1,""],[[1,0],"",2],[[2,1],"",""]],
					["ab"],
					["a","b"]],
				[3, "b*",
					[[[0,1],"",0]],
					["_", "b", "bb", "bbb"],
					["a","b"]],
				[4, "ab*a",
					[[[0,0],1,""],[[1,0],2,1],[[2,1],"",""]],
					["aa","aba","abba","abbba"],
					["a","b"]],
				[5, "(a|b)c",
					[[[0,0],1,1,""],[[1,0],"","",2],[[2,1],"","",""]],
					["ac","bc"],
					["a","b","c"]],
				[6, "(abb)*",
					[[[0,1],1,""],[[1,0],"",2],[[2,0],"",0]],
					["_","abb","abbabb","abbabbabb"],
					["a","b"]],
				[7, "(a|b)c*a",
					[[[0,0],1,1,""],[[1,0],2,"",1],[[2,1],"","",""]],
					["aca", "bca", "aa", "bcca"],
					["a","b","c"]],
				[8, "(ab(a|c))*",
					[[[0,1],1,"",""],[[1,0],"",2,""],[[2,0],0,"",0]],
					["_","aba","abcaba","abaabcaba"],
					["a","b","c"]]];

//FUNCTIONS

function resetBoard(){
	/**
	 * Clears board to just starting state
	 */
	states = [[75,240,0]];
	connections = [];
	alphaLocs = []
	binMode = false;
	arrowMode = false;
	connecting = false;
	draw();
	
	//Reset all buttons
	document.getElementById("statesBut").src = "images/states.png";
	document.getElementById("arrowBut").src = "images/arrow.png";
	document.getElementById("binBut").src = "images/bin.png";
	document.getElementById("clearBut").src = "images/clear.png";
}

function mynextLevel(){
	/**
	 * Increases level count, resets the board, sets up popup for new skill if
	 * needed
	 */
	currentLevel++;
	document.getElementById("additional").style.visibility = 'hidden';
	document.getElementById("nextButton").style.visibility = 'hidden';
	document.getElementById("feedback").innerHTML = "";
	resetBoard();
	init();
	
	if (currentLevel == 2){
		//alphabet skills
		document.getElementById("card4").style.visibility = 'visible';
		
		document.getElementById("skillPopTitle").innerHTML = "Alphabet Skills";
		document.getElementById("skillPopImage").src = "images/skillAlpha.png";
		document.getElementById("skillPopImage").width = 220;
		document.getElementById("skillPopImage").height = 186;
		document.getElementById("skillPopContent").innerHTML = "Change the letter of the connection by left-clicking<br> the letter itself."; 
		popup('popUpDiv');
		
	} else if (currentLevel == 3){
		//kleene
		document.getElementById("card5").style.visibility = 'visible';
		
		document.getElementById("skillPopTitle").innerHTML = "Kleene Star";
		document.getElementById("skillPopImage").src = "images/skillKleene.png";
		document.getElementById("skillPopImage").width = 109;
		document.getElementById("skillPopImage").height = 111;
		document.getElementById("skillPopContent").innerHTML = "Kleene star ( * ) means 0 or more of the preceding letter.<br><br>The above diagram is building a Finite Automata for the<br>	regular expression <b>a*</b> - the connection goes to the same <br>state so that we can choose to have this letter as many <br>times as we like.";
		popup('popUpDiv');
		
	} else if (currentLevel == 4){
		//advanced building
		document.getElementById("card6").style.visibility = 'visible';
		
		document.getElementById("popUpTitle").innerHTML= "Tip!"
		document.getElementById("skillPopTitle").innerHTML = "Advanced Automata Building";
		document.getElementById("skillPopImage").src = "images/skillAdvaBuild.png";
		document.getElementById("skillPopImage").width = 196;
		document.getElementById("skillPopImage").height = 152;
		document.getElementById("skillPopContent").innerHTML = "If stuck, build parts of the diagram separately then put together after, like the above for <b>a*b</b>.";
		popup('popUpDiv');
		
	} else if (currentLevel == 5){
		// or
		document.getElementById("card7").style.visibility = 'visible';
		
		document.getElementById("popUpTitle").innerHTML= "New Skill!!"
		document.getElementById("skillPopTitle").innerHTML = "OR in regular expressions";
		document.getElementById("skillPopImage").src = "images/skillOr.png";
		document.getElementById("skillPopImage").width = 218;
		document.getElementById("skillPopImage").height = 117;
		document.getElementById("skillPopContent").innerHTML = "The OR operator is written as \" | \" and means that either <br>letter on each side of the operator can be chosen- so <b>(a|b)</b> <br> for the above example; the route down the a connection <br>OR the b connection can be taken.";
		popup('popUpDiv');
		
	} else if (currentLevel == 6){
		// advanced kleene
		document.getElementById("card8").style.visibility = 'visible';
		
		document.getElementById("skillPopTitle").innerHTML = "Advanced Kleene Star";
		document.getElementById("skillPopImage").src = "images/skillAdvaKleene.png";
		document.getElementById("skillPopImage").width = 245;
		document.getElementById("skillPopImage").height = 112;
		document.getElementById("skillPopContent").innerHTML = "Kleene Star works for groups of letters not just single letters, like the example above showing a Finite Automata for the regular expression <b>(aa)*</b>.";
		popup('popUpDiv');
	}
	
}

function init(){
	/**
	 * Initiates the board ready to be accessed by other functions.
	 */
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	//fill all necessary text
	document.getElementById("levelText").innerHTML = "LEVEL " + currentLevel;
	var levelLoc;
	var guideHTML = "";

	for (i=0; i<levels[currentLevel-1][3].length; i++){
		guideHTML += levels[currentLevel-1][3][i] + " <br> "
	}
	
	document.getElementById("targetRect").innerHTML = levels[currentLevel-1][1];
	document.getElementById("guideRect").innerHTML = guideHTML;
	
	return setInterval(draw, 10);
}

function toggle(div_id){
	/**
	 * Function adapted from demonstration code by http://www.webdesignandsuch.com/
	 * Toggles between black 'blanket' seen behind popup, and the main window
	 * when the pop-up is not appearing.
	 * @param {string} div_id
	 */
	showing = document.getElementById(div_id);
	
	if ( showing.style.display == 'none' ){
		showing.style.display = 'block';
	} else {
		showing.style.display = 'none';
	}
}

function blanket_size(popUpDivVar){
	/**
	 * Function adapted from demonstration code by http://www.webdesignandsuch.com/
	 * Sets the size of the 'blanket' to be used behind the popup and other
	 * measurements concerning the popup
	 * @param {string} popUpDivVar (window name)
	 */
	
	if (typeof window.innerWidth != 'undefined') {
		viewportheight = window.innerHeight;
	} else {
		viewportheight = document.documentElement.clientHeight;
	}
	
	if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
		blanket_height = viewportheight;
	} else {
		if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
			blanket_height = document.body.parentNode.clientHeight;
		} else {
			blanket_height = document.body.parentNode.scrollHeight;
		}
	}
	
	blanket = document.getElementById('blanket');
	blanket.style.height = blanket_height + 'px';
	
	popUpDiv = document.getElementById(popUpDivVar);
	popUpDiv_height = 180;
	popUpDiv.style.top = popUpDiv_height + 'px';
}

function window_pos(popUpDivVar){
	/**
	 * Function adapted from demonstration code by http://www.webdesignandsuch.com/
	 * Sets the location of the pop up on the screen and other measurements
	 * key to the displaying of the popup
	 * @param {string} popUpDivVar (window name)
	 */
	if (typeof window.innerWidth != 'undefined') {
		viewportwidth = window.innerHeight;
	} else {
		viewportwidth = document.documentElement.clientHeight;
	}
	
	if ((viewportwidth > document.body.parentNode.scrollWidth) && (viewportwidth > document.body.parentNode.clientWidth)) {
		window_width = viewportwidth;
	} else {
		if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
			window_width = document.body.parentNode.clientWidth;
		} else {
			window_width = document.body.parentNode.scrollWidth;
		}
	}
	popUpDiv = document.getElementById(popUpDivVar);
	window_width=window_width/2-200;
	popUpDiv.style.left = window_width + 'px';
}

function popup(windowname){
	/**
	 * Function adapted from demonstration code by http://www.webdesignandsuch.com/
	 * Calls the appropriate functions to set up and display the popup
	 * @param {string} windowname
	 */
	blanket_size(windowname);
	window_pos(windowname);
	
	toggle('blanket');
	toggle(windowname);		
}

function cardPop(){
	/**
	 * Opens a separate window containing a gif of basic controls in use
	 */
	window.open("images/output_aumJ7F.gif", "Window Title", "width=250, height=200");

}

function delState(ID){
	/**
	 * Removes a state from the board and all its connected arrows
	 * @param {int} ID (of state)
	 */
	//remove any connections to/from the deleted state
	var removeStates = [];
	for (i=0; i<connections.length; i++){
		if (connections[i][0]==ID || connections[i][1]==ID){
			removeStates.push(i);
		}
	}
	for (i=removeStates.length-1; i>-1; i--){
		//remove them from highest to lowest so the order isn't messed with
		connections.splice(removeStates[i],1);
		alphaLocs.splice(removeStates[i],1);
	}
	states[ID] = null;
	//change array to null so that connections to other states are kept
}

function stateClicked(){
	/**
	 * Called when add state button is clicked. Adds a state to the board.
	 */
	if (!binMode && !arrowMode){
		//checks we're not in arrow mode or bin mode (and therefore can't add
		// a new state)
		if (xPlace>260){
			xPlace = 60;
		} else {
			xPlace+=20;
		}
		states.push([xPlace,75,0]);
		draw();
	}
}

function arrowClicked(){
	/**
	 * Called when connection button clicked. Toggles between arrow mode.
	 */
	if (!binMode){
		//Check we're not in bin mode in order to toggle
		if (arrowMode){
			arrowMode = false;
			connecting = false;
			document.getElementById("statesBut").src = "images/states.png";
			document.getElementById("binBut").src = "images/bin.png";
			document.getElementById("clearBut").src = "images/clear.png";
		} else {
			arrowMode = true;
			document.getElementById("statesBut").src = "images/statesDis.png";
			document.getElementById("binBut").src = "images/binDis.png";
			document.getElementById("clearBut").src = "images/clearDis.png";
		}
	}
	
}

function binClicked(){
	/**
	 * Called when bin button clicked. Toggles between bin mode.
	 */
	if (!arrowMode){
		//Can't toggle bin mode if already in arrow mode
		if (binMode){
			binMode = false;
			document.getElementById("statesBut").src = "images/states.png";
			document.getElementById("arrowBut").src = "images/arrow.png";
			document.getElementById("binBut").src = "images/bin.png";
			document.getElementById("clearBut").src = "images/clear.png";
		} else {
			binMode = true;
			document.getElementById("statesBut").src = "images/statesDis.png";
			document.getElementById("arrowBut").src = "images/arrowDis.png";
			document.getElementById("binBut").src = "images/binOpen.png";
			document.getElementById("clearBut").src = "images/clearDis.png";
		}
	}
}

function submitClicked(){
	/**
	 * Called when submit button clicked. Calls various other functions to
	 * check correctness of player's FA, and displays result and next button
	 * to player.
	 */
	userDiagram = NFAtoDFA();
	//userDiagram is the DFA of what the user has submitted
	
	//first of all check they have a final state at all
	if (noFinalStateIn(userDiagram)){
		nextLevel = false;
		reason = "noFinal";
		
	} else {
		//else check for correctness
		dfa1 = userDiagram;
		dfa2 = levels[currentLevel-1][2];
		
		//create the intersect of the user's DFA with the minimal DFA
		iSect = calculateIntersect(dfa1, dfa2);
		
		if (iSect){
			// we have the intersect
			finalFound = false
			
			for (i=0; i<iSect.length; i++){
				state1 = iSect[i][0][0];
				state2 = iSect[i][0][1];
				//looking for final states in dfa1 and non-final in dfa2
				// or non-final in dfa1 and final in dfa2
				if ((dfa1[state1][0][1] == 1 && dfa2[state2][0][1] == 0) || (dfa1[state1][0][1] == 0 && dfa2[state2][0][1] == 1)){
					finalFound = true;
					break;
				}
			}
			if (finalFound){
				//the intersect of A notB or B notA has a final state so the
				// two automata are not recognising the same language
				nextLevel = false
				reason = "final";
			} else {
				nextLevel = true;
			}

		} else {
			//if iSect is false, the intersect could not be created
			// a path could not be followed around both
			// automata so they do not recognise the same language
			nextLevel = false;
			reason = "route";
		}
	}
	
	
	if (nextLevel){
		//if next level is true, show text and button to progress to next level
		
		//work out the text based on number of states
		myText = "Perfect!";
		
		userLength = 0;
		for (each of states){
			if (each != null){
				userLength++;
			}
		}
		
		
		if (userLength > dfa2.length){
			//User's diagram is correct but with more states than the minimal
			myText = "Good job!"
			document.getElementById("additional").innerHTML = "Is there a way you could less states in your automata?";
			document.getElementById("additional").style.visibility = 'visible';
			
		} else {
			//count up how many connections in ideal and compare
			var connectCount = 0;
			for (each of dfa2){
				for (i=1;i<each.length;i++){
					if (!(each[i] === "")){
						connectCount++;
					}
				}
			}
			
			if (connections.length > connectCount){
				//User's diagram is correct but with more connections than the
				// minimal
				myText = "Good job!"
				document.getElementById("additional").innerHTML = "Is there a way you could less connections in your automata?";
				document.getElementById("additional").style.visibility = 'visible';
			} else {
				document.getElementById("additional").style.visibility = 'hidden';
			}
			
			
		}
		
		
		
		document.getElementById("feedback").innerHTML = myText;
		
		//if there are no more levels, don't show the next button
		if (currentLevel + 1 <= levels.length){
			document.getElementById("nextButton").style.visibility = 'visible';
		} else {
			document.getElementById("finishAlert").style.display = "block";
		}
		
	} else {
		// display message when diagram is incorrect
		if (reason == "final"){
			document.getElementById("feedback").innerHTML = "Close!";
			document.getElementById("additional").style.visibility = 'visible';
			document.getElementById("additional").innerHTML = "You might want to check your final states!";
		} else if (reason == "route"){
			document.getElementById("feedback").innerHTML = "Not quite...";
			document.getElementById("additional").style.visibility = 'visible';
			document.getElementById("additional").innerHTML = "Your diagram's not right.<br>Try to follow the path through to see where you might be wrong.";
		} else if (reason == "noFinal"){
			document.getElementById("feedback").innerHTML = "Not quite...";
			document.getElementById("additional").style.visibility = 'visible';
			document.getElementById("additional").innerHTML = "Have you forgotten to put a final state?";
		} else{
			document.getElementById("feedback").innerHTML = "Incorrect";
			document.getElementById("additional").style.visibility = 'hidden';
			
		}
		
	}
}

function clearClicked(){
	/**
	 * Called when clear button clicked. Clears board to just a starting state.
	 */
	if (!binMode && !arrowMode){
		states = [[75,240,0]];
		connections = [];
		draw();
	}
}

function rect(x,y,w,h){
	/**
	 * Draws a rectangle - used when setting up the drawing board.
	 * @param {integer} x (x loc)
	 * @param {integer} y (y loc)
	 * @param {integer} w (width)
	 * @param {integer} h (height)
	 */
	ctx.beginPath();
	ctx.rect(x,y,w,h);
	ctx.closePath();
	ctx.fill();
}

function drawArc(x,y){
	/**
	 * Draws the arc part of the self-arrow.
	 * @param {integer} x (circle's x loc)
	 * @param {integer} y (circle's y loc)
	 */
	ctx.beginPath();
	ctx.arc(x,y,crad,0.7*Math.PI,2.3*Math.PI);
	ctx.stroke();
}

function drawArrowHead(fromx, fromy, tox, toy, arrowHead){
	/**
	 * Draws the head of an arrow (of a connection) based on where the arrow
	 * came from and goes to on the canvas, and the size of arrow head.
	 * @param {integer} fromx
	 * @param {integer} fromy
	 * @param {integer} tox
	 * @param {integer} toy
	 * @param {integer} arrowHead
	 */
	var angle = Math.atan2(toy-fromy,tox-fromx);
	
	ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-arrowHead*Math.cos(angle-Math.PI/6),toy-arrowHead*Math.sin(angle-Math.PI/6));
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(tox, toy);
    ctx.lineTo(tox-arrowHead*Math.cos(angle+Math.PI/6),toy-arrowHead*Math.sin(angle+Math.PI/6));
	ctx.stroke();
}

function drawArrowSelf(fromx, fromy, head, letter){
	/**
	 * Draws a self arrow on the state in the specified location.
	 * @param {integer} fromx
	 * @param {integer} fromy
	 * @param {integer} head
	 * @param {char} letter
	 */
	x = fromx;
	y = fromy-40;
	
	drawArc(x,y);
	
	drawAlpha(fromx,fromy-40-crad,letter);
	alphaLocs.push([fromx,fromy-40-crad]);
	
	//Before drawing the arrow head, change the from and to in order to
	// get a neat arrow head following the direction of the arc.
	fromx = fromx-40;
	fromy = fromy-40;
	tox = tox-15;
	toy = toy-22;
	drawArrowHead(fromx, fromy, tox, toy, head);
}

function drawArrowStraight(fromx, fromy, tox, toy, head, letter){
	/**
	 * Draws a straight arrow between two states
	 * @param {integer} fromx
	 * @param {integer} fromy
	 * @param {integer} tox
	 * @param {integer} toy
	 * @param {integer} head
	 * @param {char} letter
	 */
    
	if (letter){
		angP = Math.atan((fromy-toy)/(tox-fromx));
		
		lineDiffY = Math.sin(angP)*(crad);
		lineDiffX = Math.cos(angP)*(crad);
		
		if ((tox-fromx)<0){
			fromx = fromx-lineDiffX;	fromy = fromy+lineDiffY;
			tox = tox+lineDiffX;		toy = toy-lineDiffY;
		} else {
			fromx = fromx+lineDiffX;	fromy = fromy-lineDiffY;
			tox = tox-lineDiffX;		toy = toy+lineDiffY;
		}
	}
	
	
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.stroke();
	
	drawArrowHead(fromx, fromy, tox, toy, head);
	halfX = (fromx+tox)/2;
	halfY = (fromy+toy)/2;
	
	if (letter){
		drawAlpha(halfX,halfY,letter);
		alphaLocs.push([halfX,halfY]);
	}
}

function drawArrowCurve(fromx,fromy,tox,toy, head, letter, order){
	/**
	 * Draws a curved arrow between two states
	 * @param {integer} fromx
	 * @param {integer} fromy
	 * @param {integer} tox
	 * @param {integer} toy
	 * @param {integer} head
	 * @param {char} letter
	 * @param {integer} order
	 */
	
	mX = (tox+fromx) / 2;
	mY = (toy+fromy) / 2;
	
	angR = Math.atan((toy-mY)/(tox-mX));
	
	//80 being the distance the curve reaches away from the straight
	XcurveDiff = Math.sin(angR) * 80;
	YcurveDiff = Math.cos(angR) * 80;
	
	//work out which way to draw the curve- above or below the straight
	if (order){
		curvePointerX = mX + XcurveDiff;
		curvePointerY = mY - YcurveDiff;
	} else {
		curvePointerX = mX - XcurveDiff;
		curvePointerY = mY + YcurveDiff;
	}
	
	
	angP = Math.atan((fromy-curvePointerY)/(curvePointerX-fromx));
	
	lineDiffY = Math.sin(angP)*(crad);
	lineDiffX = Math.cos(angP)*(crad);
	
	ctx.lineWidth = 3;
	ctx.beginPath();
	
	if (curvePointerX<fromx){
		ctx.moveTo(fromx-lineDiffX, fromy+lineDiffY);
	} else {
		ctx.moveTo(fromx+lineDiffX, fromy-lineDiffY);
	}
	
	if (order){
		if (curvePointerX<fromx){
			if (tox<fromx){
				tox = tox-lineDiffY;
				toy = toy-lineDiffX;
			} else {
				tox = tox+lineDiffY;
				toy = toy+lineDiffX;
			}
		} else {
			if (tox<fromx){
				tox = tox+lineDiffY;
				toy = toy+lineDiffX;
			} else {
				tox = tox-lineDiffY;
				toy = toy-lineDiffX;
			}
		}
	} else {
		if (curvePointerX<fromx){
			if (tox<fromx){
				tox = tox+lineDiffY;
				toy = toy+lineDiffX;
			} else {
				tox = tox-lineDiffY;
				toy = toy-lineDiffX;
			}
		} else {
			if (tox<fromx){
				tox = tox-lineDiffY;
				toy = toy-lineDiffX;
			} else {
				tox = tox+lineDiffY;
				toy = toy+lineDiffX;
			}
		}
	}
	
	ctx.quadraticCurveTo(curvePointerX,curvePointerY, tox, toy);
	ctx.stroke();
	
	//pretend it comes from the middle of the curve point so the arrow head
	// comes from that direction
	fromx = curvePointerX;
	fromy = curvePointerY;
	
	drawArrowHead(fromx, fromy, tox, toy, head);
	
	//alpha half way between midpoint and curve point
	drawAlpha((mX+curvePointerX)/2,(mY+curvePointerY)/2,letter);
	alphaLocs.push([(mX+curvePointerX)/2,(mY+curvePointerY)/2]);
	
}

function drawStartArrow(){
	/**
	 * Draws the arrow to the starting state
	 */
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(15, 240);
	ctx.lineTo(75-(crad), 240);
	ctx.stroke();
	
	drawArrowHead(15,240,75-(crad),240,20);
}

function drawAlpha(xSpot, ySpot, letter){
	/**
	 * Adds two numbers
	 * @param {integer} xSpot
	 * @param {integer} ySpot
	 * @param {char} letter
	 */
	
	//draw the circle first to contain the letter
	ctx.fillStyle = 'black';
	ctx.beginPath();
	ctx.arc(xSpot,ySpot,10,0,2*Math.PI);
	ctx.closePath();	
	ctx.fill();
	
	//now draw the letter
	ctx.font="20px Georgia";
	ctx.fillStyle = 'white';
	ctx.textAlign="center"; 
	ctx.fillText(letter,xSpot,ySpot+5);
}

function drawConnections(){
	/**
	 * Iterates through the list of connections and draws them between the
	 * correct states on the drawing board
	 */
	
	alphaLocs = [];
	//reset alphalocs and add to as we go through the connections
	//after each arrow drawn append to alphaLocs so we know the location of
	// each letter on the board for when we want to change or delete a
	// connection
	for (i=0; i<connections.length; i++){
		each = connections[i];
		fromx = states[each[0]][0];
		fromy = states[each[0]][1];
		tox = states[each[1]][0];
		toy = states[each[1]][1];
		letter = each[2];
		
		if (fromx==tox && fromy==toy){
			//draw a self-arrow
			drawArrowSelf(fromx, fromy, 10, letter)
			
		} else {
			var count = 0;
			myOrder = 0;
			for (j=0; j<connections.length;j++){
				if ( ((each[0] == connections[j][0]) && (each[1] == connections[j][1])) ||
						((each[1] == connections[j][0]) && (each[0] == connections[j][1])) ) {
					count = count + 1;
					if (count==1 && j==i){
						myOrder = 0;
					}
					if (count==1 && j<i){
						//we've come across another one after, so we'll come second
						myOrder = 1;
					}
					
					if (count==2 && j<i){
						//if there are two already before ours, ours is third
						myOrder = 2;
					}
				}
			}
			
			if (count == 1){
				//if there's just one arrow between states, draw a straight
				drawArrowStraight(fromx,fromy,tox,toy,10, letter);
				
			} else {
				//more than one between these states!
				if (myOrder<2){
					//if myOrder is 0 or 1 we want a curve:
					drawArrowCurve(fromx,fromy,tox,toy, 10, letter, myOrder);
				} else {
					//if myOrder is 2 then it'll be a straight
					drawArrowStraight(fromx,fromy,tox,toy,10, letter);
				}
			}
		}
	}
}

function drawCircs(){
	/**
	 * Iterates through the list of states and draws them on the board.
	 */
	 
	ctx.strokeStyle = "black";
	ctx.lineWidth   = 3;

	for (i=0; i<states.length; i++){
		if (states[i]!=null){
			//check that the state hasn't previously been deleted
			// (set as null)
			var x = states[i][0];
			var y = states[i][1];
			ctx.beginPath();
			ctx.arc(x,y,crad,0,2*Math.PI);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			
			if (states[i][2] == 1){
				// This state is a final state. Draw another circle inside.
				ctx.beginPath();
				ctx.arc(x,y,crad-5,0,2*Math.PI);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		}
	}
}

function clearCanvas(){
	/**
	 * Called as part of the draw function to clear the canvas before redrawing.
	 */
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function draw(){
	/**
	 * Clears the canvas and redraws all objects on it.
	 */
	clearCanvas();
	ctx.fillStyle = "#FAF7F8";
	rect(0,0,WIDTH,HEIGHT);
	
	drawStartArrow();
	drawCircs();
	drawConnections();
	
	//if we're currently connecting something, draw the arrow to show this
	if (connecting){
		drawArrowStraight(states[connectingState][0], states[connectingState][1],
					states[connectingState][0]+50, states[connectingState][1], 20);
	}
}

function pointInCircle(x, y){
	/**
	 * Takes the location of a mouse down and returns whether or not a state
	 * was clicked on.
	 * @param {integer} x
	 * @param {integer} y
	 * @return {integer} -1 if no state hit, else state ID
	 */
	 
	toReturn = -1;
	for (i=0; i<states.length; i++){
		if (states[i]!=null){
			cx = states[i][0];
			cy = states[i][1];
			distancesquared = ((x-canvas.offsetLeft - cx) * (x-canvas.offsetLeft - cx)) +
							((y-canvas.offsetTop - cy)  * (y-canvas.offsetTop - cy));
			if (distancesquared <= crad * crad){
				toReturn = i;
			}
		}
	}
	return toReturn;
}

function alphaHit(x,y){
	/**
	 * Adds two numbers
	 * @param {integer} x 
	 * @param {integer} y
	 * @return {integer} -1 if no alpha hit, else alpha ID
	 */
	
	toReturn = -1;
	for (i=0; i<alphaLocs.length; i++){
		cx = alphaLocs[i][0];
		cy = alphaLocs[i][1];

		//see if the mouse pos is in the alpha circle
		distancesquared = ((x-canvas.offsetLeft - cx) * (x-canvas.offsetLeft - cx)) +
						((y-canvas.offsetTop - cy)  * (y-canvas.offsetTop - cy));
		
		if (distancesquared <= 10 * 10){
			toReturn = i;
		}
	}
	return toReturn;
}

function delLine(ID){
	/**
	 * Deletes a connection by removing it from the connections list.
	 * @param {integer} ID (of connection)
	 */
	
	//splice array to get rid of deleted connection
	connections.splice(ID,1);
}

function mouseIsRoughlyInTheSamePlace(downX, downY, upX, upY){
	/**
	 * Checks the mouse click and release were in roughly the same place to
	 * allow for players not clicking cleanly when they mean to.
	 * @param {integer} downX
	 * @param {integer} downY
	 * @param {integer} upX
	 * @param {integer} upY
	 * @return {bool} true if mouse press and release were close, else false.
	 */
	
	//This is a fix to sometimes arrows not being drawn because the user has
	// moved the mouse only slightly but it still feels like a single click
	// rather than a drag. This function checks that the mouse up is roughly
	// the same as the mouse down- so gives a little leeway.
	
	clickDiffX = (downX - upX) * (downX - upX);
	clickDiffY = (downY - upY) * (downY - upY);
	
	if (clickDiffX + clickDiffY < 20){
		return true;
	} else {
		return false;
	}
}

function myMove(e){
	/**
	 * Called when the mouse is moved, checks if a state is being dragged and
	 * sets new x and y values for its location if so.
	 * @param {event} e
	 */
	 
	if (dragok){
		states[circleHit][0] = e.pageX - canvas.offsetLeft - xdiff;
		states[circleHit][1] = e.pageY - canvas.offsetTop - ydiff;
	}
	mouseX = e.pageX;
	mouseY = e.pageY;
}

function myDown(e){
	/**
	 * Called when the mouse is clicked, calls other functions to move states
	 * if they have been clicked/dragged.
	 * @param {event} e
	 */
	
	//disable text selection (so objects or text aren't highlighted when
	// the mouse is dragged)
	document.body.classList.add('unselectable')
	
	mouseDownX = e.pageX;
	mouseDownY = e.pageY;
	
	circleHit = pointInCircle(e.pageX, e.pageY);
	//circleHit is -1 if no circle hit, else the ID of the circle
	
	if (!(circleHit== -1 || circleHit==0)){
		//if we have hit a state that isn't the start state
		
		xdiff = e.pageX - canvas.offsetLeft - states[circleHit][0];
		ydiff = e.pageY - canvas.offsetTop - states[circleHit][1];
		
		dragok = true;
		canvas.onmousemove = myMove;
	}
}

function myUp(e){
	/**
	 * Called when the mouse is released, checks to see if anything has been
	 * deleted, connections made or letters changed.
	 * @param {event} e
	 */
	
	//mouse has been released, we are not dragging anything now
	dragok = false;
	canvas.onmousemove = null;
	
	//if we're in bin mode delete the circle, or line if we're on it
	if (binMode && mouseDownX==e.pageX && mouseDownY==e.pageY){
		if (!(circleHit== -1 || circleHit==0)){
			delState(circleHit);
		}		
		ID = alphaHit(e.pageX, e.pageY);
		if (!(ID==-1)){
			delLine(ID);
		}
	}
	
	//if we're not deleting, and the mouse was a click rather than a drag,
	// check to see if we clicked an alpha and change the letter if so.
	if (!binMode && mouseIsRoughlyInTheSamePlace(mouseDownX, mouseDownY, e.pageX, e.pageY)){
		ID = alphaHit(e.pageX, e.pageY);
		if (ID != -1){
			//we're hit a letter; cycle through alphabet
			alphabet = levels[currentLevel-1][4];
			index = alphabet.indexOf(connections[ID][2]);
			if (index < alphabet.length-1){
				index++;
			} else {
				index = 0;
			}
			connections[ID][2] = alphabet[index];
		}
	}
	
	//if the mouse up is same place as mouse down and we're not in bin mode
	// then we want to start a connection
	if (arrowMode && (!connecting) && mouseIsRoughlyInTheSamePlace(mouseDownX, mouseDownY, e.pageX, e.pageY)){
		//if in arrow mode and not already connecting, start an arrow
		if (!(circleHit== -1)){
			connecting = true;
			connectingState = circleHit;
		}
		
	} else if (arrowMode && connecting && mouseIsRoughlyInTheSamePlace(mouseDownX, mouseDownY, e.pageX, e.pageY)){
		//if in arrow mode and already connecting, end the arrow
		if (!(circleHit== -1)){
			
			//check if there are already three connections between these states
			count = 0;
			for (i=0; i<connections.length; i++){
				if ( ((connectingState == connections[i][0]) && (circleHit == connections[i][1])) ||
						((circleHit == connections[i][0]) && (connectingState == connections[i][1])) ) {
					count = count + 1;
				}
			}
			
			if ((count == 1) && (connectingState==circleHit)){
				document.getElementById("additional").innerHTML = "Usually you can have more than one self-connection, but this game doesn't allow it. Sorry!";
				document.getElementById("additional").style.visibility = 'visible';

			} else if (count<3){
				connections.push([connectingState,circleHit,"a"]);
				
			} else {
				document.getElementById("additional").innerHTML = "No more than 3 connections between states, or your diagram will be too cluttered!";
				document.getElementById("additional").style.visibility = 'visible';
			}			
		}
		connecting = false;
	}
}

function myRightClick(e){
	/**
	 * Called when the mouse is released, checks to see if anything has been
	 * deleted, connections made or letters changed.
	 * @param {event} e
	 * @return {bool} false (always, so the context menu does not appear)
	 */
	 
	circleHit = pointInCircle(e.pageX, e.pageY);
	
	if (circleHit!=-1){
		//if we hit a circle (with R-click), toggle the type of the circle
		// between final and not
		if (states[circleHit][2] ==0){
			states[circleHit][2] = 1;
		} else{
			states[circleHit][2] = 0;
		}
	}
	
	//and so the context menu doesn't appear...
	return false;
}

function onMouseDown(e){
	/**
	 * Called when the event mousedown is triggered, and calls either myDown
	 * or myRightClick depending on if it was a left- or right-click.
	 * @param {event} e
	 */
	 
	e = e || window.event; //window.event for IE

	if ((e.keyCode || e.which) == 3){
		//right click
		myRightClick(e);
	} else if ((e.keyCode || e.which) == 1){
		//left down
		myDown(e);
	}
}

function noFinalStateIn(userDiagram){
	/**
	 * Takes the array representation of the player's FA and checks to see if
	 * there is a final state in it (to save the computational power used in
	 * finding the intersect if there is no need).
	 * @param {array} userDiagram
	 * @return {bool} true if there is no final state, else false.
	 */
	 
	for (each of userDiagram){
		if (each[0][1] == 1){
			return false;
		}
	}
	
	return true;
}

function arraysAreEqual(a,b){
	/**
	 * `Stringify's two arrays to check for their equality (with the same
	 * orders also).
	 * @param {array} a 
	 * @param {array} b
	 * @return {bool} true if equal, else false.
	 */
	if (JSON.stringify(a) == JSON.stringify(b)){
		return true;
	} else {
		return false;
	}
}

function calculateIntersect(dfa1, dfa2){
	/**
	 * Calculates the intersect 'diagram' (minus final states) between two
	 * Deterministic Finite Automata 
	 * @param {array} dfa1
	 * @param {array} dfa2
	 * @return {array} the intersect, or false if none exists
	 */
	
	//each DFA is in the form array of states as follows:
	// [ [stateName,final] , a goes to , b goes to ]
	// for each letter in alphabet
	
	// eg   [[[0,0],1,""],[[1,1],"",""]]

	
	iSect = [ [[0,0]] ];
	rowsDone = 0;
	
	while (rowsDone < iSect.length){
		//work on the value rowsDone
		
		for (i=0; i<alpha.length; i++){
			//for each in the alphabet see if the letter goes anywhere in
			// each of the automata we're comparing
			dest1 = dfa1[iSect[rowsDone][0][0]][i+1];
			dest2 = dfa2[iSect[rowsDone][0][1]][i+1];
			
			//what we want is, either no arrow for both or arrow for both
			if ((dest1 === "") && (dest2 === "")){
				//Both go nowhere
				iSect[rowsDone].push("");
				
			} else if  (!(dest1 === "") && !(dest2 === "")){
				//Both go somewhere
				iSect[rowsDone].push([dest1,dest2]);
				
			} else {
				// No point carrying on- one goes somewhere with a letter that
				// the other doesn't go anywhere with. Return false.
				return false;
			}
		}
		
		//Now the row is filled in for each alpha, check if we have any new
		// states to look at.
		for (i=0; i<alpha.length; i++){
			newState = true;
			
			for (j=0; j<iSect.length; j++){
	
				if (iSect[rowsDone][i+1] != ""){
					if (arraysAreEqual(iSect[rowsDone][i+1], iSect[j][0])){
						newState = false;
					}
				} else {
					newState = false;
				}
			}	
			
			if (newState){
				//Found a new state which has not been analysed before. Add to
				// iSect to be analysed
				iSect.push([iSect[rowsDone][i+1]]);
			}
		}

		//Increase the counter
		rowsDone++;
	}
	
	//Once the rows done have caught up with the length of iSect (i.e there
	// were no new rows to analyse) we have finished building the iSect.
	return iSect;
}

function NFAtoDFA(){
	/**
	 * Converts the NFA currently drawn on the drawing board to a DFA (without
	 * a trap state).
	 * @return {array} DFA based on currently drawn NFA
	 */
	
	DFAstates = [];
	DFA = [[[0]]];
	rowsDone = 0;

	s = states;
	DFAconnections = connections;
	alpha = levels[currentLevel-1][4];
	
	// we don't need the location, so make a new array with just the
	// minimal information; whether or not it is a final state
	for (i=0; i<s.length; i++){
		if (s[i] == null){
			DFAstates.push(null);
		} else {
			DFAstates.push(s[i][2]);
		}
	}
	
	//now DFAstates is [0,1,0, null...] depending on final state or not
	//and DFAconnections is [[from,to,"a"],[from,to,"b"]...]
	
	while (rowsDone < DFA.length){
		
		statesToLookThrough = DFA[rowsDone][0];

		//fill the row up with empties for each letter in the alphabet
		for (i=0; i<alpha.length; i++){
			DFA[rowsDone][i+1] = [];
		}
		
		for (i=0; i<statesToLookThrough.length; i++){
			//for each state to look through, see where the arrows are going
			// for each letter
		
			for (j=0; j<alpha.length; j++){
				
				for (k=0; k<DFAconnections.length; k++){
					if (DFAconnections[k][0] == statesToLookThrough[i] &&
							DFAconnections[k][2] == alpha[j]){
						//Connection has been found for this letter, add the
						// corresponding state to the array of states this
						// letter goes to if it isn't already in there
												
						if (DFA[rowsDone][j+1].indexOf(DFAconnections[k][1]) === -1){
							
							DFA[rowsDone][j+1].push(DFAconnections[k][1]);
							
						} //else it is already in there
					}
				}
			}
		}
		
		//Now the states have all been added to the row, see which need to be
		// analysed
		for (i=0; i<alpha.length; i++){
			newState = true;
			
			for (j=0; j<DFA.length; j++){
				
				if (DFA[rowsDone][i+1].length != 0){ //if its not empty list
					
					if (arraysAreEqual(DFA[rowsDone][i+1], DFA[j][0])){
						newState = false;
					}
				} else {
					newState = false;
				}
			}	
			
			if (newState){
				// New state found which a letter goes to, make a new row
				DFA.push([DFA[rowsDone][i+1]]);
			}
		}
		rowsDone++;
	}
	
	//At this point the DFA has been created but the states are actually
	// arrays of states so need to be simplified.
	
	//Eg. [ [[0],[2,1],[]],  [[2,1],[],[1]],  [[1],[],[]] ]
	//Also whether they are final states or not need to be stored in the DFA.
	
	stateNameLocs = [];
	finalState = 0;
	
	for (i=0; i<DFA.length; i++){
		for (j=0; j<DFA[i][0].length; j++){
		//look through array of states
		
			for (k=0; k<DFAstates.length; k++){
			//check against initial states for finals
				if (DFA[i][0][j] == k && DFAstates[k] ==1){
					finalState = 1;
				}
			}			
		}
		stateNameLocs.push([DFA[i][0], finalState]);
		finalState = 0;
	}
	
	
	for (i=0; i<DFA.length; i++){
		//for each row
		for (j=0; j<DFA[i].length; j++){
			//and each column
			
			//if it's empty then ignore it
			if (DFA[i][j].length != 0){
				var newName;
				//find the new name of the state based on the current one
				for (k=0; k<stateNameLocs.length; k++){
					if (arraysAreEqual(DFA[i][j], stateNameLocs[k][0])){
						newName = k;
						break;
					}
				}
				//set the new state name (from array to integer)
				DFA[i][j] = newName;
			} else {
				DFA[i][j] = "";
			}
		}
	}
	
	//and to store the final state information
	for (i=0; i<DFA.length; i++){
		DFA[i][0] = [i,stateNameLocs[i][1]];
	}
	
	return DFA;
}


init();

canvas.onmousedown = onMouseDown;
canvas.onmouseup = myUp;


$(document).bind("contextmenu", function (event) {
    
    // Stop the context menu from appearing when we right click
    event.preventDefault();
});
