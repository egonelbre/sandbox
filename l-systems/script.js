// canvas setup
var d = document,
    canvas = document.getElementById("canvas"),
    c = canvas,
    W = 800,
    H = 700;
c.width = W,
    c.height = H,
    c = c.getContext("2d");

// Math function aliases
var cos = Math.cos,
    sin = Math.sin,
    abs = Math.abs,
    sqrt = Math.sqrt,
    sgn = function(val) {
        return val >= 0 ? 1 : -1
    },
    atan2 = Math.atan2,
    rand = Math.random,
    TAU = 2 * Math.PI;

// logging
dolog = true;

function logCreate(mod) {
    var i = 0;
    return function() {
        if (!dolog) return;
        if (i % mod == 0)
            console.log(arguments);
        i = (i + 1) % mod;
    }
}

log = logCreate(1);
logS = logCreate(60);

// Mouse
$M = {
    loc: V2(W / 2, H / 2),
    dloc: V2(0, 0),
    uloc: V2(0, 0),
    down: false,
    action: 0,
    pressed: false
};

function V2(x, y) {
    return {
        x: x || 0.0,
        y: y || 0.0
    };
}

V2c = function(v) {
    return {
        x: v.x,
        y: v.y
    };
}

V2add = function(a, b, r) {
    r.x = a.x + b.x;
    r.y = a.y + b.y;
}

V2sub = function(a, b, r) {
    r.x = a.x - b.x;
    r.y = a.y - b.y;
}

V2scale = function(a, s, r) {
    c.x = a.x * s;
    c.y = a.y * s;
}

V2dot = function(a, b, r) {
    r.x = a.x * b.x;
    r.y = a.y * b.y;
}

V2rot = function(a, angle, r) {
    r.x = a.x * cos(angle) - a.y * sin(angle);
    r.y = a.y * sin(angle) + a.y * cos(angle);
}

RotM2 = function(angle) {
    return {
        x11: cos(angle),
        x12: -sin(angle),
        x21: sin(angle),
        x22: cos(angle)
    };
}

M2xV2 = function(m, v, r) {
    r.x = v.x * m.x11 + v.y * m.x12;
    r.y = v.x * m.x21 + v.y * m.x22;
}

MAX = 1000000;

defCommands = {
    "F": "~"
};

defVars = {
    angle: [TAU / 9, -MAX, MAX],
    min: [TAU / 12, -MAX, MAX],
    max: [TAU / 9, -MAX, MAX],
    spread: [0.0, 0.0, MAX],

    length: [14.0, -MAX, MAX],
    width: [7.0, 0.0, MAX],

    hue: [90.0, -MAX, MAX],
    saturation: [60.0, 0.0, 100],
    lightness: [60.0, 0.0, 100],
    alpha: [1.0, 0.0, 1.0]
};

defSetup = {
    round: true,
    length_scale: 1.0,
    width_scale: 1.0,
    start: V2(0.5, 0.5)
};

leaf = {
    axiom: "X",
    rules: {
        "F": "FF",
        "X": "F/[[X]*X]*F[*FX]/X"
    },
}

dragon = {
    axiom: "X",
    rules: {
        "X": "X+Y+",
        "Y": "-X-Y",
    },
    commands: {
        "X": "~",
        "Y": "~#hue+5;",
    },
    vars: {
        angle: [TAU / 4, -MAX, MAX],

        length: [5.0, -MAX, MAX],
        width: [2.0, 0.0, MAX],

        hue: [90.0, -MAX, MAX],
        saturation: [60.0, 0.0, 100],
        lightness: [60.0, 0.0, 100],
        alpha: [1.0, 0.0, 1.0]
    },
}

tree_at_fall = {
    axiom: "SF" +
        "[(#min=-75;#max=75;*)(#length=1.3;#size*0.35;X)]" +
        "[(#min=-75;#max=75;*)(#length=1.2;#size*0.35;X)]" +
        "[(#min=-45;#max=45;*)(#length=1.5;#size*0.35;X)]" +
        "[(#min=-85;#max=85;*)(#length=1.1;#size*0.35;X)]" +
        "[(#min=-65;#max=65;*)(#length=1.4;#size*0.35;X)]" +
        "[(#min=-35;#max=35;*)(#length=1.6;#size*0.35;X)]" +
        "[(#min=-45;#max=45;*)(#length=1.5;#size*0.35;X)]" +
        "[(#min=-85;#max=85;*)(#length=1.1;#size*0.35;X)]" +
        "[(#min=-75;#max=75;*)(#length=1.3;#size*0.35;X)]",
    rules: {
        "S": "#size+1;#size*1.5;S",
        "F": "DFDF",
        "X": "VX" +
            "|0.1{[R(ZX)L]}{}" +
            "VX" +
            "[Y(ZX)L]" +
            "[Y(ZX)LN]" +
            "[Y(ZX)L]"
    },
    commands: {
        "D": "(#min=-2;#max=2;*)",
        "F": "#size*0.9926;(#length=1.5;#hue=0; #alpha=0.5; ~)",

        "R": "(#min=20;#max=60;|0.5{*}{/})",
        "V": "(#min=-5;#max=5;*)",
        "Y": "(#min=-75;#max=75;*)",
        "Z": "#size*0.5;",
        "X": "(#hue=30;#alpha=0.5;~)",

        "L": "|0.5{#hue-5;}{#hue-17;}(#size=1; #length=0.5; #alpha=0.05;  [  [@=45;%=1.4142;-~+@=18.435; %=3.1623;+~][@=-45;%=1.4142;-~+@=-18.435; %=3.1623;+~]   [@=36.8699;%=1.25;-~+@=14.0362; %=3.0923;+~][@=-36.8699;%=1.25;-~+@=-14.0362; %=3.0923;+~]    [@=26.5651;%=1.118;-~+@=9.4623; %=3.0414;+~][@=-26.5651;%=1.118;-~+@=-9.4623; %=3.0414;+~]    [@=14.0262;%=1.0308;-~+@=4.7636; %=3.0104;+~][@=-14.0262;%=1.0308;-~+@=-4.7636; %=3.0104;+~]  @=0;%=4;~ @=22.0;])",

        "P": "[(#length=0;#size=10;#alpha=0.5;#red<1;#green<1;#blue<1;" +
            "|0.6{|0.6{#red=0.9;#green=0.1;}{#red=0.8;#green=0.2;}}{|0.6{#red=0.7;#green=0.3;}{#red=0.6;#green=0.4;}}" +
            "~)]"
    },
    vars: { //     val   min  max
        angle: [TAU / 18, -MAX, MAX],
        min: [TAU / 24, -MAX, MAX],
        max: [TAU / 12, -MAX, MAX],
        spread: [0.0, 0.0, MAX],

        length: [1.0, -MAX, MAX],
        width: [2.0, 0.0, MAX],

        hue: [0.0, -MAX, MAX],
        saturation: [70.0, 0.0, 100],
        lightness: [70.0, 0.0, 100],
        alpha: [1.0, 0.0, 1.0]
    }
}

bush_at_night = {
    axiom: "F",
    rules: {
        "F": "FF/[(#width-5;/F*F*FL)]*[(#width-5;*F/F/FL)]"
    },
    commands: {
        "F": "(#hue=30;#lightness=15;#saturation=13;~)",
        "L": "(#width=100;#alpha=0.10;~)"
    },
    vars: { //     val   min  max
        angle: [0.0, -MAX, MAX],
        min: [TAU / 20, -MAX, MAX],
        max: [TAU / 16, -MAX, MAX],
        spread: [0.0, 0.0, MAX],

        length: [16.0, -MAX, MAX],
        width: [20.0, 0.0, MAX],

        hue: [90.0, -MAX, MAX],
        saturation: [70.0, 0.0, 100],
        lightness: [20.0, 0.0, 100],
        alpha: [1.0, 0.0, 1.0]
    },
    setup: {
        round: true,
        length_scale: 1.0,
        width_scale: 0.5,
        start: V2(0.5, 1.0)
    }
}

xtree = {
    axiom: "F",
    rules: {
        "F": "FF[*L/L]L[/L]"
    },
    commands: {
        "F": "#hue=30;~", //"(#hue=30;#lightness=15;#saturation=13;~)",
        "L": "#hue=90;~", //"(#width=100;#alpha=0.10;~)"
    },
    vars: { //     val   min  max
        angle: [0.0, -MAX, MAX],
        min: [TAU / 20, -MAX, MAX],
        max: [TAU / 16, -MAX, MAX],
        spread: [0.0, 0.0, MAX],

        length: [16.0, -MAX, MAX],
        width: [20.0, 0.0, MAX],

        hue: [90.0, -MAX, MAX],
        saturation: [70.0, 0.0, 100],
        lightness: [20.0, 0.0, 100],
        alpha: [1.0, 0.0, 1.0]
    },
    setup: {
        round: true,
        length_scale: 1.0,
        width_scale: 0.5,
        start: V2(0.5, 1.0)
    }
}

useDefinition = dragon;

useIterations = 16;

function LSystem(def) {
    // system generation
    this.axiom = def.axiom;
    this.rules = def.rules;
    this.commands = def.commands || defCommands;
    this.vars = def.vars || defVars;
    this.setup = def.setup || defSetup;

    // add implicit undefined extensions
    var extensions = def.axiom;
    for (var r in def.rules)
        extensions += def.rules[r];
    for (var i = 0, l = extensions.length; i < l; i++) {
        var ext = extensions[i];
        this.rules[ext] = this.rules[ext] || ext;
        this.commands[ext] = this.commands[ext] || ext;
    }

    this.tree = "";
};

LSystem.prototype.generate = function(iterations) {
    var rules = this.rules,
        commands = this.commands,
        tree = this.axiom,
        new_tree = [];

    // generate tree
    for (var it = 0; it < iterations; it++) {
        var new_tree = [];
        for (var i = 0, l = tree.length; i < l; i++) {
            var rule = tree.charAt(i);
            new_tree.push(rules[rule] || rule);
        }
        tree = new_tree.join("");
    }

    // replace with commands
    var cmds = [];
    for (var i = 0, l = tree.length; i < l; i++) {
        var rule = tree.charAt(i),
            replacement = commands[rule] || rule;
        cmds.push(replacement);
    }
    tree = cmds.join("");

    this.tree = tree;
}

LSystem.prototype.render = function(c, size, time) {
    var stack = [],
        varstack = [],
        start = V2(size.x * this.setup.start.x, size.y * this.setup.start.y),
        point = {
            loc: start,
            rot: -TAU / 4
        },
        vars = {},
        move = V2(0.0, 0.0),
        width_scale = this.setup.width_scale || 1.0,
        length_scale = this.setup.length_scale || 1.0;

    for (var v in this.vars)
        vars[v] = this.vars[v].slice();

    if (this.setup.round)
        c.lineCap = "round";
    else
        c.lineCap = "butt";

    // system rendering
    var actions = {
        "~": function() { // draw forward
            move.x = length_scale * vars.length[0] * cos(point.rot);
            move.y = length_scale * vars.length[0] * sin(point.rot);
            if (vars.width[0] <= 0.00001) {
                V2add(point.loc, move, point.loc);
                return;
            };
            c.beginPath();
            c.strokeStyle = "hsla(" + vars.hue[0] + ", " + vars.saturation[0] + "%, " + vars.lightness[0] + "%, " + vars.alpha[0] + ")";
            c.lineWidth = vars.width[0] * width_scale;
            c.moveTo(point.loc.x, point.loc.y);
            V2add(point.loc, move, point.loc);
            c.lineTo(point.loc.x, point.loc.y);
            c.stroke();
        },
        "^": function() { // jump forward
            move.x = vars.length[0] * cos(point.rot);
            move.y = vars.length[0] * sin(point.rot);
            V2add(point.loc, move, point.loc);
        },
        "+": function() { // turn right
            point.rot += vars.angle[0];
        },
        "-": function() { // turn left
            point.rot -= vars.angle[0];
        },
        "*": function() { // turn random right
            point.rot += rand() * (vars.max[0] - vars.min[0]) + vars.min[0];
        },
        "/": function() { // turn random left
            point.rot -= rand() * (vars.max[0] - vars.min[0]) + vars.min[0];
        },
        "(": function() { // save vars
            var nvars = {};
            for (var v in vars)
                nvars[v] = vars[v].slice();
            varstack.push(nvars);
        },
        ")": function() { // load vars
            vars = varstack.pop();
        },
        "[": function() { // save pos/heading
            stack.push(point);
            point = {
                loc: V2c(point.loc),
                rot: point.rot
            };
        },
        "]": function() { // restore pos/heading
            point = stack.pop();
        }
    };
    var tree = this.tree,
        cmdRegEx = /^([a-z]+)([<>]?)([\+\-\*\/\=])([0-9\.e\+\-]+)(\??)$/;
    // matches   ^ name  ^ idx  ^ operator    ^ value

    for (var i = 0, l = tree.length; i < l; i++) {
        var act = tree.charAt(i);
        switch (act) {
            case "#":
                var start = i,
                    last = tree.indexOf(";", i),
                    cmd = tree.substring(start + 1, last),
                    matches = cmdRegEx.exec(cmd);
                if (!matches || matches.length < 5) throw "Unkown cmd: '" + cmd + "' @ " + start;
                var varname = matches[1],
                    vartype = matches[2] || "",
                    varop = matches[3],
                    num = parseFloat(matches[4]),
                    numrand = matches[5] == "?",
                    validate = false,
                    idx = 0;

                if (numrand)
                    num *= rand();

                switch (vartype) {
                    case "":
                        idx = 0;
                        break;
                    case ">":
                        idx = 1;
                        break;
                    case "<":
                        idx = 2;
                        break;
                    default:
                        throw "Unknown vartype : " + vartype + " @ " + start;
                }

                switch (varop) {
                    case "=":
                        vars[varname][idx] = num;
                        break;
                    case "+":
                        vars[varname][idx] += num;
                        break;
                    case "-":
                        vars[varname][idx] -= num;
                        break;
                    case "*":
                        vars[varname][idx] *= num;
                        break;
                    case "/":
                        vars[varname][idx] /= num;
                        break;
                    default:
                        throw "Unknown varop : " + varop + " @ " + start;
                }

                if (idx == 0) {
                    var vararr = vars[varname];
                    if (vararr[0] < vararr[1])
                        vararr[0] = vararr[1];
                    if (vararr[0] > vararr[2])
                        vararr[0] = vararr[2];
                }

                i = last;
                break;
            default:
                var action = actions[act] || function() {};
                action();
        }
    }
}

function World() {
    this.systems = [];
    this.mouse = {
        start: V2(0, 0),
        stop: V2(0, 0),
        drawing: true,
        action: 0
    };
}

World.prototype.logic = function() {
    this.mouse.drawing = $M.down;
    if ($M.pressed || $M.down) {
        this.mouse.start = $M.dloc;
        this.mouse.stop = $M.loc;
        this.mouse.action = $M.action;
    }
    if ($M.pressed) {
        $M.pressed = false;
        this.mouse.start = $M.dloc;
        this.mouse.stop = $M.uloc;
        this.mouse.apply = true;
    }
};

World.prototype.render = function(c) {
    { // Background
        c.fillStyle = "#000";
        c.fillRect(0, 0, W, H);
        c.fillStyle = "#000";
        c.strokeStyle = "#000";
    }

    { // systems
        var time = (new Date()).getTime() / 720;
        for (var i = 0, l = this.systems.length; i < l; i++) {
            var sys = this.systems[i];
            sys.render(c, V2(W, H), time);
        }
    }

    return;

    { // mouse
        c.fillStyle = "#8f3";
        c.strokeStyle = "#000";
        c.lineWidth = 1.0;
        c.beginPath();
        c.arc($M.loc.x, $M.loc.y, 3, 0, TAU, true);
        c.closePath();
        c.fill();
        c.stroke();

        if (this.mouse.drawing) {
            c.strokeStyle = "#f00";
            c.beginPath();
            c.moveTo(this.mouse.start.x, this.mouse.start.y);
            c.lineTo(this.mouse.stop.x, this.mouse.stop.y);
            c.stroke();
        }
    }
};

world = new World();
sys = new LSystem(useDefinition);
sys.generate(useIterations);
world.systems.push(sys);

animate = function() {
    return;
    if (world) {
        world.logic();
        world.render(c);
    }
};

world.render(c);

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback, element) {
        window.setTimeout(callback, 1000 / 60);
    };

off = [canvas.offsetLeft, canvas.offsetTop];

function extractPos(e) {
    if (e.offsetX) {
        return V2(e.offsetX, e.offsetY);
    } else if (e.layerX) {
        return V2(e.layerX, e.layerY);
    }
    return V2(e.clientX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
}

canvas.onmousemove = function(e) {
    $M.loc = extractPos(e);
};
canvas.onmousedown = function(e) {
    $M.down = true;
    $M.action = e.button;
    $M.dloc = extractPos(e);
};
canvas.onmouseup = function(e) {
    $M.pressed = true;
    $M.down = false;
    $M.uloc = extractPos(e);
};

(function _animation_loop_() {
    animate();
    requestAnimFrame(_animation_loop_);
})();