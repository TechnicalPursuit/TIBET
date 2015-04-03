
/* Some grammar converted from: https://github.com/dchester/jsonpath/blob/master/lib/grammar.js */

start
  = (JSON_PATH)*

/* ===== Productions ===== */

JSON_PATH
  = DOLLAR body:PATH_COMPONENTS                             {return {expression: {type: "root", value: body}}}
  / LEADING_CHILD_MEMBER_EXPRESSION
  / LEADING_CHILD_MEMBER_EXPRESSION body:PATH_COMPONENTS    {return {operation: "member", scope: "child", expression:{ type: "identifier", value: body }}}
  / DOLLAR                                                  {return {expression: {type: "root", value: "$"}}}

PATH_COMPONENTS
  = PATH_COMPONENT+

PATH_COMPONENT
  = body:MEMBER_COMPONENT                           {body.operation = "member"; return body}
  / body:SUBSCRIPT_COMPONENT                        {body.operation = "subscript"; return body}

MEMBER_COMPONENT
  = body:DESCENDANT_MEMBER_COMPONENT                {return {scope: "descendant", value: body}}
  / body:CHILD_MEMBER_COMPONENT                     {return {scope: "child", value: body}}
  / body:PARENT_MEMBER_COMPONENT                    {return {scope: "parent", value: body}}

CHILD_MEMBER_COMPONENT
  = DOT body:MEMBER_EXPRESSION? !CIRCUMFLEX         {return body}

DESCENDANT_MEMBER_COMPONENT
  = DOT_DOT body:MEMBER_EXPRESSION? !CIRCUMFLEX     {return body}

PARENT_MEMBER_COMPONENT
  = DOT CIRCUMFLEX body:MEMBER_EXPRESSION?          {return body}

LEADING_CHILD_MEMBER_EXPRESSION
  = body:MEMBER_EXPRESSION                          {return {scope: "child", operation: "member", value: body}}

MEMBER_EXPRESSION
  = body:STAR                                       {return {expression: {type: "wildcard", value: body}}}
  / body:IDENTIFIER                                 {return {expression: {type: "identifier", value: body}}}
  / body:SCRIPT_EXPRESSION                          {return {expression: {type: "script_expression", value: body}}}
  / body:INDEX                                      {return {expression: {type: "numeric_literal", value: parseInt(body)}}}

SUBSCRIPT_COMPONENT
  = body:DESCENDANT_SUBSCRIPT_COMPONENT             {return {scope: "descendant", value: body}}
  / body:CHILD_SUBSCRIPT_COMPONENT                  {return {scope: "child", value: body}}

CHILD_SUBSCRIPT_COMPONENT
  = "[" body:SUBSCRIPT "]"                          {return body}

DESCENDANT_SUBSCRIPT_COMPONENT
  = DOT_DOT "[" body:SUBSCRIPT "]"                  {return body}

SUBSCRIPT
  = SUBSCRIPT_EXPRESSION_LIST
  / SUBSCRIPT_EXPRESSION

SUBSCRIPT_EXPRESSION_LIST
  = first:SUBSCRIPT_EXPRESSION rest:(whitespace* "," whitespace* content:SUBSCRIPT_EXPRESSION {return content})+    {return {expression: {type: "union", value: [first].concat(rest)}}}

SUBSCRIPT_EXPRESSION
  = body:STAR               {return {expression: {type:"wildcard", value: body}}}
  / body:ARRAY_SLICE        {return {expression: {type:"slice", value: body}}}
  / body:INDEX              {return {expression: {type:"index", value: body}}}
  / body:IDENTIFIER         {return {expression: {type:"identifier", value: body}}}
  / body:SCRIPT_EXPRESSION  {return {expression: {type:"script_expression", value: body}}}
  / body:FILTER_EXPRESSION  {return {expression: {type:"filter_expression", value: body}}}
  / body:STRING_LITERAL     {return {expression: {type:"string_literal", value: body}}}

STRING_LITERAL
  = body:QQ_STRING          {return body}
  / body:Q_STRING           {return body}

/* ===== Supporting values ===== */

IDENTIFIER
  = body:[a-zA-Z0-9_{}]+[a-zA-Z0-9_{}]*     {return body.join("")}

ARRAY_SLICE
  = start:INDEX? whitespace* ":" whitespace* end:INDEX?     {return {start:start, end:end}}

INDEX
  = minus? int                      {return parseInt(text());}

Q_STRING
  = chars:char*                     {return chars.join("")}

QQ_STRING
  = string

SCRIPT_EXPRESSION
  = body:EXPR                       {return body.join("")}

FILTER_EXPRESSION
  = "?" body:EXPR                   {return body.join("")}

/* ====== EXPR ====== */

EXPR
  = EXPR_START inner:EXPR_INNER+ EXPR_END   {return inner}

EXPR_START = "("
EXPR_END   = ")"

EXPR_INNER
  = body:EXPR_CONTENT                     {return body}
  / body:EMPTY_EXPR_CONTENT               {return body}
  / !EXPR_END body:.                      {return body}
  / body:"\\("                            {return body}

/* ====== EXPR CONTENT ====== */

EMPTY_EXPR_CONTENT
  = "(" body:_? ")"                                     {return "(" + body.join("") + ")"}

EXPR_CONTENT
  = "(" body:EXPR_CONTENT_INNER+ ")"                    {return "("+ body.join("") +")"}

EXPR_CONTENT_INNER
  = EMPTY_EXPR_CONTENT / EXPR_CONTENT+ / !")" body:.    {return body}

/* ===== Literal values ===== */

DOLLAR
  = "$"

DOT_DOT
  = ".."

DOT
  = "."

STAR
  = "*"

CIRCUMFLEX
  = "^"

BRACKET_LEFT
  = "["

BRACKET_RIGHT
  = "]"

/* ===== Numbers ===== */

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

decimal_point = "."
digit1_9      = [1-9]
e             = [eE]
exp           = e (minus / plus)? DIGIT+
frac          = decimal_point DIGIT+
int           = zero / (digit1_9 DIGIT*)
minus         = "-"
plus          = "+"
zero          = "0"

/* ===== Strings ===== */

string "string"
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape         = "\\"
quotation_mark = '"'
unescaped      = [\x20-\x21\x23-\x5B\x5D-\u10FFFF]

/* ===== Core ABNF Rules ===== */

/* See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4627). */
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i

/* ===== Whitespace ===== */

_ "whitespace"
  = whitespace*

// Whitespace is undefined in the original JSON grammar, so I assume a simple
// conventional definition consistent with ECMA-262, 5th ed.
whitespace
  = [ \t\n\r]
