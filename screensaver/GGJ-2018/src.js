"use strict";

var canvas = document.getElementById('view'),
	context = canvas.getContext("2d");

var TAU = Math.PI * 2;
var PHI = 1.61803398874989484820;

var screenWidth = 0;
var screenHeight = 0;
window.onresize = function(e) {
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;

	canvas.width = screenWidth;
	canvas.height = screenHeight;
};
window.onresize();

var Light = "hsla(57, 88%, 65%, 1)";
var Dark = "hsla(244, 49%, 25%, 1)";

var BOUNCE = 0;

(function(tick) {
	var last = new Date();
	var time = 0;

	function update() {
		window.requestAnimationFrame(update);
		try {
			context.save();
			var now = new Date();
			var dt = (now - last) * 0.001;
			last = now;
			if (dt > 0.1) {
				dt = 0.1;
			}
			time += dt;

			if (BOUNCE < 1.0) {
				BOUNCE += dt / 2.5;
			}

			var s = Math.sin(time * 8);
			var c = Math.cos(time * 7.3);
			var offset = 1 + (s + c) * 0.008;
			//tick(dt * offset);
			tick(dt);
		} finally {
			context.restore();
		}
	}
	window.setTimeout(update, 0);
})(Tick)

function random(min, max) {
	return +min + Math.random() * (+max - +min);
}

function randomsnap(min, max, snap) {
	return +min + Math.floor(Math.random() * (+max - +min) / +snap) * +snap;
}

function bounce(t, start, end, duration) {
	t = +t;
	start = +start;
	end = +end;
	duration = +duration;

	t = t / duration
	var ts = t * t
	var tc = ts * t
	return start + end * (33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t)
}

const rad2deg = 360.0 / TAU;
const deg2rad = TAU / 360.0;

/* vector.js */

function clamp01(x) {
	if (x < 0) return 0;
	if (x > 1) return 1;
	return x;
}

function clamp(x, min, max) {
	if (x < min) return min;
	if (x > max) return max;
	return x;
}

function lerp(a, b, p) {
	return a + (b - a) * p
}

function lerpClamped(a, b, p) {
	return lerp(a, b, clamp01(p));
}

class Vector {
	constructor(x, y) {
		this.x = +x;
		this.y = +y;
	}

	static fromAngle(angle, len) {
		len = +len || +1.0;
		return new Vector(Math.cos(angle) * len, Math.sin(angle) * len);
	}

	static lerp(a, b, p) {
		return a.add(b.sub(a).scale(p));
	}
	static lerpClamped(a, b, p) {
		return Vector.lerp(a, b, clamp01(p));
	}

	setAngle(angle, len) {
		this.x = Math.cos(angle) * len;
		this.y = Math.sin(angle) * len;
	}

	clone() {
		return new Vector(this.x, this.y);
	}
	zlerpTowards(p, a) {
		this.x = this.x * (1 - a) + p.x * a;
		this.y = this.y * (1 - a) + p.y * a;
	}
	zset(v) {
		this.x = v.x;
		this.y = v.y;
	}
	add(b) {
		return new Vector(this.x + b.x, this.y + b.y);
	}
	addmul(b, s) {
		return new Vector(this.x + b.x * s, this.y + b.y * s);
	}
	zaddmul(b, s) {
		this.x += b.x * s;
		this.y += b.y * s;
	}
	zadd(b) {
		this.x += b.x;
		this.y += b.y;
	}
	sub(b) {
		return new Vector(this.x - b.x, this.y - b.y);
	}
	zsub(b) {
		this.x -= b.x;
		this.y -= b.y;
	}
	scale(s) {
		return new Vector(this.x * s, this.y * s);
	}
	neg() {
		return new Vector(-this.x, -this.y);
	}
}
Vector.Zero = new Vector(0, 0);

function debug(p, size, color) {
	context.fillStyle = color || "#f00";
	context.beginPath();
	context.arc(p.x, p.y, size || 5, 0, TAU, true);
	context.fill();
}

function debugDir(p, angle, len, size, color) {
	context.strokeStyle = color || "#f00";
	context.lineWidth = size;
	context.beginPath();
	context.moveTo(p.x, p.y);
	var t = p.add(Vector.fromAngle(angle, len));
	context.lineTo(t.x, t.y);
	context.stroke();
}

var camera = Vector.Zero;
var hue = 0;

class Comet {
	constructor() {
		this.reset();
		this.delay = random(-1, 5);
	}
	reset() {
		this.hue = (random(0, 360) | 0);
		var dir = random(0, 1) < 0.5 ? -1 : 1;
		this.V = new Vector(dir * random(100, 200), random(0, 10));

		if (this.V.x < 0) {
			var px = random(0, screenWidth + -this.V.x * 15);
		} else {
			var px = random(-this.V.x * 15, screenWidth);
		}
		this.P = new Vector(px, -50);;
		this.R = random(3, 6);

		var p = this.P;
		this.tail = [];
		for (var i = 0; i < 10; i++) {
			this.tail.push(new Vector(p.x, p.y));
		}
	}

	update(dt) {
		if (this.delay > 0) {
			this.delay -= dt;
			return;
		}
		dt *= 2;

		this.P.zaddmul(this.V, dt);
		this.V.y += 5 * dt;

		var last = this.tail[0];

		if ((this.V.x < 0) && (last.x < 0)) this.reset();
		if ((this.V.y > 0) && (last.x > screenWidth)) this.reset();
		if (last.y > screenHeight * 1.3) this.reset();

		var last = this.P;
		var grab = 0.2;
		for (var i = 0; i < this.tail.length; i++) {
			var p = this.tail[i];
			p.zlerpTowards(last, grab);
			grab -= 0.01;
			last = p;
		}
	}

	draw(context) {
		var hue = this.hue;
		var h = screenHeight * 0.6;

		var alpha = 0.9;

		var lit = (this.P.y / h) * 100 | 0;
		var sat = Math.max(80 - lit, 0);
		var r = this.R;

		for (var i = 0; i < this.tail.length; i++) {
			var p = this.tail[i];

			context.fillStyle = "hsla(" + hue + ", " + sat + "%, " + lit + "%, " + alpha + ")";

			context.beginPath();
			context.arc(p.x, p.y, r, 0, TAU, true);
			context.fill();

			hue += 30;
			r += 3;
			r *= 1.1;
			alpha *= 0.65;
		}

		context.fillStyle = "rgba(255, 255, 255, 0.9)";
		context.beginPath();
		context.arc(this.P.x, this.P.y, this.R - 1, 0, TAU, true);
		context.fill();
	}
}

var comets = [];
for (var i = 0; i < 70; i++) {
	comets.push(new Comet());
}

function Tick(dt) {
	context.save(); {
		hue += dt * 10;
		var sat = 80 + Math.sin(hue) * 10;
		var lit = 10;

		function linearGradient(full, y0, y1, stops) {
			y0 *= screenHeight;
			y1 *= screenHeight;

			var g = context.createLinearGradient(0, y0, 0, y1);

			for (var i = 0; i < stops.length; i++) {
				g.addColorStop(stops[i][0], stops[i][1]);
			}

			context.fillStyle = g;
			context.fillRect(0, y0, screenWidth, y1);
		}

		linearGradient(false, 0, 0.9, [
			[0.00, "hsla(57, 78%, 50%, 0.2)"],
			[0.40, "hsla(57, 88%, 65%, 0.2)"],
			[0.75, "hsla(57, 88%, 65%, 0.2)"],
			[0.80, "hsla(57, 78%, 55%, 0.2)"],
			[1.00, "hsla(35, 49%, 25%, 0.2)"]
		]);

		//context.globalCompositeOperation = "lighter";
		//context.globalCompositeOperation = "screen";
		context.globalCompositeOperation = "overlay";

		comets.forEach(comet => {
			comet.update(dt);
		});

		comets.forEach(comet => {
			comet.draw(context);
		});

		context.globalCompositeOperation = "source-over";
		linearGradient(false, 0.7, 1, [
			[0.00, "hsla(280, 49%, 25%, 0)"],
			[0.15, "hsla(280, 49%, 25%, 0.2)"],
			[0.25, "hsla(280, 49%, 25%, 0.55)"],
			[0.45, "hsla(280, 49%, 25%, 0.6)"],
			[0.50, "hsla(280, 49%, 25%, 1)"],
			[0.65, "hsla(244, 49%, 25%, 1)"],
			[1.00, "hsla(244, 49%, 15%, 1)"]
		]);
	}
	context.restore();

	function textWithShadow(text, x, y, size, align) {
		var fontSize = (screenHeight * size) | 0;
		context.font = fontSize + "px Georgia small-caps";
		var size = context.measureText(text);

		if (align == "left") {} else if (align == "right") {
			x -= size.width;
		} else {
			x -= size.width / 2;
		}

		context.fillStyle = "rgba(0,0,0,0.5)";
		context.fillText(text, x, y - fontSize * 0.5 + fontSize * 0.05);

		context.lineWidth = 5;
		context.strokeStyle = "rgba(0,0,0,0.5)";
		context.strokeText(text, x, y - fontSize * 0.5);

		context.fillStyle = "rgba(255, 255, 255, 1)";
		context.fillText(text, x, y - fontSize * 0.5);
	}

	function countdown(targethours) {
		function pad(x) {
			return x < 0 ? x : x < 10 ? "0" + x : x;
		}

		var now = new Date();
		var target = new Date(2017, 11, 4, targethours);
		var totalSeconds = (target - now) / 1000;
		if (totalSeconds < 0) {
			return "";
		}

		var hours = (totalSeconds / (60 * 60)) | 0;
		var minutes = ((totalSeconds / 60) - hours * 60) | 0;
		var seconds = (totalSeconds - minutes * 60 - hours * 60 * 60) | 0;

		return hours + ":" + pad(minutes) + ":" + pad(seconds);
	}

	{
		var base = screenHeight * 0.02;
		var step = screenHeight * 0.05;
		var block = screenHeight * 0.1;
		var x = screenWidth / 2 - screenWidth * 0.04;
		var x2 = screenWidth / 2 + screenWidth * 0.04;

		textWithShadow("Global Game Jam\n2018",
			screenWidth * 0.5,
			screenHeight * 0.89,
			0.1);
	}
}