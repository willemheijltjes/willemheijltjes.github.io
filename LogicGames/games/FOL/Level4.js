/**
 * Created by amyho on 25/02/2017.
 */
$(window).load(function(){
    $('#instructionModal').modal('show');
});

let context = [];
let sentence2 = {type:"predicate", formula:"Has", args:["Frege", "Idea"]};
let sentences = [sentence2];
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
        if (!(document.getElementById("arrowBox").hasChildNodes()))
        {
            russellFrege=false;
        }
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
        context.push(russellFrege+"(Frege Idea )");
    }

    let output = true;

    $( sentences ).each(function() {
        let sentence=$(this)[0];
        if (!eval(context, sentence)){
            output = false;
        }
    });
    if(output){
        triggerNextLevelDialogue();
    }
    else{
        triggerTryAgainDialogue();
    }

}



