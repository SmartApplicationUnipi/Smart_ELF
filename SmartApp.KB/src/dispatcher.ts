// NUMERIC PREDICATES
// function isEqual(params: string[]): boolean { return Number(params[0]) === Number(params[1]); }
function isEqual(op1: string, op2: string): boolean { return Number(op1) === Number(op2); }

function isGreater(op1: string, op2: string): boolean { return Number(op1) > Number(op2); }
function isGreaterEqual(op1: string, op2: string): boolean { return Number(op1) >= Number(op2); }
function isLower(op1: string, op2: string): boolean { return Number(op1) < Number(op2); }
function isLowerEqual(op1: string, op2: string): boolean { return Number(op1) <= Number(op2); }

// DATE PREDICATES
function isEqualDate(op1: string, op2: string): boolean { return (new Date(op1).getTime()) === (new Date(op2).getTime()); }
function isAfterDate(op1: string, op2: string): boolean { return (new Date(op1).getTime()) > (new Date(op2).getTime()); }
function isBeforeDate(op1: string, op2: string): boolean { return (new Date(op1).getTime()) < (new Date(op2).getTime()); }

// GENERIC JAVASCRIPT CODE TO EXECUTE
// export function evalFunction(functionCode: string[]): boolean {
//     return eval("function"+(functionCode[0])+functionCode[:]);
// }

const avaiableFunctions: { [index: string]: (op1: string, op2: string) => boolean }
    = {
    'isEqual': isEqual,
    'isGreater': isGreater,
    'isGreaterEqual': isGreaterEqual,
    'isLower': isLower,
    'isLowerEqual': isLowerEqual,
    'isEqualDate': isEqualDate,
    'isAfterDate': isAfterDate,
    'isBeforeDate': isBeforeDate,
    // 'lambda': evalFunction
};

export function executeSpecialPredicate(functionName: string, params: string[][]): boolean[] {
    const result: boolean[] = [];
    for (const paramList of params) {
        result.push(avaiableFunctions[functionName].apply(this, paramList));
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
