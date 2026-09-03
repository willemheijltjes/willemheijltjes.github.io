/**
 * Created by amyho on 07/04/2017.
 */
let predicates=["Happy","Logician","Sad","Alarmed","Despairs"];
let relations=["Likes","IsAngryWith","Has"];
let objects=["Theory","Idea","Tea","HotChoc","Pen","Pencil", "HasTheory"];
$('[rel="tooltip"]').on('click', function () {
    $(this).tooltip('hide')
})
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {

    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    if (predicates.indexOf(String(data))>-1 || objects.indexOf(String(data))>-1 || String(data).charAt(0)=='x'){
        let image = document.getElementById(data),
            clone = image.cloneNode(true);
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
    if (relations.indexOf(String(data))>-1){
        let image = document.getElementById(data),
            clone = image.cloneNode(true);
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
    if (String(data)=="topArrow"||String(data)=="bottomArrow"||String(data)=="startArrowBox"){
        let image = document.getElementById(data),
            clone = image.cloneNode(true);
        clone.id = "cloned"+String(counter);
        counter++;
        event.target.appendChild(clone);
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
    if(parent=="arrowBox"||parent=="bottomArrowBox"||parent=="topArrowBox"){
        document.getElementById(parent).style.border="";
    }
    let child = target.id;
    removeElement(child, parent);
});
function removeElement(element, parent) {
    var holder = document.getElementById(parent);
    var image = document.getElementById(element);
    let y = image.parentNode;
    holder.removeChild(image);
}
function addBorder(event){
    let eventId = event.target.id;
    if (eventId =="arrowBox"||eventId=="bottomArrowBox"||eventId=="topArrowBox"){
        event.target.style.border= "10px dotted green";
    }
}
function removeBorder(event){
    let eventId = event.target.id;
    if (eventId =="arrowBox"||eventId=="bottomArrowBox"||eventId=="topArrowBox"){
        event.target.style.border= "";
    }
}
