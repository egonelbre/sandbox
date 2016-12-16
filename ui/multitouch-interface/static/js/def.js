"use strict";

if( typeof Object.create !== "function" ){
    Object.create = function(obj){
        var F = function( ){};
        F.prototype = obj;
        return new F();
    };
}

if( typeof Object.clone !== "function" ){
    Object.clone = function(obj) {
         return Object.extend({}, obj);
    };
}

if( typeof Object.extend !== "function" ){
    Object.extend = function extend(what, wit) {
        var extObj, witKeys = Object.keys(wit);
        extObj = Object.keys(what).length ? Object.clone(what) : {};
        witKeys.forEach(function(key) {
            Object.defineProperty(extObj, key, Object.getOwnPropertyDescriptor(wit, key));
        });
        return extObj;
    };
}

if( typeof Object.keys !== "function" ){
    Object.keys = function( obj ) {
        var array = new Array();
        for ( var prop in obj ) {
            if ( obj.hasOwnProperty( prop ) ) {
                array.push( prop );
            }
        }
        return array;
    };
}

if( typeof Object.__musthave__ !== "function" ){
    Object.__musthave__ = function(names){
        var errors = [];
        for( var i = 0, l = names.length; i < l; i++ ){
            var name = names[i];
            if( typeof this[name] === "undefined" ){
                errors.push({
                    name: "NotSupportedError",
                    message: "Current browser does not support '" + name + "'."
                });
            }
        }
        if( errors.length > 0 )
            throw errors;
    };
}

function safe(f){
    try {
        f();
    } catch( e ){
        console.log( e );
    }
}

safe(function(){
    // ECMA5 checks
    Object.__musthave__([
        'preventExtensions', 'isExtensible',
        'defineProperty', 'defineProperties',
        'keys', 'getOwnPropertyNames',
        'seal', 'isSealed',
        'freeze', 'isFrozen',
    ]);
});

Function.prototype.method = function( name, func ){
    this.prototype[name] = func;
    return this;
}

Function.prototype.methods = function(methods) {
    for( var name in methods )
        this.prototype[name] = methods[name];
    return this;
}

Function.methods({
    make : function(){
        var that = Object.create(this.prototype);
        var other = this.apply( that, arguments );
        return ( typeof other === 'object' && other ) || that;
    },
    inherits : function( Parent ){
        this.prototype = new Parent();
        return this;
    },
    property : function( name, desc ){
        desc = desc || {};
        if( !desc.hasProperty( "writable" )){
            desc.writable = true;
        }
        if( !desc.hasProperty( "enumerable" )){
            desc.enumerable = true;
        }
        if( !desc.hasProperty( "configurable" )){
            desc.configurable = true;
        }
        Object.defineProperty( this.prototype, name, desc );
    },
    bind : function( that ){
        var method = this,
        slice = Array.prototype.slice,
        args  = slice.apply(arguments, [1]);
        return function( ){
            return method.apply( that,
                args.concat(slice.apply(arguments, [0])));
        };
    }
});

Array.methods({
    seqOf : function(type, fn){
        var result;
        for(var i = 0; i < this.length; i += 1){
            var obj = this[i];
            if((type != null) && !(obj instanceof type))
                continue;
            result = fn(obj);
            if(result) return result;
        }
    },
    seqReverseOf : function(type, fn){
        var result;
        for(var i = this.length - 1; i >= 0; i -= 1){
            var obj = this[i];
            if((type != null) && !(obj instanceof type))
                continue;
            result = fn(obj);
            if(result) return result;
        }
    }
});
