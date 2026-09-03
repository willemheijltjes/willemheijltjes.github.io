function textEvalFinalBlock(block) {
    var output;
    if (block.hasParams) {
        output = [("("+block.func.text+")")];
        for (var i = 0; i < block.paramCount; i++) {
            output.push(evalFinalBlock(block.linkedParams[i]));
        }
    }  else {
        output = [block.func.text];
    }
    return output.join(" ");
}

function isArrow(outType) {
    const surroundedByBrackets = (str => 
            str[0] === '(' && str[str.length-1] === ')');
    return surroundedByBrackets(outType);
}

function evalBlock(block) {
    if (block === null || block === undefined) return;
    var out = "";
    var outType = block.outputText().text;
    var func = block.func.text;

    var blockFn = null;

    if (/\+[0-9]+/.test(func)) {
        const num = parseInt(func.slice(1));
        blockFn = curriedPlus(num);
    } else {
        switch (func) {
            case "concat":
            case "+":
                blockFn = plus;
                break;
            case "-":
                blockFn = minus;
                break;
            case "/":
                blockFn = div;
                break;
            case "*":
                blockFn = mult;
                break;
            case "%":
                blockFn = mod;
                break;
            case "(,)":
                blockFn = tuple;
                break;
            case "toInt":
                blockFn = toInt;
                break;
            case "apply":
                blockFn = apply;
                break;   
            case "cons":
                blockFn = cons;
                break;
            case "map":
                blockFn = mapFunc;
                break;
            case "reduce":
                blockFn = reduceFunc;
            case "\\x -> (x,x)":
                blockFn = contraction;
                break;
        }
    }

    if (block.hasParams) {
        // supported functions
        out = perfFuncOnParams(block, blockFn);
    } else {
        if (/\(.+(,.+)+\)/.test(outType)) {
            out = parseCurried(func);
        } else {
            // supported base types
            switch (outType) {
                case "Int":
                    out = parseInt(func);
                    break;
                case "Char":
                    out = func.charAt(1);
                    break;
                case "String":
                    out = func.slice(1, -1);
                    break;
                case "[Int]":
                case "[String]":
                    out = parseList(func);
                    break;
                default:
                    out = blockFn;
            }
        }
    }
    return out;
}

function parseList(func) {
    return JSON.parse(func);
}

function parseCurried(outText) {
    return outText.slice(1, -1).split(",").map(x => parseInt(x));
}

// Bind argument at argument number "n"
function bind_arg_at_n(fn, n, bound_arg) {
    return function(...args) {
        return fn(...args.slice(0, n), bound_arg, ...args.slice(n));
    };
}

function perfFuncOnParams(block, func) {
    // for each param that's not been arrow or curried
    // not arrowed: don't bind the arg
    // is arrowed: bind the arg and all of it's curried args

    var numArgsNotApplied = func.length;
    var tempFunc = func;
    for (var [loc, paramI] of block.paramIndices) {
        // if param has been arrowed or curried, ignore
        if (isNaN(paramI)) continue;

        // if param is curried, eval and split the output into 
        // the original function params
        const paramBlock = block.linkedParams[paramI];
        const evaluatedBlock = evalBlock(paramBlock);

        if (block.curried[loc] === undefined) {
            tempFunc = bind_arg_at_n(tempFunc, loc, evaluatedBlock);
            numArgsNotApplied--;
        } else {
            // evaluated block will have number of curried 
            var curried = block.curried[loc];
            curried.push(loc);
            curried.sort();
            
            for (var i = 0; i < curried.length; i++) {
                tempFunc = bind_arg_at_n(tempFunc, curried[i], evaluatedBlock[i]);
                numArgsNotApplied--;
            }
        }

    }
    if (numArgsNotApplied == 0) {
        tempFunc = tempFunc();
    }
    return tempFunc;
}

const curriedPlus = a => (b => a + b);
const plus = ((a, b) => a + b);
const minus = ((a, b) => a - b);
const div = ((a, b) => a / b);
const mult = ((a, b) => a * b);
const mod = ((a, b) => a % b);
const tuple = ((a, b) => [a, b]);
const toInt = (val => val.charCodeAt(0));
const apply = ((fn, x) => fn(x));
const cons = ((a, b) => [a].concat(b));
const mapFunc = ((a, b) => b.map(a));
const reduceFunc = ((f, list) => list.reduce((a,b) => f(a, b), []));
const contraction = a => [a, a];