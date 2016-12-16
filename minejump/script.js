var
    SelectedBlock = 1,
    j,
    world={};

/** @const */
var Sz = 512;
c.width = c.height = Sz;

/** @const */
var
    BlockDiagY=10, 
    BlockHeight=BlockDiagY*2.5,
    BlockDiagX=BlockDiagY*2,
    
    Offset1 = 1 << 3,
    Offset2 = 1 << 6,
    Offset3 = 1 << 9,
    
    ZERO = 0,
    
    LETTER_OFFSET = 37,
    
    RIGHT = 39 - LETTER_OFFSET,
    UP    = 38 - LETTER_OFFSET,
    LEFT  = 37 - LETTER_OFFSET,
    DOWN  = 40 - LETTER_OFFSET,
    KEY_A = 97,
    KEY_X = 120,
    KEY_C = 99,
    KEY_Z = 122,
    SIZE = 8,
    
    TimeInterval = 30,
    CenterX = Sz/2,
    CenterY = Sz/2 + 200;

var 
   hsla = function (v){return 'hsla('+v[0]+','+v[1]+'%,'+v[2]+'%,'+v[3]+')'},
   R = function(){
    world.player = [4,4,3];
    world.jump = 0;   
    world.blocks = [];
    world.key = [];    
    for(i=-1;++i<Offset3;)
      world.blocks[i] = {tp:(i<Offset2|0)*4, p:[7-(i&7), (7 - (i >> 3) & 7), i >> 6]},
      world.key[i-38] = 0;
  },

  A=function(p){
    console.log(); // forces function not to be inlined
    return (p[2] << 6) - (p[1] << 3) - p[0] + 63;
  },
  G=function(c){
    return (c[0]|c[1]|c[2])&~7?{tp:1}:world.blocks[A(c)];
  },

  drawWorld = function(){
    a.fillStyle = hsla([0,0,10,1]);
    a.strokeStyle = hsla([0,0,0,.2]);
    a.fillRect(0,0,Sz,Sz);
    var dp = A(normPlayer());
    for(i = -1; ++i < Offset3;){
      if(world.blocks[i].tp)
        drawBlock(world.blocks[i]);
      if(i==dp)
        drawPlayer();
    }
  },
  
  drawBlock = function(b){
    s = b.p;
    var diff = (j=s[0] - world.player[0])*j +
               (j=s[1] - world.player[1])*j +
               (j=s[2] - world.player[2])*j;
    a.fillStyle = hsla(b = [210 - b.tp * 30, 50, 90 - b.tp*7 - diff, b.tp / 5 + 0.2]);
    sx = CenterX + (s[0] - s[1]) * BlockDiagX;
    sy = CenterY - s[2] * BlockHeight - (s[0] + s[1]) * BlockDiagY - BlockHeight;
    a.beginPath();
    a.moveTo(sx,sy);
    a.lineTo(sx+BlockDiagX,sy-BlockDiagY);
    a.lineTo(sx+BlockDiagX,sy-BlockDiagY+BlockHeight);
    a.lineTo(sx,sy+BlockHeight);
    a.lineTo(sx-BlockDiagX,sy-BlockDiagY+BlockHeight);
    a.lineTo(sx-BlockDiagX,sy-BlockDiagY);
    a.lineTo(sx,sy);
    a.lineTo(sx+BlockDiagX,sy-BlockDiagY);
    a.lineTo(sx,sy-2*BlockDiagY);
    a.lineTo(sx-BlockDiagX,sy-BlockDiagY);
    a.fill();
    b[3] > 0.4 && a.stroke();
  },
  
  drawPlayer = function(){
    s = world.player,
    sx = CenterX + (s[0] - s[1]) * BlockDiagX,
    sy = CenterY - s[2] * BlockHeight - (s[0] + s[1] ) * BlockDiagY,
    a.fillStyle = hsla([0,100,50,1]);
    a.beginPath();
    a.moveTo(sx, sy);
    a.lineTo(sx + BlockDiagY*0.7, sy - BlockHeight + BlockDiagY*0.1);
    a.lineTo(sx - BlockDiagY*0.7, sy - BlockHeight + BlockDiagY*0.1);   
    a.fill(); 
  },
  
  normPlayer = function(){
    return [world.player[0]|0, world.player[1]|0, world.player[2]|0];
  },
  
  physics = function(b){
    //var dx = world.key[UP] - world.key[DOWN] - world.key[LEFT] + world.key[RIGHT];
    //var dy = world.key[UP] - world.key[DOWN] - world.key[RIGHT]  + world.key[LEFT];
    var dx = world.key[UP] - world.key[DOWN];
    var dy = dx + (b = world.key[LEFT] - world.key[RIGHT]);
    dx -= b;
    //dx *= 0.1;
    //dy *= 0.1;
    //dx = 0 < dx ? 0.1 : 0 > dx ? -0.1 : 0;
    //dy = 0 < dy ? 0.1 : 0 > dy ? -0.1 : 0;
    
    world.player[0] += (dx *= 0.1);
    if(G(normPlayer()).tp)
        world.player[0] -= dx;
    world.player[1] += (dy *= 0.1);
    if(G(normPlayer()).tp)
        world.player[1] -= dy;
    p = normPlayer();
    if((p[2]-=1),(G(p).tp) && (world.jump < 0)){
      world.player[2] |= 0;
      world.jump = 0;
    } else if ((p[2]+=2),(G(p).tp) && (world.jump > 0)){    
      world.jump = 0;
    } else {
      world.player[2] += world.jump;
      world.jump -= 0.1;
    }
    if(world.jump < -0.5){
      world.jump = -0.5;
    }    
  };

R();

setInterval(function(){
    physics();
    drawWorld();
}, TimeInterval);

onkeydown = function(ev){
  world.key[ev.keyCode-LETTER_OFFSET] = 1;
};
onkeyup = function(ev){
  world.key[ev.keyCode-LETTER_OFFSET] = 0;
};
onkeypress = function(ev){
    //ev = ev.charCode - 48;
    //SelectedBlock = ev & ~15 ? SelectedBlock : ev;
    SelectedBlock = (ev=ev.charCode - 48) & ~15 ? SelectedBlock : ev;
    var z = normPlayer();
    z[2] -= 1;
    var b = G(z);
    (ev == KEY_A-48) && (b.tp=ZERO);
    (ev == KEY_Z-48) && (b.tp=SelectedBlock);
    (ev == KEY_X-48) && (world.jump = 0.5);
};
