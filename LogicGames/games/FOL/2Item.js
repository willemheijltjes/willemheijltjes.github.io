/**
 * Created by amyho on 14/02/2017.
 */
$(window).load(function(){
    $('#instructionModal').modal('show');
});
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
});
let context = [];
let sentence1 = {type:"predicate", formula:"Likes", args:["Russell", "Frege"]};
let sentence2 = {type:"predicate", formula:"Likes", args:["Frege", "Russell"]};
let sentences = [sentence1, sentence2];
let counter = 0;


function makeContext(){
    context = [];
    let russellEmotion, fregeEmotion, russellFrege, fregeRussell;
    if (document.getElementById("russellEmotion")) {
        let russellEmotionBox = document.getElementById("russellEmotion").firstElementChild;

        russellEmotion = russellEmotionBox ? russellEmotionBox.className : false;
        console.log(russellEmotion);
    }

    if (document.getElementById("fregeEmotion")) {
        let fregeEmotionBox = document.getElementById("fregeEmotion").firstElementChild;
        fregeEmotion = fregeEmotionBox ? fregeEmotionBox.className : false;
    }


    if (document.getElementById("russellFrege")) {
        let russellFregeBox = document.getElementById("russellFrege").firstElementChild;
        russellFrege = russellFregeBox ? russellFregeBox.className : false;
    }

    if(document.getElementById("fregeRussell")){
        let fregeRussellBox = document.getElementById("fregeRussell").firstElementChild;
        fregeRussell = fregeRussellBox ? fregeRussellBox.className : false;
    }

    if (russellEmotion){
        context.push(russellEmotion+"(Russell )");
    }
    if(fregeEmotion){
        context.push(fregeEmotion+"(Frege )");
    }
    if(russellFrege){
        context.push(russellFrege+"(Russell Frege )");
    }
    if(fregeRussell){
        context.push(fregeRussell+"(Frege Russell )");
    }
    let output = true;

    for (sentence of sentences){
        if (!eval(context, sentence)){
            output = false;
        }
    }
    if(output){
        triggerNextLevelDialogue();
    }
    else{
        triggerTryAgainDialogue();
    }

}
function addBorder(event){
	console.log(event.target);
	let eventId = event.target.id;
	if (eventId =="arrowBox"||eventId=="bottomArrowBox"||eventId=="topArrowBox"){
		event.target.style.border= "10px dotted green";
	}
}
function removeBorder(event){
	console.log(event.target);
	let eventId = event.target.id;
	if (eventId =="arrowBox"||eventId=="bottomArrowBox"||eventId=="topArrowBox"){
		event.target.style.border= "";
	}
}
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {

    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {

    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    if (String(data)=="Happy" || String(data)=="HasTheory"){
        let image = document.getElementById(data),
            clone = image.cloneNode(true); // true means clone all childNodes and all event handlers
        clone.id = "cloned"+String(counter);
        counter++;
        ev.target.appendChild(clone);
    }
    else{
        $('#unaryAlert').show();

    }

}
function dropB(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    if (String(data)=="Likes" || String(data)=="IsAngryWith"){
        let image = document.getElementById(data),
            clone = image.cloneNode(true); // true means clone all childNodes and all event handlers
        clone.id = "cloned"+String(counter);
        counter++;
        ev.target.appendChild(clone);
    }
    else{
        $('#binaryAlert').show();
    }

}
function dropArrow(event) {

    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    if (String(data)=="topArrow"||String(data)=="bottomArrow"){

        //event.target.appendChild(document.getElementById(data).cloneNode(true));
        let image = document.getElementById(data),
        clone = image.cloneNode(true); // true means clone all childNodes and all event handlers
        clone.id = "cloned"+String(counter);
        counter++;
        event.target.appendChild(clone);
		//need to put the counter code in here
    }
	event.target.style.border= "";
	
}


function triggerNextLevelDialogue(){
    $('#nextLevelDialogue').modal('show');
}
function triggerTryAgainDialogue(){
    $('#tryAgainDialogue').modal('show');

}
$(document).dblclick(function(event) {
    var element=event.target.id;
    let x=String(event.target.tagName);
    let target = event.target;
    while(x==="TD" || x==="TR" ||x==="TBODY" ||x==="TABLE") {
        let tempElement = target.parentNode;
        x = String(tempElement.tagName);
        target = tempElement;
    }
    let parent = (target.parentNode.id);
	console.log(parent);
	if(parent=="arrowBox"||parent=="bottomArrowBox"||parent=="topArrowBox"){
		document.getElementById(parent).style.border="";
	}
    let child = target.id;
    removeElement(child, parent);
});
function removeElement(element, parent) {
    var holder = document.getElementById(parent);
    var image = document.getElementById(element);
	console.log(holder);
	console.log(image);
    let y = image.parentNode;
    holder.removeChild(image);
}


