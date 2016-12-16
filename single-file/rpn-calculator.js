isNumber = isFinite;

ops = {
    "+": [2, function(a,b) {return a + b;}],
    "-": [2, function(a,b) {return a - b;}],
    "*": [2, function(a,b) {return a * b;}],
    "/": [2, function(a,b) {return a / b;}],
    "sin": [1, function(a){return Math.sin(a);}]
};

function assert(v, msg){if(!v){throw msg;}}

function evalrpn(expr) {
    var stack = [], args = [];
    stack = expr.split(/\s+/).reverse();
    while (stack.length > 0) {
        var token = stack.pop();
        if (isNumber(token)) {
            args.push(parseFloat(token));
        } else {
            var op = ops[token],
                arg = [];
            assert(typeof op != "undefined", "Operator not defined");
            for (var i = op[0]; i > 0; i -= 1)
                arg.push(args.pop());
            assert(arg.length == op[0], "Not enough arguments!");
            var result = op[1].apply(null,arg);
            stack.push(result);
        }
    }
    return args;
}

evalrpn("5 10 * 3 +");