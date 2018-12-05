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
function containsString(op1: string, op2: string): boolean { return op1.toLocaleLowerCase().indexOf(op2.toLocaleLowerCase()) >= 0; }

// EDIT DISTANCE PREDICATES
function editDistanceEqual(w1: string, w2: string, num: string): boolean { return solveEditDistance(w1, w2) === Number(num); }
function editDistanceGreater(w1: string, w2: string, num: string): boolean { return solveEditDistance(w1, w2) > Number(num); }
function editDistanceLess(w1: string, w2: string, num: string): boolean { return solveEditDistance(w1, w2) < Number(num); }

function solveEditDistance(word1: string, word2: string): number {
    if (word1.length === 0 || word1 === undefined) { /*console.log('word1 is undefined');*/ return word2.length; }
    if (word2.length === 0 || word2 === undefined) { /*console.log('word2 is undefined');*/ return word1.length; }
    const memo: number[][] = [];
    for (let i = 0; i <= word1.length; ++i) { memo[i] = new Array<number>(word2.length); }
    for (let i = 0; i <= word1.length; ++i) { memo[i][0] = i; }
    for (let j = 0; j <= word2.length; ++j) { memo[0][j] = j; }
    for (let i = 1; i <= word1.length; ++i) {
        for (let j = 1; j <= word2.length; ++j) {
            if (word1[i - 1] === word2[j - 1]) { memo[i][j] = memo[i - 1][j - 1];
            } else {
                memo[i][j] = 1 + Math.min(
                    memo[i - 1][j - 1],        // REPLACE
                    Math.min(memo[i][j - 1],   // INSERT
                        memo[i - 1][j]));      // REMOVE
            }
        }
    }
    // console.log('editDist('+ word1 + ', ' + word2 + ') = ', memo[word1.length][word1.length]);
    return memo[word1.length][word1.length];
}

const avaiableFunctions: { [index: string]: (op1: string, op2: string,  ...otherParams: string[]) => boolean }
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
    'containsString': containsString,
    'editDistanceEqual': editDistanceEqual,
    'editDistanceGreater': editDistanceGreater,
    'editDistanceLess': editDistanceLess,
    // 'lambda': evalFunction
};

export function executeSpecialPredicate(functionName: string, params: string[][]): boolean[] {
    const result: boolean[] = [];
    if (!avaiableFunctions.hasOwnProperty(functionName)) {
        for (const paramList of params) { result.push(false); }
    } else {
        for (const paramList of params) { result.push(avaiableFunctions[functionName].apply(this, paramList)); }
    }
    return result;
}
