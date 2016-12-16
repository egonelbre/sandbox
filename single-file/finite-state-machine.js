state = {
	start : 1,
	update : 0,
	stop, -1
};

function Machine(){
	this.cur  = function(m,s){};
	this.next = null;
}

Machine.prototype.update = function(){
	if( this.next != null ){
		this.cur(this, state.stop);
		this.cur = this.next;
		this.next = null;
		this.cur(this, state.start);
	}
	this.cur(this, state.update);
};

// example
M = new Machine();

tick = function(m,s){
	switch(s){
		case state.start : 
			console.log("starting tick;");
			break;
		case state.update : 
			console.log("updating tick;");
			m.next = tock;
			break;
		case state.stop : 
			console.log("stopping tick;");
			break;
	}
};

tock = function(m,s){
	switch(s){
		case state.start : 
			console.log("starting tock;");
			break;
		case state.update : 
			console.log("updating tock;");
			m.next = tick;
			break;
		case state.stop : 
			console.log("stopping tock;");
			break;
	}
};

M.next = tick;

for(var i = 0; i < 100; i += 1){
	M.update();
}