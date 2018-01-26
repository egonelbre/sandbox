"use strict";

var canvas = document.getElementById('view'),
	context = canvas.getContext("2d");

var TAU = Math.PI * 2;

var Time = 0.0;
var Scale = 10.0;

function Vector(x, y, z) {
	this.X = +x || 0.0;
	this.Y = +y || 0.0;
	this.Z = +z || 0.0;
}
Vector.prototype = {
	Zero: function() {
		var a = this;
		a.X = 0.0;
		a.Y = 0.0;
		a.Z = 0.0;
	},
	Set: function(b) {
		var a = this;
		a.X = b.X;
		a.Y = b.Y;
		a.Z = b.Z;
	},
	Add: function(b) {
		var a = this;
		a.X += b.X;
		a.Y += b.Y;
		a.Z += b.Z;
	},
	Sub: function(b) {
		var a = this;
		a.X -= b.X;
		a.Y -= b.Y;
		a.Z -= b.Z;
	},
	AddScaled: function(b, s) {
		var a = this;
		a.X += b.X * s;
		a.Y += b.Y * s;
		a.Z += b.Z * s;
	},
	Scale: function(s) {
		var a = this;
		a.X *= s;
		a.Y *= s;
		a.Z *= s;
	},
	Length: function() {
		var a = this;
		return Math.sqrt(
			a.X * a.X +
			a.Y * a.Y +
			a.Z * a.Z
		);
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
		RandomRange(low, high),
		RandomRange(low, high)
	);
}

function Text(text, height, x, y, color, stroke) {
	context.fillStyle = color || "#fff";
	context.strokeStyle = stroke || "rgba(0,0,0,0.7)";
	context.font = height + "px Arcade";
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
	context.font = height + "px Arcade";

	var width = context.measureText(text).width;
	context.beginPath();
	context.strokeText(text, x - width, y + height / 2);
	context.fillText(text, x - width, y + height / 2);
}

function TextLeft(text, height, x, y, color, stroke) {
	context.fillStyle = color || "#fff";
	context.strokeStyle = stroke || "#000";
	context.lineWidth = text / 30;
	context.font = height + "px Arcade";

	context.beginPath();
	context.strokeText(text, x, y + height / 2);
	context.fillText(text, x, y + height / 2);
}

function Node() {
	var node = this;
	// node.Position = new Vector(0, 0, 0);
	node.Position = new RandomVector(-10, 10);
	node.Velocity = new RandomVector(-50, 50);
	node.Force = new Vector(0, 0, 0);
	node.Mass = 5.0;

	node.Hue = RandomRange(0, 360) | 0;
}

Node.prototype = {
	Reset: function() {
		this.Force.Zero();
	},

	Tick: function(dt) {
		var node = this;

		node.Position.AddScaled(node.Velocity, dt);
		node.Velocity.AddScaled(node.Force, dt / node.Mass);
	},

	Render: function(context) {
		var node = this;

		context.save();

		context.lineWidth = 20;

		//var hue = (node.Position.X * node.Position.Y) | 0;
		var hue = Math.atan2(node.Position.Y, node.Position.X) * 180;
		var dist = node.Position.Length();
		context.fillStyle = "hsla(" + hue + ", 70%, 70%, 0.9)";

		context.beginPath();
		context.arc(
			node.Position.X,
			node.Position.Y,
			dist / 20, 0, Math.PI * 2, true);
		context.fill();

		context.restore();
	}
}

var nodes = [];
for (var i = 0; i < 30; i++) {
	nodes.push(new Node(i));
}

var QuoteTimer = 0.0;
var Quote = "";
var Quotes = [
	'Sometimes lose, always win!',
	'"Until you find something to fight for,\nyou settle for something to fight against."\n - Chuck Palahniu',
	"When life gives you lemons, don't make lemonade.\nMake life take the lemons back.\nGET MAD!\nI DON'T WANT YOUR DAMN LEMONS!\nWHAT AM I SUPPOSED TO DO WITH THESE?!\nDEMAND TO SEE LIFE'S MANAGER!\nMake life RUE the day it thought it could give CAVE JOHNSON LEMONS!\nDO YOU KNOW WHO I AM?!\nI'M THE MAN WHO'S GONNA BURN YOUR HOUSE DOWN!\nWITH THE LEMONS!\nI'm gonna get my engineers to invent a combustible lemon\nthat's gonna BURN YOUR HOUSE DOWN!\n - Cave Johnson",
	"Also an inspiring quote!",
	"Tahaks j22da iseendaks, aga raha tahaks ka.\nOi ma lendaks, oi ma lendaks,\naga maha tahaks ka. (J. Leesment)",
	"I'm here to create games and chew bubblegum,\nand I'm all out of bubblegum.",
	"*You suddenly feel very inspired.*",
	"This is a promising event!",
	"Trallallaa-lallallaa,\nvalgeks pea saab terve maa!",
	'"Any sufficiently advanced technology is\nindistinguishable from magic."\n - A. Clarke',
	"If it works it's not stupid.",
	"Keep it simple, stupid.",
	'"All we need to make us really happy is\nsomething to be enthusiastic about."\n - Charles Kingsley',
	'¯\_(ツ)_/¯',
	'Whether you think you can\nor you think you cannot,\nyou are right.',
	'"The price of anything\nis the amount of life you exchange for it."\n - Thoreau'
]


function Tick(dt) {
	Time += dt;

	var gradient = context.createRadialGradient(
		Size.X / 2, Size.Y / 2,
		Math.min(Size.X / 2, Size.Y / 2) / 3,

		Size.X / 2, Size.Y / 2,
		Math.max(Size.X / 2, Size.Y / 2)
	);
	gradient.addColorStop(0, "hsla(90,80%,10%,0.4)");
	gradient.addColorStop(1, "hsla(90,30%,10%,0.9)");

	context.fillStyle = "rgba(0,0,0,0.4)";
	context.fillRect(0, 0, Size.X, Size.Y);

	context.globalCompositionOperator = "lighten";

	context.save();
	context.translate(Size.X / 2, Size.Y / 2);
	context.scale(Scale, Scale);
	context.rotate(Time * 0.7);


	var center = new Vector(0, 0, 0);
	var z = new Vector();
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		node.Reset();
		node.Velocity.Scale(0.999999);

		var speed = node.Velocity.Length();
		if (speed > 60.0) {
			node.Velocity.Scale(60 / speed);
		}

		z.Set(node.Position);
		z.Sub(center);
		z.Scale(10.0);

		node.Force.Sub(z);
	}

	for (var i = 0; i < nodes.length; i++) {
		for (var k = i + 1; k < nodes.length; k++) {
			var a = nodes[i];
			var b = nodes[k];

			z.Set(a.Position);
			z.Sub(b.Position);

			var len = z.Length();
			len = len - 10.0;
			if (len > 0) {
				z.Scale(1 / len);
			}

			a.Force.Sub(z);
			b.Force.Add(z);
		}
	}

	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		node.Tick(dt);
	}

	context.lineWidth = 0.3;
	context.strokeStyle = "rgba(255,255,255, 0.5)";
	for (var i = 0; i < nodes.length; i++) {
		for (var k = i + 1; k < nodes.length; k++) {
			var a = nodes[i];
			var b = nodes[k];

			z.Set(a.Position);
			z.Sub(b.Position);

			var len = z.Length();
			if (len < 20.0) {
				context.beginPath();
				context.moveTo(a.Position.X, a.Position.Y);
				context.lineTo(b.Position.X, b.Position.Y);
				context.stroke();
			}
		}
	}

	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		node.Render(context);
	}

	context.restore();

	context.globalCompositionOperator = "source-over";

	Text("Ludum Dare 37", 80, Size.X / 2, Size.Y * 9 / 10);
	Text("One room", 80, Size.X / 2, Size.Y / 10);

	QuoteTimer -= 0.033;
	if (QuoteTimer < 0) {
		Quote = Quotes[(Math.random() * Quotes.length) | 0];
		QuoteTimer = 30 + Math.random() * 10 + Quote.length / 10;
	}

	Text(Quote, 40, Size.X / 2, Size.Y / 2);
}

setInterval(function() {
	var s = Math.sin(Time * 8);
	var c = Math.cos(Time * 7.3);
	Tick((s + c) * 0.008 + 0.017);
}, 33);