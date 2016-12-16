lex = {};
+function(exports){
    function log(){
        var args = Array.prototype.slice.call(arguments);
        document.writeln.call( document, JSON.stringify( args ) );
    }
    
    var iota = function(){
        var cnt = 0;
        return function(){
            cnt += 1;
            return cnt - 1;
        }
    }();
    
    // item types
    var itemTyp = {
        "Error"      : iota(),
        "Bool"       : iota(),
        "Complex"    : iota(),
        "EOF"        : iota(),
        
        "Field"      : iota(), // identifier, starting with '.'
        "Identifier" : iota(), // identifier
        "LeftDelim"  : iota(), // left meta-string
        "Number"     : iota(), // number
        "Pipe"       : iota(), // pipe symbol
        "RawString"  : iota(), // raw quoted string (includes quotes)
        "RightDelim" : iota(), // right meta-string
        
        "String"     : iota(), // quoted string (includes quotes)
        "Text"       : iota(), // plain text
        
        "Keyword"    : iota(), // used only to delimit keywords
        "Dot"        : iota(), // the cursor, spelled '.'
        "Define"     : iota(), // define keyword
        "Else"       : iota(), // else keyword
        "End"        : iota(), // end keyword
        "If"         : iota(), // if keyword
        
        "Range"      : iota(), // range keyword
        "Template"   : iota(), // template keyword
        "With"       : iota(), // with keyword
    };
    
    var itemName = {};
    for( var o in itemTyp ){
        itemName[ itemTyp[o] ] = o;
    }
    
    var itemKey = {
        "."         : itemTyp.Dot,
        "define"    : itemTyp.Define,
        "else"      : itemTyp.Else,
        "end"       : itemTyp.End,
        "if"        : itemTyp.If,
        "range"     : itemTyp.Range,
        "template"  : itemTyp.Template,
        "with"      : itemTyp.With
    }
    
    // item template  
    function item( desc ){
        this.typ = desc.typ || itemTyp.Error;
        this.val = desc.val || "";
    }
    
    item.method("print", function(){
        switch( this.typ ){
            case itemTyp.EOF       : return "EOF"; break;
            case itemTyp.itemError : return this.val; break;
        }
        if( this.val.length > 10 ){
            return this.val.substr(0, 10) + '...';
        }
        return this.val;
    });
    
    function lexer(name, input){
        this.name  = name  || ""; // error reporting
        this.input = input || ""; // string being scanned
        this.start = 0;           // start position of this item
        this.pos   = 0;           // current position
        this.items = [];          // output
        
        this.stateFn = null;
    }
    
    
    var leftDelim    = "{{",
        rightDelim   = "}}",
        leftComment  = "{{/*",
        rightComment = "*/}}",
        eof = -1;
    
    var hasMatch = function( hay, pos, needle ){
        for(var i=0, l=needle.length; i < l; i++){
            if( hay.charCodeAt(pos + i) !== needle.charCodeAt(i) )
                return false;
        }
        return true;
    };
    
    // lexText scans until an opening action delimiter, "{{".
    var lexText = function(l){
        for(;;){
            if( hasMatch( l.input, l.pos, leftDelim ) ){
                if( l.pos > l.start ){
                    l.emit( itemTyp.Text )
                }
                return lexLeftDelim;
            }
            if( l.next() == eof ){ 
                break;
            }            
        }
        if( l.pos > l.start ){
            l.emit( itemTyp.Text );
        }
        l.emit( itemTyp.EOF );
        return null;
    };
    
    var lexLeftDelim = function(l){
        if( hasMatch(l.input, l.pos, leftComment) ){
            return lexComment;
        }
        l.pos += leftDelim.length;
        l.emit( itemTyp.LeftDelim );
        return lexInsideAction; // now inside {{ }}
    };
    
    var lexComment = function(l){
        i = l.input.indexOf( rightComment, l.pos );
        if( i < 0 ){
            return l.errorf("unclosed comment");
        }
        l.pos += i + rightComment.length;
        l.ignore();
        return lexText;
    };
    
    var lexRightDelim = function(l){
        l.pos += rightDelim.length;
        l.emit( itemTyp.RightDelim );
        return lexText; // now outside {{ }}
    };
    
    var regWhitespace = /\s/,
        regNumber = /[\+\-1234567890]/,
        isLetter = function(c){ return c.toUpperCase() != c.toLowerCase() },
        isAlphaNumeric = function(c){ return isLetter(c) || (c === "_") || (c === "$") || c.match(regNumber) };
    
    var lexInsideAction = function(l){
        for(;;){
            if( hasMatch( l.input, l.pos, rightDelim ) ){
                return lexRightDelim;
            }
            var r = l.next();
            switch( r ){
                case '\n': case eof:
                    return l.errorf("unclosed action"); 
                    break;
                case '|':
                    l.emit( itemTyp.Pipe );
                    break;
                case '"':
                    return lexQuote;
                    break;
                case '`':
                    return lexRawQuote;
                    break;
                case '.':
                    // special lookahead
                    if( l.pos < l.input.length ){
                        r = l.input[l.pos];
                        if( !r.match(/[0-9]/) ) {
                            return lexIdentifier;
                        }
                    }
                    break;
                default:
                    if( r.match(regWhitespace) ){
                        l.ignore()
                    } else if ( r.match(regNumber) || (r === ".")){
                        l.backup();
                        return lexNumber;
                    } else if ( isAlphaNumeric(r) ){
                        l.backup();
                        return lexIdentifier;
                    } else {
                        return l.errorf("unrecognized character in action: {0}", r);
                    }
            };
        }
        return null;
    }
    
    var lexIdentifier = function( l ){
        for(;;){
            var r = l.next();
            if ( (r === ".") && (l.input.charAt(l.start) === ".") ){
                // absorb field changing
            } else if( isAlphaNumeric(r) ){
                // absorb
            } else {
                l.backup();
                var word = l.input.substr( l.start, l.pos - l.start );
                if( itemKey[word] ){
                    l.emit( itemKey[word] );
                } else if ( word.charAt(0) === '.' ) {
                    l.emit( itemTyp.Field );
                } else if ( (word === "true") || (word === "false") ) {
                    l.emit( itemTyp.Bool );
                } else {
                    l.emit( itemTyp.Identifier );
                }
                break;
            }
        }
        return lexInsideAction;
    };
    
    var lexNumber = function( l ){
        if( !l.scanNumber() ){
        }
        var sign = l.peek();
        if( (sign === "+") || (sign === "-") ){
            if( !l.scanNumber() || (l.input[l.pos-1] !== "i") ){
                return l.errorf("bad number syntax: {0}", l.input.substr( l.start, l.pos - l.start ));
            }
            l.emit( itemTyp.Complex );
        } else { 
            l.emit( itemTyp.Number );
        }
        return lexInsideAction;
    }
    
    var scanNumber = function( l ){
        l.accept("\+\-");
        var digits = "012345789";
        if( l.accept( "0" ) && l.accept( "xX" ) ){
            digits = "012345789abcdefABCDEF";
        }
        l.acceptRun(digits);
        if( l.accept( "\." ) ){
            l.acceptRun( digits );
        }
        if( l.accept("eE") ){
            l.accept("\+\-");
            l.acceptRun("01235789");
        }
        
        l.accept("i");
        if( isAlphaNumeric(l.peek()) ){
            l.next();
            return l.errorf("bad number syntax: {0}", 
                                l.input.substr( l.start, l.pos - l.start ));
        }
        l.emit( itemTyp.Number );
        return lexInsideAction;
    };
    
    var lexQuote = function(l){
        for(;;){
            var r = l.next();
            if( r === "\\" ){
                r = l.next();
                if ( (r === eof) || (r === "\n") ){
                    return l.errorf("unterminated quoted string");
                }
            } else if ( (r === eof) || (r === "\n") ){
                return l.errorf("unterminated quoted string");
            } else if ( r === '"' ){
                break;
            }
        }
        l.emit( itemTyp.String );
        return lexInsideAction;
    };
    
    var lexRawQuote = function(l){
        for(;;){
            var r = l.next();
            if ( (r === eof) || (r === "\n") ){
                return l.errorf("unterminated raw quoted string");
            } else if ( r === '`' ){
                break;
            }
        }
        l.emit( itemTyp.RawString );
        return lexInsideAction;
    };
    
    lexer.method("run", function(){
        while( l.stateFn !== null ){
            l.stateFn = l.stateFn( this );
        }
    });
    
    lexer.method("lex", function(){
        var l = this;
        l.pos = 0;
        l.start = 0;
        l.items = [];
        l.stateFn = lexText;
        l.run();
        return [l, l.items];
    });
    
    lexer.method("next", function(){
        var l = this;
        if( l.pos >= l.input.length ){
            return eof;
        }
        var rune = l.input.charAt( l.pos );
        l.pos += 1;
        return rune;
    });
    
    lexer.method("peek", function(){
        var l = this,
            rune = l.next();
        l.backup();
        return rune;
    });
    
    lexer.method("ignore", function(){
        var l = this;
        l.start = l.pos;
    });
    
    lexer.method("backup", function(){
        var l = this;
        l.pos -= 1;
    });
    
    lexer.method("accept", function(valid){
        var   l = this,
            reg = RegExp("^["+valid+"]$");
        if( l.next().match( reg ) ){
            return true;
        }
        l.backup();
        return false;
    });
    
    lexer.method("acceptRun", function(valid){
        var   l = this,
            reg = RegExp("^["+valid+"]$");
        for(; l.next().match(reg);){
        }
        l.backup();
    });
    
    lexer.method("scanNumber", function(){
        var l = this;
        l.accept("\+\-");
        var digits = "012345789";
        if( l.accept( "0" ) && l.accept( "xX" ) ){
            digits = "012345789abcdefABCDEF";
        }
        l.acceptRun(digits);
        if( l.accept( "\." ) ){
            l.acceptRun( digits );
        }
        if( l.accept("eE") ){
            l.accept("\+\-");
            l.acceptRun("01235789");
        }
        
        l.accept("i");
        if( isAlphaNumeric(l.peek()) ){
            l.next();
            return false
        }
        return true;
    });
    
    lexer.method("emit", function( typ ){
        var l = this;
        var i = item.new({typ:typ, val: l.input.substr(l.start, l.pos - l.start) });
        this.items.push( i );
        this.start = this.pos;
    });
    
    lexer.method("errorf", function(fstr){
        var l = this,
            slice = Array.prototype.slice,
            args  = slice.apply(arguments, [1]),
            formatted = fstr.format.apply(fstr, args);
        l.items.push( item.new({typ:itemTyp.Error, val: formatted }) );
        return null;
    });    
    
    this.lexer = lexer;
    this.item = item;
    this.types = itemTyp;
    this.typeNames = itemName;
    
}.apply(lex);


var template = multiline(function(){/*
Evaluation: {{.Title}}
Constants and functions: {{printf "%g: %#3X" 1.2+2i 123}}
Control structures {{range $s.Text}} {{.}} {{end}}
*/});

function printLexing( lexing ){
    for( var i = 0, l = lexing.length; i < l; i++ ){
        var item = lexing[i];
        document.writeln(lex.typeNames[item.typ] + ": \"" + item.val + "\"");
    }
}
    
l = lex.lexer.new("lx", template);
lexing = l.lex()[1];

document.writeln( "===" );
document.writeln( template );
document.writeln( "===" );
printLexing( lexing );