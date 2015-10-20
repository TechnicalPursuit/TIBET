/* ====== THIS IS A DEBUG VERSION OF THE TEMPLATE PARSER ====== */
/* ====== IT IS MEANT TO BE EXECUTED INSIDE OF AN ENVIRONMENT THAT CAN  ====== */
/* ====== MANAGE A STANDARD JAVASCRIPT CONSOLE  ====== */

{
   console.clear()
}

start
  = (VALUE / COMMAND / BLOCK / TEXT)*

TEXT
  = body:TEXT_INNER+ { console.log('text: ' + body.toString().replace(' ','_')); return ["text", body.join("")]}

TEXT_INNER
  = !BLOCK_START !VALUE_START c: ("\\{" / "\\}" / .) {return c}

/* ====== Value ====== */

VALUE
  = VALUE_START inner:VALUE_INNER+ VALUE_END
                      {return ["value", inner.join("")]}

VALUE_START = "{{" ![:/] {console.log('VALUE_START')}
VALUE_END   = "}}"       {console.log('VALUE_END')}

VALUE_INNER
  = body:OBJECT       { console.log('VALUE INNER 1: ' + peg$savedPos + ' body: ' + body); return body}
  / body:FORMAT_SUBSTITUTION { console.log('VALUE INNER 2: ' + peg$savedPos + ' body: ' + body); return body}
  / body:EMPTY_OBJECT { console.log('VALUE INNER 3: ' + peg$savedPos + ' body: ' + body); return body}
  / !VALUE_END body:. { console.log('VALUE INNER 4: ' + peg$savedPos + ' body: ' + body); return body}
  / body:"\\{"        { console.log('VALUE INNER 5: ' + peg$savedPos + ' body: ' + body); return body}

/* ====== Format Substitutions ('@', '#', '%' substitutions) ====== */

FORMAT_SUBSTITUTION
  = sigil:[#%@] "{" body:FORMAT_SUBSTITUTION_INNER+ "}" {console.log('FORMAT_SUBSTITUTION: ' + peg$savedPos + 'sigil: ' + sigil + ' body: ' + body); return sigil + '{' + body.join('') + '}'}

FORMAT_SUBSTITUTION_INNER
  = !"{" !"}" body:. {console.log('FORMAT_SUBSTITUTION INNER: ' + peg$savedPos + ' body: ' + body); return body}

/* ====== Commands ====== */

COMMAND
  = BLOCK_START _ command:COMMANDS _ BLOCK_END
                      { return ["command", ""]}
  / BLOCK_START _ command:COMMANDS _ body:COMMAND_INNER+ _ BLOCK_END
                      { return ["command", body.join("")]}

COMMAND_INNER
  = body:OBJECT       { console.log('COMMAND INNER 1: ' + peg$savedPos + ' body: ' + body); return body}
  / body:EMPTY_OBJECT { console.log('COMMAND INNER 2: ' + peg$savedPos + ' body: ' + body); return body}
  / !BLOCK_END body:. { console.log('COMMAND INNER 3: ' + peg$savedPos + ' body: ' + body); return body}

COMMANDS
=   "html"
  / "="
  / "!"  {return "comment"}

/* ====== Blocks ====== */

BLOCK
  = open:BLOCK_OPEN inner:(BLOCK_INNER+)?  else_b:(ELSE_BLOCK+)? close:BLOCK_CLOSE
    {
      if (open.command == close){
        if (open.command == "if"){
          return [open.command, open.body.join(""), inner, else_b];
        } else {
          if(open.args){
            return [open.command, {args : open.args[0], data: open.body.join("")}, inner];
          } else {
            return [open.command, open.body.join(""), inner];
          }
        }
      } else {
        throw new this.SyntaxError(
          "No closing tag found for " + open.command + ' on line: ' + line() + ' at position: ' + column()
        );
      }
    }

/*
Blocks always start and end with ':' and '/:' respectively, but we also want to
make sure that that character is followed by an alphanumeric character. Also, we
precede that part of the match with a '&' so that if it matches it will not
consume the match.
*/

BLOCK_START_OPEN_BLOCK = "{{:" &[a-zA-Z0-9]+  {console.log('BLOCK_START_OPEN_BLOCK: ' + peg$savedPos)}
BLOCK_START_CLOSE_BLOCK = "{{/:" &[a-zA-Z0-9]+ {console.log('BLOCK_START_CLOSE_BLOCK: ' + peg$savedPos)}

BLOCK_START = (BLOCK_START_OPEN_BLOCK / BLOCK_START_CLOSE_BLOCK)
BLOCK_END   = "}}"
    {console.log('BLOCK_END: ' + peg$savedPos)}

BLOCK_OPEN
  = BLOCK_START_OPEN_BLOCK _ command:BLOCK_COMMANDS _ args:(BLOCK_ARGS+)? _ body:COMMAND_INNER+ _ BLOCK_END
    { console.log('BLOCK_OPEN: ' + peg$savedPos + ' body: ' + body); return {command:command, body:body, args:args}}

BLOCK_CLOSE
  = BLOCK_START_CLOSE_BLOCK _ tail:BLOCK_COMMANDS _ BLOCK_END
    { console.log('BLOCK CLOSE: ' + peg$savedPos + ' tail: ' + tail); return tail }

BLOCK_INNER
  = body:BLOCK             { return body}
  / body:COMMAND           { return body}
  / body:VALUE             { return body}
  / body:TEXT              { return body}

BLOCK_COMMANDS
  = COMMAND_FOR
  / COMMAND_IF
  / COMMAND_WITH
  / COMMAND_LOG

COMMAND_IF
  = "if"

COMMAND_FOR
  = "for"

COMMAND_WITH
  = "with"

COMMAND_LOG
  = "log"

BLOCK_ARGS
  = "(" _ inner:BLOCK_ARGS_INNER+ ")" { return inner.join("")}

BLOCK_ARGS_INNER
  = !")" body:. { return body }

/* ====== Else block ====== */
// Damn this is tricky

COMMAND_ELSE
  = "else"

ELSE_BLOCK
  = expression:ELSE_BLOCK_OPEN inner:(ELSE_BLOCK_INNER+)?
    { return ["else", expression, inner] }

ELSE_BLOCK_INNER
  = BLOCK_INNER

ELSE_BLOCK_OPEN
  = BLOCK_START _ COMMAND_ELSE _ BLOCK_END
    { return "true"}
  / BLOCK_START _ COMMAND_ELSE _ expression:COMMAND_INNER+ _ BLOCK_END
    { return expression.join("")}

ELSE_BLOCK_CLOSE
  = BLOCK_START _ "/" COMMAND_IF _ BLOCK_END

/* ====== Objects ====== */

EMPTY_OBJECT
  = "{{" body:_? "}}"            { return "{{" + body.join("") + "}}"}

OBJECT
  = "{{" body:OBJECT_INNER+ "}}" { return "{{"+ body.join("") +"}}"}

OBJECT_INNER
  = EMPTY_OBJECT / OBJECT+ / !"}}" body:. {return body}

/* ===== Whitespace ===== */

_ "whitespace"
  = whitespace*

// Whitespace is undefined in the original JSON grammar, so I assume a simple
// conventional definition consistent with ECMA-262, 5th ed.
whitespace
  = [ \t\n\r]
