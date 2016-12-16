g = {
    SampleRate : 44100,
    BitsPerSample : 16,
    NumChannels : 1
};

g.BlockAlign = g.BitsPerSample >> 3;
g.ByteRate = g.SampleRate * g.BlockAlign;


T=Math.PI*2
i2s=function(a,b,d,r,i){r=b?String.fromCharCode(a&255)+i2s(a>>8,b-1):"";return r}
pack=function(a,b,d,r,i){r="";for(i=0;i<a.length;i++)r+=b[i]=="s"?a[i]:i2s(a[i],b.charCodeAt(i)-48);return r}
a2d=function(a,b,d,r,i){r="";for(i=0;i<a.length;i++)b=32767*a[i]|0,b=b<-32768?-32768:32767<b?32767:b,b+=b<0?65536:0,r+=String.fromCharCode(b&255,b>>8);return r}
make=function(a,b,d,r,i){r=new Audio("data:audio/wav;base64,"+btoa(pack(["RIFF",36+(i=2*a.length),"WAVEfmt ",16,1,1,44100,88200,2,16,"data",i,a2d(a)],"s4s4224422s4s")));return r}
s2t=function(a,b,d,r,i){r=a/44100;return r}
t2s=function(a,b,d,r,i){r=a*44100;return r}
ns=function(a,b,d,r,i){r=new Array(a|0);for(i=0;i<a;i++)r[i]=0.0;return r}
map=function(a,b,d,r,i){for(i=0;i<a.length;i++)a[i]=b(i,a[i]);return a}
mul=function(a,b,d,r,i){r=a*d;return r}
sc=function(a,b,d,r,i){r=map(a,mul,b);return r}

S=[];for(i=24;i>=0;i--){S[i]=440*Math.PI*2*Math.pow(2,i/12)/44100;}

love=[
    "a", "e", "g", 4,
    "a", "f", "g", 4,
];

map ={
    "a":0,
    "bb":1,"b":2,
    "c":3,
    "db":4,"d":5,
    "eb":6,"e":7,
    "f":8,
    "gb":9,"g":10,
    "Ab":11, "A":12,
    "Bb":13,"B":14,
    "C":15,
    "Db":16,"D":17,
    "Eb":18,"E":19,
    "F":20,
    "Gb":21,"G":22,
    "ab":23,
}
map[null]=24;
S[24]=0;

song=function(notes,speed){
    r=[];
    for(var i=0; i < notes.length; i+=4){
        //x = S[map[notes[i]]];
        //y = S[map[notes[i+1]]];
        //z = S[map[notes[i+2]]];
        x = S[(Math.rand()*24)|0];
        y = S[(Math.rand()*24)|0];
        z = S[(Math.rand()*24)|0];
        samples = t2s(notes[i+3]*speed);
        temp = ns(samples);
        map(samples, function(a,b,d,r,i){r=Math.sin(a*x)+Math.sin(a*y)+Math.sin(a*z);return r});
        r=r.concat(samples);
    }
    return r;
}

x=sc(song(love,0.5),0.3);
a=make(x);
a.play();