"use strict";

function V(x,y){
	return {x:x||0, y:y||0};
}

V.distSq = function(from, to){
	return Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2);
};

V.dist = function(from, to){
	return Math.sqrt(V.distSq(from, to));
}

V.dot = function(a, b){
	return a.x * b.x + a.y * b.y;
};

V.add = function(a, b, r){
	r = r || {x:0,y:0};
	r.x = a.x + b.x;
	r.y = a.y + b.y;
	return r;
};

V.sub = function(a, b, r){
	r = r || {x:0,y:0};
	r.x = a.x - b.x;
	r.y = a.y - b.y;
	return r;
};

V.nearToLine = function(from, to, pos, err){
	var err2, len2, px, py, dx, dy;
    err2 = err*err;
    
    dx = from.x - to.x;
    dy = from.y - to.y;
    len2 = dx*dx + dy*dy;

    if (len2 <= 0.00001 ){ return false; }

    var t = (pos.x - from.x)*(to.x - from.x) + 
            (pos.y - from.y)*(to.y - from.y);
    t /= len2;

    // out of ends
    if ( t < 0 ) {
    	dx = from.x - pos.x;
    	dy = from.y - pos.y;
    	return dx*dx + dy*dy < err2;
    }

    if ( t > 1.0 ) {
    	dx = to.x - pos.x;
    	dy = to.y - pos.y;
    	return dx*dx + dy*dy < err2;
    }

    dx = from.x + t * (to.x - from.x) - pos.x;
    dy = from.y + t * (to.y - from.y) - pos.y;

    return dx*dx + dy*dy < err2;
};