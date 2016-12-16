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
	Clone: function() {
		var a = this;
		return new Vector(a.x, a.y, a.z);
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
	Negate: function() {
		var a = this;
		a.X = -a.X;
		a.Y = -a.Y;
		a.Z = -a.Z;
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
	},
	Lerp: function(b, p) {
		var a = this;
		a.X = a.X * (1 - p) + b.X * p;
		a.Y = a.Y * (1 - p) + b.Y * p;
		a.Z = a.Z * (1 - p) + b.Z * p;
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

function Curve(p) {
	//return p * p * (3.0 - 2.0 * p);
	var p2 = p * p;
	return p2 / (2.0 * (p2 - p) + 1.0);
}

function Ninja() {
	this.Position = new Vector();
	this.DiscretePosition = new Vector();

	this.Velocity = new Vector();

	this.AnimationProgress = 0.0;
	this.AnimationDuration = 0.2;
	this.AnimationStart = new Vector();
	this.AnimationFinish = new Vector(0, 0, 0);
}

Ninja.prototype = {
	Update: function(dt) {
		var ninja = this;
		var WasAnimating = ninja.AnimationProgress < ninja.AnimationDuration;
		ninja.AnimationProgress += dt;
		if (ninja.AnimationProgress < ninja.AnimationDuration) {
			ninja.Velocity.Set(ninja.Position);
			ninja.Position.Set(ninja.AnimationStart);
			var p = Curve(ninja.AnimationProgress / ninja.AnimationDuration);
			ninja.Position.Lerp(ninja.AnimationFinish, p);

			// ninja.DiscretePosition.X = Math.round(ninja.Position.X);
			// ninja.DiscretePosition.Y = Math.round(ninja.Position.Y);
			// ninja.DiscretePosition.Y = Max(ninja.DiscretePosition.Y, 0);

			ninja.Velocity.Sub(ninja.Position);
			ninja.Velocity.Negate();
			ninja.Velocity.Scale(0.03 / dt);
		} else {
			if (WasAnimating) {
				ninja.Velocity.Zero();
				ninja.Position.Set(ninja.AnimationFinish);
			}

			ninja.Velocity.Add(new Vector(0, -50 * dt, 0));
			ninja.Position.AddScaled(ninja.Velocity, dt);

			ninja.DiscretePosition.X = Math.round(ninja.Position.X);
			ninja.DiscretePosition.Y = Math.round(ninja.Position.Y);
			ninja.DiscretePosition.Y = Max(ninja.DiscretePosition.Y, 0);

			if (ninja.Position.Y <= 0.0) {
				ninja.Velocity.Zero();
				ninja.Position.Set(ninja.DiscretePosition);
			}
		}
	},
	Dash: function(offset) {
		var ninja = this;
		ninja.AnimationStart.Set(ninja.Position);
		ninja.DiscretePosition.Add(offset);
		ninja.DiscretePosition.Y = Max(ninja.DiscretePosition.Y, 0);
		ninja.AnimationFinish.Set(ninja.DiscretePosition);
		ninja.AnimationProgress = 0.0;
	},
	Render: function(context) {
		var ninja = this;

		context.save();
		context.translate(ninja.Position.X - 0.5, ninja.Position.Y - 0.5);

		var velocity = ninja.Velocity;
		if (ninja.AnimationProgress >= ninja.AnimationDuration) {
			velocity = new Vector();
		}

		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(1, velocity.Y);
		context.lineTo(1 + velocity.X, 1 + velocity.Y);
		context.lineTo(velocity.X, 1);
		context.closePath();
		context.fillStyle = "#fff";
		context.fill();

		context.restore();

		context.save();
		context.translate(ninja.DiscretePosition.X, ninja.DiscretePosition.Y);
		context.fillStyle = "#f00";
		context.fillRect(-0.1, -0.1, 0.2, 0.2);
		context.restore();
	}
}

var Player = new Ninja();

window.onkeydown = function(ev) {
	switch (ev.keyCode) {
		case 87: // W
			// Player.AnimationFinish.Y += 1;
			Player.Dash(new Vector(0, 2));
			break;
		case 65: // A
			Player.Dash(new Vector(-2, 0));
			break;
		case 83: // S
			Player.Dash(new Vector(0, -2));
			break;
		case 68: // D
			Player.Dash(new Vector(2, 0));
			break;
	}
};

function Tick(dt) {
	Time += dt;

	context.fillStyle = "rgba(0,0,0,0.1)";
	context.fillRect(0, 0, Size.X, Size.Y);

	context.save();
	context.translate(Size.X / 2, Size.Y / 2);
	context.scale(64, -64);

	Player.Update(dt);
	Player.Render(context);

	context.restore();
}

function QuickTick(dt) {
	var N = 2;
	for (var i = 0; i < N; i++) {
		Tick(dt / N);
	}
}

var Now = (new Date()) | 0;

function update() {
	var Next = (new Date()) | 0;
	var Delta = Next - Now;
	Now = Next;
	QuickTick(Delta / 1000.0);
	window.requestAnimationFrame(update);
}
update();