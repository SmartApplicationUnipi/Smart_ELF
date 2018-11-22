

// &isGreater([$x, 3])


// callFunction<RetType>(nomeFunc, [lista params]) expect as result a list of results

function isEqual(op1: string, op2: string): boolean { return Number(op1) === Number(op2); }
function isGreater(op1: string, op2: string): boolean { return Number(op1) > Number(op2); }
function isGreaterEqual(op1: string, op2: string): boolean { return Number(op1) >= Number(op2); }

function isLower(op1: string, op2: string): boolean { return Number(op1) < Number(op2); }
function isLowerEqual(op1: string, op2: string): boolean { return Number(op1) <= Number(op2); }

function isEqualDate(op1: string, op2: string): boolean { return op1 === op2; }
function isAfterDate(op1: string, op2: string): boolean { return op1 === op2; }
function isBeforeDate(op1: string, op2: string): boolean { return op1 === op2; }

const avaiableFunctions = {
    'isEqual': isEqual,
    'isGreater': isGreater,
    'isGreaterEqual' : isGreaterEqual,
    'isLower': isLower,
    'isLowerEqual' : isLowerEqual,
    // ...
    '&(LAMBDA_EXPR)' : eval
};

// parte magica
mi manda 
const mappa = new Map < number, any[][]>(); // number a me non interessa, 


risposta Map<id array, di booleani> 


// in an ideal world
console.log( avaiableFunctions['isGreater']('50', '2') );

console.log( executeFunctionByNameSingleCall('isGreater(50, 2)') );
console.log( executeFunctionByNameManyCalls('isGreater', [['50', '2'], ['2', '10']] ));

export function executeSpecialPredicate(cose: Map<number, any[][]>) : Map<number, boolean[]> {
    // do magic stuff here
    
    return undefined;

}

function executeFunctionByNameManyCalls(funcName, paramsLists: string[][]) : any[] {
    const results = []
    for (const e of paramsLists) {
        results.push( avaiableFunctions[funcName](paramsLists) );
    }
    return results
}


export function executeFunctionByNameSingleCall(funcName, paramsLists: string[][]) : any[] {
    return avaiableFunctions[funcName](paramsLists);
}
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
