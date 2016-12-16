// set up canvas for drawing
c = document.body.children[0], W = window.innerWidth, H = window.innerHeight;
c.width = W, c.height = H, c = c.getContext('2d');
// multiplies vector with a value
b = function(v, s, a) {
	return [v[0] * s, v[1] * s, v[2] * s, v[3]]
};
// rotate vector around y
vy = function(v, s, a) {
	is = Math.sin(s), ic = Math.cos(s);
	return [v[2] * ic - v[0] * is, v[1], v[2] * is + v[0] * ic, v[3]]
};
// rotate vector around x
vx = function(v, s, a) {
	is = Math.sin(s), ic = Math.cos(s);
	return [v[0], v[1] * ic - v[2] * is, v[1] * is + v[2] * ic, v[3]]
};
// conversion from 3d to 2d
vi = function(v, s, a) {
	r = [];
	r[2] = ((s = v[2] / 2) + 30) / 30;
	r[0] = C[0] - v[0] * r[2] * 10;
	r[1] = C[1] - v[1] * r[2] * 10;
	r[2] = C[2] + r[2] * 3;
	r[3] = v[3];
	return r
};
// color format
cf = function(v, s, a) {
	return [v[0] | 0, v[1] | 0, v[2] | 0, v[3]]
};
// plot particle
p2 = function(v, s, a) {
	if (v[2] <= 0) return;
	//c.fillStyle = 'rgba(' + cf(v[3]) + ')';
	c.rect(v[0], v[1], v[2], v[2])
};
// adjust color of a particle
vc = function(v, s, a) {
	r = [];
	r[0] = (W - v[0]) * 255 / W;
	r[1] = (H - v[1]) * 255 / H;
	r[2] = (1 - os) * v[2] * 22;
	r[3] = v[2] * 2 * 2000 / pc;
	v[3] = r;
	return v
};
// rotation based on time
vt = function(v, s, a) {
	return vx(vy(v, tt), os)
};
// function 1
e = function(v, s, a) {
	return Math.sin(tt + v[0] + v[2]) * 3
};
// function 2
at = function(v, s, a) {
	return Math.sin(tt + v[0] / 3 + v[1] / 3) + 1.5
};
// merge functions
t = function(v, s, a) {
	return b(v, at(v) + os * e(v) / 10 + os)
};
// spherizes random dots
s3 = function(v, s, a) {
	return b(v, 17 / Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]))
};
// reset
//   'javascript:R(particle count, time step)'
//   tt  - total time
//   pc  - particle count
//   p[] - particles
//   ts  - timestep
// most stuff goes on here
//   p2(vc(vi(vt(t(p[i])))))
//      p[i] is a vector [x,y,z,[r,g,b,a]]
//      t  apply transformation
//      vt rotate
//      vi add perspective and transpose to canvas space
//      vc color particle
//      p2 plot particle
R = function(v, s, a) {
		pc = v;
		ts = s;
		tt = 3
	}
	// interval
setInterval(function(v, s, a) {
	tt += ts;
	os = Math.sin(tt);
	c.globalCompositeOperation = 'source-over';
	c.fillStyle = 'rgba(0,0,0,0.5)';
	c.fillRect(0, 0, W, H);
	c.globalCompositeOperation = 'lighter';
	c.beginPath();
	c.fillStyle = "#fff";
	for (i = pc; i--;) p2(vc(vi(vt(t(s3([Math.random() - .5, Math.random() - .5, Math.random() - .5, [0, 0xff, 0, 1]]))))))
	c.fill();
}, 30);
C = [W / 2, H / 2, 0];
R(5000, .02);