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


function R(size) {
	return Math.random() * size;
}

function RR(a, b) {
	return Math.random() * (b - a) + a;
}

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


var flicker = [];
for (var i = 0; i < 20; i++) {
	flicker.push(Math.random());
}

var letters = [{
	t: "L",
	x: [0, 0, 0, 1],
	y: [0, 0.5, 1, 1]
}, {
	t: "D",
	c: true,
	x: [0, 0, 0, 1, 1],
	y: [0, 0.5, 1, 0.75, 0.25]
}, {
	t: "3",
	x: [0, 1, 1, 0, 1, 1, 0],
	y: [0, 0, 0.5, 0.5, 0.5, 1, 1]
}, {
	t: "6",
	x: [1, 0, 0, 0, 1, 1, 0],
	y: [0, 0, 0.5, 1, 1, 0.5, 0.5]
}];

var time = 0;

function X() {
	var s = Math.abs(
		Math.cos(time * 0.42 * 0.3) *
		Math.sin(time * 0.51 * 0.3) *
		view.size.y / 24
	) + 1;
	return RR(-s, s);
}

function drawletter(p, sz, letter) {
	context.beginPath();
	for (var i = 0; i < letter.x.length; i++) {
		var g = {
			x: p.x + sz.x * letter.x[i] + X(),
			y: p.y + sz.y * letter.y[i] + X()
		};

		if (i == 0) {
			context.moveTo(g.x, g.y);
		} else {
			context.lineTo(g.x, g.y);
		}
	}
	if (letter.c) {
		context.closePath();
	}

	context.strokeStyle = "hsla(90,100%,70%,0.2)";
	context.lineWidth = view.size.y / 18;
	context.stroke();
}

function tick(dt) {
	time += dt;

	var g = context.createRadialGradient(
		view.size.x / 2, view.size.y / 2,
		Math.min(view.size.x / 2, view.size.y / 2) / 3,

		view.size.x / 2, view.size.y / 2,
		Math.max(view.size.x / 2, view.size.y / 2)
	);

	g.addColorStop(0, "hsla(90,80%,10%,0.4)");
	g.addColorStop(1, "hsla(90,30%,10%,0.8)");

	context.fillStyle = g;
	context.fillRect(0, 0, view.size.x, view.size.y);

	for (var i = 0; i < flicker.length; i++) {
		flicker[i] += RR(-0.01, 0.01);
		if (Math.random() < 0.01) {
			flicker[i] = Math.random();
		}
		if ((flicker[i] < 0) || (flicker[i] > 1)) {
			flicker[i] = Math.random();
		}

		var y = (flicker[i] * view.size.y) | 0;
		context.fillStyle = "hsla(90,80%,70%,0.2)";
		context.fillRect(0, y, view.size.x, 3);
	}

	context.strokeStyle = "#ccc";
	context.lineWidth = 8;

	var sz = {
		x: 0,
		y: view.size.y / 4
	};
	sz.x = sz.y * 0.7;

	var pads = 1 + 0.5;
	var p = {
		x: view.size.x / 2 - letters.length * sz.x * pads / 2,
		y: view.size.y / 2 - sz.y / 2
	};
	for (var i = 0; i < letters.length; i++) {
		drawletter(p, sz, letters[i]);
		drawletter(p, sz, letters[i]);
		drawletter(p, sz, letters[i]);
		drawletter(p, sz, letters[i]);
		drawletter(p, sz, letters[i]);
		p.x += sz.x * pads;
	}

	context.fillStyle = g;
	context.fillRect(0, 0, view.size.x, view.size.y);

	var liney = 230;

	function line(size, text, x, dy) {
		context.font = "Bold " + size + "px monospace";
		var w = context.measureText(text).width;
		x -= w / 2;

		var rx = String.fromCharCode((Math.random() * 1500 + 32) | 0);
		context.fillText(text, x, liney);
		context.strokeText(text, x, liney);

		liney += size * 1.1;
	}


	context.fillStyle = "hsla(90,100%,80%,1)";
	context.lineWidth = 1;
	context.strokeStyle = "hsla(90,100%,0%,1)";

	var starty = 40;

	var fontsz = view.size.y / 10;
	liney = fontsz * 2;
	var px = view.size.x / 2;
	liney = view.size.y / 2;
	line(fontsz, "Ancient Technology", px, 10);

	/*
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

	line(120, "award", view.size.x / 2, 1.1);
	line(120, "ceremony", view.size.x / 2, 1.3);
	y += 50;
	line(140, "21:00", view.size.x / 2, 1.2);
	*/
}

setInterval(function() {
	tick(0.033);
}, 33);