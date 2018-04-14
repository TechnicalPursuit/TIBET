//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
General-purpose support for data templating.
*/

//  ========================================================================
//  STRING TEMPLATING
//  ========================================================================

TP.defineMetaInstMethod('transform',
function(aDataSource, transformParams) {

    /**
     * @method transform
     * @summary Performs a transformation on the supplied data source object
     *     using the receiver.
     * @description At this level, this method merely calls transform<Type>
     *     where <type> is the type of the data source. If that type has no
     *     transform method, transformObject() will be called as the default.
     * @param {Object} aDataSource The object supplying the data to use in the
     *     transformation.
     * @param {TP.core.Hash|TP.sig.Request} transformParams A parameter
     *     container responding to at(). For string transformations a key of
     *     'repeat' with a value of true will cause iteration to occur (if
     *     aDataSource is an 'ordered collection' this flag needs to be set to
     *     'true' in order to have 'automatic' iteration occur). Additional keys
     *     of '$REPEAT_START' and '$REPEAT_LIMIT' determine the range of the
     *     iteration.
     * @returns {String} The string resulting from the transformation process.
     */

    //  context, specializer, prefix, suffix, fallback, arglist
    return this.callBestMethod(arguments, aDataSource,
                                'transform', null,
                                'transformObject');
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('transformObject',
function(aDataSource, transformParams) {

    /**
     * @method transformObject
     * @summary Performs a transformation on the supplied data source object
     *     using the receiver.
     * @description At this level, this method is providing the 'fallback' for
     *     the 'transform()' method. It provides no functionality.
     * @param {Object} aDataSource The object supplying the data to use in the
     *     transformation.
     * @param {TP.core.Hash|TP.sig.Request} transformParams A parameter
     *     container responding to at(). For string transformations a key of
     *     'repeat' with a value of true will cause iteration to occur (if
     *     aDataSource is an 'ordered collection' this flag needs to be set to
     *     'true' in order to have 'automatic' iteration occur). Additional keys
     *     of '$REPEAT_START' and '$REPEAT_LIMIT' determine the range of the
     *     iteration.
     * @returns {String} The string resulting from the transformation process.
     */

    return null;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('compile',
function(templateName, ignoreCache, shouldRegister, sourceVarNames, echoFormat, annotateMarkup) {

    /**
     * @method compile
     * @summary Compiles the receiver string template and registers it under
     *     the key provided. If no template name is provided all cache and
     *     registration flags are effectively ignored.
     * @param {String} templateName The template's lookup ID.
     * @param {Boolean} [ignoreCache=false] If true, this method ignores the
     *     template cache and will compile and register the template, even if it
     *     has done so before.
     * @param {Boolean} [shouldRegister=true] If false, this method does not
     *     register the template in the template cache.
     * @param {Array} sourceVarNames An Array of variable names that have a '$'
     *     as their first character, but that we want the templating engine to
     *     treat as coming from the data source instead of the params (the
     *     engine will usually treat '$' variables specially and draw their data
     *     from the 'params' argument instead of the source).
     * @param {Boolean} [echoFormat=true] Whether or not to 'echo' the format
     *     out to the result if no source object can be computed for it.
     * @param {Boolean} [annotateMarkup=true] Whether or not to annotate markup
     *     output with embedded XHTML 'span' elements that wrap ACP expressions
     *     and contain the ACP expression in a 'tibet:templateexpr' attribute
     *     on that element.
     * @returns {Function} The compiled template Function.
     */

    var str,
        regName,
        uri,

        shouldEcho,

        func,

        tokens,

        newTokens,
        len,
        i,

        tokenType,
        tokenText,
        lastTokenText;

    //  Force a string representation. This ensures certain Mozilla bugs
    //  don't get triggered by referencing 'this' alone.
    if (TP.isEmpty(str = this.toString())) {
        return null;
    }

    //  If the template name contains 'substitution characters' (i.e. '#@%',
    //  etc. - which can happen when using them standalone) then make sure to
    //  escape the name before trying to use it as a URI name to register the
    //  template under.
    if (TP.regex.FORMAT_SUBSTITUTION.test(regName = templateName)) {
        regName = window.escape(regName);
    }

    //  Check under any regName provided if we're supposed to check the cache.
    if (TP.notEmpty(regName) && TP.notTrue(ignoreCache)) {

        //  Build a URI and check to see if it already has a resource result -
        //  if so, it's the template function.
        uri = TP.uc(TP.TIBET_URN_PREFIX + regName);
        if (TP.isURI(uri)) {

            //  NB: We assume 'async' of false here.
            if (TP.isFunction(func = uri.getResource().get('result'))) {
                return func;
            }
        }
    }

    shouldEcho = TP.ifInvalid(echoFormat, true);

    //  No dynamic ACP content? The function is one that returns a simple static
    //  string.
    if (!TP.regex.HAS_ACP.test(str)) {

        func =
            function(aDataSource) {
                return str;
            };

    } else {
        //  Tokenize the String template. {{}} constructs will appear in the
        //  output as 'value' tokens
        try {
            tokens = TP.$templateParser.parse(str);
        } catch (e) {
            return this.raise(
                    'TP.sig.TemplateTokenizationFailed',
                    TP.ec(e,
                        TP.sc('Tokenization failed at: ', e.line || 'unknown',
                                ' in template named: ', templateName,
                                ' with source: ' + str)));
        }

        //  If the invoker hasn't explicitly set annotateMarkup to false, and
        //  the result output contains markup, then annotate it with XHTML span
        //  elements.
        if (TP.notFalse(annotateMarkup) &&
            TP.regex.CONTAINS_ELEM_MARKUP.test(str)) {

            //  Allocate our Array of 'new tokens'.
            newTokens = TP.ac();

            len = tokens.getSize();
            for (i = 0; i < len; i++) {

                //  Grab the token type and test it to see if it's a 'value' or
                //  'control' token.
                tokenType = tokens.at(i).at(0);
                tokenText = tokens.at(i).at(1);

                if (TP.regex.ACP_VALUE_TOKEN.test(tokenType) ||
                    TP.regex.ACP_CONTROL_TOKEN.test(tokenType)) {

                    //  Grab the token text for the 'last' token.
                    lastTokenText = tokens.at(i - 1).at(1);

                    //  If the last token's text contains only the start of an
                    //  XML attribute or element, then we don't want to embed
                    //  markup inside of that - just push the token and move on.
                    if (TP.regex.CONTAINS_ONLY_ATTR_START.test(lastTokenText) ||
                        TP.regex.CONTAINS_ONLY_ELEM_START.test(lastTokenText)) {
                        newTokens.push(tokens.at(i));
                    } else {

                        //  Otherwise, push 2 additional 'text' tokens 'around'
                        //  the original token that contain a text blob of the
                        //  starting and ending markup.
                        newTokens.push(
                            TP.ac('text',
                                    '<span' +
                                    ' tibet:templateexpr="' + tokenText + '"' +
                                    '>'),
                                    tokens.at(i),
                                    TP.ac('text', '</span>'));
                    }
                } else {

                    //  Otherwise, just push the token and move on.
                    newTokens.push(tokens.at(i));
                }
            }

            //  Make the tokens that we'll use the 'new tokens'.
            tokens = newTokens;
        }

        //  Compile the tokenized template into a Function object
        func = this.$compileTemplateTokens(
                        tokens, templateName, sourceVarNames, shouldEcho);
    }

    //  Compilation/creation of a template function failed.
    if (!TP.isFunction(func)) {
        this.raise('TP.sig.InvalidTemplate',
                    'Unable to compile string: ' + str);

        return;
    }

    //  Register as a compiled template for reuse provided we have a valid
    //  regName to use.
    if (TP.notEmpty(regName) && TP.notFalse(shouldRegister)) {
        TP.uc(TP.TIBET_URN_PREFIX + regName).setResource(func);
    }

    return func;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('$compileTemplateTokens',
function(tokenList, templateName, sourceVarNames, echoFormat) {

    /**
     * @method $compileTemplateTokens
     * @summary Compiles the supplied template tokens into a JavaScript
     *     Function object.
     * @param {Array} tokenList The list of tokens representing the template.
     * @param {String} templateName The template's lookup ID. In this method,
     *     this is used by inline templates to qualify their name.
     * @param {Array} sourceVarNames An Array of variable names that have a '$'
     *     as their first character, but that we want the templating engine to
     *     treat as coming from the data source instead of the params (the
     *     engine will usually treat '$' variables specially and draw their data
     *     from the 'params' argument instead of the source).
     * @param {Boolean} [echoFormat] Whether or not to 'echo' the format out to
     *     the result if no source object can be computed for it.
     * @returns {Function} The compiled template Function.
     */

    var srcVars,

        newlineChar,
        inlineCount,

        ignoreNull,
        formattedValue,

        generators,
        commands,

        funcParts,
        funcBody,

        templateFunc,

        scopedParams,
        scopedSourceNames,

        funcStr;

    srcVars = sourceVarNames;
    if (TP.notValid(srcVars)) {
        srcVars = TP.ac();
    }

    scopedParams = TP.ac();
    scopedSourceNames = TP.ac();

    inlineCount = 0;

    newlineChar = '__NEW_LINE__';

    ignoreNull = 'return TP.isNull(result) ? \'\' : TP.str(result);';

    formattedValue = function(faultText, argFormat, isRepeating) {
        //  Returns an expression that will return the value formatted according
        //  to the supplied format, and whether it's a repeating format.

        var retVal;

        if (TP.notEmpty(argFormat)) {

            //  Had a format
            if (isRepeating) {

                //  It's a repeating format
                if (echoFormat) {
                    retVal = '(TP.format(TP.ifInvalid(result, ' +
                                            '\'{{' + faultText + '}}\'),' +
                                    ' "' + argFormat + '", ' +
                                    'params.atPut(\'repeat\', true)))';
                } else {
                    retVal = '(TP.format(TP.ifInvalid(result, ' +
                                            '\'\'),' +
                                    ' "' + argFormat + '", ' +
                                    'params.atPut(\'repeat\', true)))';
                }
            } else {

                //  It's a non-repeating format
                if (echoFormat) {
                    retVal = '(TP.format(TP.ifInvalid(result, ' +
                                            '\'{{' + faultText + '}}\'),' +
                                    ' "' + argFormat + '", params))';
                } else {
                    retVal = '(TP.format(TP.ifInvalid(result, ' +
                                            '\'\'),' +
                                    ' "' + argFormat + '", params))';
                }
            }
        } else {

            //  No format - just the value 'formatted' as a String
            if (echoFormat) {
                retVal = '(TP.format(TP.ifInvalid(result, ' +
                                            '\'{{' + faultText + '}}\'),' +
                                    ' "' + 'String' + '"))';
            } else {
                retVal = '(TP.format(TP.ifInvalid(result, ' +
                                            '\'\'),' +
                                    ' "' + 'String' + '"))';
            }
        }

        return retVal;
    };

    generators = {

        defineUndefined: function(arg) {
            //  Returns an expression that returns an empty String if the
            //  argument is not defined.

            return 'if (!TP.isDefined(' +
                    generators.escapedIdentifier(arg) +
                    ')) { return \'\'; };';
        },

        escape: function(str) {
            //  Returns any single quote within the str as escaped quotes.

            return str.replace(/'/ig, '\\\'');
        },

        escapedIdentifier: function(str) {
            //  Returns any supplied identifier as a 'hashed number' if it can't
            //  be expressed as a JavaScript identifier

            if (!TP.regex.JS_IDENTIFIER.test(str)) {
                return '_' + str.asHashedNumber().abs();
            }

            return str;
        },

        guardCollection: function(arg) {
            //  Returns an expression that will tested the provided argument to
            //  see if it is defined. If so, it will be used - otherwise it will
            //  return an empty Array

            return '!TP.isDefined(' +
                    generators.escapedIdentifier(arg) +
                    ') ? TP.ac() : ' +
                arg;
        },

        getFromArgs: function(propName) {
            //  Returns an expression that will try to extract a value for the
            //  property named by the propName parameter. The source object for
            //  this will either be the data source or the params handed to the
            //  generated Function or a source variable 'in scope'.

            var retVal,
                sourceName;

            //  If the propName starts with a '$' and isn't in the 'special
            //  list' of 'source variable' supplied by the caller, then it
            //  should get its value from the 'params' parameter to the template
            //  Function
            if (TP.regex.IS_ACP_VARIABLE.test(propName) &&
                !srcVars.contains(propName)) {
                sourceName = 'params';
            } else {
                //  Otherwise, if a list of 'scoped source' names is being kept
                //  (we're probably being generated inside of a control
                //  structure of some sort), check with that list. If there is
                //  no entry there, then use 'source'.
                if (TP.isEmpty(sourceName = scopedSourceNames.last())) {
                    sourceName = 'source';
                }
            }

            //  Generate the expression.
            retVal = 'var ' + generators.escapedIdentifier(propName) + ' = ' +
                        'TP.wrap(TP.objectValue(' + sourceName + ',' +
                                    ' ' + propName.quoted() + ',' +
                                    ' true));';

            return retVal;
        },

        guardValue: function(arg) {
            //  Returns an expression that will tested the provided argument to
            //  see if it is defined. If so, it will be used - otherwise it will
            //  return a null.

            return '!TP.isDefined(' +
                    generators.escapedIdentifier(arg) + ') ? ' +
                    'null : ' + arg;
        },

        handle: function(item) {
            //  Handles processing a particular kind of token

            var args,
                command;

            //  item is a tuple [command, args, [,args]]
            args = item;
            command = args.shift();

            if (!TP.isCallable(commands[command])) {
                return this.raise(
                        'TP.sig.TemplateCompilationFailed',
                            TP.sc('Compilation failed.',
                                    ' Unknown handler for: ', command,
                                    ' with args: ' + args.shift()));
            }

            return commands[command].apply(this, args);
        }.bind(this),

        loop: function(input, joinChar) {
            //  Loops over the stream of tokens represented by input, invokes
            //  'handle' on each one, and concats it all together into a single
            //  expression

            return input.map(generators.handle).join(
                                joinChar || ' +' + newlineChar);
        },

        returnWrap: function(code) {
            //  Returns an expression that returns whatever the supplied code
            //  returns.

            return generators.wrap('return ' + code);
        },

        wrap: function(code) {
            //  Wraps the supplied code into a Function closure that is then
            //  executed.

            return '(function() {' + code + '})()';
        },

        valueFromVar: function(varName) {

            var valueGet,
                defaultStr,
                str;

            if (TP.notEmpty(scopedParams) &&
                (scopedParams.last().contains(varName) ||
                 scopedParams.last().contains(TP.ALL))) {
                valueGet = '';
            } else {
                valueGet = generators.getFromArgs(varName);
            }

            str = '(function() {\n' +
                valueGet + newlineChar +
                generators.defineUndefined(varName) + newlineChar +
                'var arg = (' + generators.escapedIdentifier(varName) + ');' +
                    newlineChar +
                'arg = TP.isCallable(arg) ? arg(params) : arg;' + newlineChar +
                defaultStr +
                'if (TP.isArray(arg)) {arg.$set(\'delimiter\', \'\')};' +
                    newlineChar +
                'var result = ' + varName + ';' + newlineChar +
                ignoreNull +
                '})()';

            return str;
        },

        valueStatement: function(expr) {

            var valueGet,
                str;

            if (TP.notEmpty(scopedParams) &&
                (scopedParams.last().contains(expr) ||
                 scopedParams.last().contains(TP.ALL))) {
                valueGet = '';
            } else {
                valueGet = generators.getFromArgs(expr);
            }

            str =
                valueGet + newlineChar +
                generators.defineUndefined(expr) + newlineChar +
                'result = (' + generators.escapedIdentifier(expr) + ');' +
                    newlineChar +
                'result = TP.isCallable(result) ? result(params) : result;' +
                    newlineChar +
                'if (TP.isArray(result)) ' +
                    '{result.$set(\'delimiter\', \'\')};' +
                    newlineChar;

            return str;
        },
        formatStatement: function(faultText, format, isRepeating) {

            var str;

            str = 'result = ' + formattedValue(faultText, format, isRepeating) +
                    ';' +
                    newlineChar;

            return str;
        },
        defaultStatement: function(expr) {

            var str;

            str =
                'if (TP.isEmpty(result)) {' +
                    'result = ' + expr + '; ' +
                    'if (TP.isArray(result)) {' +
                        'result.$set(\'delimiter\', \'\')};' +
                '}' + newlineChar;

            return str;
        }
    };

    /* eslint-disable no-reserved-keys */
    commands = {
        comment: function() {
            //  For comments, just return a Function returning the empty string.

            return generators.returnWrap('\'\'');
        },

        text: function(text) {
            //  For comments, just return a Function returning a string with
            //  escaped text.

            return generators.returnWrap(
                    '\'' + generators.escape(text) + '\';');
        },

        value: function(arg) {

            var src,
                tokens,

                len,
                i,

                expr,
                currentOp,

                wroteStart,
                escapedTemplate,

                result,

                token,
                val,

                inlineTemplate,
                inlineName,

                formatFaultText;

            src = arg;

            TP.regex.ACP_OPERATORS.lastIndex = 0;
            src = src.replace(TP.regex.ACP_OPERATORS, ' $1 ');

            tokens = TP.$tokenize(
                        src,
                        //  All of the JS operators *and* the TSH operators
                        TP.tsh.script.$tshAndJSOperators,
                        true, true, false, true);

            expr = '';
            currentOp = null;
            wroteStart = false;
            escapedTemplate = '';

            result = '(function() {' + newlineChar +
                        'var result;' + newlineChar;

            len = tokens.getSize();
            for (i = 0; i < len; i++) {

                token = tokens.at(i);
                val = token.value;

                switch (token.name) {

                    case 'operator':

                        TP.regex.ACP_OPERATORS.lastIndex = 0;
                        if (TP.isValid(currentOp) &&
                            TP.regex.ACP_OPERATORS.test(val)) {

                            expr = TP.trim(expr);

                            //  Escaped template - slice out the escaping '\'
                            //  characters from either end (making sure to
                            //  append '}}' to reconstruct the template) and
                            //  exit here.
                            if (expr.at(0) === '\\') {
                                escapedTemplate = expr.slice(1, -3) + '}}';

                                expr = '';
                                currentOp = null;

                                break;
                            } else {
                                formatFaultText =
                                    TP.sc('<NOT_FOUND: ', expr, ' >');

                                switch (currentOp) {
                                    case '.%':
                                        result += generators.formatStatement(
                                                formatFaultText, expr, false);
                                        break;
                                    case '.%*':
                                        result += generators.formatStatement(
                                                formatFaultText, expr, true);
                                        break;
                                    case '.||':
                                        result += generators.defaultStatement(
                                                expr);
                                        break;
                                    default:
                                        break;
                                }
                            }

                            expr = '';
                            currentOp = null;
                        }

                        switch (val) {
                            case '.%':
                            case '.%*':
                            case '.||':
                                currentOp = val;
                                break;
                            default:
                                //  leave everything else alone
                                expr += val;
                                break;
                        }

                        break;

                    case 'template':

                        inlineTemplate = val;

                        //  compute a unique name for the 'inline' template
                        inlineName = templateName + '_inline_' + inlineCount++;

                        //  compile and register it (ignoring any previously
                        //  cached value)
                        inlineTemplate.compile(inlineName, true);

                        expr = inlineName;

                        if (TP.isValid(currentOp)) {

                            formatFaultText = TP.sc('<NOT_FOUND: ', expr, ' >');

                            switch (currentOp) {
                                case '.%':
                                    result += generators.formatStatement(
                                                formatFaultText, expr, false);
                                    break;
                                case '.%*':
                                    result += generators.formatStatement(
                                                formatFaultText, expr, true);
                                    break;
                                default:
                                    break;
                            }

                            expr = '';
                            currentOp = null;
                        }

                        break;

                    case 'identifier':

                        //  TODO: This is a hack due to a bug in the tokenizer
                        if (val === '($') {
                            val = '$';
                        }

                        //  Note the fallthrough

                    default:
                        //  leave everything else alone
                        expr += val;

                        break;
                }

                if (TP.isValid(currentOp) && !wroteStart) {
                    expr = TP.trim(expr);

                    result += generators.valueStatement(expr);

                    wroteStart = true;
                    expr = '';

                    continue;
                }
            }

            expr = TP.trim(expr);
            if (!wroteStart) {
                result += generators.valueStatement(expr);
            } else if (TP.isValid(currentOp)) {

                formatFaultText = TP.sc('<NOT_FOUND: ', expr, ' >');

                if (TP.notEmpty(expr)) {

                    //  Escaped template - slice out the escaping '\' characters
                    //  from either end (making sure to append '}}' to
                    //  reconstruct the template).
                    if (expr.at(0) === '\\') {
                        escapedTemplate = expr.slice(1, -3) + '}}';
                    } else {
                        switch (currentOp) {
                            case '.%':
                                result += generators.formatStatement(
                                                formatFaultText, expr, false);
                                break;
                            case '.%*':
                                result += generators.formatStatement(
                                                formatFaultText, expr, true);
                                break;
                            case '.||':
                                result += generators.defaultStatement(expr);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }

            //  If there's an escaped template, we ignore all other computed
            //  results and just output a statement to return it quoted.
            if (TP.notEmpty(escapedTemplate)) {
                result = '(function() {' + newlineChar +
                            'return ' + escapedTemplate.quoted('\'');
            } else {
                result += ignoreNull + newlineChar;
            }

            result += '})()';

            return result;
        },

        html: function(arg) {
            return generators.returnWrap(generators.valueFromVar(arg));
        },

        for: function(data, blocks) {
            //  For 'for' statements, generate an expression that does the
            //  looping and manages closured variables.

            var aspectName,
                argNames,

                collection,

                retVal;

            //  If there were arguments supplied, then 'data' will be a hash of
            //  'data' (the aspectName) and 'args' (the arguments to the control
            //  block)
            if (TP.isValid(argNames = data.args)) {
                aspectName = data.data;
                argNames = argNames.split(',');
            } else {
                //  Otherwise, the aspectName *is* the data and we default the
                //  arguments to '(item, index)'
                aspectName = data;
                argNames = TP.ac('item', 'index');
            }

            //  Push the Array of argument names onto the 'scoped parameters'
            //  list. This gets used when generating expressions that extract
            //  set up local variable values. If there are scoped parameters,
            //  then these 'setup expressions' will *not* be generated and
            //  values will come from the enclosing scope.
            scopedParams.push(argNames);

            //  Guard the collection in case it's null
            collection = generators.guardCollection(aspectName);

            //  Generate the expression that will extract the value from the
            //  data source.
            retVal = generators.getFromArgs(aspectName);

            //  Make the aspectName (i.e. 'item' or whatever was supplied)
            //  available as a 'scoped source'.
            scopedSourceNames.push(
                    generators.escapedIdentifier(argNames.first()));

            //  Generate an expression that does a 'collect' over the embedded
            //  control structure expression and returns that result. Note that
            //  the expression does a 'getValues()' on the collection in case
            //  it's not an Array.
            retVal =
                generators.wrap(
                    retVal +
                    'return ' + collection +
                    '.getValues().collect(function(' +
                                            argNames.join(', ') +
                                            ')' +
                    '{return ' + generators.loop(blocks) + '}).join(\'\')');

            //  Pop off whatever we pushed onto the 'scoped source' stack.
            scopedSourceNames.pop();

            //  Pop off whatever we pushed onto the 'scoped parameters' stack.
            scopedParams.pop();

            return retVal;
        },

        with: function(aspectName, blocks) {
            //  For 'with' statements, generate an expression that manages
            //  closured variables.

            var retVal;

            //  Generate the expression that will extract the value from the
            //  data source.
            retVal = generators.getFromArgs(aspectName);

            //  Make the aspectName available as a 'scoped source'.
            scopedSourceNames.push(generators.escapedIdentifier(aspectName));

            //  Generate an expression that will return looping over each block
            //  'under' the 'with.
            retVal = generators.wrap(
                        retVal +
                        'return ' + generators.loop(blocks));

            //  Pop off whatever we pushed onto the 'scoped source' stack.
            scopedSourceNames.pop();

            return retVal;
        },

        if: function(aspectName, blocks, else_blocks) {
            //  For 'if' statements, generate an expression that executes only
            //  if the data at the end of the aspect path exists

            var retVal,
                tail;

            //  Generate the expression that will extract the value from the
            //  data source.
            retVal = generators.getFromArgs(aspectName);

            //  Make the aspectName available as a 'scoped source'.
            scopedSourceNames.push(generators.escapedIdentifier(aspectName));

            //  If there are any 'else' statements, generate the proper code for
            //  them.
            tail = else_blocks ?
                    generators.loop(else_blocks, ' ') :
                    'else {return \'\'}';

            //  Generate an expression that does the 'if' logic.
            retVal = generators.wrap(
                    retVal +
                    'if (' + generators.escapedIdentifier(aspectName) + ')' +
                        '{return ' + generators.loop(blocks) + '}' + tail);

            //  Pop off whatever we pushed onto the 'scoped source' stack.
            scopedSourceNames.pop();

            return retVal;
        },

        else: function(args, block) {
            //  For 'else' statements, we just generate what we need to fit up
            //  under an 'if' block
            return 'else if (' + args + ')' +
                        '{return ' + generators.loop(block) + '}';
        }
    };
    /* eslint-enable no-reserved-keys */

    //  Loop over all of the tokens and generate expressions. Then take any
    //  newlines and returns and converted them to escaped newlines.
    funcBody = generators.loop(tokenList).replace(/\n|\r/ig, '\\n');

    funcBody = funcBody.replace(/__NEW_LINE__/g, '\n');

    //  Couldn't generate a String? - exit here.
    if (TP.isEmpty(funcBody)) {
        //  TODO: Raise an exception
        return null;
    }

    funcParts = TP.ac();

    funcParts.push(
        'var params,\n',
        '    source;\n',
        '\n',
        'params = TP.ifInvalid(aParamHash, TP.hc());\n',
        'params.$$noPathTracking = true;\n',
        'source = TP.wrap(aDataSource);\n',
        '\n\n',

        'try\n',
        '{\n',

        'return (', funcBody, ')\n',

        '}\n',
        'catch(e)\n',
        '{\n',
            'TP.ifError() ? TP.error(TP.ec(e)): 0;\n',
        '};\n');

    funcStr = funcParts.join('');

    try {
        templateFunc = TP.fc('aDataSource', 'aParamHash', funcStr);
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e, 'Error generating template function: ' + funcStr)) : 0;
    }

    return templateFunc;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('transform',
function(aDataSource, transformParams) {

    /**
     * @method transform
     * @summary Performs a transformation on the supplied data source object
     *     using the receiver.
     * @description At this level, this method performs a TIBET-specific string
     *     interpolation (a fancy word for substitutions) of a particular form.
     *     In TIBET we support the {{varname}} for performing interpolation. See
     *     Function's version of 'transform' for more information on how
     *     transform() works.
     * @param {Object} aDataSource The object supplying the data to use in the
     *     transformation.
     * @param {TP.core.Hash|TP.sig.Request} transformParams A parameter
     *     container responding to at(). For string transformations a key of
     *     'repeat' with a value of true will cause iteration to occur (if
     *     aDataSource is an 'ordered collection' this flag needs to be set to
     *     'true' in order to have 'automatic' iteration occur). Additional keys
     *     of '$REPEAT_START' and '$REPEAT_LIMIT' determine the range of the
     *     iteration.
     * @returns {String} The string resulting from the transformation process.
     */

    var str,

        template,
        type,

        urnBuilt,
        urn,
        url;

    if (TP.isEmpty(str = this.toString())) {
        return;
    }

    //  type names can only have JS chars and colon, nothing more, so that's
    //  a quick check to see if we got a templating string
    if (TP.regex.HAS_ACP.test(str)) {

        //  concat here is to force string to be a primitive string
        template = '' + str;

        //  If there is escaped quoted content, then double escape it to avoid
        //  problems when the Function is created from the string.
        if (TP.regex.CONTENT_WITH_ESCAPED_QUOTES.test(template)) {
            template = template.replace(/\\/g, '\\\\');
        }

        //  If there are valid transform parameters, then pass any value of
        //  'sourcevars' to the compile method. This allows the caller to tell
        //  the template Function generation routine that certain '$' variables
        //  should be resolved against the source (normally, special '$'
        //  variables are resolved using the transform params itself as the data
        //  source).
        if (TP.isValid(transformParams)) {
            template = template.compile(
                        null,
                        false,
                        true,
                        transformParams.at('sourcevars'),
                        transformParams.at('shouldEcho'),
                        transformParams.at('annotateMarkup'));
        } else {
            template = template.compile(null, false, true);
        }

        if (TP.isCallable(template)) {
            return template.transform(aDataSource, transformParams);
        } else {
            TP.ifError() ?
                TP.error('Unable to compile formatting template: ' +
                                str) : 0;
            return;
        }
    } else if (TP.regex.FORMAT_SUBSTITUTION.test(str)) {
        //  context, specializer, prefix, suffix, fallback, arglist
        return this.callBestMethod(arguments, aDataSource,
                                    'transform', null,
                                    'transformObject');
    } else if (TP.isType(type = TP.sys.getTypeByName(str))) {
        if (TP.canInvoke(type, 'transform')) {
            return type.transform(aDataSource, transformParams);
        } else {
            return TP.raise(this, 'TP.sig.InvalidFormat',
                            str + ' does not support transform call.');
        }
    } else {

        //  See if the format is a URI string. If so, see if there's a real URL
        //  that we can use to do the formatting.

        //  Note that this code is structured to purposely avoid creating a URI
        //  via TP.uc for testing purposes. This avoids filling up the URI map
        //  with URIs that don't really have resources.

        urn = TP.uriExpandPath(str);
        if (!TP.isURIString(urn)) {
            urn = TP.TIBET_URN_PREFIX + urn;
        }

        //  If we have a URI string and there's already a registered instance of
        //  a URI matching that, then go ahead and use it.
        if (TP.isURIString(urn) && TP.uri.URI.hasInstance(urn)) {
            url = TP.uri.URI.getInstanceById(urn);
            //  NB: We assume 'async' of false here.
            if (TP.isValid(template = url.getResource().get('result'))) {
                return template.transform(aDataSource, transformParams);
            } else if (TP.notTrue(urnBuilt)) {
                //  If we didn't "augment" in an attempt to create a valid URI
                //  then the one provided didn't resolve/find a resource.
                TP.ifError() ?
                    TP.error('Unable to locate formatting template URN: ' +
                                    urn) : 0;
                return;
            }
        }
    }

    //  context, specializer, prefix, suffix, fallback, arglist
    return this.callBestMethod(arguments, aDataSource,
                                'transform', null,
                                'transformObject');
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('transform',
function(aDataSource, transformParams) {

    /**
     * @method transform
     * @summary Performs a transformation on the supplied data source object
     *     using the receiver.
     * @description At this level, this method performs a TIBET-specific string
     *     interpolation (a fancy word for substitutions) of a particular form.
     *     In TIBET we support the {{varname}} for performing interpolation.
     *     In TIBET you can think of both the 'xpath' and 'varname' portions as
     *     representing an 'aspect' which is passed to the get() method for the
     *     target object. Normal get() processing takes over at that point so
     *     XML nodes will check for any supported access path syntax, as will
     *     JavaScript objects.
     * @param {Object} aDataSource The object supplying the data to use in the
     *     transformation.
     * @param {TP.core.Hash|TP.sig.Request} transformParams A parameter
     *     container responding to at(). For string transformations a key of
     *     'repeat' with a value of true will cause iteration to occur (if
     *     aDataSource is an 'ordered collection' this flag needs to be set to
     *     'true' in order to have 'automatic' iteration occur). Additional keys
     *     of '$REPEAT_START' and '$REPEAT_LIMIT' determine the range of the
     *     iteration.
     * @returns {String} The string resulting from the transformation process.
     */

    var dataSource,

        params,

        oldSource,

        retVal,

        isOrdered,

        source,

        start,
        limit,

        len,
        arr,
        i,

        val;

    //  NOTE!!! We do *not* change for validity of the data source. Some
    //  templating expressions can be executed without a data source. If no data
    //  source was supplied, we just use an empty TP.core.Hash.
    if (TP.notValid(dataSource = aDataSource)) {
        dataSource = TP.hc();
    }

    if (TP.isValid(transformParams)) {
        if (TP.canInvoke(transformParams, 'getPayload')) {
            params = transformParams.getPayload().copy();
        } else {
            params = transformParams.copy();
        }
    } else {
        params = TP.hc();
    }

    //  Supply the dataSource as $INPUT. This will be used in both iterating
    //  and non-iterating contexts.
    params.atPutIfAbsent('$INPUT', dataSource);

    //  It's not a collection OR it is a collection, but the caller has not
    //  specified to repeat, we run ourself and return the results.
    if (!TP.isCollection(dataSource) || TP.notTrue(params.at('repeat'))) {
        try {

            //  In a non-iterating context, '$_' is an alias for $INPUT
            params.atPutIfAbsent('$_', dataSource);

            oldSource = params.at('$_');

            retVal = this(dataSource, params);

            //  In case any nested templates messed with the $INPUT, restore it
            //  to the value we set before template execution.
            params.atPut('$INPUT', oldSource);

            //  In a non-iterating context, '$_' is an alias for $INPUT
            params.atPut('$_', oldSource);

            //  Make sure to return the primitive String
            return '' + retVal;
        } catch (e) {
            return this.raise('TP.sig.TransformFailed',
                                TP.ec(e, 'Transform failed'));
        }
    }

    //  Now that we've determined we should repeat, we remove the 'repeat'
    //  parameter from the params hash. This may seem strange, but we don't
    //  want to affect nested templates who will be reusing this parameter
    //  hash. They have mechanisms by which they can specify whether they
    //  want to repeat or not.
    params.removeKey('repeat');

    isOrdered = TP.isArray(dataSource) || TP.isNodeList(dataSource);
    if (isOrdered) {
        source = dataSource;
    } else if (TP.canInvoke(dataSource, 'getItems')) {
        source = dataSource.getItems();
    } else {
        return this.raise('TP.sig.InvalidParameter',
            'Argument must be a valid collection or object with items.');
    }

    //  More special variables which can be used along with '$INPUT' and
    //  '$INDEX' when iterating.
    start = TP.ifKeyInvalid(params,
                            '$REPEAT_START',
                            0);
    limit = TP.ifKeyInvalid(params,
                            '$REPEAT_LIMIT',
                            Number.POSITIVE_INFINITY);

    //  normalize iteration count to avoid running off end of data source
    len = (start + source.getSize()).min(start + limit);

    oldSource = params.at('$INPUT');

    arr = TP.ac();

    for (i = start; i < len; i++) {

        //  Make the current index available
        params.atPut('$INDEX', i);

        //  In an iterating context, '$#' is an alias for $INDEX
        params.atPut('$#', i);

        //  Make the current item available
        params.atPut('$ITEM', source.at(i));

        //  In an iterating context, '$_' is an alias for $ITEM
        params.atPut('$_', source.at(i));

        //  Some convenience variables
        params.atPut('$FIRST', i === start);
        params.atPut('$MIDDLE', i > start && i < len - 1);
        params.atPut('$LAST', i === len - 1);
        params.atPut('$EVEN', i % 2 === 0);
        params.atPut('$ODD', i % 2 !== 0);

        try {
            val = this(source.at(i), params);
        } catch (e) {
            return this.raise(
                    'TP.sig.TransformFailed',
                    TP.ec(e, 'Repeating transform failed on item: ' + i));
        }

        arr.push(val);
    }

    //  In case any nested templates messed with the $INPUT, restore it to the
    //  value we set before template execution and clear the others.

    params.atPut('$INPUT', oldSource);

    params.atPut('$INDEX', null);
    params.atPut('$#', null);
    params.atPut('$ITEM', null);
    params.atPut('$_', null);

    return arr.join('');
});

//  ========================================================================
//  Templating Parser
//  ========================================================================

//  Generate this by executing the following command (assuming NodeJS is
//  available):

//  pegjs --export-var 'TP.$templateParser' <tibet_dir>/src/tibet/grammars/template_parser.pegjs

/* eslint-disable */

TP.$templateParser = (function() {
  "use strict";

  /*
   * Generated by PEG.js 0.9.0.
   *
   * http://pegjs.org/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  function peg$parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},
        parser  = this,

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = function(body) { return ["text", body.join("")]},
        peg$c1 = "\\{",
        peg$c2 = { type: "literal", value: "\\{", description: "\"\\\\{\"" },
        peg$c3 = "\\}",
        peg$c4 = { type: "literal", value: "\\}", description: "\"\\\\}\"" },
        peg$c5 = { type: "any", description: "any character" },
        peg$c6 = function(c) {return c},
        peg$c7 = function(inner) {return ["value", inner.join("")]},
        peg$c8 = "{{",
        peg$c9 = { type: "literal", value: "{{", description: "\"{{\"" },
        peg$c10 = /^[:\/]/,
        peg$c11 = { type: "class", value: "[:/]", description: "[:/]" },
        peg$c12 = "}}",
        peg$c13 = { type: "literal", value: "}}", description: "\"}}\"" },
        peg$c14 = function(body) {return body},
        peg$c15 = /^[#%@]/,
        peg$c16 = { type: "class", value: "[#%@]", description: "[#%@]" },
        peg$c17 = "{",
        peg$c18 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c19 = "}",
        peg$c20 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c21 = function(sigil, body) {return sigil + '{' + body.join('') + '}'},
        peg$c22 = function(command) { return ["command", ""]},
        peg$c23 = function(command, body) { return ["command", body.join("")]},
        peg$c24 = function(body) { return body},
        peg$c25 = "html",
        peg$c26 = { type: "literal", value: "html", description: "\"html\"" },
        peg$c27 = "=",
        peg$c28 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c29 = "!",
        peg$c30 = { type: "literal", value: "!", description: "\"!\"" },
        peg$c31 = function() {return "comment"},
        peg$c32 = function(open, inner, else_b, close) {
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
            },
        peg$c33 = "{{:",
        peg$c34 = { type: "literal", value: "{{:", description: "\"{{:\"" },
        peg$c35 = /^[a-zA-Z0-9]/,
        peg$c36 = { type: "class", value: "[a-zA-Z0-9]", description: "[a-zA-Z0-9]" },
        peg$c37 = "{{/:",
        peg$c38 = { type: "literal", value: "{{/:", description: "\"{{/:\"" },
        peg$c39 = function(command, args, body) { return {command:command, body:body, args:args}},
        peg$c40 = function(tail) { return tail},
        peg$c41 = "if",
        peg$c42 = { type: "literal", value: "if", description: "\"if\"" },
        peg$c43 = "for",
        peg$c44 = { type: "literal", value: "for", description: "\"for\"" },
        peg$c45 = "with",
        peg$c46 = { type: "literal", value: "with", description: "\"with\"" },
        peg$c47 = "log",
        peg$c48 = { type: "literal", value: "log", description: "\"log\"" },
        peg$c49 = "(",
        peg$c50 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c51 = ")",
        peg$c52 = { type: "literal", value: ")", description: "\")\"" },
        peg$c53 = function(inner) { return inner.join("")},
        peg$c54 = function(body) { return body },
        peg$c55 = "else",
        peg$c56 = { type: "literal", value: "else", description: "\"else\"" },
        peg$c57 = function(expression, inner) { return ["else", expression, inner] },
        peg$c58 = function() { return "true"},
        peg$c59 = function(expression) { return expression.join("")},
        peg$c60 = "/",
        peg$c61 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c62 = function(body) { return "{{" + body.join("") + "}}"},
        peg$c63 = function(body) { return "{{"+ body.join("") +"}}"},
        peg$c64 = { type: "other", description: "whitespace" },
        peg$c65 = /^[ \t\n\r]/,
        peg$c66 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function error(message) {
      throw peg$buildException(
        message,
        null,
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos],
          p, ch;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column,
          seenCR: details.seenCR
        };

        while (p < pos) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, found, location) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new peg$SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function peg$parsestart() {
      var s0, s1;

      s0 = [];
      s1 = peg$parseVALUE();
      if (s1 === peg$FAILED) {
        s1 = peg$parseCOMMAND();
        if (s1 === peg$FAILED) {
          s1 = peg$parseBLOCK();
          if (s1 === peg$FAILED) {
            s1 = peg$parseTEXT();
          }
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parseVALUE();
        if (s1 === peg$FAILED) {
          s1 = peg$parseCOMMAND();
          if (s1 === peg$FAILED) {
            s1 = peg$parseBLOCK();
            if (s1 === peg$FAILED) {
              s1 = peg$parseTEXT();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseTEXT() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseTEXT_INNER();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseTEXT_INNER();
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c0(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseTEXT_INNER() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parseBLOCK_START();
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseVALUE_START();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c1) {
            s3 = peg$c1;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c2); }
          }
          if (s3 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c3) {
              s3 = peg$c3;
              peg$currPos += 2;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s3 === peg$FAILED) {
              if (input.length > peg$currPos) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c5); }
              }
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c6(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseVALUE() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseVALUE_START();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseVALUE_INNER();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseVALUE_INNER();
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseVALUE_END();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c7(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseVALUE_START() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c8) {
        s1 = peg$c8;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c9); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        if (peg$c10.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c11); }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseVALUE_END() {
      var s0;

      if (input.substr(peg$currPos, 2) === peg$c12) {
        s0 = peg$c12;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c13); }
      }

      return s0;
    }

    function peg$parseVALUE_INNER() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseOBJECT();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c14(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseFORMAT_SUBSTITUTION();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c14(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseEMPTY_OBJECT();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c14(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = peg$parseVALUE_END();
            peg$silentFails--;
            if (s2 === peg$FAILED) {
              s1 = void 0;
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c5); }
              }
              if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c14(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c1) {
                s1 = peg$c1;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c2); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c14(s1);
              }
              s0 = s1;
            }
          }
        }
      }

      return s0;
    }

    function peg$parseFORMAT_SUBSTITUTION() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (peg$c15.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c16); }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 123) {
          s2 = peg$c17;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c18); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseFORMAT_SUBSTITUTION_INNER();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseFORMAT_SUBSTITUTION_INNER();
            }
          } else {
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s4 = peg$c19;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c20); }
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c21(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseFORMAT_SUBSTITUTION_INNER() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 123) {
        s2 = peg$c17;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c18); }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 125) {
          s3 = peg$c19;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c20); }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c5); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c14(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseCOMMAND() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseBLOCK_START();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseCOMMANDS();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseBLOCK_END();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c22(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseBLOCK_START();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseCOMMANDS();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseCOMMAND_INNER();
                if (s6 !== peg$FAILED) {
                  while (s6 !== peg$FAILED) {
                    s5.push(s6);
                    s6 = peg$parseCOMMAND_INNER();
                  }
                } else {
                  s5 = peg$FAILED;
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseBLOCK_END();
                    if (s7 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c23(s3, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }

      return s0;
    }

    function peg$parseCOMMAND_INNER() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseOBJECT();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c24(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseEMPTY_OBJECT();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c24(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          peg$silentFails++;
          s2 = peg$parseBLOCK_END();
          peg$silentFails--;
          if (s2 === peg$FAILED) {
            s1 = void 0;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c5); }
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c24(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }

      return s0;
    }

    function peg$parseCOMMANDS() {
      var s0, s1;

      if (input.substr(peg$currPos, 4) === peg$c25) {
        s0 = peg$c25;
        peg$currPos += 4;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c26); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 61) {
          s0 = peg$c27;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c28); }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 33) {
            s1 = peg$c29;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c30); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c31();
          }
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseBLOCK() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseBLOCK_OPEN();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseBLOCK_INNER();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseBLOCK_INNER();
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseELSE_BLOCK();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseELSE_BLOCK();
            }
          } else {
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseBLOCK_CLOSE();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c32(s1, s2, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseBLOCK_START_OPEN_BLOCK() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c33) {
        s1 = peg$c33;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c34); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = [];
        if (peg$c35.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c35.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c36); }
            }
          }
        } else {
          s3 = peg$FAILED;
        }
        peg$silentFails--;
        if (s3 !== peg$FAILED) {
          peg$currPos = s2;
          s2 = void 0;
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseBLOCK_START_CLOSE_BLOCK() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c37) {
        s1 = peg$c37;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = [];
        if (peg$c35.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c35.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c36); }
            }
          }
        } else {
          s3 = peg$FAILED;
        }
        peg$silentFails--;
        if (s3 !== peg$FAILED) {
          peg$currPos = s2;
          s2 = void 0;
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseBLOCK_START() {
      var s0;

      s0 = peg$parseBLOCK_START_OPEN_BLOCK();
      if (s0 === peg$FAILED) {
        s0 = peg$parseBLOCK_START_CLOSE_BLOCK();
      }

      return s0;
    }

    function peg$parseBLOCK_END() {
      var s0;

      if (input.substr(peg$currPos, 2) === peg$c12) {
        s0 = peg$c12;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c13); }
      }

      return s0;
    }

    function peg$parseBLOCK_OPEN() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      s1 = peg$parseBLOCK_START_OPEN_BLOCK();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseBLOCK_COMMANDS();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseBLOCK_ARGS();
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseBLOCK_ARGS();
                }
              } else {
                s5 = peg$FAILED;
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  s7 = [];
                  s8 = peg$parseCOMMAND_INNER();
                  if (s8 !== peg$FAILED) {
                    while (s8 !== peg$FAILED) {
                      s7.push(s8);
                      s8 = peg$parseCOMMAND_INNER();
                    }
                  } else {
                    s7 = peg$FAILED;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse_();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseBLOCK_END();
                      if (s9 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c39(s3, s5, s7);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseBLOCK_CLOSE() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseBLOCK_START_CLOSE_BLOCK();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseBLOCK_COMMANDS();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseBLOCK_END();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c40(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseBLOCK_INNER() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseBLOCK();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c24(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseCOMMAND();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c24(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseVALUE();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c24(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseTEXT();
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c24(s1);
            }
            s0 = s1;
          }
        }
      }

      return s0;
    }

    function peg$parseBLOCK_COMMANDS() {
      var s0;

      s0 = peg$parseCOMMAND_FOR();
      if (s0 === peg$FAILED) {
        s0 = peg$parseCOMMAND_IF();
        if (s0 === peg$FAILED) {
          s0 = peg$parseCOMMAND_WITH();
          if (s0 === peg$FAILED) {
            s0 = peg$parseCOMMAND_LOG();
          }
        }
      }

      return s0;
    }

    function peg$parseCOMMAND_IF() {
      var s0;

      if (input.substr(peg$currPos, 2) === peg$c41) {
        s0 = peg$c41;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }

      return s0;
    }

    function peg$parseCOMMAND_FOR() {
      var s0;

      if (input.substr(peg$currPos, 3) === peg$c43) {
        s0 = peg$c43;
        peg$currPos += 3;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c44); }
      }

      return s0;
    }

    function peg$parseCOMMAND_WITH() {
      var s0;

      if (input.substr(peg$currPos, 4) === peg$c45) {
        s0 = peg$c45;
        peg$currPos += 4;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c46); }
      }

      return s0;
    }

    function peg$parseCOMMAND_LOG() {
      var s0;

      if (input.substr(peg$currPos, 3) === peg$c47) {
        s0 = peg$c47;
        peg$currPos += 3;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c48); }
      }

      return s0;
    }

    function peg$parseBLOCK_ARGS() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c49;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c50); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseBLOCK_ARGS_INNER();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseBLOCK_ARGS_INNER();
            }
          } else {
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 41) {
              s4 = peg$c51;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c52); }
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c53(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseBLOCK_ARGS_INNER() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 41) {
        s2 = peg$c51;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c5); }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c54(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseCOMMAND_ELSE() {
      var s0;

      if (input.substr(peg$currPos, 4) === peg$c55) {
        s0 = peg$c55;
        peg$currPos += 4;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c56); }
      }

      return s0;
    }

    function peg$parseELSE_BLOCK() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseELSE_BLOCK_OPEN();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseBLOCK_INNER();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseBLOCK_INNER();
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c57(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseELSE_BLOCK_OPEN() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseBLOCK_START();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseCOMMAND_ELSE();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseBLOCK_END();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c58();
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseBLOCK_START();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseCOMMAND_ELSE();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseCOMMAND_INNER();
                if (s6 !== peg$FAILED) {
                  while (s6 !== peg$FAILED) {
                    s5.push(s6);
                    s6 = peg$parseCOMMAND_INNER();
                  }
                } else {
                  s5 = peg$FAILED;
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseBLOCK_END();
                    if (s7 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c59(s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }

      return s0;
    }

    function peg$parseELSE_BLOCK_CLOSE() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseBLOCK_START();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 47) {
            s3 = peg$c60;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c61); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseCOMMAND_IF();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseBLOCK_END();
                if (s6 !== peg$FAILED) {
                  s1 = [s1, s2, s3, s4, s5, s6];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseEMPTY_OBJECT() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c8) {
        s1 = peg$c8;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c9); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c12) {
            s3 = peg$c12;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c13); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c62(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseOBJECT() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c8) {
        s1 = peg$c8;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c9); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseOBJECT_INNER();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseOBJECT_INNER();
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c12) {
            s3 = peg$c12;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c13); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c63(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseOBJECT_INNER() {
      var s0, s1, s2;

      s0 = peg$parseEMPTY_OBJECT();
      if (s0 === peg$FAILED) {
        s0 = [];
        s1 = peg$parseOBJECT();
        if (s1 !== peg$FAILED) {
          while (s1 !== peg$FAILED) {
            s0.push(s1);
            s1 = peg$parseOBJECT();
          }
        } else {
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c12) {
            s2 = peg$c12;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c13); }
          }
          peg$silentFails--;
          if (s2 === peg$FAILED) {
            s1 = void 0;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c5); }
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c14(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      s1 = peg$parsewhitespace();
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsewhitespace();
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c64); }
      }

      return s0;
    }

    function peg$parsewhitespace() {
      var s0;

      if (peg$c65.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c66); }
      }

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(
        null,
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})();

/* eslint-enable */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
