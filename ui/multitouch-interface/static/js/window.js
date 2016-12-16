function Window(){
    this.controls = {
        control : false,
        shift : false,
        alt : false
    };
    this.children = {};
    this.handleOrder = [];
    this.renderOrder = [];
    this.touches = {};
    this.touchCount = 0;
    this.size = {x:0,y:0};
    this.debug = [];
}

Window.methods({
    key : function(action, e){
        
    },
    touch : function(action, e){
        if(!this.touches[e.identifier]){
            this.touches[e.identifier] = e;
            e.data = {owner: null};
        }
        if(!e.data)
            e.data = this.touches[e.identifier].data;
        this.touches[e.identifier] = e;

        var lx = e.cx,
            ly = e.cy,
            px,py;

        if( e.data.owner == null){
            for(var i = 0; i < this.handleOrder.length; i += 1){
                var item = this.handleOrder[i];
                px = lx - item.pos.x;
                py = ly - item.pos.y;
                
                if( ((px >= 0) && (py >= 0) && (px < item.size.x) && (py < item.size.y)))
                    e.data.owner = item.child;
            }
        }
        
        if( e.data.owner != null ){
            var item = this.children[e.data.owner.name];
            e.cx = lx - item.pos.x;
            e.cy = ly - item.pos.y;
            e.data.owner.touch(action, e);
        }

        e.cx = lx;
        e.cy = ly;

        this.invalidate();

        if ((action == "end") || (action == "cancel")){
            delete this.touches[e.identifier];
        };
    },
    render : function(ctx){
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, this.size.x, this.size.y);

        for(var i = 0; i < this.renderOrder.length; i += 1){
            var item = this.renderOrder[i];
            ctx.save();

            ctx.translate(item.pos.x, item.pos.y);
            item.child.render(ctx);

            ctx.restore();
        }
        

        ctx.fillStyle = "#000";
        var y = 20;
        for(var i = 0; i < main.debug.length; i += 1){
            ctx.fillText(main.debug[i], 80, y);
            y += 12;
        }
    },
    invalidate : function(){
        requestRender();
    },
    update : function(){
        this.render(ctx);
    },
    modified : function(who){
        this.update();
    },
    add : function(name, child){
        var item = {child:child, pos:{x:0,y:0}, size:{x:0,y:0}};
        child.owner = this;
        child.name = name;
        this.children[name] = item;
        this.handleOrder.push(item);
        this.renderOrder.push(item);
        this.realign();
    },
    setSize : function(s){
        this.size = s;
        this.realign();
    },
    realign : function(){
        var item, alignment, size;
        var topLeft = {x:0,y:0},
            bottomRight = Object.clone(this.size);
        size = {x:0,y:0};
        for(var i = 0; i < this.handleOrder.length; i += 1){
            size.x = bottomRight.x - topLeft.x;
            size.y = bottomRight.y - topLeft.y;

            item = this.handleOrder[i];
            alignment = item.child.align(size);
            
            if(alignment.side == "left"){
                item.pos.x = topLeft.x;
                item.pos.y = topLeft.y;
                topLeft.x += alignment.x;
            } else if (alignment.side == "top"){
                item.pos.x = topLeft.x;
                item.pos.y = topLeft.y;
                topLeft.y += alignment.y;
            } else if (alignment.side == "right"){
                item.pos.y = topLeft.y;
                bottomRight.x -= alignment.x;
                item.pos.x = bottomRight.x;
            } else if (alignment.side == "bottom"){
                item.pos.x = topLeft.x;
                bottomRight.y -= alignment.y;
                item.pos.y = bottomRight.y;
            } else if (alignment.side == "client"){
                item.pos.x = topLeft.x;
                item.pos.y = topLeft.y;
                topLeft.x += alignment.x;
                topLeft.y += alignment.y;
            }
            item.size.x = alignment.x;
            item.size.y = alignment.y;
        }
        this.update();
    },
    log : function(text){
        this.debug.push(text);
        if(this.debug.length > 10){
            this.debug.splice(0,1);
        }
    }
});
