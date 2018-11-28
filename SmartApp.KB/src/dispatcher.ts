// NUMERIC PREDICATES
function isEqual(op1: string, op2: string): boolean { return Number(op1) === Number(op2); }
function isGreater(op1: string, op2: string): boolean { return Number(op1) > Number(op2); }
function isGreaterEqual(op1: string, op2: string): boolean { return Number(op1) >= Number(op2); }
function isLess(op1: string, op2: string): boolean { return Number(op1) < Number(op2); }
function isLessEqual(op1: string, op2: string): boolean { return Number(op1) <= Number(op2); }

// DATE PREDICATES
function isEqualDate(op1: string, op2: string): boolean { return (new Date(op1).getTime()) === (new Date(op2).getTime()); }
function isAfterDate(op1: string, op2: string): boolean { return (new Date(op1).getTime()) > (new Date(op2).getTime()); }
function isBeforeDate(op1: string, op2: string): boolean { return (new Date(op1).getTime()) < (new Date(op2).getTime()); }

// STRING PREDICATES
function isEqualString(op1: string, op2: string): boolean { return op1 === op2; }
function isGreaterString(op1: string, op2: string): boolean { return op1 > op2; }
function isLessString(op1: string, op2: string): boolean { return op1 < op2; }
// GENERIC JAVASCRIPT CODE TO EXECUTE
// export function evalFunction(functionCode: string[]): boolean {
//     return eval("function"+(functionCode[0])+functionCode[:]);
// }

const avaiableFunctions: { [index: string]: (op1: string, op2: string) => boolean }
    = {
    'isEqual': isEqual,
    'isGreater': isGreater,
    'isGreaterEqual': isGreaterEqual,
    'isLess': isLess,
    'isLessEqual': isLessEqual,
    'isEqualDate': isEqualDate,
    'isAfterDate': isAfterDate,
    'isBeforeDate': isBeforeDate,
    'isEqualString': isEqualString,
    'isGreaterString': isGreaterString,
    'isLessString': isLessString,
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
// console.log("isLess, expected [false, true]", executeSpecialPredicate('isLess', [['50', '2'], ['1', '2']]));
// console.log("isLessEqual, expected [true, true]", executeSpecialPredicate('isLessEqual', [['2', '2'], ['1', '2']]));
// console.log("\n");
// console.log("equalDate, expected [true, false]", executeSpecialPredicate('isEqualDate', [['2018-03-11', '2018-03-11'], ['2018-03-10', '2018-03-11']]));
// console.log("afterDate, expected [true, false]", executeSpecialPredicate('isAfterDate', [['December 17, 1995 03:24:01', 'December 17, 1995 03:24:00'], ['2018-03-09', '2018-03-11']]));
// console.log("beforeDate, expected [true, true, false]", executeSpecialPredicate('isBeforeDate', [['December 17, 1994 02:24:01', 'December 17, 1995 03:24:00'], ['2010-03-09', '2018-03-11'], ['December 17, 2002 02:24:00', 'December 17, 2000 02:24:00']]));
// console.log("\n");
// console.log("equalString, expected [true, false]", executeSpecialPredicate('isEqualString', [['2018-03-11', '2018-03-11'], ['2018-03-10', '2018-03']]));
// console.log("greaterString, expected [true, false]", executeSpecialPredicate('isGreaterString', [['zbpo', 'zapo'], ['vapor', 'wave' ]]));
// console.log("lessString, expected [true, false]", executeSpecialPredicate('isLessString', [['aba', 'lapo'], ['lapo', 'caro']]));

// const funkyCode: string[] = [];

// console.log(executeSpecialPredicate('lambda', [funkyCode]));
