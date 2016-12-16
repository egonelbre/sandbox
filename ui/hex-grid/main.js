var canvas = document.getElementById("view");
canvas.width = 640;
canvas.height = 480;

var context = canvas.getContext("2d");

mouse = {x:0, y:0};

canvas.onmousemove = function(ev){ 
	mouse.x = ev.clientX - canvas.offsetLeft;
	mouse.y = ev.clientY - canvas.offsetTop;
}; 

var Tools = ["draw", "erase"];

TAU = Math.PI*2;

polygon = function(N, s){
	var points = [];
	for(var i = 0; i < N; i += 1){
		points.push({
			x: s*Math.cos(TAU*i/N),
			y: s*Math.sin(TAU*i/N)
		});
	}
	return points;
};

square_distance = function(a,b){
	var dx = a.x - b.x,
		dy = a.y - b.y;
	return dx*dx + dy*dy;
};

function PointGrid(){
	this.offset = 0.5;
	this.xSpacing = 3;
	this.ySpacing = Math.sqrt(3)/2;
}

PointGrid.prototype = {
	coordinateToPoint: function(coord){
		var x = ((coord.y & 1) * this.offset + coord.x) * this.xSpacing,
			y = coord.y * this.ySpacing;
		return {x:x, y:y};
	},
	approxCoordinate: function(p){
		var yi = Math.round(p.y / this.ySpacing),
			xi = Math.round((p.x - (yi & 1) * this.offset * this.xSpacing) / this.xSpacing);
		return {x: xi, y:yi};
	},
	pointToCoordinate: function(p){
		var center = this.approxCoordinate(p),
			best_coord = {x:0, y:0},
			best_dist = 10000000;

		for(var dx = -1; dx < 2; dx += 1){
			for(var dy = -1; dy < 2; dy += 1){
				var temp = this.coordinateToPoint({x:center.x + dx, y:center.y + dy}),
					dist = square_distance(temp, p);
				if(dist < best_dist){
					best_coord = {x: center.x + dx, y: center.y + dy};
					best_dist = dist;
				}
			}
		}
		return best_coord;
	}
};

var grid = new PointGrid();

var shape = polygon(6, 1.02);

var gui = new dat.GUI();
gui.add(grid, 'offset', 0, 1);
gui.add(grid, 'xSpacing', 0, 5);
gui.add(grid, 'ySpacing', 0, 5);

var image = {
	data: new Uint8Array(32*32*4),
	bytes: 4,
	stride: 32,
	height: 32
};

for(var i = 0; i < image.data.length; i += 1){
	image.data[i] = Math.random() * 255;
}

function rgba(data, s){
	return "rgba(" + ([data[s], data[s+1], data[s+2], data[s+3]/100]).join(",") + ")";
}

function update(){
	context.fillStyle = "#000";
	context.fillRect(0,0,640,480);

	var scale = 15;

	for(var y = 0; y < image.height; y += 1){
		for(var x = 0; x < image.stride; x += 1){
			
			var c = grid.coordinateToPoint({x:x, y:y});

			// find the color
			var s = y * image.stride + x * 4;
			context.fillStyle = rgba(image.data, s);

			context.save();
			context.translate(c.x * scale, c.y * scale);

			context.beginPath();
			context.moveTo(shape[0].x * scale, shape[0].y * scale)
			for(var i = 1; i < shape.length; i += 1){
				context.lineTo(shape[i].x * scale, shape[i].y * scale);
			}
			context.closePath();
			context.fill();

			context.restore();
		}
	}

	var p = {x: mouse.x/scale, y: mouse.y/scale},
		coord = grid.pointToCoordinate(p);

	var c = grid.coordinateToPoint(coord);

	context.save();
	context.translate(c.x * scale, c.y * scale);

	context.beginPath();
	context.moveTo(shape[0].x * scale, shape[0].y * scale)
	for(var i = 1; i < shape.length; i += 1){
		context.lineTo(shape[i].x * scale, shape[i].y * scale);
	}
	context.closePath();
	context.strokeStyle = "#f00";
	context.lineWidth = 2.0;
	context.stroke();

	context.restore();
}

setInterval(update, 33);