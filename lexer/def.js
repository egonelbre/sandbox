"use strict";

if( typeof Object.create !== 'function' ){
    Object.create = function(o){
        var F = function( ){};
        F.prototype = o;
        return new F();
    };
}

if( typeof Object.__musthave__ !== 'function' ){
    Object.__musthave__ = function(names){
        var errors = [];
        for( var i = 0, l = names.length; i < l; i++ ){
            var name = names[i];
            if( typeof this[name] === 'undefined' ){
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

safe( function(){
    // ECMA5 checks
    Object.__musthave__([
        'preventExtensions', 'isExtensible',
        'defineProperty', 'defineProperties',
        'keys', 'getOwnPropertyNames',
        'seal', 'isSealed',
        'freeze', 'isFrozen',
    ]);
});

/* OOP stuff */

Function.prototype.method = function( name, func ){
    this.prototype[name] = func;
    return this;
}

Function.prototype.methods = function(methods) {
    for( var name in methods )
        this.prototype[name] = methods[name];
    return this;
}

Function.method('new', function() {
    var that = Object.create(this.prototype);
    var other = this.apply( that, arguments );
    return ( typeof other === 'object' && other ) || that;
});

Function.method('inherits', function( Parent ){
    this.prototype = new Parent();
    return this;
});

Object.method('hasProperty', function( prop ){
    return Object.prototype.hasOwnProperty.call( this, prop );
});

Function.method('property', function( name, desc ){
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
});

Object.method('superior', function(name){
    var that = this,
        method = that[name];
    return function(){
        return method.apply(that, arguments);
    };
});

/* Functional stuff */

Function.method('bind', function( that ){
    var method = this,
        slice = Array.prototype.slice,
        args  = slice.apply(arguments, [1]);
    return function( ){
        return method.apply( that,
            args.concat(slice.apply(arguments, [0])));
    };
});

/* Other */

function multiline(f){
    // remove up to comment start and trailing spaces and one newline
    var s = f.toString().replace(/^.*\/\* *\r?\n/,"");
    // remove the trailing */} with preceeding spaces and newline
    s = s.replace(/\n *\*\/\s*\}\s*$/,"")
    return s;
};

function monitor( obj, method_name ){
    var method = obj[ method_name ];
    obj[ method_name ] = function(){
        console.log("'" + method_name + "' called.");
        return method.apply( this, arguments );
    };
}

String.method("format", function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
});