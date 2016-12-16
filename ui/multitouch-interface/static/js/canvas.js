"use strict";

var tau = Math.PI*2;

var angle_between = function(from, to){
	var dx = from.x - to.x,
		dy = from.y - to.y;
	return Math.atan2(dy, dx);
}

CanvasRenderingContext2D.prototype.arrow = function(points, width, lineWidth){
    if(points.length < 2){
    	throw "Requires at least 2 points!";
    }
    
    lineWidth = lineWidth || 1;

    var fill = ctx.fillStyle,
    	stroke = ctx.strokeStyle;

    var angle, dx, dy, prex, prey, last;

    this.lineWidth = width;
    this.lineCap = "round";
    this.lineJoin = "round";

    this.beginPath();
    this.moveTo(points[0].x, points[0].y);
    for(var i = 1; i < points.length-1; i += 1){
    	this.lineTo(points[i].x, points[i].y);
    }

    last = points[points.length-1];

    angle = angle_between(points[points.length-2], last);
    dx = Math.cos(angle)*width*2;
    dy = Math.sin(angle)*width*2;

    prex = last.x + dx,
    prey = last.y + dy;
    
    this.lineTo(prex, prey);
    this.stroke();

    this.strokeStyle = fill;
    this.lineWidth = width - lineWidth*2;
    this.stroke();

    this.strokeStyle = stroke;

    this.lineWidth = lineWidth;
    this.lineCap = "butt";
    this.lineJoin = "miter";

    this.beginPath();
    
    angle += tau/4;
    dx = Math.cos(angle)*width;
    dy = Math.sin(angle)*width;
    
    this.moveTo(prex+dx, prey+dy);
    this.lineTo(last.x, last.y);
    this.lineTo(prex-dx, prey-dy);

    this.closePath();
	this.fill();
    this.stroke();
}
