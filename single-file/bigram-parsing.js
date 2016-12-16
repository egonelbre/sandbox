function Node(token, priority){
    this.left = null;
    this.right = null;
    this.scope = null;
    this.ltr = false;
    this.token = token || null;
    this.priority = priority || null;
}

Node.prototype.toString = function(){
    if(!this.scope && !this.left && !this.right )
        return this.token;
    if(this.scope && !this.left && !this.right)
        return this.scope.toString();
    var result = "";
    result += "("  + this.token;
    if( this.scope )
        result += " `" + this.scope.toString();
    if( this.left )
        result += " " + this.left.toString();
    if( this.right )
        result += " " + this.right.toString();
    result += ")";
    return result;
};

/* =================================================== */

function find(root, node){
    var parent = root;
    
    if( node.ltr ){
        while(  (parent.right !== null) && 
                (parent.right.priority > node.priority))
            parent = parent.right;
        return parent;
    } else {
        while(  (parent.right !== null) && 
                (parent.right.priority >= node.priority) )
            parent = parent.right;
    }

    return parent;
}

function add(root, node){
    var parent = find(root, node);
    var tmp = parent.right;
    parent.right = node;
    node.left = tmp;
}

function parse(next, input){
    var root = new Node("root", Infinity);
    while( input.length > 0 ){
        var node = new Node(),
            token = next(root, input);

        node.token    = token.name;
        node.priority = token.priority;
        node.ltr      = token.ltr;
        
        if(token.scope)
            node.scope = parse(token.scope, input);
        if(token.exit)
            break;

        add(root, node);
    }
    return root.right;
}

// example use

prefix = "ltr";
postfix = "rtl";

tokens = {
    "="  : [7],
    "==" : [6],
    "+"  : [5], "-" : [5],
    "*"  : [4], "/" : [4],
    "!"  : [1, prefix], "~" : [1, prefix],
    "^"  : [1],
    " "  : [-1],
    "(" : [0, next], ")" : [0, "<"]
};

for(var i = 0; i < 10; i += 1) tokens[i] = [0];

// each token is defined such [priority, param]
//   if param is a function it will be used to enter a scope
//   if param is "<" it will end a scope
//   if param is "ltr"/"rtl" the token will be processed as such

// this function gets our next token from input
// this returns
//   name : name of the token
//   ltr  : should this token be in left to right order
//   priority : priority of the token
//   scope : which scope should this token enter
//   exit : should this token end current scope

function next(root, input){
    var token = input.shift(),
        action = tokens[token];
    if(typeof action === "undefined" ){
        return {
            name : token,
            ltr : leftToRight,
            priority : 0,
        };
    }

    var priority, param;

    if( action instanceof Array ){
        priority = parseFloat(action[0]);
        param = action[1];
    } else {
        priority = parseFloat(action);
        param = undefined;
    }

    if(typeof param === "function"){
        return {
            name : token,
            ltr : leftToRight,
            priority : priority,
            scope : param
        };
    } else if (param === "<"){
        return {
            name : token,
            ltr : leftToRight,
            priority : priority,
            exit : true
        };
    }

    var ltr = leftToRight;
    if(param === "ltr"){
        ltr = true;
    } else if (param === "rtl") {
        ltr = false;
    }

    return {
        name : token,
        priority : priority,
        ltr : ltr
    };
}

// the last row should say what is
// the first scope parser
next;
