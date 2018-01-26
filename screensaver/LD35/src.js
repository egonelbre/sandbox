"use strict";

var canvas = document.getElementById('view'),
	context = canvas.getContext("2d");

var TAU = Math.PI * 2;

var view = {
	size: {
		x: 0,
		y: 0
	}
};

window.onresize = function(e) {
	view.size.x = window.innerWidth;
	view.size.y = window.innerHeight - 100;

	canvas.width = view.size.x;
	canvas.height = view.size.y;
};
window.onresize();


function poly(N, s) {
	var points = [];
	for (var i = 0; i < N; i += 1) {
		points.push({
			x: s * Math.cos(TAU * i / N),
			y: s * Math.sin(TAU * i / N)
		});
	}
	return points;
};

function drawpoly(context, poly, id, coord) {
	context.beginPath();
	for (var i = 1; i < poly.length; i++) {
		var p = poly[i];
		var x = p.x * (Math.cos(coord.x + id * 0.9) + Math.sin(i * id / 3) + 2) / 2;
		var y = p.y * (Math.cos(coord.y + id * 1.1) + Math.sin(i * id / 3) + 2) / 2;
		if (i == 0) {
			context.moveTo(x, y);
		} else {
			context.lineTo(x, y);
		}
	}
	context.closePath();
}

var polysize = 30;
var octagon = poly(32, 30);

var time = 0;

function tick(dt) {
	time += dt;

	context.fillStyle = "hsla(" + (time * 10) + ",70%,65%,1)";
	context.fillStyle = "#fff";
	context.fillRect(0, 0, view.size.x, view.size.y);

	context.strokeStyle = "#ccc";
	context.lineWidth = 8;

	var p = {
		x: 0,
		y: 0
	};
	var coord = {
		x: 0,
		y: 0
	};
	while (p.y <= view.size.y + polysize) {
		p.x = 0;
		coord.x = 0;
		while (p.x <= view.size.x + polysize) {
			var id = coord.x * Math.sqrt(coord.y) + time;

			context.fillStyle = "hsla(" + (id * 15) + ",40%, " + (70 + (Math.sin(id * 5) * 10 | 0)) + "%, 1)";
			context.strokeStyle = "hsla(" + (id * 15) + ",40%, " + (70 + (Math.sin(id * 5) * 10 | 0)) + "%, 1)";

			context.save();
			context.translate(p.x, p.y);
			context.rotate(id)
			drawpoly(context, octagon, id, coord);
			context.restore();

			context.stroke();

			p.x += polysize * 4;
			coord.x++;
		}
		coord.y++;
		p.y += polysize * 5;
	}


	context.strokeStyle = "#fff";
	context.lineWidth = 1;
	context.fillStyle = "#000";

	var y = 230;

	function line(size, text, x, dy) {
		context.font = "Bold " + size + "px monospace";
		var w = context.measureText(text).width;
		x -= w / 2;
		context.fillText(text, x, y + Math.sin(time * dy) * 20);
		context.strokeText(text, x, y + Math.sin(time * dy) * 20);

		y += size * 1.1;
	}

	line(120, "Shapeshift", view.size.x / 2, 1.1);
	y += 50;
	line(140, "LD37", view.size.x / 2, 1.2);
}

setInterval(function() {
	//console.profile("tick");
	tick(0.033);
	//console.profileEnd();
}, 33);