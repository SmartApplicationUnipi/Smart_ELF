
export function transformRule(request: string): object {
    // request = '{head} :- {clause} ; {clause} ; [pred]'
    // where [pred] = [ foo, [params...], [params...]'

    // Return:
    // { _head: {head}, _body: [{clause}...], _pred: [[pred]...]}
    let reply: { [index: string]: any } = {};
    let bodyAry: object[] = [];

    const headBodyPred = request.split('<-');
    const bodyPred = headBodyPred[1].replace(/\r\n/g, "\r").replace(/\n/g, "\r").split(/[\r;]+/);
    reply._predicates = new Array();

    for (const b of bodyPred) {
        if (b.trim().charAt(0) === '{') {
            bodyAry.push(JSON.parse(b.trim()));
        } else if (b.trim().charAt(0) === '[') {
            reply._predicates.push(eval(b.trim()));
        }
    }
    reply['_head'] = JSON.parse(headBodyPred[0].trim());
    reply['_body'] = bodyAry;
    return reply;
}
