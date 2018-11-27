/*
traslator python per esporre quesa roba

func 
*/

// NUMERIC PREDICATES
function isEqual(params: string[]): boolean { return Number(params[0]) === Number(params[1]); }
function isGreater(params: string[]): boolean { return Number(params[0]) > Number(params[1]); }
function isGreaterEqual(params: string[]): boolean { return Number(params[0]) >= Number(params[1]); }
function isLower(params: string[]): boolean { return Number(params[0]) < Number(params[1]); }
function isLowerEqual(params: string[]): boolean { return Number(params[0]) <= Number(params[1]); }

// DATE PREDICATES
function isEqualDate(params: string[]): boolean { return false; }
function isAfterDate(params: string[]): boolean { return false; }
function isBeforeDate(params: string[]): boolean { return false;  }

// GENERIC JAVASCRIPT CODE
function evalFunction(functionCode: string): any {
    return eval(functionCode);
}

const avaiableFunctions = {
    'isEqual': isEqual,
    'isGreater': isGreater,
    'isGreaterEqual': isGreaterEqual,
    'isLower': isLower,
    'isLowerEqual': isLowerEqual,
    // ...
    '\\lambda': evalFunction
};

// param   : number e' id del fatto, any[][] lista di lista di parametri
// returns : id, un booleano per ogni possibile binding
export function executeSpecialPredicate(functionName: string, params: string[][]): boolean[] {
    const result: boolean[] = [];
    for (const paramList of params) {
        // add controls
        result.push(avaiableFunctions[functionName](paramList));
    }
    return result;
}

console.log(executeSpecialPredicate('isEqual', [['50', '2'], ['2', '2']]));

// const funkyCode: string[] = [];
// console.log(executeSpecialPredicate('lambda', [funkyCode]));

//function executeFunctionByName(functionName, context /*, args */) {
//    var args = Array.prototype.slice.call(arguments, 2);
//    var namespaces = functionName.split(".");
//    var func = namespaces.pop();
//    for(var i = 0; i < namespaces.length; i++) {
//      context = context[namespaces[i]];
//    }
//    return context[func].apply(context, args);
//  }

//  executeFunctionByName("Namespace.functionName", My, arguments);
//  executeFunctionByName("My.Namespace.functionName", window, arguments);
