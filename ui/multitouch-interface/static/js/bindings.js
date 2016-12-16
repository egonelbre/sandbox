var mouseDown = false;
var mouseBinding = function(action){
    return function(e){
        if(action == "start"){
            mouseDown = true;
        } else if (action == "end"){
            mouseDown = false;
        }
        if(!mouseDown && (action == "move")) return;

        var touch = e;
        touch.cx = touch.pageX - canvas.offsetLeft;
        touch.cy = touch.pageY - canvas.offsetTop;
        touch.identifier = "mouse";
        main.touch(action, touch);

        e.preventDefault();
    }
};

canvas.onmousemove=mouseBinding("move");
canvas.onmousedown=mouseBinding("start");
canvas.onmouseup=mouseBinding("end");

var keyBinding = function(action){
    return function(e){
        main.key(action, e);
    }
};

document.onkeydown=keyBinding("down");
document.onkeypress=keyBinding("press");
document.onkeyup=keyBinding("up");


var touchBinding = function(action){
    return function(e){
        e.preventDefault();

        for(var i = 0; i < e.changedTouches.length; i += 1){
            var touch = e.changedTouches[i];
            touch.cx = touch.pageX - canvas.offsetLeft;
            touch.cy = touch.pageY - canvas.offsetTop;
            main.touch(action, touch);
        }
    }
};

canvas.addEventListener("touchstart",  touchBinding("start"));
canvas.addEventListener("touchend",    touchBinding("end"));
canvas.addEventListener("touchcancel", touchBinding("cancel"));
canvas.addEventListener("touchmove",   touchBinding("move"));


//canvas.addEventListener("gesturestart", function(e){});
//canvas.addEventListener("gesturechange", function(e){});
//canvas.addEventListener("gestureend", function(e){);

body.onload=window.onload=window.onresize=function(e){
    var s = {x:canvas.clientWidth, y:canvas.clientHeight};
    canvas.setAttribute("width", s.x + "px");
    canvas.setAttribute("height", s.y + "px");
    main.setSize(s);
}