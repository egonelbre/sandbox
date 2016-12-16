function HUDStack(){
    this.name = "";
    this.owner = null;
    this.size = {x:0,y:0};
    this.touches = {};
}

HUDStack.methods({
    render : function(ctx){
        ctx.fillStyle = "#efe";
        ctx.fillRect(0,0, this.size.x, this.size.y);
        var r = 40;
        if(main.controls.control)
            r = r + Math.sin(((new Date())-1)/300)*20;

        for(var n in this.touches){
            if(this.touches.hasOwnProperty(n)){
                var touch = this.touches[n];
                ctx.beginPath();
                ctx.fillStyle = touch.color;
                ctx.arc(touch.x, touch.y, r, 0, Math.PI*2, false);
                ctx.fill();
            }
        }
    },
    align : function(size){
        this.size.x = size.x;
        this.size.y = size.y;
        return {x:size.x, y:size.y, side:"client"};
    },
    touch : function(action, e){
        if(!this.touches[e.identifier])
            this.touches[e.identifier] = {x:e.cx, y:e.cy, color:"#f00"};
        this.touches[e.identifier].x = e.cx;
        this.touches[e.identifier].y = e.cy;

        if(action == "start"){
            this.touches[e.identifier].color = '#'+Math.floor(Math.random()*16777215).toString(16);
        }

        if((action == "end") || (action == "cancel"))
            delete this.touches[e.identifier];
    },
    add : function(hud){
        
    }
});
