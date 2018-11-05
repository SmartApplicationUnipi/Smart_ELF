export function findMatches(query: any, Dataset: any[]) {
    const matches = new Array();
    // inefficient lookup with a loop onto dataset array
    for (const data of Dataset) {
        const mb = matchBind(query, data, {});
        if (mb.match) {
            matches.push(mb.binds); // TODO: do we want to deliver the complete json?
        }
    }
    return matches;
}

function matchBind(q: any, d: any, initBinds: any): any {
    const ksq = Object.keys(q);
    let binds = Object.assign({}, initBinds);
    let match = true;

    let i = 0;
    while (i < ksq.length && match) {
        const kq = ksq[i];

        // console.log('analyzing key: ' + kq);

        if (isAtom(kq)) {
            // the object d is good if contains all the keys in q
            if (d.hasOwnProperty(kq)) {
                const vq = q[kq];
                const vd = d[kq];

                // console.log('try to match/bind key vaulues ' + vq + ' and ' + vd);

                if (isAtom(vq)) {
                // the value of the current query key is an atom, so we need the value of the data key to be equal
                    if (vq !== vd) { match = false; }
                }
                if (isPlaceholder(vq)) {
                // the value of the current query key is a placeholder,
                // so we need to check if we can bind the value to it
                    if (binds.hasOwnProperty(kq) && binds[kq] !== vd) { match = false; } else { binds[vq] = vd; }
                }
                if (isObject(vq)) {
                // the value of the current query key is an object,
                // so we can do recursive call to check if they can be matched
                    const r = matchBind(vq, vd, binds);
                    match = r.match;
                    binds = r.binds;
                }
            } else { match = false; }
        }
        if (isPlaceholder(kq)) {
            // TODO: implement this case.
            // The idea is: for each possible key assignemt do a recursive call.
            // possible problems could be in binds object?
            match = false;
        }
        i++;
    }
    return {match, binds};
}

function isPlaceholder(v: any) {
    return (typeof (v) === 'string' && v.charAt(0) === '$');
}
function isObject(v: any) {
    return (typeof (v) === 'object');
}
function isAtom(v: any) {
    return (!isPlaceholder(v) && !isObject(v));
}
