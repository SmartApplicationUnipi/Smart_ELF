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
function isEqualDate(params: string[]): boolean { return (new Date(params[0]).getTime()) ===  (new Date(params[1]).getTime()); }
function isAfterDate(params: string[]): boolean {  return (new Date(params[0]).getTime()) >  (new Date(params[1]).getTime()); }
function isBeforeDate(params: string[]): boolean {  return (new Date(params[0]).getTime()) < (new Date(params[1]).getTime());  }

// GENERIC JAVASCRIPT CODE TO EXECUTE
function evalFunction(functionCode: string): any {
    return eval(functionCode);
}

const avaiableFunctions = {
    'isEqual': isEqual,
    'isGreater': isGreater,
    'isGreaterEqual': isGreaterEqual,
    'isLower': isLower,
    'isLowerEqual': isLowerEqual,
    'isEqualDate': isEqualDate,
    'isAfterDate': isAfterDate,
    'isBeforeDate': isBeforeDate,
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

// TEST. SORRY FOR THAT
// console.log("isEqual, expected [false, true]", executeSpecialPredicate('isEqual', [['50', '2'], ['2', '2']]));
// console.log("isGreater, expected [true, false, false]", executeSpecialPredicate('isGreater', [['50', '2'], ['2', '2'], ['2', '50']]));
// console.log("isGreaterEqual, expected [true, true]", executeSpecialPredicate('isGreaterEqual', [['50', '2'], ['2', '2']]));
// console.log("isLower, expected [false, true]", executeSpecialPredicate('isLower', [['50', '2'], ['1', '2']]));
// console.log("isLowerEqual, expected [true, true]", executeSpecialPredicate('isLowerEqual', [['2', '2'], ['1', '2']]));
// console.log("\n");
// console.log("equalDate, expected [true, false]", executeSpecialPredicate('isEqualDate', [['2018-03-11', '2018-03-11'], ['2018-03-10', '2018-03-11']]));
// console.log("afterDate, expected [true, false]", executeSpecialPredicate('isAfterDate', [['December 17, 1995 03:24:01', 'December 17, 1995 03:24:00'], ['2018-03-09', '2018-03-11']]));
// console.log("beforeDate, expected [true, true, false]", executeSpecialPredicate('isBeforeDate', [['December 17, 1994 02:24:01', 'December 17, 1995 03:24:00'], ['2010-03-09', '2018-03-11'], ['December 17, 2002 02:24:00', 'December 17, 2000 02:24:00']]));

// const funkyCode: string[] = [];
// console.log(executeSpecialPredicate('lambda', [funkyCode]));
