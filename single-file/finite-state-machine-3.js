function Machine(first, $){
    var cur = {}, next = $[first];
    var self = {
        go: function(to){ next = next ? next : ($[to] || $.undefined); },
        trigger: function(event){ var t = cur.tx && cur.tx[event]; t && self.go(t); }
    };
    return function(){
        if(next){
            cur.exit && cur.exit.call(self);
            cur = next; next = undefined;
            self.__proto__ = cur.data;
            cur.enter && cur.enter.call(self);
        }
        cur.fn && cur.fn.call(self);
    };
};

var m = Machine("tick", {
    undefined : {
        fn : function(){
            console.log("ERROR: NO STATE!");
            this.trigger("recover");
        },
        tx : {
            recover: "tick"
        }
    },
    tick : {
        enter : function(){
            console.log("entered tick");
        },
        fn : function(){
            console.log("tick");
            this.go("tock");
        }
    },
    tock : {
        data : {
            counter : 0
        },
        exit : function(){
            this.counter += 1;
        },
        fn : function(){
            this.counter += 1;
            console.log("tock : " + this.counter);
            if(this.counter > 5)
                this.go("invalid");
            if(this.counter > 3)
                this.trigger("forward");
        },
        tx : {
            forward : "tick"
        }
    }
});