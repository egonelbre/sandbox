// canvas setup
var d=document,
    canvas = document.getElementById("canvas"),
    c=canvas,
    W=800,H=700;
    c.width = W,
    c.height = H,
    c = c.getContext("2d");

// Math function aliases
var cos=Math.cos,
    sin=Math.sin,
    abs=Math.abs,
    pow=Math.pow,
    sqrt=Math.sqrt,
    sgn=function(val) { return val >= 0 ? 1 : -1 },
    atan2=Math.atan2,
    rand=Math.random,
    TAU = 2*Math.PI;
    
letters = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F' ];
semis=[0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
drums = [];

function calcFreq(semi, base){
    return 220*pow(2, base/12)*pow(2, semi/12);
}

function addDrums(octave, size, radius){
    for(var i = 12; i--;){
        var alpha = i * TAU / 12 - TAU/4,
            drum = {
                loc    : [W/2 + cos(alpha)*radius, H/2 - sin(alpha)*radius],
                radius : size,
                radius2 : size * size,
                name   : letters[i],
                hot    : 1.0,
                semi   : semis[i],
                freq   : calcFreq(semis[i], 4) * pow(2,octave)
            };
        drums.push(drum);
    }
};

addDrums(0, 60, 250);
addDrums(1, 30, 130);
baseSound = ["sine",0.0000,0.4130,0.0370,0.5500,2.2320,0.0420,135.0000,663.0000,2000.0000,0.0000,0.0000,0.0020,7.7844,0.0003,0.0000,0.0000,0.1000,0.0000,-0.0200,0.0016,0.0020,-0.0060,1.0000,-0.0060,0.0000,0.0000,0.0000];

function playSound( drum, alpha, dist ){
    drum.hot = 1.0;

    alpha = 1 - abs(alpha)/TAU;

    var params = jsfxlib.arrayToParams(baseSound);
    
    var distf = 1-sqrt( dist / drum.radius2 );
    
    params.MasterVolume = 0.2 * sqrt(distf) + 0.1;
    params.StartFrequency = drum.freq + drum.freq * rand() * 0.001;  
    params.SustainTime = 0.1 * distf + 0.01;
    params.DecayTime = 0.5 * distf + 0.01;
    
    //params.VibratoDepth = 0.01;
    //params.VibratoFrequency = 7*(1-distf);
    
    var data = jsfx.generate(params),
        wave = audio.make(data);
    delete data;
    wave.play();
    wave.addEventListener("ended", function(){ delete wave; }); // protect from gc
}

function drawDrum(c, drum){
    c.fillStyle = "hsla(" + (drum.semi*360/12) + ", 70%, " + (70 + drum.hot*30) + "%, 1.0)";
    
    drum.hot -= 0.1;
    if(drum.hot < 0)
        drum.hot = 0;
        
    
    c.beginPath();
    c.arc(drum.loc[0], drum.loc[1], drum.radius, 0, TAU, 0);
    c.closePath();
    
    c.fill();
    
    c.fillStyle = "#232";
    c.font = "15pt Georgia";
    c.fillText( drum.name, drum.loc[0]-7, drum.loc[1]+7);
};


render = function(){
    // Background
    c.fillStyle="#efe";
    c.fillRect(0,0,W,H);
    c.fillStyle="#000";
    c.strokeStyle="#000";   
    
    for(var i = drums.length; i--;)
        drawDrum(c, drums[i]);
    
    c.fillStyle = "#111";
    c.font = "20pt Georgia";
    c.fillText( "dx", -20+W/2, 10+H/2);
}

doclick = function(loc){
    for(var i = drums.length; i--;){
        var drum = drums[i],
            dx = drum.loc[0] - loc[0],
            dy = drum.loc[1] - loc[1],
            dist = dx * dx + dy * dy;
        if( dist < drum.radius2 ){
            playSound( drum, atan2(dx, -dy), dist);
        }
    }
}

window.requestAnimFrame = 
    window.requestAnimationFrame       || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function(callback, element){ window.setTimeout(callback, 1000 / 60); };

off = [canvas.offsetLeft, canvas.offsetTop];
canvas.onmousemove = function(e){ M = [ e.clientX - off[0], e.pageY - off[1]];};
canvas.onclick = function(e){ doclick([ e.clientX - off[0], e.pageY - off[1]])};

(function _animation_loop_(){
    render();
    requestAnimFrame(_animation_loop_);
})();