/**
 * Created by amyho on 23/01/2017.
 */

const variables=["Frege", "Russell"];

function lookup(context, predicate){
    let returnValue = false;
    //for (currentTerm of context){
    //    if (predicate == currentTerm){
    //        returnValue = true;
     //   }
    //}
    //$(context).each(function(){
    $.each( context, function( i, l ){
        let temp=i;
        let temp2=l;

        let currentTerm=$(this);
        if (predicate==l){
            returnValue=true;
        }
    });

    return returnValue;
}

function eval(context, formula){
    let tempFormula = formula;
    let returnValue = "error";
    switch(tempFormula.type){

        case "predicate":

            let fullFormula = contextElementMaker(formula.formula, formula.args);
            returnValue = lookup(context, fullFormula);

            break;
        case "binary":
            switch(formula.formula){
                case "AND":
                    returnValue = eval(context,formula.pred1) && eval(context, formula.pred2);
                    break;

                case "OR":
                    returnValue = eval(context,formula.pred1) || eval(context, formula.pred2);
                    break;

                default:
                    returnValue="binary formula not recognised"
            }
            break;

        case "forAll":
            //need to address the case where forall has nested statements.
            //forall should take a single argument that is a predicate

            returnValue = subAllVariables(context, formula);
            break;

        case "thereExists":

            returnValue = subAllVariables(context, formula);
            break;

        case "negation":

            returnValue = !eval(context,formula.pred1);
            break;

        default:

            returnValue = "eval error";
            break;
    }
    return returnValue;



}
//const context=["Happy(Frege )", "Happy(Russel )", "Friends(Russel Frege )",  "Friends(Freg e Russel )", "Friends(Frege Frege )",
//    "Friends(Russel Russel )", "HasTheory(Ru ssel )", "HasTheory(Fre ge )"];

const pred4 = {type:"predicate", formula:"Friends", args:["x","Russel"]};
const pred7 = {type:"predicate", formula:"Happy", args:["x"]};
const pred9 = {type:"predicate", formula:"HasTheory", args:["x"]};
const pred2 = {type:"binary", formula:"OR", pred1:pred7, pred2:pred9};
const pred10 = {type:"negation", formula:"NOT", pred1:pred3};
const pred11 = {type:"forAll", formula:"forAll", replaceVar:"x", pred1:pred10};

function forFolPrinting(){
    document.getElementById("compOutput").innerHTML=eval(context, pred11);
}
function contextElementMaker(formula, args){
    let predicate = String(formula)+"(";
    //for (arg of args){
    //    predicate = predicate+String(arg)+" ";
    //}
   // $( args ).each(function() {
        $.each( args, function( i, l ){
            let temp2=i;
            let temp3=l;

            let arg=l;
            predicate = predicate+String(arg)+" ";
        });

    predicate = predicate+")";
    return predicate;
}
function subAllVariables(context, sentence){
    let tempPred = sentence.pred1;
    const replaceVar = sentence.replaceVar;
    let returnValue = "not assigned";
    switch (tempPred.type) {
        case "negation":
            if (sentence.formula == "forAll"){
                returnValue = true;

                for(let i=0; i<variables.length; i++){
                    const variable = variables[i];
                    let freshSentence = $.extend(true,{},tempPred);
                    let newPredicate = subVariable(replaceVar, freshSentence, variable);

                    if (!eval(context, newPredicate)){
                        returnValue = false;
                    }
                }
            }
            else if (sentence.formula == "thereExists"){
                returnValue = false;

                for(let i=0; i<variables.length; i++){
                    const variable = variables[i];
                    let freshSentence = $.extend(true,{},tempPred);
                    let newPredicate = subVariable(replaceVar, freshSentence, variable);

                    if (eval(context, newPredicate)){
                        returnValue = true;
                    }
                }
            }
            break;
        case "predicate":
            returnValue = "subAllVariables error";
            switch (sentence.formula){
                case "thereExists":
                    returnValue = false;

                    for(let i=0; i<variables.length; i++){
                        const variable = variables[i]; //gets a variable
                        let freshTempPred = $.extend(true,{},tempPred); //makes a copy of temppred
                        let newPredicate = subVariable(replaceVar, freshTempPred, variable); //subs variable in
                        if (eval(context, newPredicate)){
                            returnValue = true;
                        }
                    }
                    break;
                case "forAll":
                    returnValue = true;
                    for(let i=0; i<variables.length; i++){
                        const variable = variables[i];
                        let freshSentence = $.extend(true,{},tempPred);
                        let newPredicate = subVariable(replaceVar, freshSentence, variable);
                        if (!eval(context, newPredicate)){
                            returnValue = false;
                        }
                    }
                    break;
                default:
                    returnValue = "default error";
                    break;
            }
            break;

        case "binary":

            if (sentence.formula == "forAll"){
                returnValue = true;

                for(let i=0; i<variables.length; i++){
                    const variable = variables[i];
                    let freshSentence = $.extend(true,{},tempPred);
                    let newPredicate = subVariable(replaceVar, freshSentence, variable);

                    if (!eval(context, newPredicate)){
                        returnValue = false;
                    }

                }
            }
            else if (sentence.formula == "thereExists"){
                returnValue = false;

                for(let i=0; i<variables.length; i++){
                    const variable = variables[i];
                    let freshSentence = $.extend(true,{},tempPred);
                    let newPredicate = subVariable(replaceVar, freshSentence, variable);

                    if (eval(context, newPredicate)){
                        returnValue = true;
                    }
                }
            }
            else{
                returnValue = "Binary formula error";
            }
            break;

        default:
        returnValue = "subAllVariables error";
            break;

    }
    return returnValue;

}


function subVariable(replaceVar, sentence, variable){
    const subPredicate = sentence;
    let returnValue = "notChanged";
    let subPredicateType=subPredicate.type;

    switch (subPredicateType){

        case "predicate":
            //this is the base case
            for (let i = 0; i < subPredicate.args.length; i++) {
                let currentArg = String(subPredicate.args[i]);
                if (currentArg==replaceVar){
                    subPredicate.args[i] = variable;
                }
            }
            returnValue= subPredicate;
            break;

        case "binary":
            let firstPred = subPredicate.pred1;
            let secondPred = subPredicate.pred2;
            if (subPredicate.formula == "AND" || subPredicate.formula == "OR"){
                firstPred = subVariable(replaceVar, firstPred, variable);
                secondPred = subVariable(replaceVar, secondPred, variable);
                returnValue = subPredicate;
            }
            else{
                returnValue = "Binary subVariable error";
            }
            break;
        case "negation":
            let singlePred = subPredicate.pred1;
            singlePred = subVariable(replaceVar, singlePred, variable);
            returnValue = subPredicate;
            break;
        default:
            returnValue = "subVariable error";
            break;
    }
    return returnValue;
}
