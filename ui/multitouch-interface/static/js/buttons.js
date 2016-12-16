function ButtonPanel(){
    this.name = "";
    this.owner = null;
    this.buttons = [];
    this.side = "right";
    this.width = 50;
    this.size = {x:0,y:0};
    this.x = 0;
    this.y = 0;
    this.pad = 10;
    this.lastButton = null;
}

ButtonPanel.methods({
    render : function(ctx){
        ctx.fillStyle = "#fbffe1";
        ctx.fillRect(0, 0, this.size.x, this.size.y);

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, tau, false);
        ctx.fill();

        var p = {x:0,y:this.pad},
            s = {x:this.width, y:this.width-6};
        for(var i = 0; i < this.buttons.length; i += 1){
            var btn = this.buttons[i];
            btn.render(ctx, p, s);
            p.y += this.pad + s.y;
        }
                
        ctx.strokeStyle = "#5a7900";
        ctx.beginPath();

        if(this.side == "left"){
            ctx.moveTo(this.size.x, 0);
            ctx.lineTo(this.size.x, this.size.y);
        } else if (this.side == "right"){
            ctx.moveTo(0, 0);
            ctx.lineTo(0, this.size.y);
        } else if (this.side == "top"){
            ctx.moveTo(0, this.size.y);
            ctx.lineTo(this.size.x, this.size.y);
        } else if (this.side == "bottom"){
            ctx.moveTo(0, 0);
            ctx.lineTo(this.size.x, 0);
        } 
        ctx.stroke();        
    },
    align : function(size){
        var p = {x:0,y:0};
        if ((this.side == "left") || (this.side == "right")) {
            p.x = this.width;
            p.y = size.y;
        } else {
            p.x = size.x;
            p.y = this.width;
        };
        this.size.x = p.x;
        this.size.y = p.y;
        return {x:p.x, y:p.y, side:this.side};
    },
    touch : function(action, e){
        this.x = e.cx;
        this.y = e.cy;

        var idx = -1;
        if ((this.side == "left") || (this.side == "right")) {
            idx = (e.cy / (this.width - 6 + this.pad))|0;
        } else {
            idx = (e.cx / (this.width - 6 + this.pad))|0;
        };

        if((idx >= 0) && (idx < this.buttons.length)){
            if( this.lastButton != this.buttons[idx] ){
                if(this.lastButton != null)
                    this.lastButton.doUp();
                this.lastButton = this.buttons[idx];
                this.lastButton.doDown();
            }
            
            if((action == "end") || (action == "cancel")){
                this.lastButton.doUp();
                this.lastButton = null;
            }
        } else {
            if (this.lastButton)
                this.lastButton.doUp();
            this.lastButton = null;
        }
    },
    add : function(btn){
        this.buttons.push(btn);
    }
});

function Button(text, methods){
    methods = methods || {};
    this.text = text;
    this.bg = "#fdd";
    this.isDown = false;
    this.down = methods.down ? methods.down : null;
    this.up = methods.up ? methods.up : null;
}

Button.methods({
    doDown : function(){
        this.isDown = true;
        if(this.down)
            this.down();
    },
    doUp : function(){
        this.isDown = false;
        if(this.up)
            this.up();
    },
    render : function(ctx, pos, size){
        ctx.fillStyle = this.isDown ? "#f33" : this.bg;
        ctx.fillRect(pos.x, pos.y, size.x, size.y);
        ctx.fillStyle = "#000";
        ctx.font = "24px Georgia";
        var m = ctx.measureText(this.text);
        ctx.fillText(this.text, pos.x + size.x/2 - m.width/2, pos.y + size.y/2 + 24/2);
    }
});
