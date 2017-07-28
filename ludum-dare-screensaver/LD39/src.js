"use strict";

var canvas = document.getElementById('view'),
	context = canvas.getContext("2d");

var TAU = Math.PI * 2;
var PHI = 1.61803398874989484820;

var Time = 0.0;
var Scale = 10.0;

function Vector(x, y) {
	this.X = +x || 0.0;
	this.Y = +y || 0.0;
}
Vector.prototype = {
	Zero: function() {
		var a = this;
		a.X = 0.0;
		a.Y = 0.0;
	},
	Clone: function() {
		var a = this;
		return new Vector(a.X, a.Y);
	},
	Set: function(b) {
		var a = this;
		a.X = b.X;
		a.Y = b.Y;
	},
	Add: function(b) {
		var a = this;
		a.X += b.X;
		a.Y += b.Y;
	},
	Sub: function(b) {
		var a = this;
		a.X -= b.X;
		a.Y -= b.Y;
	},
	AddScaled: function(b, s) {
		var a = this;
		a.X += b.X * s;
		a.Y += b.Y * s;
	},
	SubScaled: function(b, s) {
		var a = this;
		a.X -= b.X * s;
		a.Y -= b.Y * s;
	},
	Scale: function(s) {
		var a = this;
		a.X *= s;
		a.Y *= s;
	},
	Length: function() {
		var a = this;
		return Math.sqrt(
			a.X * a.X +
			a.Y * a.Y
		);
	},
	Length2: function() {
		var a = this;
		return a.X * a.X + a.Y * a.Y;
	}
}

var Size = new Vector(0, 0);

window.onresize = function(e) {
	Size.X = window.innerWidth;
	Size.Y = window.innerHeight - 100;

	canvas.width = Size.X;
	canvas.height = Size.Y;
};
window.onresize();

var Min = Math.min;
var Max = Math.max;
var Abs = Math.abs;

function Random(size) {
	return Math.random() * size;
}

function RandomRange(a, b) {
	return Math.random() * (b - a) + a;
}

function RandomVector(low, high) {
	return new Vector(
		RandomRange(low, high),
		RandomRange(low, high)
	);
}

function Text(text, height, x, y, color, stroke, font) {
	context.fillStyle = color || "#fff";
	context.strokeStyle = stroke || "rgba(0,0,0,0.7)";
	context.font = height + "px " + (font || "Perfect Dark");
	context.lineWidth = height / 6;

	var lines = text.split("\n");

	var width = 0;
	for (var i = 0; i < lines.length; i++) {
		var w = context.measureText(lines[i]).width;
		if (w > width) {
			width = w;
		}
	}

	var totalHeight = lines.length * height;

	x -= width / 2;
	y += height / 2 - totalHeight / 2;

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		context.beginPath();
		context.strokeText(line, x, y);
		context.fillText(line, x, y);

		y += height;
	}
}

function TextRight(text, height, x, y, color, stroke) {
	context.fillStyle = color || "#fff";
	context.strokeStyle = stroke || "#000";
	context.lineWidth = height / 30;
	context.font = height + "px Perfect Dark";

	var width = context.measureText(text).width;
	context.beginPath();
	context.strokeText(text, x - width, y + height / 2);
	context.fillText(text, x - width, y + height / 2);
}

function TextLeft(text, height, x, y, color, stroke) {
	context.fillStyle = color || "#fff";
	context.strokeStyle = stroke || "#000";
	context.lineWidth = text / 30;
	context.font = height + "px Perfect Dark";

	context.beginPath();
	context.strokeText(text, x, y + height / 2);
	context.fillText(text, x, y + height / 2);
}

var QuoteTimer = 0.0;
var QuoteIndex = 0;
var Quote = "";
var Quotes = [
	"When life gives you lemons, don't make lemonade.\nMake life take the lemons back.\nGET MAD!\nI DON'T WANT YOUR DAMN LEMONS!\nWHAT AM I SUPPOSED TO DO WITH THESE?!\nDEMAND TO SEE LIFE'S MANAGER!\nMake life RUE the day it thought it could give CAVE JOHNSON LEMONS!\nDO YOU KNOW WHO I AM?!\nI'M THE MAN WHO'S GONNA BURN YOUR HOUSE DOWN!\nWITH THE LEMONS!\nI'm gonna get my engineers to invent a combustible lemon\nthat's gonna BURN YOUR HOUSE DOWN!\n - Cave Johnson",
	"Also an inspiring quote!",
	"*You suddenly feel very inspired.*",
	"If it works it's not stupid.",
	'¯\\_(ツ)_/¯',

	"Sometimes following that wild and\ncompletely unrealistic idea\nchanges the world round you\nfor the better.\nIn other words - just do it!",
	'"READY FOR THE MOSH PIT, SHAKA BRAH?"\n- Maxine "Max" Caulfield',
	"Some quit due to slow progress,\nnever grasping that slow progress IS progress."
]

var k = 0;
var N = 5;

var AngleChange = 0.2;
var Phase = 0;
var Homing = false;

function Node() {
	this.Position = new Vector(0, 0);
	this.Speed = 50;
	this.Path = [new Vector(0, 0)];

	this.Hue = (k * PHI * 360 / TAU) | 0;
	this.Angle = k * TAU / N;

	k++;
}

Node.prototype = {
	Update: function(dt) {
		var node = this;
		node.Position.X += Math.cos(node.Angle) * node.Speed * dt;
		node.Position.Y += Math.sin(node.Angle) * node.Speed * dt;
	},
	Home: function(dt) {
		var node = this;
		// var delta = node.Position.Clone();
		// delta.Scale(-dt);
		for (var k = 0; k < node.Path.length; k++) {
			//node.Path[k].AddScaled(delta, 2 * (k & 1) - 1);
			node.Path[k].AddScaled(node.Path[k], (2 * (k & 1) - 1) * dt * 0.1);
		}
		node.Position.AddScaled(node.Position, -dt);
	},
	Tilt: function() {
		var node = this;
		node.Angle -= TAU / 8;
		node.Push();
	},
	Push: function() {
		var node = this;
		node.Path.push(node.Position.Clone());
		if (node.Path.length > 20) {
			node.Path.shift();
		}
	},
	StrokePath: function(context, overline) {
		var node = this;
		if (!overline) {
			context.beginPath();
			for (var k = 0; k < node.Path.length; k++) {
				var p = node.Path[k];
				if (k == 0) {
					context.moveTo(p.X, p.Y);
				}
				context.lineTo(p.X, p.Y);
			}
			context.lineTo(node.Position.X, node.Position.Y);

			context.stroke();
		} else {
			var pp = node.Path[0];
			for (var k = 1; k < node.Path.length; k++) {
				var p = node.Path[k];
				var alpha = k / node.Path.length;
				context.strokeStyle = "hsla(" + node.Hue + ", 90%, 70%, " + alpha + ")";
				context.beginPath();
				context.moveTo(pp.X, pp.Y);
				context.lineTo(p.X, p.Y);
				context.stroke();
				pp = p;
			}
			var p = node.Position;
			context.beginPath();
			context.moveTo(pp.X, pp.Y);
			context.lineTo(p.X, p.Y);
			context.stroke();
		}

	}
};

var Nodes = [];
for (var i = 0; i < N; i++) {
	Nodes.push(new Node());
}

function Tick(dt) {
	Time += dt;

	var gradient = context.createRadialGradient(
		Size.X / 2, Size.Y / 2,
		Math.min(Size.X / 2, Size.Y / 2) / 3,

		Size.X / 2, Size.Y / 2,
		Math.max(Size.X / 2, Size.Y / 2)
	);
	gradient.addColorStop(0, "hsla(90,80%,2%,0.2)");
	gradient.addColorStop(1, "hsla(90,30%,10%,0.9)");

	context.fillStyle = gradient; //"rgba(0,0,0,0.4)";
	context.fillRect(0, 0, Size.X, Size.Y);


	context.save();
	context.globalCompositionOperator = "lighten";

	context.translate(Size.X / 2, Size.Y / 2);
	context.scale(Scale, Scale);

	Phase += dt;
	if (Homing) {
		if (Phase > 1) {
			Phase = 0;
			Homing = !Homing;
		}

		for (var i = 0; i < Nodes.length; i++) {
			var node = Nodes[i];
			node.Home(dt * 2);
		}
	} else {
		if (Phase > 5) {
			Phase = 0;
			Homing = !Homing;
			for (var i = 0; i < Nodes.length; i++) {
				var node = Nodes[i];
				node.Push();
			}
		}

		AngleChange -= dt;
		if (AngleChange < 0) {
			AngleChange = RandomRange(0.1, 0.5);
			for (var i = 0; i < Nodes.length; i++) {
				var node = Nodes[i];
				node.Tilt();
			}
		}

		for (var i = 0; i < Nodes.length; i++) {
			var node = Nodes[i];
			node.Update(dt);
		}
	}

	context.lineWidth = 3;
	context.strokeStyle = "#000";
	context.lineCap = "round";
	context.lineJoin = "round";

	for (var i = 0; i < Nodes.length; i++) {
		var node = Nodes[i];
		node.StrokePath(context, false)
	}

	context.lineWidth = 2;
	//context.strokeStyle = "rgba(255, 255, 255, 0.3)";
	for (var i = 0; i < Nodes.length; i++) {
		var node = Nodes[i];
		node.StrokePath(context, true)
	}

	context.restore();

	context.globalCompositionOperator = "source-over";

	Text("Ludum Dare 39", 80, Size.X / 2, Size.Y * 5 / 10);

	QuoteTimer -= 0.033;
	if (QuoteTimer < 0) {
		Quote = Quotes[(Math.random() * Quotes.length) | 0];
		//Quote = Quotes[QuoteIndex++];
		QuoteTimer = 30 + Math.random() * 10 + Quote.length / 10;
		// QuoteTimer = 2;
	}
	Text(Quote, 40, Size.X / 2, Size.Y * 9 / 10, "#fff", "#000", "Tahoma");
}

setInterval(function() {
	var s = Math.sin(Time * 8);
	var c = Math.cos(Time * 7.3);
	Tick((s + c) * 0.008 + 0.04);
}, 33);