// canvas setup
var d=document,
    canvas = document.getElementById("canvas"),
    c=canvas,
    W=1200,H=700;
    c.width = W,
    c.height = H,
    c = c.getContext("2d");

// Math function aliases
var cos  = Math.cos,
    sin  = Math.sin,
    abs  = Math.abs,
    sqrt = Math.sqrt,
    sgn  = function(val) { return val >= 0 ? 1 : -1 },
    atan2= Math.atan2,
    rand = Math.random,
	TAU = 2*Math.PI;

// Box2D shorthands
var   b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2Transform = Box2D.Common.Math.b2Transform
	, b2AABB = Box2D.Collision.b2AABB
	, b2BodyDef = Box2D.Dynamics.b2BodyDef
	, b2Body = Box2D.Dynamics.b2Body
	, b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	, b2Fixture = Box2D.Dynamics.b2Fixture
	, b2World = Box2D.Dynamics.b2World
	, b2MassData = Box2D.Collision.Shapes.b2MassData
	, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	, b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	, b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
	;
// Mouse
$M = {
	loc : [W/2, H/2],
	dloc : [0,0],
	uloc : [0,0],
	down : false,
	pressed : false
};

function World(){
	this.world = new b2World(
		new b2Vec2(0,0), // gravity
		false             // allow sleep
	);
	
	this.planet = {
		radius  : 20,
		gravity : 6,
		body : null
	}
	
	this.objects = {
		projectiles : 20,
	}
	
	this.view = {
		scale : 5,
		framerate : 1/60,
	};
	
	this.projectiles = [];
	this.moon = { 
		dist : 60,
		radius  : 10,
		gravity : 5,
		angular_speed : TAU/50
	};
	
	this.impulse = {
		drawing : false,
		start   : [],
		stop    : [],
		apply   : false
	};
	
	this.mouse = null;
};

World.prototype.setup = function(){
	{ // setup ground
		{ // ground properties
			var fixDef = new b2FixtureDef;
			fixDef.density     = 30.0;
			fixDef.friction    = 0.8;
			fixDef.restitution = 0.1;
		  // ground shape
			fixDef.shape = new b2CircleShape( this.planet.radius );
		}
		{ // body def
			var bodyDef = new b2BodyDef;
			bodyDef.type = b2Body.b2_staticBody;
			bodyDef.position.x = ( W / this.view.scale ) / 2;
			bodyDef.position.y = ( H / this.view.scale ) / 2;
		}
		this.planet.body = this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		this.planet.body.m_userData = { type : "planet"};
	}
	fixDef.density     = 1.0;
	var WC = this.planet.body.m_body.GetWorldCenter();
	
	{ // setup mouse
		fixDef.shape = new b2CircleShape( 0.3 );
		bodyDef.type = b2Body.b2_staticBody;
		bodyDef.position.x = 0;
		bodyDef.position.y = 0;
		this.mouse = this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		this.mouse.m_body.SetActive(false);
		this.mouse.m_userData = { type : "mouse" };
	}
	
	{ // setup some objects falling
		var dist = this.planet.radius + 10;
		bodyDef.linearDamping = 0.3;
		for( var i = 0; i < this.objects.projectiles; i++ ){
			bodyDef.type = b2Body.b2_dynamicBody;
			var alpha = rand() * TAU;
			
			//fixDef.shape = new b2CircleShape(1);
			fixDef.shape = new b2PolygonShape();
			fixDef.shape.SetAsBox( 1, 1 );
			
			bodyDef.position.x = WC.x +  dist * cos( alpha );
			bodyDef.position.y = WC.y +  dist * sin( alpha );
			
			var body = this.world.CreateBody( bodyDef ).CreateFixture( fixDef );
			body.m_userData = { type : "projectile" };
			this.projectiles.push( body );
		}
	}
	
	{ // setup a moon
		bodyDef.linearDamping = 0.0;
		fixDef.density     = 30.0;
		bodyDef.type = b2Body.b2_kinematicBody;
		var alpha = rand() * TAU,
			dist  = this.moon.dist;
		fixDef.shape = new b2CircleShape( this.moon.radius );
		
		bodyDef.position.x = WC.x +  dist * cos( alpha );
		bodyDef.position.y = WC.y +  dist * sin( alpha );
		
		var body = this.world.CreateBody( bodyDef ).CreateFixture( fixDef );
		body.m_userData = { type : "moon" };
		//body.m_body.SetActive(false);
		
		this.moon.angle = alpha;
		this.moon.body = body;
	}
	
	{ // debug Draw 
		var debugDraw = new b2DebugDraw();
		debugDraw.SetSprite( c );
		debugDraw.SetDrawScale( this.view.scale );
		debugDraw.SetFillAlpha( 0.3 );
		debugDraw.SetLineThickness( 1.0 );
		debugDraw.SetFlags( b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit );
		this.world.SetDebugDraw(debugDraw);
	}
};

World.prototype.logic = function(){
	this.impulse.drawing = $M.down;
	if( $M.pressed || $M.down ){
		this.impulse.start = $M.dloc;
		this.impulse.stop  = $M.loc;
	}
	if( $M.pressed ){
		$M.pressed = false;
		this.impulse.start = $M.dloc;
		this.impulse.stop  = $M.uloc;
		this.impulse.apply = true;
	}
};

World.prototype.screenToWorld = function( loc ){
	return [loc[0] / this.view.scale, loc[1] / this.view.scale]
}

World.prototype.physics = function(){
	this.world.ClearForces();
	
	// apply impulse
	if( this.impulse.apply ){
		this.impulse.apply = false;
		
		var startPos = this.screenToWorld( $M.dloc );
		var endPos   = this.screenToWorld( $M.uloc );
		
		var startV = new b2Vec2( startPos[0], startPos[1] );
		var endV = new b2Vec2( endPos[0], endPos[1] );
		
		var body = null;
		
		this.world.QueryPoint( function(fix){
			if( fix.m_userData && ((fix.m_userData.type == "projectile") || (fix.m_userData.type == "moon"))){
				body = fix;
			}
		}, startV );
		
		if( body ){
			var power = new b2Vec2();
			power.SetV( endV );
			power.Subtract( startV );
			power.Multiply( 5 );
			var b = body.m_body;
			b.ApplyImpulse( power, b.GetWorldCenter() );
		}
	}	
	
	{ // move mouse
		var aPos = this.screenToWorld( $M.loc );
		var mPos = new b2Vec2( aPos[0], aPos[1] );
		//this.mouse.m_shape.SetLocalPosition( mPos );
		this.mouse.m_body.SetPosition( mPos );
	}
	
	{ // move moon
		this.moon.angle = (this.moon.angle + this.moon.angular_speed * this.view.framerate) % TAU;
		var WC = this.planet.body.m_body.GetWorldCenter();		
		
		var newPos = [WC.x + this.moon.dist * cos( this.moon.angle ),
		              WC.y + this.moon.dist * sin( this.moon.angle )];
		//this.moon.body.m_body.SetPositionAndAngle( new b2Vec2(newPos[0], newPos[1]), this.moon.angle );
		var curPos = this.moon.body.m_body.GetWorldCenter();
		var velocity = new b2Vec2( newPos[0] - curPos.x, newPos[1] - curPos.y);
		// velocity.Subtract( new b2Vec2( newPos[0], newPos[1] ) );
		this.moon.body.m_body.SetLinearVelocity( velocity );
		this.moon.body.m_body.SetAngularVelocity( this.moon.angular_speed );
		//this.moon.body.m_body.SetLinearVelocity( new b2Vec2(newPos[0], newPos[1]), this.moon.angle );
		//var newV = [10 * cos( this.moon.angle ),
		//            10 * sin( this.moon.angle )];
		//this.moon.body.m_body.SetLinearVelocity( new b2Vec2( newV[0], newV[1] ) );
	}	
	
	// apply gravities
	
	var applyGravity = function( body, planet, gravity ){
		var ground = planet.m_body,
			mass   = planet.GetMassData().mass,
			circle = planet.m_shape,
			center = ground.GetWorldPoint( circle.m_p ),
			position = body.GetPosition();
		center.Subtract( position ); // dist vector
		var force = gravity * mass / center.LengthSquared();
		center.Normalize();
		center.Multiply( force ); // scaled force vector
		body.ApplyForce( center, position );
	}
	
	var planet = this.planet.body;
	for(var i = 0; i < this.projectiles.length; i++){
		var body = this.projectiles[i].m_body;
		applyGravity( body, this.planet.body, this.planet.gravity );
		if( this.moon.body.m_body.IsActive() )
			applyGravity( body, this.moon.body, this.moon.gravity );
	}
	
	// iterate
	this.world.Step(
		this.view.framerate, // frame-rate
		10,     // velocity iterations
		10      // position iterations
	);
};

World.prototype.render = function(){
    /*{ // Background
		c.fillStyle="#efe";
		c.fillRect(0,0,W,H);
		c.fillStyle="#000";
		c.strokeStyle="#000";
	}*/	
	
	{ // world
		this.world.DrawDebugData();
	}
	
	{ // mouse
		c.fillStyle = "#8f3";
		c.strokeStyle="#000";
		c.beginPath();
		c.arc( $M.loc[0], $M.loc[1], 3, 0, TAU, true );
		c.closePath();
		//c.fill();
		//c.stroke();
		
		if( this.impulse.drawing ){
			c.strokeStyle="#f00";
			c.beginPath();
			c.moveTo( this.impulse.start[0], this.impulse.start[1] );
			c.lineTo( this.impulse.stop[0], this.impulse.stop[1] );
			c.stroke();
		}
	}
};

world = new World();
world.setup();

animate = function(){
	if( world ){
		world.logic();
		world.physics();
		world.render();
	}
};

window.requestAnimFrame = 
    window.requestAnimationFrame       || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function(callback, element){ window.setTimeout(callback, 1000 / 60); };

off = [canvas.offsetLeft, canvas.offsetTop];

function extractPos( e ){
	if ( e.offsetX ) {
		return [e.offsetX, e.offsetY];
	} else if ( e.layerX ){
		return [e.layerX, e.layerY];
	}
	return [ e.clientX - canvas.offsetLeft, e.pageY - canvas.offsetTop] ;
}

canvas.onmousemove = function(e){ $M.loc = extractPos(e);};
canvas.onmousedown = function(e){ $M.down = true; $M.dloc = extractPos(e); };
canvas.onmouseup   = function(e){ $M.pressed = true; $M.down = false; $M.uloc = extractPos(e); };

(function _animation_loop_(){
    animate();
    requestAnimFrame(_animation_loop_);
})();
