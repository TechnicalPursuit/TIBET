//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/* eslint-disable no-labels, no-loop-func */

/**
 * @type {TP.tsh.script}
 * @summary Provides support for the TIBET Shell (TSH) during raw content
 *     compilation and execution. This tag is typically wrapped around raw
 *     content entered in a TIBET console to provide an XML context for it.
 *     During tag compilation this tag handles XML desugaring as well as
 *     splitting of command lines for pipes and redirects. At execution time
 *     this tag handles the processing of individual tsh:eval tags and manages
 *     the overall execution loop.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:script');

TP.tsh.script.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  A list of operators specific to compile-time TSH processing. In
//  particular these are the operators which define pipe and redirection
//  syntax in TSH scripts. These are used to help parse individual tags from
//  the sugared command input.
TP.tsh.script.Type.defineAttribute('$tshOperators');

//  A list of both TSH and JS operators
TP.tsh.script.Type.defineAttribute('$tshAndJSOperators');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.set(
        '$tshOperators',
        TP.ac(
            '.|', '.&', '.|&',          //  pipe w/wo stderr
            '.|*', '.&*', '.|&*',       //  pipe w/wo stderr (iterate/splat)
            '.|?', '.&?', '.|&?',       //  pipe w/wo stderr
                                        //  (filter follows)
            '.|?*', '.&?*', '.|&?*',    //  pipe w/wo stderr
                                        //  (splatted filter)
            '.|%', '.&%', '.|&%',       //  pipe w/wo stderr
                                        //  (format follows)
            '.|%*', '.&%*', '.|&%*',    //  pipe w/wo stderr
                                        //  (splatted format)

            '.*',                       //  shorthands (iterate)
            '.?', '.?*',                //  shorthands (filter)
            '.%', '.%*',                //  shorthands (format)

            '.||', '.&&',               //  conditional pipes

            '.>', '.&>', '.>&',         //  output w/wo stderr
            '.>!', '.&>!', '.>&!',      //  output w/wo stderr (save)
            '.>>', '.&>>', '.>>&',      //  output and append w/wo stderr
            '.>>!', '.&>>!', '.>>&!',   //  output and append w/wo stderr
                                        //  (save)

            '.<',                       //  input redirection
            '.<!',                      //  input redirection with refresh
                                        //  true

            '.<<',                      //  'here document'

            '.;',                       //  pipe segment terminator

            '.((', '.))',               //  nested tsh:script with own
                                        //  request
            '.{{', '.}}',               //  nested tsh:script with shared
                                        //  request
            '.[[', '.]]',               //  CDATA content sugar

            '<?', '?>',                 //  XML processing instruction
            '<![', ']]>',               //  XML CDATA open and close
            '</', '/>'                  //  XML tag close operators
            ));

    this.set('$tshAndJSOperators',
               TP.boot.$operators.concat(this.$tshOperators));

    //  A regular expression which can be used as either a test or splitting
    //  function for simple pipe constructions.
    TP.regex.TSH_PIPE = TP.rc(
        TP.tsh.script.$tshOperators.map(
            function(item) {
                return TP.regExpEscape(item);
            }).join('|')
        );

    return;
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('$adjustPipeSymbols',
function(aNode, aCommandList, aRequest) {

    /**
     * @method $adjustPipeSymbols
     * @summary Migrates pipe symbols from the leading element to the trailing
     *     element so that the currently executing request can see what the
     *     input pipe may have been.
     * @param {Node} aNode A native node containing one or more executable child
     *     elements.
     * @param {Array} aCommandList The run requests for this script.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     */

    var children,
        child,
        previous,
        peer,
        pipe,
        last,
        ins;

    //  the parse phase assigns pipes to the leading element, but we really
    //  want them assigned to the element which has to work with that as a
    //  form of instruction for input/output processing, so we move them.
    children = TP.nodeGetChildElements(aNode);
    if (children.length > 1) {
        child = children.last();
        previous = children.before(child);
        while (previous) {
            if (TP.elementHasAttribute(previous, 'tsh:pipe', true)) {
                TP.elementSetAttribute(
                    child,
                    'tsh:pipe',
                    TP.elementGetAttribute(previous, 'tsh:pipe', true),
                    true);

                TP.elementRemoveAttribute(previous, 'tsh:pipe', true);
            }

            child = previous;
            previous = children.before(child);
        }
    }

    //  the first child element may also receive a pipe symbol if the
    //  overall request contained a cmdPeer reference implying a larger
    //  pipe scope (often found with alias/history translation etc.)
    if (TP.isValid(peer = aRequest.at('cmdPeer'))) {
        pipe = TP.elementGetAttribute(peer.at('cmdNode'), 'tsh:pipe', true);
        if (TP.notEmpty(pipe)) {
            TP.elementSetAttribute(children[0], 'tsh:pipe', pipe, true);
        } else if (TP.notEmpty(ins = peer.get('ins'))) {
            pipe = TP.elementGetAttribute(ins.at(0).at('cmdNode'),
                                            'tsh:pipe',
                                            true);
            TP.elementSetAttribute(children[0], 'tsh:pipe', pipe, true);
        }

        if (TP.notEmpty(pipe)) {
            //  a secondary concern here is that if we're patching the pipe
            //  context from the peer we also need to patch the last command
            //  since that's where the stdio buffers will be found.
            last = peer.at('cmdLast');
            if (TP.isValid(last)) {
                aCommandList.at(0).atPut('cmdLast', last);
            } else {
                aCommandList.at(0).atPut('cmdPeer', peer);
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('$connectPipeSections',
function(commands, aRequest) {

    /**
     * @method $connectPipeSections
     * @summary Joins the various requests involved in processing the pipe so
     *     that the proper workflow semantics are observed.
     * @param {Array} commands An array of arrays of requests which make up the
     *     individual sections of command pipeline.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     */

    var i,
        j,
        k,
        len,
        len2,
        len3,

        command,
        last,
        prereqs,
        stdin,

        ins,
        outs,

        node,
        cond,
        state;

    if (!TP.isArray(commands)) {
        this.raise('TP.sig.InvalidParameter',
            'Sequence must be an Array.');
        return;
    }

    len = commands.getSize();
    for (i = 0; i < len; i++) {
        command = commands.at(i);
        state = null;

        //  for the first command in the sequence if we have a request with
        //  pre-supplied STDIN we populate it as if it were part of a larger
        //  pipe. This is used largely when binding to script elements or
        //  when connecting subshell input.
        if (i === 0) {
            if (TP.isValid(stdin = aRequest.at(TP.STDIN))) {
                //  note that stdin is supposed to be an array of one or
                //  more inputs including redirections.
                if (!TP.isArray(stdin)) {
                    command.atPut(TP.STDIN, TP.ac(stdin));
                } else {
                    command.atPut(TP.STDIN, stdin);
                }
            }
        }

        //  one complication is conditional operations. when a pipe uses a
        //  .|| conditional we want to set that command and its associated
        //  ins (if any) to observe TP.FAILED, not TP.SUCCEEDED for the
        //  prior command.
        node = command.at('cmdNode');
        if (TP.notEmpty(cond = TP.elementGetAttribute(node,
                                                        'tsh:cond',
                                                        true))) {
            if (cond === '.||') {
                state = TP.FAILED;
            }
        }

        //  NOTE we have to be careful here because a negative index can
        //  result in wrapping back on ourselves.
        /* eslint-disable no-extra-parens */
        last = (i > 0) ? commands.at(i - 1) : null;
        /* eslint-enable no-extra-parens */

        prereqs = TP.isValid(last) ? last.get('outs') : null;

        //  commands have to wait for all their inputs to complete...and
        //  their inputs have to wait on the previous command/outputs
        ins = command.get('ins');
        if (TP.notEmpty(ins)) {
            len2 = ins.getSize();
            for (j = 0; j < len2; j++) {
                command.andJoin(ins.at(j));

                if (TP.notEmpty(prereqs)) {
                    len3 = prereqs.getSize();
                    for (k = 0; k < len3; k++) {
                        ins.at(j).andJoin(prereqs.at(k), state);
                    }
                } else if (TP.isValid(last)) {
                    last.joinTo(ins.at(j), state);
                }
            }
        } else {
            //  no command inputs, so the command itself has to wait for the
            //  prior command/outputs to complete
            if (TP.notEmpty(prereqs)) {
                len3 = prereqs.getSize();
                for (k = 0; k < len3; k++) {
                    command.andJoin(prereqs.at(k), state);
                }
            } else if (TP.isValid(last)) {
                last.joinTo(command, state);
            }
        }

        //  command outputs just wait for the command itself.
        outs = command.get('outs');
        if (TP.notEmpty(outs)) {
            len2 = outs.getSize();
            for (j = 0; j < len2; j++) {
                command.joinTo(outs.at(j));
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @method cmdAddContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using an
     *     appending operation such as .>>.
     * @description On this type, this method merely invokes 'tshExecute'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue.
     */

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @method cmdFilterInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to filter standard input using a
     *     filter operation such as .|?.
     * @description On this type, this method merely invokes 'tshExecute'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue.
     */

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @method cmdGetContent
     * @summary Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @description On this type, this method merely invokes 'tshExecute'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue.
     */

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary Runs the receiver, effectively invoking its action.
     * @description This method is invoked any time a tag is being run as part
     *     of the processing of an enclosing tsh:script, which happens most
     *     often when the tag is being run interactively. The default defers to
     *     the tshExecute method of their type. On this type, this method merely
     *     invokes 'tshExecute' against the receiver.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. TP.CONTINUE and TP.BREAK are common values.
     */

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @description On this type, this method merely invokes 'tshExecute'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue.
     */

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @method cmdTransformInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to transform standard input using a
     *     simple transform operation such as .|
     * @description On this type, this method merely invokes 'tshExecute'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue.
     */

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('$desugarXML',
function(source, shell, sibling, request) {

    /**
     * @method $desugarXML
     * @summary Converts TSH syntax sugaring, particularly XML sugaring, into
     *     its verbose equivalent so the returned string can be turned in to
     *     valid XML nodes.
     * @description The primary purpose of this method is to convert sugared TSH
     *     input into a viable XML string. This means finding any TSH pipe or
     *     redirection operators as well as any other sugared tag syntax. TSH
     *     sugaring is intended to eliminate the need for entering brackets or
     *     extraneous information to identify tag attribute values. That means
     *     things like :clear ultimately become <tsh:clear/>, while input such
     *     as :import href=~code.js become <tsh:import href="~code.js"/>.
     *
     *     Pipes define command line "partitions" which are relevant for history
     *     and aliasing since those can focus on "start of command" in their
     *     processing. NOTE that during command execution when history/alias
     *     expansion is being performed each expanded command is repartitioned
     *     as needed, but those partitions don't create individual history
     *     entries.
     *
     *     Specific pipe syntax processed by this command includes:
     *
     *     a .| b (pipe stdout)
     *     a .& b (pipe stderr)
     *     a .|& b (pipe stdout and stderr)
     *
     *     a .|| b (conditional pipe [if lvalue fails])
     *     a .&& b (conditional pipe [if lvalue succeeds])
     *
     *     For the non-conditional pipe operators you can add a trailing *
     *     (splat) operation to tell the pipe that you want to iterate across a
     *     collection rather than pass the collection as the input value. An
     *     example might be:
     *
     *     a.* b (pipe stdout and iterate over it)
     *     a.|* b (pipe stdout and iterate over it)
     *
     *     In addition to the splatting syntax which drives iteration by those
     *     commands/tags which support it there is a sugar for "query" which
     *     allows strings/selectors to be placed inline in the pipe for use as
     *     extended conditionals. When using this syntax place the ? directly
     *     after the standard pipe symbol and before any trailing * (splat)
     *     operator:
     *
     *     a .? b (pipe stdout and query it via b)
     *     a .|? b (pipe stdout and query it via b)
     *     a .|?* b (pipe stdout and query each item via b)
     *
     *     Redirects define values for stdin, stdout, and/or stderr relative to
     *     a command. As such they define simple pipes where there is an implied
     *     command setting/getting content on a specified object (usually via a
     *     URI). The object side of the redirect does not have history or alias
     *     expansion, it is mapped to a parameter which can subsequently undergo
     *     variable, uri, and substitution processing at runtime.
     *
     *     a .< b (redirect stdin w/getContent)
     *     a .<! b (redirect stdin w/getContent and refresh true)
     *
     *     a .<< (here document...read block as input)
     *
     *     a .> b (redirect stdout w/setContent)
     *     a .&> b (redirect stderr w/setContent)
     *     a .>& b (redirect stdout and stderr w/setContent)
     *
     *     a .>> b (redirect stdout w/addContent)
     *     a .&>> b (redirect stderr w/addContent)
     *     a .>>& b (redirect stdout and stderr w/addContent)
     *
     *     For redirects you can also add a trailing ! (commit) symbol which
     *     tells TIBET that you want the data to be flushed from the local
     *     in-browser cache to the file system or remote server. In other cases
     *     the data simply updates the TP.uri.URI content but doesn't send it
     *     to the server. For example:
     *
     *     a .>! b (redirect stdout and 'commit')
     *
     *     Tag (action) input lines (foo:bar, :bar, etc) are updated to their
     *     XML equivalents, removing simple sugaring for XML.
     *
     *     :clear <tsh:clear/>
     *
     *     //   attribute parameters (named parameters)
     *     :source ref=blah <tsh:source ref="blah"/>
     *
     *     //   'switch' parameters
     *     :lint -full <tsh:lint full="true"/>
     *
     *     //   'identity' parameters
     *     html:checkbox --checked <html:checkbox checked="checked"/>
     *
     *     //   positional parameters
     *     :lint a b c <tsh:lint argv="a b c"/>
     *
     *     All other lines (without pipe, redirect, or other split or tag
     *     sugaring) are wrapped as simple command tags with text contained in
     *     CDATA blocks.
     *
     *     1+2 (simple command) <tsh:eval><![CDATA[1+2]]></tsh:eval>
     *
     *     Multiple commands and input can be mixed using semicolons as
     *     statement terminators. Pipe and redirect symbols also act as
     *     statement terminators. When processing content in this fashion block
     *     constructs in JavaScript are treated as a single command tag to avoid
     *     potential syntax errors from splitting a block-level construct such
     *     as a function.
     *
     *     NOTE that these transforms are all "compile time" conversions. See
     *     the TP.tsh.eval type for processing specific to "runtime" processing
     *     of shell input.
     * @param {String|Array} source The input source to translate.
     * @param {TP.shell.Shell} shell The shell instance handling the request
     *     we're processing text for.
     * @param {TP.dom.Node} sibling The previous sibling, which may contain
     *     pipe information.
     * @param {TP.sig.Request} request The request being desugared.
     * @returns {String} The translated/desugared script source.
     */

    var requote,

        arr,

        command,
        result,
        args,
        chunk,
        mode,
        tagname,
        builtin,

        i,
        j,
        token,
        prefix,
        closer,
        close,

        count,
        offset,

        arg,

        last,
        next,
        more,
        block,

        cmdns;

    //  ---
    //  helper functions
    //  ---

    //  Turn the incoming string into a value that will work as an XML
    //  attribute. We rely on double quotes as our outer quoting value
    //  so process accordingly.
    requote = function(tokenValue) {
        var value;

        //  Goal here is to always use double quotes and to preserve any form of
        //  quoting that was already in existence. By preserving we ensure the
        //  "original value" used by the shell's argument parser knows which
        //  type of quote (or if there were even quotes) were used for a value.
        value = tokenValue;
        value = TP.xmlLiteralsToEntities(value);
        //  Since literals include quot; and apos; we can just bracket in
        //  quotes.
        value = '"' + value + '"';

        return value;
    };

    //  if we're provided with an array assume its a set of tokens to
    //  process and do that, otherwise condense the source without removing
    //  newlines or spaces (so we preserve as much semantic data as
    //  possible). We also want to configure to process TSH-specific
    //  operators and to receive a token array back rather than a string
    //  we'd have to just tokenize again.
    arr = TP.isArray(source) ?
                source :
                TP.$condenseJS(
                        source, false, false,
                        //  All of the JS operators *and* the TSH operators
                        TP.tsh.script.$tshAndJSOperators,
                        true, true, true);

    cmdns = 'tsh';

    command = [];
    result = [];
    args = [];
    chunk = [];

    i = 0;
    token = arr[i];

    //  respect overall escape syntax, which is a leading =. in that case we
    //  strip off the first token and return the rest in a standard tsh:eval
    //  tag for source/script evaluation as a chunk.
    if (token && token.value === '=') {
        //  a leading = doesn't affect further parsing, but it does signify
        //  that the literal flag should be observed for the entire request
        if (TP.isValid(request)) {
            request.atPut('cmdLiteral', true);
        }

        i += 1;
        token = arr[i];
    } else if (token && token.value === ';') {
        //  a leading ; doesn't affect other parsing, but it does cause the
        //  rest of the command buffer to be flagged as producing no console
        //  output (although errors always produce console output).
        if (TP.isValid(request)) {
            request.atPut('cmdSilent', true);
        }

        i += 1;
        token = arr[i];
    }

    while (token) {
        switch (mode) {
            case 'tag':

                //  tag mode starts when we see a new statement starting
                //  with an optional prefix followed by a colon and optional
                //  tag name. once we've seen that sequence we read until we
                //  find the end of the tag by locating a terminator token.

                i += 1;
                for (;;) {
                    token = arr[i];
                    if (!token) {
                        break;
                    }

                    //  most terminators end a tag...the one exception we
                    //  parse for is the "CDATA operator" which forces what
                    //  follows to be tag content rather than a new segment.
                    if (TP.$is_terminator(token.value) &&
                        token.value !== '.[[') {
                        //  when the terminator is a TSH pipe/redirect we
                        //  put that information on the tag so it can
                        //  process correctly when executing.
                        switch (token.value) {
                            case ';':
                                //  semicolon, nothing more to do
                                break;
                            default:
                                command.splice(1, 0, ' tsh:pipe="',
                                    TP.xmlLiteralsToEntities(token.value),
                                    '"');
                                break;
                        }

                        //  bump token and break so we close this iteration
                        i += 1;
                        token = arr[i];

                        break;
                    } else if (token.name === 'operator') {
                        //  if we're reading portions of a tag there are,
                        //  strictly speaking, only a few viable operators
                        //  we should see: = for attributes and - for flags.
                        if (token.value === '=') {
                            //  previous token must be a valid identifier
                            //  that could be an attribute name
                            last = arr[i - 1];
                            /* eslint-disable no-extra-parens */
                            if (!last ||
                                (last.name !== 'identifier' &&
                                 last.name !== 'reserved')) {
                                TP.ifWarn() ?
                                    TP.warn('Missing attribute name in' +
                                        ' tag input: ' + token.value) : 0;

                                i += 1;
                                token = arr[i];

                                continue;
                            }
                            /* eslint-enable no-extra-parens */

                            //  if the next token is a "string" then the
                            //  attribute value is already quoted, otherwise
                            //  we want to quote the next sequence of tokens
                            //  up through a new flag or attribute name (the
                            //  next token directly in front of an =).
                            next = arr[i + 1];
                            if (next && next.name !== 'string') {
                                command.push(token.value, '"');

                                chunk.length = 0;

                                //  push all contiguous tokens which don't
                                //  break whitespace or parse as terminators
                                //  into the attribute value
                                i += 1;
                                token = arr[i];

                                while (token &&
                                    !TP.$is_whitespace(token.name) &&
                                    !TP.$is_terminator(token.value)) {
                                    chunk.push(token.value);
                                    i += 1;
                                    token = arr[i];
                                }

                                command.push(chunk.join(''), '"');
                            } else {
                                //  push the = and string value as found,
                                //  requoting the token string so it uses
                                //  double quotes
                                command.push(token.value,
                                                requote(next.value));
                                i += 2;
                                token = arr[i];
                            }
                        } else if (token.value === '--' ||
                                    token.value === '-') {
                            //  flag of some kind. flags are effectively
                            //  just attributes but they're special in terms
                            //  of prefixing and how the shell allocates
                            //  them prior to request execution.
                            next = arr[i + 1];

                            if (next &&
                                (next.name === 'identifier' ||
                                 next.name === 'reserved')) {
                                more = arr[i + 2];

                                if (more && more.value === '=') {
                                    //  appears to be a valued flag, perhaps
                                    //  --as=Array etc so capture value. we
                                    //  can do that by consuming up to the =
                                    //  and then continuing so the = token
                                    //  process captures things.
                                    command.push(' tsh:', next.value);
                                    i += 2;
                                    token = more;

                                    continue;
                                } else {
                                    //  Check name for 'no-' prefix. If found
                                    //  then we'll be inverting the value and
                                    //  adjusting the name we push.
                                    if (/^no-/.test(next.value)) {
                                        command.push(' tsh:',
                                            next.value.slice(3), '="');
                                        command.push('false');
                                    } else {
                                        command.push(' tsh:', next.value, '="');
                                        command.push('true');
                                    }
                                    command.push('"');

                                    i += 2;
                                    token = arr[i];
                                }
                            } else {
                                if (next && token.value === '-') {
                                    args.push(token.value + next.value);
                                    i += 2;
                                } else {
                                    //  - or -- without following identifier?
                                    //  that's a syntax error
                                    TP.ifWarn() ?
                                        TP.warn('Missing flag name in tag' +
                                            ' input: ' + source + '.') : 0;
                                    break;
                                }
                            }
                        } else if (token.value === '.[[') {
                            //  allow for CDATA block sugaring where we
                            //  close off the opening tag, read to the end
                            //  of the cdata, then close the tag.

                            //  close off the tag
                            if (args.length > 0) {
                                command.push(' tsh:argv="');

                                arg = TP.xmlLiteralsToEntities(
                                                    args.join(' ').trim());
                                if (args.length > 1) {
                                    arg = arg.unquoted();
                                }

                                command.push(arg);
                                command.push('"');
                                args.length = 0;
                            }

                            command.push('>');

                            //  push CDATA opening into the command,
                            command.push('<![CDATA[');

                            //  capture cdata content, closing off the tag
                            //  when we reach the final brackets.
                            i += 1;
                            for (;;) {
                                token = arr[i];

                                if (!token) {
                                    TP.ifWarn() ?
                                        TP.warn('Unexpected end of CDATA' +
                                            ' input.') : 0;

                                    break;
                                }

                                if (token.value === '.]]') {
                                    //  close off the CDATA and tag
                                    command.push(']]>');
                                    command.push('</', tagname, '>');
                                    break;
                                }

                                command.push(token.value);
                                i += 1;
                            }

                            closer = '';
                            i += 1;
                            token = arr[i];

                        } else if (token.value === '{') {

                            chunk.length = 0;
                            chunk.push(token.value);

                            //  Process everything up through the closing brace.
                            i += 1;
                            token = arr[i];
                            while (token && token.value !== '}') {

                                if (token.value === '[' || token.value === '{') {
                                    //  capture tokens that comprise nested
                                    //  structure by keeping count until we find
                                    //  the true closing token.
                                    close = token.value === '[' ? ']' : '}';
                                    count = 1;
                                    offset = 0;
                                    while (count !== 0 && arr[i + offset]) {
                                        if (arr[i + offset].value === token.value) {
                                            count++;
                                        } else if (arr[i + offset].value === close) {
                                            count--;
                                        }
                                        offset++;
                                    }

                                    //  If not closed and no arr[i + offset] we
                                    //  ran off the end looking for closer.
                                    if (count !== 0 && !arr[i + offset]) {
                                        //  TODO:   warn/error?
                                        void 0;
                                    }

                                    //  Push count of nested tokens into place.
                                    for (j = 0; j < offset; j++) {
                                        chunk.push(token.value);
                                        i += 1;
                                        token = arr[i];
                                    }

                                    i += 1;
                                    token = arr[i];

                                } else {
                                    chunk.push(token.value);
                                    i += 1;
                                    token = arr[i];
                                }
                            }

                            //  Depending on internal loop we may still need to
                            //  push the closing token.
                            if (token && token.value === '}') {
                                chunk.push(token.value);
                            }

                            args.push(chunk.join(''));

                            i += 1;
                            token = arr[i];

                        } else if (token.value === '[') {

                            chunk.length = 0;
                            chunk.push(token.value);

                            //  Process everything up through the closing brace.
                            i += 1;
                            token = arr[i];
                            while (token && token.value !== ']') {

                                if (token.value === '[' || token.value === '{') {
                                    //  capture tokens that comprise nested
                                    //  structure by keeping count until we find
                                    //  the true closing token.
                                    close = token.value === '[' ? ']' : '}';
                                    count = 1;
                                    offset = 0;
                                    while (count !== 0 && arr[i + offset]) {
                                        if (arr[i + offset].value === token.value) {
                                            count++;
                                        } else if (arr[i + offset].value === close) {
                                            count--;
                                        }
                                        offset++;
                                    }

                                    //  If not closed and no arr[i + offset] we
                                    //  ran off the end looking for closer.
                                    if (count !== 0 && !arr[i + offset]) {
                                        //  TODO:   warn/error?
                                        void 0;
                                    }

                                    //  Push count of nested tokens into place.
                                    for (j = 0; j < offset; j++) {
                                        chunk.push(token.value);
                                        i += 1;
                                        token = arr[i];
                                    }

                                    i += 1;
                                    token = arr[i];

                                } else {
                                    chunk.push(token.value);
                                    i += 1;
                                    token = arr[i];
                                }
                            }

                            //  Depending on internal loop we may still need to
                            //  push the closing token.
                            if (token && token.value === ']') {
                                chunk.push(token.value);
                            }

                            args.push(chunk.join(''));

                            i += 1;
                            token = arr[i];

                        } else {
                            //  probably going to result in a syntax error
                            //  unless it happens to be a tag closing pair
                            //  or an unattributed URI prefix
                            if (!/^(~|\.|\/|{|%)/.test(token.value)) {
                                TP.ifWarn() ?
                                    TP.warn('Unexpected operator in tag' +
                                        ' input: ' + token.value) : 0;
                            }

                            chunk.length = 0;
                            chunk.push(token.value);

                            //  push all contiguous tokens which don't break
                            //  whitespace or parse as terminators into the
                            //  arg list
                            i += 1;
                            token = arr[i];
                            while (token &&
                                    !TP.$is_whitespace(token.name) &&
                                    !TP.$is_terminator(token.value)) {
                                chunk.push(token.value);

                                i += 1;
                                token = arr[i];
                            }

                            args.push(chunk.join(''));

                            i += 1;
                            token = arr[i];
                        }
                    } else if (TP.$is_identifier(token.name) &&
                                TP.isValid(arr[i + 1]) &&
                                arr[i + 1].value === ':') {
                        //  namespace-qualified attribute. for sugaring
                        //  reasons we allow the attribute to be simply
                        //  named (for css existence testing) in which case
                        //  we simply set the value to true, or we allow the
                        //  full expression with =.
                        command.push(token.value, ':');

                        i += 2;
                        token = arr[i];
                        if (token && TP.$is_identifier(token.name)) {
                            command.push(token.value);
                        } else {
                            //  should have seen an identifier next. if not
                            //  then we've got a bit of a problem.
                            TP.ifWarn() ?
                                TP.warn('Unexpected end of prefixed' +
                                    ' attribute.') : 0;

                            break;
                        }

                        //  once we've processed the attribute name we've
                        //  got two choices...either the next token is a =
                        //  showing we've got a value assignment or not.
                        //  when it's not it should be whitespace or a
                        //  terminator so we can close off the attribute.
                        next = arr[i + 1];
                        if (!next ||
                            (TP.$is_whitespace(next.name) ||
                            TP.$is_terminator(next.value))) {
                            command.push('="true"');
                        }

                        i += 1;
                        token = arr[i];
                    } else {
                        //  "open" arguments, i.e. args with no leading - or
                        //  trailing =, are collected into a single arg list
                        //  the consuming tag can treat as the "arguments"
                        last = arr[i - 1];
                        next = arr[i + 1];
                        if (token.name !== 'space' &&
                            token.name !== 'tab' &&
                            (last && last.value !== ':') &&
                            (TP.notValid(next) || next.value !== '=')) {
                            chunk.length = 0;
                            chunk.push(token.value);

                            //  push all contiguous tokens which don't break
                            //  whitespace or parse as terminators into the
                            //  arg list
                            i += 1;
                            token = arr[i];

                            while (token &&
                                    !TP.$is_whitespace(token.name) &&
                                    !TP.$is_terminator(token.value)) {
                                chunk.push(token.value);

                                i += 1;
                                token = arr[i];
                            }

                            args.push(chunk.join(''));
                        } else {
                            //  all other tokens should be output directly
                            //  to the tag. NOTE that we could add more
                            //  logic here to try to catch syntax errors at
                            //  this point.
                            command.push(token.value);

                            i += 1;
                            token = arr[i];
                        }
                    }
                }

                //  close off the tag and reset for next tag/command
                if (args.length > 0) {
                    command.push(' tsh:argv="');

                    arg = TP.xmlLiteralsToEntities(args.join(' ').trim());
                    if (args.length > 1) {
                        arg = arg.unquoted();
                    }

                    command.push(arg);
                    command.push('"');

                    args.length = 0;
                }

                command.push(TP.ifInvalid(closer, '/>'));

                result.addAll(command);
                command.length = 0;

                //  once we've closed the current tag we need to reset the
                //  mode so the next token is treated as a starting token
                mode = null;

                break;

            case 'src':

                //  src mode starts any time we don't fall into tag mode.
                //  any tokens read while in src mode are processed as
                //  content of an enclosing tsh:eval tag which will handle
                //  evaluation of the text at execution time.

                //  src mode is tricky with respect to terminators due to
                //  blocks which may appear in the stream. we have to track
                //  block count and only respect semicolons as a terminator
                //  when the block count is zero.

                block = 0;

                i += 1;
                for (;;) {
                    token = arr[i];
                    if (!token) {
                        break;
                    }

                    //  track nesting level of any block-type construct so
                    //  we don't assume semi-colons found in the block are
                    //  true command terminators.
                    if ('{(['.indexOf(token.value) >= 0) {
                        block++;
                    } else if ('])}'.indexOf(token.value) >= 0) {
                        block--;

                        if (block < 0) {
                            //  TODO:   raise? too many closing delimiters
                            void 0;
                        }
                    }

                    if (TP.$is_terminator(token.value)) {
                        if (token.value === ';') {
                            command.push(token.value);
                            i += 1;
                            token = arr[i];

                            //  if we're at a clean terminator that isn't
                            //  nested in a block construct we terminate
                            //  this particular command tag. otherwise the
                            //  loop continues processing so that code
                            //  statements which are part of a block are all
                            //  contained in a single command tag.
                            if (block <= 0) {
                                if (TP.sys.cfg('tsh.split_commands')) {
                                    break;
                                }

                                //  other case is when the next piece of
                                //  text starts with sugared tag text
                                //  either prefix: or just :tag
                                j = 1;

                                /* eslint-disable no-extra-parens */
                                while ((next = arr[i + j])) {
                                    if (!TP.$is_whitespace(next.name)) {
                                        break;
                                    }
                                    j++;
                                }
                                /* eslint-enable no-extra-parens */

                                if (next) {
                                    if (next.value === ':') {
                                        break;
                                    } else if (TP.$is_identifier(next.name)) {
                                        more = arr[i + j + 1];
                                        if (more && more.value === ':') {
                                            break;
                                        }
                                    }
                                }
                            }
                        } else {
                            //  all other terminators are pipe/redirection
                            //  symbols which should terminate. NOTE however
                            //  that in cases of a terminator being found
                            //  within a block we have a potential error.
                            if (block > 0) {
                                //  TODO:   raise?
                                void 0;
                            }

                            //  splice the token into the pipe attribute so
                            //  we can track that at the shell level
                            command.splice(1, 0,
                                            ' tsh:pipe="',
                                            TP.xmlLiteralsToEntities(
                                                            token.value),
                                            '"');

                            i += 1;
                            token = arr[i];

                            break;
                        }
                    } else {
                        //  non-terminators are pushed into the output
                        //  stream without additional parsing in src mode
                        command.push(token.value);

                        i += 1;
                        token = arr[i];
                    }
                }

                if (block !== 0) {
                    //  if we don't find the right block count then we have
                    //  a potentially missing/unbalanced set of delimiters

                    //  TODO:   raise?
                    void 0;
                }

                //  close the overall command/src tag
                command.push(closer || ']]></tsh:eval>');

                result.addAll(command);
                command.length = 0;

                //  once we've closed the current tag we need to reset the
                //  mode so the next token is treated as a starting token
                mode = null;

                break;

            default:

                //  figure out what mode to be in based on lookahead data
                //  from the token stream. NOTE that we start in this mode
                //  as well, so the very first step in the while loop drops
                //  us here.

                //  clear any tag close data, require new tag modes to
                //  update as needed by their individual requirements
                closer = null;

                switch (token.name) {
                    case 'newline':
                    case 'space':
                    case 'tab':
                        //  whitespace doesn't affect mode
                        i += 1;
                        token = arr[i];
                        break;

                    case 'uri':
                        //  tokenized uris are just packaged into tags
                        command.push('<tsh:uri',
                            ' tsh:href="',
                            TP.xmlLiteralsToEntities(token.value),
                            '"');
                        mode = 'tag';
                        tagname = 'tsh:uri';
                        break;

                    case 'keyword':
                    case 'reserved':
                    case 'identifier':

                        //  identifiers followed immediately by : represent
                        //  either URIs, XML namespace prefixes or, when
                        //  terminated (tsh:), sugar for a "set
                        //  namespace"
                        next = arr[i + 1];

                        if (next && next.value === ':') {
                            //  have to try to determine if this is a URI or
                            //  a tag prefix
                            more = arr[i + 2];

                            if (more && more.value === '/') {
                                //  URI...http:/...file:/...etc.
                                command.push('<tsh:uri');
                                args.push(token.value);

                                i += 1;
                                token = arr[i];

                                while (token &&
                                        !TP.$is_terminator(token.value) &&
                                        !TP.$is_whitespace(token.name)) {
                                    args.push(token.value);

                                    i += 1;
                                    token = arr[i];
                                }

                                if (args.length > 0) {
                                    command.push(
                                            ' tsh:href="',
                                            TP.xmlLiteralsToEntities(
                                                prefix + args.join('')),
                                            '"');

                                    args.length = 0;
                                }

                                if (token &&
                                    (TP.$is_terminator(token.value) ||
                                    TP.$is_whitespace(token.name))) {
                                    i--;
                                }

                                mode = 'tag';
                                tagname = 'tsh:uri';
                            } else if (more && !TP.$is_whitespace(more.name)) {
                                tagname = token.value +
                                            next.value +
                                            more.value;

                                //  If the custom type isn't found verify
                                //  whether the shell may have this as a built
                                //  in. Warn if you can't find either.
                                if (TP.notValid(
                                            TP.sys.getTypeByName(tagname))) {
                                    if (TP.notValid(
                                                TP.sys.getTypeByName(tagname))) {
                                        builtin = 'execute' +
                                            ('' + more.value).asTitleCase();
                                        if (!TP.canInvoke(shell, builtin)) {
                                            TP.ifWarn() ?
                                                TP.warn('Unable to find' +
                                                    ' command ' +
                                                    tagname) : 0;
                                        }
                                    }
                                }

                                command.push('<' + tagname);
                                i += 2;
                                mode = 'tag';
                            } else {
                                //  if the line is of the form xmlns: then
                                //  this is special syntax for changing the
                                //  default xmlns for tags below this one
                                //  until we find another default xmlns.
                                cmdns = token.value;

                                request.stdout(
                                    'Changing default prefix to ' +
                                    token.value + next.value);

                                i += 2;
                                mode = null;
                            }
                        } else {
                            //  identifier but not a : following means
                            //  src mode. NOTE that we push in a potentially
                            //  curious fashion here, but the goal is to
                            //  leave a position where attributes can be
                            //  injected into the command to support pipe
                            //  and/or redirection syntax.
                            command.push('<tsh:eval', '><![CDATA[',
                                            token.value);
                            mode = 'src';
                        }

                        break;

                    case 'operator':

                        //  !!! Make sure to keep the global
                        //  TP.TSH_OPERATOR_CHARS RegExp up-to-date with
                        //  this list of tokens!!!
                        //
                        //  TSH supports a number of 'operator sugars',
                        //  particularly when the operator is a prefix. We
                        //  watch for those here because many are sugar for
                        //  a tsh tag of some type.
                        switch (token.value) {
                        //  case '`':
                        //      //  TSH command substitution, tokenized as a
                        //      //  substitution rather than a operator and
                        //      //  handled at the tsh:eval tag level.

                            /* eslint-disable no-fallthrough */

                            case '#':
                                //  Normally a URI fragment but those have to be
                                //  valid ID values or xpointers. We can
                                //  overload a bit if there's a number or regex
                                //  and use # as snippet (a variant of history).

                                next = arr[i + 1];

                                if (next && (/^\d+/.test(next.value) ||
                                        next.value === '/')) {
                                    command.push('<tsh:history');

                                    //  snippet is of the form #n or #/foo/
                                    //  collect all tokens until whitespace
                                    //  or terminator (or end of stream).
                                    i += 1;
                                    token = arr[i];
                                    while (token &&
                                        !TP.$is_terminator(token.value) &&
                                        !TP.$is_whitespace(token.name)) {
                                        args.push(token.value);
                                        i += 1;
                                        token = arr[i];
                                    }

                                    if (args.length > 0) {
                                        command.push(
                                            ' hid="',
                                            TP.xmlLiteralsToEntities(
                                                            args.join('')),
                                            '"');
                                        args.length = 0;
                                    }

                                    command.push(' edit="true"');

                                    if (token &&
                                        (TP.$is_terminator(token.value) ||
                                        TP.$is_whitespace(token.name))) {
                                        i--;
                                    }
                                    mode = 'tag';
                                    tagname = 'tsh:history';

                                    break;
                                }

                                //  Otherwise, its a TSH URI fragment /
                                //  barename. Treat as a partial URI so fall
                                //  through

                            case '~':

                                /* eslint-enable no-fallthrough */

                                //  TIBET virtual URI syntax. NOTE that
                                //  officially you could type ~23 and that
                                //  would be legal JS, but the odds of that
                                //  are slim so we require an escape \~23.
                                next = arr[i + 1];

                                /* eslint-disable no-extra-parens */
                                if (next &&
                                    (TP.$is_whitespace(next.name) ||
                                    next.value === '(' ||
                                    (!TP.$is_identifier(next.name) &&
                                    (next.value.indexOf('/') !== 0)))) {
                                    command.push('<tsh:eval',
                                        '><![CDATA[', token.value);
                                    mode = 'src';
                                    break;
                                }
                                /* eslint-enable no-extra-parens */

                                command.push('<tsh:uri');
                                prefix = token.value;

                                i += 1;
                                token = arr[i];
                                while (token &&
                                    !TP.$is_terminator(token.value) &&
                                    !TP.$is_whitespace(token.name)) {
                                    args.push(token.value);
                                    i += 1;
                                    token = arr[i];
                                }

                                if (args.length > 0) {
                                    command.push(' tsh:href="',
                                        TP.xmlLiteralsToEntities(
                                            prefix + args.join('')),
                                            '"');
                                    args.length = 0;
                                }

                                if (token &&
                                    (TP.$is_terminator(token.value) ||
                                    TP.$is_whitespace(token.name))) {
                                    i--;
                                }
                                mode = 'tag';
                                tagname = 'tsh:uri';
                                break;

                            case '!':
                                //  TSH history command prefix. NOTE that
                                //  you could use !varname or !value etc.
                                //  but doing that without an LVALUE or IF
                                //  is highly unlikely. Still, we try to
                                //  observe standard shell semantics a bit
                                //  here and allow whitespace, =, or ( to
                                //  override the history interpretation.

                                next = arr[i + 1];
                                if (next &&
                                    (TP.$is_whitespace(next.name) ||
                                    next.value === '(')) {
                                    command.push('<tsh:eval',
                                        '><![CDATA[', token.value);
                                    mode = 'src';
                                    break;
                                }

                                command.push('<tsh:history');

                                //  history is of the form ![+-]n[:m] so
                                //  collect all tokens until whitespace or
                                //  terminator (or end of stream).
                                i += 1;
                                token = arr[i];
                                while (token &&
                                    !TP.$is_terminator(token.value) &&
                                    !TP.$is_whitespace(token.name)) {
                                    args.push(token.value);
                                    i += 1;
                                    token = arr[i];
                                }

                                if (args.length > 0) {
                                    command.push(
                                        ' hid="',
                                        TP.xmlLiteralsToEntities(
                                                        args.join('')),
                                        '"');
                                    args.length = 0;
                                }

                                if (token &&
                                    (TP.$is_terminator(token.value) ||
                                    TP.$is_whitespace(token.name))) {
                                    i--;
                                }
                                mode = 'tag';
                                tagname = 'tsh:history';
                                break;

                        //  case '@':
                        //      //  Used by the system for 'object
                        //      //  dereferencing'

                        //  case '$':
                        //      //  Valid JS identifier, we don't process
                        //      //  into a tag
                        //      //  (not in TP.TSH_OPERATOR_CHARS).

                            case '%':
                                //  TSH "job" syntax.
                                command.push('<tsh:job');
                                next = arr[i + 1];
                                if (next) {
                                    command.push(
                                        ' pid="',
                                        TP.xmlLiteralsToEntities(
                                                        next.value),
                                        '"');
                                    i += 1;
                                }

                                mode = 'tag';
                                tagname = 'tsh:job';
                                break;

                        //  case '^':
                        //      //  Regexp history substitution. Processed
                        //      //  at runtime by tsh:eval tag since it
                        //      //  doesn't convert into a tag.

                            case '&':
                                //  Could cause potential confusion with
                                //  pipes but there's one thing that's just
                                //  too good to pass up...raw entity dumps.
                                next = arr[i + 1];
                                if (next && next.value === '#') {
                                    command.push('<tsh:entity');
                                    mode = 'tag';
                                    i += 1;
                                } else if (TP.notValid(next)) {
                                    command.push('<tsh:entity');
                                    mode = 'tag';
                                } else {
                                    command.push(
                                        '<tsh:eval',
                                        '><![CDATA[&');
                                    mode = 'src';
                                }

                                break;

                        //  case '*':
                        //      //  leading * is available...

                            case '=':

                                //  leading = is a literal signifier for
                                //  command tag input
                                command.push(
                                        '<tsh:eval',
                                        ' literal="true"><![CDATA[');
                                mode = 'src';
                                break;

                        //  case '\\':
                        //      //  Alias escaping per shell. Processed at
                        //      //  runtime by tsh:eval tag.

                        //  case '|':
                        //      //  potential confusion with pipes
                        //      //  (not in TP.TSH_OPERATOR_CHARS).

                        //  case ';':
                        //      //  leading ; is used by TP.tsh.command as the
                        //      //  'null statement' indicator which turns
                        //      //  console output via cmdSilent flagging.

                            case ':':
                                //  command with default namespace prefix
                                i += 1;
                                token = arr[i];

                                command.push('<' +
                                                cmdns +
                                                ':' +
                                                token.value);
                                mode = 'tag';
                                tagname = cmdns + ':' + token.value;

                                break;

                        //  case ',':
                        //      //  leading , is available...

                        //  case '<':
                        //      //  potential confusion with pipes
                        //      //  (not in TP.TSH_OPERATOR_CHARS).

                            case '.':
                                //  An alias for the 'source' or 'import'
                                //  command.

                                //  First, see if it's an identifier
                                next = arr[i + 1];
                                if (next && TP.$is_identifier(next.name)) {

                                    i += 1;
                                    token = arr[i];

                                    while (token &&
                                        !TP.$is_whitespace(token.name) &&
                                        !TP.$is_terminator(token.value)) {
                                        args.push(token.value);
                                        i += 1;
                                        token = arr[i];
                                    }

                                    //  Create a 'tsh:source' command with the
                                    //  identifier name
                                    if (args.length > 0) {
                                        command.push('<tsh:source',
                                            ' ref="',
                                            TP.xmlLiteralsToEntities(
                                                args.join('')),
                                            '"');
                                        args.length = 0;
                                    }

                                    if (token &&
                                        (TP.$is_terminator(token.value) ||
                                        TP.$is_whitespace(token.name))) {
                                        i--;
                                    }
                                    mode = 'tag';
                                    tagname = 'tsh:source';
                                } else if (next && next.name === 'uri') {

                                    //  Otherwise, if it's a URI, it could
                                    //  either be an external TSH script or it
                                    //  could be a file that we want to import.

                                    i += 1;
                                    token = arr[i];

                                    mode = 'tag';

                                    //  If the extension is '.tsh', then its an
                                    //  external TSH script.
                                    if (TP.uriExtension(token.value) ===
                                                                    'tsh') {

                                        command.push('<tsh:script',
                                            ' src="',
                                            TP.xmlLiteralsToEntities(
                                                            token.value),
                                            '"');
                                        tagname = 'tsh:script';
                                    } else {
                                        //  Otherwise, it's something to import
                                        command.push('<tsh:import',
                                            ' href="',
                                            TP.xmlLiteralsToEntities(
                                                            token.value),
                                            '"');
                                        tagname = 'tsh:import';
                                    }
                                } else {
                                    //  Otherwise, it isn't any of that, so just
                                    //  create a command with literal text (make
                                    //  sure to re-created the leading '.').
                                    command.push(
                                            '<tsh:eval',
                                            ' literal="true"><![CDATA[.');
                                    mode = 'src';
                                }

                                break;
                        //  case '>':
                        //      //  potential confusion with pipes
                        //      //  (not in TP.TSH_OPERATOR_CHARS).

                            case '/':
                                //  flag syntax, provides access to TIBET's
                                //  TP.sys.cfg() and TP.sys.setcfg()
                                //  mechanisms. NOTE that the tokenizing
                                //  step will have found true regular
                                //  expressions and comments before we got
                                //  to this point, so we know the / isn't
                                //  part of one of those.
                                i += 1;
                                token = arr[i];
                                while (token &&
                                    !TP.$is_whitespace(token.name) &&
                                    !TP.$is_terminator(token.value)) {
                                    args.push(token.value);
                                    i += 1;
                                    token = arr[i];
                                }

                                command.push('<tsh:config');

                                if (args.length > 0) {
                                    command.push(' name="',
                                        TP.xmlLiteralsToEntities(
                                            args.join('')),
                                        '"');
                                    args.length = 0;
                                }

                                if (token &&
                                    (TP.$is_terminator(token.value) ||
                                    TP.$is_whitespace(token.name))) {
                                    i--;
                                }
                                mode = 'tag';
                                tagname = 'tsh:config';
                                break;

                            case '?':
                                //  TSH help command
                                command.push('<tsh:help');
                                next = arr[i + 1];
                                if (next) {
                                    command.push(
                                        ' topic="',
                                        TP.xmlLiteralsToEntities(
                                                            next.value),
                                        '"');
                                    i += 1;
                                }

                                mode = 'tag';
                                tagname = 'tsh:help';
                                break;

                            default:

                                //  when we see a pipe as the first symbol
                                //  in a text section there are two possible
                                //  meanings...one is that there's an
                                //  element sibling just ahead of the text
                                //  which should have the pipe symbol added
                                //  to it, the other is that we're
                                //  effectively defaulting the first tag to
                                //  the current value of $$ (the last
                                //  command's result value).
                                if (TP.$is_terminator(token.value) &&
                                    token.value !== ';') {
                                    if (TP.isElement(sibling)) {
                                        TP.elementSetAttribute(
                                            sibling,
                                            'tsh:pipe',
                                            TP.xmlLiteralsToEntities(
                                                token.value),
                                            true);
                                    } else {
                                        //  no prior element, so we're
                                        //  defaulting to using $$ as a
                                        //  "source URI"
                                        command.push('<tsh:uri',
                                            ' tsh:pipe="',
                                                TP.xmlLiteralsToEntities(
                                                    token.value),
                                            '"',
                                            ' tsh:href="tibet:///$$" />');
                                            //  TODO: urn:///??? here?
                                    }

                                    i += 1;
                                    token = arr[i];
                                } else {
                                    command.push('<tsh:eval',
                                        '><![CDATA[', token.value);
                                    mode = 'src';
                                }

                                break;
                        }

                        break;

                    default:

                        //  numbers, strings, regexes, etc. which start a
                        //  'statement' are presumed to be standard js
                        command.push('<tsh:eval',
                            '><![CDATA[', token.value);
                        mode = 'src';
                        break;
                }

                break;
        }
    }

    //  when we run out of tokens we need to close off any open tags
    switch (mode) {
        case 'tag':
            //  close off whatever tag was open...must be an empty tag
            command.push('/>');
            break;
        case 'src':
            //  close off tsh:eval we use to wrap source text
            command.push(']]></tsh:eval>');
            break;
        default:
            break;
    }
    result.addAll(command);

    return result.join('');
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('scriptFail',
function(aRequest, aMessage) {

    /**
     * @method scriptFail
     * @summary Handles failing a request during execution such that commands
     *     which are nested will properly manage request data and return value.
     * @param {TP.sig.Request} aRequest The request to fail.
     * @param {String} aMessage The failure error message, if any.
     * @returns {TP.sig.Request|Number} The request or a TP status constant.
     */

    var msg,
        node,
        root;

    msg = TP.ifInvalid(aMessage, 'Script execution error.');

    node = aRequest.at('cmdNode');
    if (TP.elementIsNested(node)) {
        root = TP.ifKeyInvalid(aRequest,
                            'rootRequest',
                            aRequest.at('cmdShell'));
        root.stderr(msg, aRequest);

        //  returning break here will effectively terminate looping in any
        //  outer processing context.
        return TP.BREAK;
    } else {
        aRequest.fail(msg);
    }

    return TP.BREAK;
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('tshCompile',
function(aRequest) {

    /**
     * @method tshCompile
     * @summary Compiles the content of a tsh:script tag, replacing the tag's
     *     content with one or more child tags which will handle the concrete
     *     processing for the script.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     */

    var node,
        shell,
        stage,
        children,
        len,
        i,
        child,
        text,
        result,
        newChild,
        iodev;

    //  NB: DO NOT CHANGE THIS METHOD TO BE 'tagCompile' UNTIL THE SHELL HAS
    //  BEEN CHANGED TO USE THE TAG PROCESSOR RATHER THAN IT'S OWN TAG
    //  PROCESSING MACHINERY (AT LEAST FOR COMPILATION).

    node = aRequest.at('cmdNode');
    shell = aRequest.at('cmdShell');

    if (TP.notEmpty(stage = TP.elementGetAttribute(node,
                                                    'tibet:phase',
                                                    true))) {
        if (stage === 'Compile') {
            return TP.CONTINUE;
        }
    }

    TP.nodeNormalize(node);

    //  get the list ready. NOTE NOTE NOTE that we convert into an array so
    //  that we can be sure that we process each original child regardless
    //  of how the desugaring process may alter the original node.
    children = TP.ac(node.childNodes);
    len = children.length;

    //  we'll have multiple child nodes potentially since we can have
    //  regular text content interspersed with XML tags which break up the
    //  individual chunks of text. the chunks get wrapped in proper tags,
    //  often tsh:eval tags which can handle the text at execution time.
    for (i = 0; i < len; i++) {
        child = children[i];
        switch (child.nodeType) {
            case Node.TEXT_NODE:
            case Node.CDATA_SECTION_NODE:

                text = TP.nodeGetTextContent(child);
                if (TP.isEmpty(text)) {
                    continue;
                }

                //  reconstitute text into original source form. this is
                //  needed since the initial process turns literals into
                //  entities to produce viable XML and any remaining has to
                //  be converted back before parsing for command breaks
                text = TP.xmlEntitiesToLiterals(text);

                //  convert any text content into desugared XML, including
                //  wrapping simple text in command tags for execution.
                result = this.$desugarXML(text,
                                            shell,
                                            children.before(child),
                                            aRequest);

                newChild = TP.nodeFromString(TP.ifInvalid(result, ''));
                if (newChild) {
                    TP.nodeReplaceChild(node, newChild, child);
                } else {
                    iodev = TP.ifKeyInvalid(aRequest, 'rootRequest', shell);
                    iodev.stderr('Unable to create node from: ' +
                                    result,
                                    aRequest);
                    aRequest.fail();
                }

                break;

            case Node.ELEMENT_NODE:
                break;

            default:
                break;
        }
    }

    return TP.DESCEND;
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Manages the overall execution process for a tsh:script and its
     *     content elements. The primary focus of this method is to parse the
     *     script into separate pipe segments (if any) and to construct a
     *     request pipeline which can process the pipeline while managing any
     *     asynchronous subcomponents of that pipe.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue.
     */

    var request,

        node,
        root,
        shell,
        nested,
        cmdID,

        src,
        url,
        resp,
        content,
        req,

        i,
        children,
        child,

        nodetype,
        command,
        pipe,

        next,

        cmdRequest,
        rootRequest,
        pipeRequest,
        constructPR,

        roots,
        cmds,
        inputIndex,

        outs,
        len,
        out,
        service;

    request = TP.request(aRequest);

    node = request.at('cmdNode');
    shell = request.at('cmdShell');

    if (TP.sys.cfg('log.tsh_execute')) {
        TP.ifTrace() ?
            TP.trace('tsh_execute:\n' + TP.str(node)) : 0;
    }

    //  nested scripts have to handle their stdio with respect to the outer
    //  request in certain circumstances, so track that state.
    nested = TP.elementIsNested(node);

    cmdID = request.at('cmdID');
    if (TP.notValid(cmdID)) {
        cmdID = request.getRootID();
    }
    request.atPutIfAbsent('cmdID', cmdID);

    //  keep a list of the commands (which keep track of their own input and
    //  output redirections so we don't have to)
    cmds = TP.ac();

    //  Two modes, just like normal script tags...src= and inline. When we
    //  see a src attribute it will override any inlined content. We fetch
    //  the referenced URI's content and compile (provided it's valid XML).
    //  The resulting compiled script tag's child nodes are then executed.
    src = node.ownerDocument[TP.SRC_LOCATION];
    if (TP.notEmpty(src)) {
        root = node;
        url = TP.uc(src);
        if (TP.notValid(url)) {
            return this.scriptFail(
                request,
                'Invalid or unresolvable TSH script url: ' + src);
        }

        resp = url.getResource(
                TP.hc('refresh', true, 'async', false, 'resultType', TP.WRAP));
        content = resp.get('content');

        if (!TP.canInvoke(content, 'getNativeNode')) {
            return this.scriptFail(
                request,
                'Unable to read valid XML for: ' + src);
        }

        node = content.getNativeNode();
        if (TP.notValid(node)) {
            return this.scriptFail(
                request,
                'Unable to get XML document for: ' + src);
        }

        node = TP.elem(node);
        if (TP.notValid(node)) {
            return this.scriptFail(
                request,
                'Unable to get root node for: ' + src);
        }

        if (TP.qname(node) !== this.getCanonicalName()) {
            return this.scriptFail(
                request,
                'Invalid (!tsh:script) root node for: ' + src);
        }

        //  Build a request we can process through our shell up through, but
        //  not including execution, and then grab the root node from that.
        req = TP.sig.ShellRequest.construct(
                        TP.hc(
                            'cmdNode', node,
                            'cmdShell', shell
                        ));
        shell.execute(req);

        //  TODO:   what if the processing failed on the subscript content?

        node = req.at('cmdNode');

        if (TP.elementGetAttribute(root, 'subshell') === 'true') {
            TP.ifWarn() ?
                TP.warn('Pure subshell not yet supported. Using block.') : 0;
        }

        //  copy the children out of the loaded script node into the
        //  current one, which will remove a layer of overhead.
        TP.nodeCopyChildNodesTo(node, root);

        //  replace the working node with the original rather than the
        //  loaded script node.
        node = root;
    }

    i = 0;
    children = node.childNodes;

    if (children.length === 0) {
        request.complete();
        return TP.CONTINUE;
    }

    //  the root request is the one in the history list...the top level
    //  request which started the whole thing.
    rootRequest = request.getRootRequest();

    /* eslint-disable no-extra-parens */
    while ((child = children[i])) {
    /* eslint-enable no-extra-parens */
        nodetype = child.nodeType;

        if (nodetype !== Node.ELEMENT_NODE &&
            nodetype !== Node.PROCESSING_INSTRUCTION_NODE) {
            i += 1;
            continue;
        }

        //  the first child in each segment is the command, remaining
        //  elements in a contiguous segment are the redirects
        command = child;

        //  reset the input handle index for any input redirects.
        inputIndex = 0;

        //  each command in the overall script gets a request assigned
        //  so we can manage async join requirements
        cmdRequest = TP.sig.TSHRunRequest.construct(
                        TP.hc(
                            'cmdAllowSubs', request.at('cmdAllowSubs'),
                            //  No 'cmd' - it's already been desugared
                            'cmdAsIs', request.at('cmdAsIs'),
                            //  'cmdExecute' is implied
                            'cmdHistory', request.at('cmdHistory'),
                            'cmdID', cmdID,
                            'cmdBuildGUI', request.at('cmdBuildGUI'),
                            'cmdLast', cmds.last(),
                            'cmdLiteral', request.at('cmdLiteral'),
                            'cmdNode', command,
                            //  'cmdPhases' is implied
                            'cmdRecycle', request.at('cmdRecycle'),
                            'cmdSequence', cmds,
                            'cmdShell', shell,
                            'cmdSilent', request.at('cmdSilent'),

                            'cmdEcho', request.at('cmdEcho'),
                            'execContext', request.at('execContext'),
                            'execInstance', request.at('execInstance'),
                            'rootRequest', rootRequest));

        //  add the new command to the command list
        cmds.push(cmdRequest);

        //  watch out for PIs by checking for element-ness before
        //  looking for a pipe or redirection symbol
        pipe = TP.isElement(command) ?
            TP.elementGetAttribute(command, 'tsh:pipe', true) : '';

        //  NOTE the label here so we can break out of the interior switch
        //  and the overall pipe while loop when we reach a terminator.
        outer: while (TP.notEmpty(pipe)) {
            next = TP.nodeGetFirstSiblingElement(child);
            if (TP.notValid(next) && !nested && pipe !== '.;') {
                rootRequest.stderr('Unexpected end of pipe at: ' +
                    TP.str(child), request);
                return TP.BREAK;
            }

            pipe = TP.xmlEntitiesToLiterals(pipe);
            switch (pipe) {
                //  ---
                //  standard pipes
                //  ---

                case '.|':      //  stdout
                case '.*':      //  stdout (and iterate)
                case '.|*':     //  stdout (and iterate)
                case '.?':      //  stdout (and filter)
                case '.|?':     //  stdout (and filter)
                case '.%':      //  stdout (and format)
                case '.|%':     //  stdout (and format)
                case '.?*':     //  stdout (iterate and filter)
                case '.|?*':    //  stdout (iterate and filter)
                case '.%*':     //  stdout (iterate and format)
                case '.|%*':    //  stdout (iterate and format)

                    cmdRequest.atPut(TP.STDOUT, TP.ac());
                    break outer;

                case '.&':      //  stderr
                case '.&*':     //  stderr (and iterate)
                case '.&?':     //  stderr (and filter)
                case '.&?*':    //  stderr (iterate and filter)
                case '.&%':     //  stderr (and format)
                case '.&%*':    //  stderr (iterate and format)

                    cmdRequest.atPut(TP.STDERR, TP.ac());
                    break outer;

                case '.|&':     //  both
                case '.|&*':    //  both (and iterate)
                case '.|&?':    //  both (and filter)
                case '.|&?*':   //  both (iterate and filter)
                case '.|&%':    //  both (and format)
                case '.|&%*':   //  both (iterate and format)

                    cmdRequest.atPut(TP.STDIO, TP.ac());
                    break outer;

                //  ---
                //  conditional execution
                //  ---

                case '.||':

                    TP.elementSetAttribute(next, 'tsh:cond', '.||', true);
                    break outer;

                case '.&&':

                    TP.elementSetAttribute(next, 'tsh:cond', '.&&', true);
                    break outer;

                //  ---
                //  input redirections
                //  ---

                case '.<':      //  stdin
                case '.<!':     //  stdin with refresh

                    //  have to construct a request that can read the data
                    //  being pointed to by the next element...the
                    //  result of running that command/tag as it were.
                    //  That request's result has to then be placed into
                    //  the cmdRequest's STDIN array in the proper slot
                    //  based on order.
                    pipeRequest = TP.sig.TSHRunRequest.construct(
                        TP.hc(
                            'cmdAllowSubs', request.at('cmdAllowSubs'),
                            //  No 'cmd' - it's already been desugared
                            'cmdAsIs', request.at('cmdAsIs'),
                            //  'cmdExecute' is implied
                            'cmdHistory', cmdRequest.at('cmdHistory'),
                            'cmdID', cmdID,
                            'cmdBuildGUI', cmdRequest.at('cmdBuildGUI'),
                            'cmdIOName', '$_' + inputIndex,
                            'cmdLiteral', cmdRequest.at('cmdLiteral'),
                            'cmdNode', next,
                            //  'cmdPhases' is implied
                            'cmdRecycle', cmdRequest.at('cmdRecycle'),
                            'cmdRequest', cmdRequest,
                            'cmdShell', shell,
                            'cmdSilent', cmdRequest.at('cmdSilent'),

                            'cmdEcho', cmdRequest.at('cmdEcho'),
                            'execContext', request.at('execContext'),
                            'execInstance', request.at('execInstance'),
                            'rootRequest', rootRequest
                        ));

                    pipeRequest.defineMethod('stdout',
                        function(result) {

                            this.at('cmdRequest').atPut(
                                this.at('cmdIOName'),
                                result);
                        });

                    inputIndex++;

                    cmdRequest.addInputRequest(pipeRequest);
                    break;

                case '.<<':     //  here document

                    //  shouldn't happen...here documents are converted
                    //  into tags and their pipe is rewritten to be a
                    //  typical input redirection symbol (.<)
                    rootRequest.stderr(
                        'Unexpected pipe symbol at: ' + TP.str(child),
                        request);

                    return TP.BREAK;

                //  ---
                //  output redirections
                //  ---

                case '.>':      //  stdout
                case '.>!':

                    cmdRequest.atPut(TP.STDOUT, TP.ac());
                    constructPR = true;
                    break;

                case '.&>':     //  stderr
                case '.&>!':

                    cmdRequest.atPut(TP.STDERR, TP.ac());
                    constructPR = true;
                    break;

                case '.>&':     //  both
                case '.>&!':

                    cmdRequest.atPut(TP.STDIO, TP.ac());
                    constructPR = true;
                    break;

                case '.>>':     //  append stdout
                case '.>>!':

                    cmdRequest.atPut(TP.STDOUT, TP.ac());
                    constructPR = true;
                    break;

                case '.&>>':    //  append stderr
                case '.&>>!':

                    cmdRequest.atPut(TP.STDERR, TP.ac());
                    constructPR = true;
                    break;

                case '.>>&':    //  append both
                case '.>>&!':

                    cmdRequest.atPut(TP.STDIO, TP.ac());
                    constructPR = true;
                    break;

                case '.;':      //  explicit end of pipe
                    //  break out so we can generate proper sequence
                    break outer;

                default:        //  bad symbol
                    rootRequest.stderr(
                        'Unexpected pipe symbol at: ' + TP.str(child),
                        request);

                    return TP.BREAK;
            }

            if (constructPR) {
                pipeRequest = TP.sig.TSHRunRequest.construct(
                    TP.hc(
                        'cmdAllowSubs', request.at('cmdAllowSubs'),
                        //  No 'cmd' - it's already been desugared
                        'cmdAsIs', request.at('cmdAsIs'),
                        //  'cmdExecute' is implied
                        'cmdHistory', cmdRequest.at('cmdHistory'),
                        'cmdID', cmdID,
                        'cmdBuildGUI', cmdRequest.at('cmdBuildGUI'),
                        'cmdLiteral', cmdRequest.at('cmdLiteral'),
                        'cmdNode', next,
                        //  'cmdPhases' is implied
                        'cmdRecycle', cmdRequest.at('cmdRecycle'),
                        'cmdRequest', cmdRequest,
                        'cmdShell', shell,
                        'cmdSilent', cmdRequest.at('cmdSilent'),

                        'cmdEcho', cmdRequest.at('cmdEcho'),
                        'execContext', request.at('execContext'),
                        'execInstance', request.at('execInstance'),
                        'rootRequest', rootRequest
                    ));

                cmdRequest.addOutputRequest(pipeRequest);
                constructPR = false;
            }

            //  the next pipe symbol will be on the 'next' element
            pipe = TP.isElement(next) ?
                TP.elementGetAttribute(next, 'tsh:pipe', true) : '';

            child = next;
            i += 1;
        }

        i += 1;
    }


    //  If, for some reason, we didn't get valid content and couldn't
    //  construct a command to run then we have to exit.
    if (TP.notValid(cmdRequest)) {
        return this.scriptFail(
            request,
            'Unable to construct subcommand(s) for: ' + src);
    }

    //  give the top level request the command sequence for inspection
    //  and use in returning results.
    request.set('subrequests', cmds);

    //  connect the current request to either the last command or to it's
    //  various output redirections as an "and'ed set" so we need to hear
    //  from all output redirects before the request can continue.
    outs = cmdRequest.get('outs');
    if (TP.isEmpty(outs)) {
        request.andJoinChild(cmdRequest);
    } else {
        len = outs.getSize();
        for (i = 0; i < len; i++) {
            out = outs.at(i);
            request.andJoinChild(out);
        }
    }

    //  connect the input and output of our children into our overall pipe
    //  sequence so they read/write to the pipe we're a part of.
    if (nested) {
        //  map the last subcommand's output buffers to be ours, which means
        //  it will write to our buffers, and those are what downstream pipe
        //  segments from the nested script tag will be reading.
        cmds.last().atPut(TP.STDOUT, request.at(TP.STDOUT));
        cmds.last().atPut(TP.STDIO, request.at(TP.STDIO));
    }

    //  adjust the pipe symbols so they are in the "right place" so
    //  individual tags can see the pipe symbol which preceded them
    this.$adjustPipeSymbols(node, cmds, request);

    //  if we're a script tag with a pipe we need to push that down onto the
    //  first child so it can find it and be aware that it may have to
    //  handle stdin etc.
    if (TP.notEmpty(pipe = TP.elementGetAttribute(node, 'tsh:pipe', true))) {
        //  when the script is being used to provide input via a redirect we
        //  want our output to become the input for our cmdRequest
        if (pipe === '.<') {
            child = cmds.last();
            if (TP.isValid(child)) {
                child.atPut('cmdRequest', request.at('cmdRequest'));
                child.atPut('cmdIOName', request.at('cmdIOName'));
                child.stdout = request.stdout;
            }
        } else {
            //  all other pipes are "left-to-right" so we want our input to
            //  go to our first subcommand as the default STDIN content.
            child = cmds.first().at('cmdNode');
            if (TP.isElement(child)) {
                TP.elementSetAttribute(child, 'tsh:pipe', pipe, true);
                cmds.first().atPut(TP.STDIN, request.at(TP.STDIN));
            }
        }
    }

    //  perform any work to connect the previous section(s) of pipe
    this.$connectPipeSections(cmds, request);

    //  Tell the main Sherpa object that it should go ahead and process DOM
    //  mutations to the source DOM.

    //  Note here how we also check to make sure we have a real Sherpa object.
    //  That's because this code can sometimes run in a 'packaging' environment
    //  where the command is being invoked, hasFeature('Sherpa') is true,
    //  TP.sys.cfg('sherpa.enabled') is true, but no real Sherpa has been
    //  allocated
    if (TP.sys.hasFeature('sherpa') && TP.isValid(TP.bySystemId('Sherpa'))) {
        TP.bySystemId('Sherpa').set('shouldProcessDOMMutations', true);
    }

    service = TP.tsh.RunService.getDefaultInstance();

    //  if the first command has input requests those are first in the
    //  overall pipe sequence, otherwise it's the command itself.
    if (TP.isValid(roots = cmds.first().get('ins'))) {
        roots.perform(
            function(inReq) {

                service[TP.composeHandlerName('TSHRunRequest')](inReq);
            });
    } else {
        service[TP.composeHandlerName('TSHRunRequest')](cmds.first());
    }

    //  return a break to keep from having shell loop descend into children
    return TP.BREAK;
});

//  ------------------------------------------------------------------------

TP.tsh.script.Type.defineMethod('$xmlifyContent',
function(src, shell, request) {

    /**
     * @method $xmlifyContent
     * @summary Processes incoming source text, massaging it to handle mixed
     *     XML and JavaScript input as well as certain TIBET Shell operators to
     *     create the best possible XML string value. As part of this process
     *     XML literals are converted to entities when found outside of opening
     *     and closing tags, TSH here document syntax is processed, subshell
     *     content is handled, and more.
     * @param {String} src The source text to process/convert.
     * @param {TP.shell.Shell} shell The shell instance requesting processing.
     * @param {TP.sig.Request} request The request being processed.
     * @returns {String} The processed/converted content.
     */

    var arr,
        token,
        i,
        result,
        mode,
        next,
        tag,
        term,
        here,
        str,
        literal,
        preserve;

    //  TODO:   coalesce into a single test
    if (!TP.regex.HAS_ELEMENT.test(src) &&
        !TP.regex.HAS_PI.test(src) &&
        !TP.regex.HAS_ENTITY.test(src) &&
        !TP.regex.TSH_SUBSHELL.test(src) &&
        !TP.regex.TSH_SUBGROUP.test(src) &&
        !TP.regex.TSH_HEREDOC.test(src)) {
        return src;
    }

    //  tokenize and do our best...
    arr = TP.$tokenize(
                src,
                //  All of the JS operators *and* the TSH operators
                TP.tsh.script.$tshAndJSOperators,
                true, false, false, false);

    i = 0;
    token = arr[i];

    mode = 'content';

    result = TP.ac();
    here = TP.ac();
    tag = TP.ac();

    while (token) {
        switch (token.value) {
            case '<':
            case '</':
                //  possibly start of opening or closing tag for an element,
                //  but we have to scan ahead to be sure (at least in the
                //  case of the <).
                next = arr[i + 1];
                if (!next) {
                    result.push(TP.xmlLiteralsToEntities(token.value));
                    i += 1;
                    token = arr[i];

                    continue;
                }

                if (next.name !== 'identifier' &&
                    next.name !== 'reserved') {
                    //  could be a comment...we handle PI and CDATA blocks
                    //  elsewhere since their opening syntax is not valid JS
                    //  but a comment's could be as in ( foo < ! --bar )
                    //  which is admittedly pretty obscure but possible
                    if (next.value === '!' && arr[i + 2] !== null &&
                        arr[i + 2].value === '--') {
                        tag.push('<!--');
                        i += 3;

                        for (;;) {
                            token = arr[i];
                            if (!token) {
                                break;
                            }

                            if (token.value === '--' &&
                                arr[i + 1] === '>') {
                                tag.push('-->');
                                i += 1;
                                break;
                            }

                            tag.push(token.value);
                            i += 1;
                        }

                        result.push(tag.join(''));
                        tag.length = 0;

                        i += 1;
                        break;
                    }

                    //  can't be a tag if not <ident with no space etc
                    result.push(TP.xmlLiteralsToEntities(token.value));
                    i += 1;
                    token = arr[i];

                    continue;
                }

                //  scan ahead. only legal tokens inside a tag are
                //  the operators : and =, identifiers, strings, and
                //  spaces. if we don't see a closing operator
                //  before finding something else then this isn't a
                //  tag, otherwise it is

                tag.push(token.value, next.value);
                i += 2;

                for (;;) {
                    token = arr[i];
                    if (!token) {
                        mode = 'content';
                        break;
                    }

                    tag.push(token.value);

                    if (token.name === 'operator') {
                        //  TODO:   officially : . - and _ are all legal in
                        //  tag names but we only support 3 of those and
                        //  even then the logic below here doesn't make sure
                        //  they are found without intervening whitespace.

                        if (token.value === '>' ||
                            token.value === '/>') {
                            //  closing the tag
                            mode = 'tag';
                            break;
                        } else if (token.value === '-') {
                            //  certain XML dialects like to use - in tag
                            //  names, particularly XSLT and XForms
                            i += 1;
                            continue;
                        } else if (token.value !== ':' &&
                                token.value !== '=') {
                            //  can't be a tag, invalid operator
                            mode = 'content';
                            break;
                        }
                    } else if (token.name === 'string' ||
                                TP.$is_identifier(token.name) ||
                                TP.$is_whitespace(token.name)) {
                        //  could be more discriminating here based on
                        //  last/next but for now assume operator check
                        //  will catch the majority of bad tag forms
                        i += 1;
                        continue;
                    } else {
                        //  can't be a tag, found something that's not
                        //  legal inside the tag itself
                        mode = 'content';
                        break;
                    }

                    i += 1;
                }

                if (mode === 'content') {
                    //  not a tag after all...content...which means we
                    //  need to xmlify what's in the tag stream so it
                    //  can be used as valid content

                    if (tag.last() === '.<<') {
                        //  start of a 'here document',
                        tag.length = tag.length - 1;
                        i -= 1;
                    } else if (tag.last() === '.((') {
                        //  start of a nested script subshell
                        tag.length = tag.length - 1;
                        i -= 1;
                    } else if (tag.last() === '.{{') {
                        //  start of a nested script "block"
                        tag.length = tag.length - 1;
                        i -= 1;
                    } else {
                        i += 1;
                    }

                    result.push(TP.xmlLiteralsToEntities(tag.join('')));
                    tag.length = 0;

                } else {
                    //  tag, no additional processing necessary, should
                    //  be in valid markup format already
                    result.push(tag.join(''));
                    tag.length = 0;

                    mode = 'content';

                    i += 1;
                }

                token = arr[i];
                break;

            case '<![':
                //  start of a CDATA block

                //  read and push until we've consumed the
                //  CDATA block content. the primary point here
                //  is that we do not escape or transform
                //  literals etc.
                tag.push('<![CDATA[');
                i += 3;

                for (;;) {
                    token = arr[i];
                    if (!token) {
                        break;
                    }

                    if (token.value === ']' &&
                        arr.slice(i, i + 2).join('') === ']]>') {
                        tag.push(']]>');
                        i += 2;
                        break;
                    }

                    tag.push(token.value);
                    i += 1;
                }

                result.push(tag.join(''));
                tag.length = 0;

                i += 1;
                break;

            case '<?':
                //  start of a processing instruction. read and push
                //  until we get to a closing ?> operator

                tag.push(token.value);
                i += 1;

                token = arr[i];
                while (token && token.value !== '?>') {
                    tag.push(token.value);
                    i += 1;
                    token = arr[i];
                }

                if (token && token.value === '?>') {
                    tag.push(token.value);
                }

                result.push(tag.join(''));
                tag.length = 0;

                i += 1;
                break;

            case '.{{':
                //  start of nested "block" tag. if we replace now with the
                //  equivalent tag we can wait for the full desugaring pass
                //  to handle the rest
                result.push('<tsh:script>');

                i += 1;
                break;

            case '.}}':

                //  close of nested script tag.
                result.push('</tsh:script>');

                i += 1;
                break;

            case '.((':
                //  start of nested script tag. if we replace now with the
                //  equivalent tag we can wait for the full desugaring pass
                //  to handle the rest
                result.push('<tsh:script subshell="true">');

                i += 1;
                break;

            case '.))':

                //  close of nested script tag.
                result.push('</tsh:script>');

                i += 1;
                break;

            case '.<<':

                //  'here' document content which is of the form:
                //  .<< TERM ...content... TERM
                //  where the TERM is any identifier to use as a delimiter
                //  and content is anything which should become content in
                //  the resulting tsh:here tag

                i += 1;
                token = arr[i];

                //  allow optional whitespace prior to first identifier, but
                //  note whether we get a \ before the first identifier
                //  since that will turn off processing of content for shell
                //  sugars and make the content "literal" and preserve any
                //  leading whitespace
                while (token && (token.name !== 'identifier' ||
                            token.name !== 'reserved')) {

                    /* eslint-disable no-extra-parens */
                    literal = (token.value === '\\');
                    preserve = (token.value === '-');
                    /* eslint-enable no-extra-parens */

                    i += 1;
                    token = arr[i];
                }

                //  have to see an identifier which will become our ending
                //  delimiter when we see it again
                if (token && (
                        token.name === 'identifier' ||
                        token.name === 'reserved')) {
                    //  capture the termination delimiter
                    term = token.value;

                    i += 1;
                    token = arr[i];

                    //  skip one whitespace token between the termination
                    //  symbol and the content (since at least one is
                    //  required syntax).
                    if (TP.$is_whitespace(token.name)) {
                        i += 1;
                        token = arr[i];
                    }

                    //  push a stdin redirect into the result which
                    //  points to the here document tag...but do it
                    //  in entity form so it converts properly
                    result.push('.&lt;');

                    //  open a tag and CDATA block to contain the data
                    result.push('<tsh:here');
                    if (literal) {
                        result.push(' literal="true"');
                    }
                    if (preserve) {
                        result.push(' preserve="true"');
                    }
                    result.push(' ><![CDATA[');

                    //  capture tokens "as is" with no translation, placing
                    //  them into a content container
                    while (token) {
                        if (token.value === term) {
                            i += 1;
                            break;
                        }

                        here.push(token.value);
                        i += 1;
                        token = arr[i];
                    }

                    //  if we found real content then push it into the
                    //  CDATA container in proper format
                    if (here.length > 0) {
                        result.push(
                            TP.xmlLiteralsToEntities(here.join('')));
                        here.length = 0;
                    }

                    //  close off the CDATA and tag
                    result.push(']]></tsh:here>');

                    //  reset to content mode for next token
                    mode = 'content';

                    //  look ahead for possible pipe/redirect so we don't
                    //  lose that information
                    //  TODO
                } else {
                    TP.ifWarn() ?
                        TP.warn('Invalid syntax at: ' + token.value) : 0;

                    i += 1;
                }

                break;

            default:

                if (token.name === 'string' ||
                    token.name === 'operator') {
                    //  xmlify string and token content to avoid issues
                    token.value = TP.xmlLiteralsToEntities(token.value);

                    result.push(token.value);
                    i += 1;
                } else {
                    result.push(token.value);
                    i += 1;
                }

                break;
        }

        token = arr[i];
    }

    str = result.join('');

    if (TP.sys.cfg('log.tsh_xmlify')) {
        TP.ifTrace() ?
            TP.trace('tsh_xmlify:\n' + str) : 0;
    }

    return str;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.script.Inst.defineMethod('constructActRequest',
function(aSignal) {

    /**
     * @method constructActRequest
     * @summary
     * @param {TP.sig.Signal} aSignal The signal instance which triggered this
     *     activity.
     * @returns {TP.sig.Request} The request that was generated (or was
     *     supplied) to run this action.
     */

    var request;

    request = this.callNextMethod();

    //  When processing tsh:script tags via act() calls we will use a
    //  different phase sequence if an external file is used. When content
    //  is inlined we presume it has been processed completely prior to
    //  inclusion in the tag's content area.
    if (TP.notEmpty(this.getNativeNode().ownerDocument[TP.SRC_LOCATION])) {
        request.atPut('cmdPhases', 'finalize');
    }

    return request;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

//  ========================================================================
//  TP.sig.TSHRunRequest
//  ========================================================================

/**
 * @type {TP.sig.TSHRunRequest}
 * @summary The TSH uses child requests to perform the actual work of running a
 *     script. All requests of this kind are TP.sig.TSHRunRequests.
 */

TP.sig.ShellRequest.defineSubtype('TSHRunRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Type.defineAttribute('responseType', 'TP.sig.TSHRunResponse');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  a list of the subrequests which provide input redirection data
TP.sig.TSHRunRequest.Inst.defineAttribute('ins');

//  a list of the subrequests which provide output redirection sinks
TP.sig.TSHRunRequest.Inst.defineAttribute('outs');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Inst.defineMethod('addInputRequest',
function(aRequest) {

    /**
     * @method addInputRequest
     * @summary Adds a request whose purpose is to provide input to the
     *     receiver. These requests are parsed from input redirection and 'here
     *     document' symbols.
     * @param {TP.sig.TSHRunRequest} aRequest The input data request.
     * @returns {TP.sig.TSHRunRequest} The receiver.
     */

    var ins;

    ins = this.$get('ins');
    if (TP.notValid(ins)) {
        ins = TP.ac();
        this.$set('ins', ins);
    }

    ins.push(aRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Inst.defineMethod('addOutputRequest',
function(aRequest) {

    /**
     * @method addOutputRequest
     * @summary Adds a request whose purpose is to store output from the
     *     receiver. These requests are parsed from output redirection symbols.
     * @param {TP.sig.TSHRunRequest} aRequest The output data request.
     * @returns {TP.sig.TSHRunRequest} The receiver.
     */

    var outs;

    outs = this.$get('outs');
    if (TP.notValid(outs)) {
        outs = TP.ac();
        this.$set('outs', outs);
    }

    outs.push(aRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Inst.defineMethod('cancel',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancel
     * @summary Tells the receiver to cancel, meaning it is being rescinded by
     *     the user or calling process. If the receiver has specific behavior to
     *     implement it should override the cancelJob() method invoked as part
     *     of this method's operation.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the cancellation.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.BREAK}
     */

    var str,
        faultCode,

        info;

    if (this.isCompleting() || this.didComplete()) {
        return;
    }

    faultCode = TP.ifEmpty(aFaultCode, TP.CANCELLED);

    if (arguments.length > 0 && TP.notTrue(this.at('cmdSilent'))) {
        switch (arguments.length) {
            case 1:
                this.stderr(aFaultString);
                break;
            case 2:
                if (TP.isError(aFaultString)) {
                    //  Try to keep messaging consistent...
                    str = faultCode + ': ' + aFaultString.message;
                    aFaultString.message = str;
                    this.stderr(aFaultString);
                } else {
                    str = faultCode + ': ' + aFaultString;
                    this.stderr(str);
                }
                break;
            case 3:
                info = TP.hc(aFaultInfo);
                if (info.at('error')) {
                    //  Try to keep messaging consistent...
                    str = faultCode + ': ' +
                            info.at('error').message +
                            ' ' + aFaultString;
                    info.at('error').message = str;
                    this.stderr(info.at('error'));
                } else {
                    str = faultCode + ': ' + aFaultString;
                    this.stderr(str);
                }
                break;
            default:
                break;
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Inst.defineMethod('complete',
function(aResult) {

    /**
     * @method complete
     * @summary Tells the receiver to complete, meaning the receiver should do
     *     whatever finalization is necessary to reach the TP.SUCCEEDED state.
     *     If the receiver has specific behavior to implement it should override
     *     the completeJob() method invoked as part of this method's operation.
     * @param {Object} aResult An optional object to set as the result for the
     *     request.
     * @returns {TP.core.JobStatus} The receiver.
     */

    if (this.isCompleting() || this.didComplete()) {
        return;
    }

    if (arguments.length > 0) {

        //  Allow undefined to be set as a result.
        this.$set('result', aResult, null, true);

        if (TP.notTrue(this.at('cmdSilent'))) {
            this.stdout(aResult);
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Inst.defineMethod('fail',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method fail
     * @summary Tells the receiver to fail, meaning it failed due to some form
     *     of exception. If the receiver has specific behavior to implement it
     *     should override the failJob() method invoked as part of this method's
     *     operation.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the error.
     * @returns {TP.BREAK}
     */

    var str,
        faultCode,

        info;

    if (this.isCompleting() || this.didComplete()) {
        return;
    }

    faultCode = TP.ifEmpty(aFaultCode, TP.FAILED);

    if (arguments.length > 0 && TP.notTrue(this.at('cmdSilent'))) {
        switch (arguments.length) {
            case 1:
                this.stderr(aFaultString);
                break;
            case 2:
                if (TP.isError(aFaultString)) {
                    //  Try to keep messaging consistent...
                    str = faultCode + ': ' + aFaultString.message;
                    aFaultString.message = str;
                    this.stderr(aFaultString);
                } else {
                    str = faultCode + ': ' + aFaultString;
                    this.stderr(str);
                }
                break;
            case 3:
                info = TP.hc(aFaultInfo);
                if (info.at('error')) {
                    //  Try to keep messaging consistent...
                    str = faultCode + ': ' +
                            info.at('error').message +
                            ' ' + aFaultString;
                    info.at('error').message = str;
                    this.stderr(info.at('error'));
                } else {
                    str = faultCode + ': ' + aFaultString;
                    this.stderr(str);
                }
                break;
            default:
                break;
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Inst.defineMethod('notify',
function(output, request) {

    /**
     * @method notify
     * @summary Standard function for notifying of "out of band" content during
     *     request execution.
     * @param {Object} output The object to write to stderr.
     * @param {TP.sig.Request|TP.core.Hash} request Optional request/parameters.
     *     Defaults to the receiver.
     */

    var shell;

    shell = this.at('cmdShell');

    return shell.notify(output, TP.ifInvalid(request, this));
});

//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Inst.defineMethod('stderr',
function(output, request) {

    /**
     * @method stderr
     * @summary Standard function for writing error output during shell
     *     execution.
     * @param {Object} output The object to write to stderr.
     * @param {TP.sig.Request|TP.core.Hash} request Optional request/parameters.
     *     Defaults to the receiver.
     */

    var req,
        buffer,
        buffered,

        start,
        end,

        rootRequest;

    //  merge keys when we get extra parameters via the request/hash.
    req = TP.isValid(request) ?
            this.getPayload().addAll(request.getPayload()) :
            this;

    //  write to the stderr "buffer" array if it's defined for us
    if (TP.isValid(buffer = this.at(TP.STDERR))) {
        buffered = true;
        buffer.push(output);
    }

    //  write to the stdio "buffer" array (stdout + stderr) if provided
    if (TP.isValid(buffer = this.at(TP.STDIO))) {
        buffered = true;
        buffer.push(output);
    }

    //  last update wins relative to our "result" but we update it here
    this.set('result', output, null, true);

    //  if we're buffering into one or more arrays then we don't output to
    //  the shell and/or $stderr function, we've been redirected to buffer
    if (buffered) {
        //  IFF we're buffering then we're being piped, in which case the
        //  output here is input for a downstream process/command.
        return;
    }

    //  Compute the tagtime from the cmdStart & cmdEnd
    if (TP.isNumber(start = req.at('cmdStart')) &&
        TP.isNumber(end = req.at('cmdEnd'))) {
        this.$set('$tagtime', end - start);
    }

    //  output to the standard error reporting function if we didn't return
    //  due to buffering check
    rootRequest = this.getRootRequest();

    return rootRequest.stderr(output, req);
});

//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Inst.defineMethod('stdin',
function() {

    /**
     * @method stdin
     * @summary Provides a common function for reading from "standard input"
     *     during shell execution. Standard input is always provided as an array
     *     of 0 to N items provided by the various stdout, stderr, and input
     *     redirection calls related to a request.
     * @returns {Array} An array of 0 to N input objects.
     */

    var buffer,
        node,
        pipe,
        name,
        last,
        peer,
        index,
        value;

    //  if we've already processed the data we'll have it cached in TP.STDIN
    if (TP.isValid(buffer = this.at(TP.STDIN))) {
        return buffer;
    }

    node = this.at('cmdNode');

    pipe = TP.elementGetAttribute(node, 'tsh:pipe', true);
    pipe = TP.isEmpty(pipe) ? pipe : TP.xmlEntitiesToLiterals(pipe);

    switch (pipe) {
        //  ---
        //  standard pipes
        //  ---

        case '.|':      //  stdout
        case '.|*':     //  stdout (and iterate)
        case '.*':      //  stdout (and iterate shorthand)
        case '.|?':     //  stdout (and filter)
        case '.?':      //  stdout (and filter shorthand)
        case '.|?*':    //  stdout (iterate and filter)
        case '.?*':     //  stdout (iterate and filter shorthand)
        case '.|%':     //  stdout (and format)
        case '.%':      //  stdout (and format shorthand)
        case '.|%*':    //  stdout (iterate and format)
        case '.%*':     //  stdout (iterate and format shorthand)

            name = TP.STDOUT;
            break;

        case '.&':      //  stderr
        case '.&*':     //  stderr (and iterate)
        case '.&?':     //  stderr (and filter)
        case '.&%':     //  stderr (and format)
        case '.&?*':    //  stderr (iterate and filter)
        case '.&%*':    //  stderr (iterate and format)

            name = TP.STDERR;
            break;

        case '.|&':     //  both
        case '.|&*':    //  both (and iterate)
        case '.|&?':    //  both (and filter)
        case '.|&%':    //  both (and format)
        case '.|&?*':   //  both (iterate and filter)
        case '.|&%*':   //  both (iterate and format)

            name = TP.STDIO;
            break;

        //  ---
        //  conditional execution
        //  ---

        case '.||':
        case '.&&':

            //  these are somewhat indeterminate since the symbol itself
            //  doesn't tell us anything regarding stdout vs. stderr
            //  from the prior command...
            name = TP.STDOUT;
            break;

        //  ---
        //  input redirections
        //  ---

        case '.<':      //  stdin
        case '.<!':     //  stdin with refresh
        case '.<<':     //  here document

            //  no reason to think these should leverage either stdout
            //  or stderr from the "prior" command since they're really
            //  somewhat orthagonal to commands other than the one they
            //  feed their data to
            name = TP.STDOUT;
            break;

        //  ---
        //  output redirections
        //  ---

        case '.>':      //  stdout
        case '.>!':
        case '.>>':     //  stdout with append
        case '.>>!':

            name = TP.STDOUT;
            break;

        case '.&>':     //  stderr
        case '.&>!':
        case '.&>>':    //  stderr with append
        case '.&>>!':

            name = TP.STDERR;
            break;

        case '.>&':     //  both
        case '.>&!':
        case '.>>&':    //  both with append
        case '.>>&!':

            name = TP.STDIO;
            break;

        default:        //  bad symbol or no pipe attribute

            break;
    }

    //  two potential sources for data here...the stdout/stderr methods
    //  which write into a pipe (.|, .&, etc) upon completion of the
    //  previous command's execution...and any input redirections for the
    //  current command which have been run prior to invoking the command

    //  if there's a buffer name provided then we know we've downstream from
    //  some pipe that should provide stdout, stderr, or both as our input.
    //  Depending on the nature of that pipe it may be stored in our cmdLast
    //  or cmdRequest slot (cmdRequest when output redirection).
    if (TP.notEmpty(name)) {
        last = this.at('cmdLast') || this.at('cmdRequest');
        if (TP.isValid(last)) {
            buffer = last.at(name);
        } else {
            peer = this.at('cmdPeer');
            if (TP.isValid(peer)) {
                buffer = peer.at(TP.STDIN);
            }
        }
    }

    //  make sure we always at least have an empty buffer by this point.
    //  this may happen either because we're the first command (so cmdLast
    //  is empty) or because we're not being piped to. either way we need to
    //  be ready to process any input redirections.
    if (TP.notValid(buffer)) {
        buffer = TP.ac();
    }

    index = 0;
    for (;;) {
        if (TP.notDefined(value = this.at('$_' + index))) {
            break;
        }

        buffer.push(value);
        index += 1;
    }

    //  cache for recall
    this.atPut(TP.STDIN, buffer);

    return buffer;
});

//  ------------------------------------------------------------------------

TP.sig.TSHRunRequest.Inst.defineMethod('stdout',
function(output, request) {

    /**
     * @method stdout
     * @summary Standard function for writing valid output during shell
     *     execution.
     * @param {Object} output The object to write to stdout.
     * @param {TP.sig.Request|TP.core.Hash} request Optional request/parameters.
     *     Defaults to the receiver.
     */

    var req,
        node,
        asIs,
        buffer,
        buffered,

        start,
        end;

    //  merge keys when we get extra parameters via the request/hash.
    req = TP.isValid(request) ?
            this.getPayload().addAll(request.getPayload()) :
            this;

    //  write to the stdout "buffer" array if it's defined for us
    if (TP.isValid(buffer = this.at(TP.STDOUT))) {
        buffered = true;
        buffer.push(output);
    }

    //  write to the stdio "buffer" array (stdout + stderr) if provided
    if (TP.isValid(buffer = this.at(TP.STDIO))) {
        buffered = true;
        buffer.push(output);
    }

    //  last update wins relative to our "result" but we update it here
    this.set('result', output, null, true);

    //  if we're buffering into one or more arrays then we don't output to
    //  the shell and/or $stderr function, we've been redirected to buffer
    if (buffered) {
        //  IFF we're buffering then we're being piped, in which case the
        //  output here is input for a downstream process/command.
        return;
    }

    //  second "common flag" is the -asis flag telling us to skip
    //  formatting the output any further
    node = this.at('cmdNode');
    asIs = TP.ifEmpty(TP.elementGetAttribute(node, 'tsh:asis', true),
                        req.at('cmdAsIs'));

    if (TP.notEmpty(asIs)) {
        asIs = TP.bc(asIs);
        req.atPut('cmdAsIs', asIs);
    }

    //  Compute the tagtime from the cmdStart & cmdEnd
    if (TP.isNumber(start = req.at('cmdStart')) &&
        TP.isNumber(end = req.at('cmdEnd'))) {
        this.$set('$tagtime', end - start);
    }

    //  we don't recheck output after whatever formatting we may have done,
    //  the shell/console routines will do that and complain as needed.
    return this.at('rootRequest').stdout(output, req);
});

//  ========================================================================
//  TSHRunResponse
//  ========================================================================

TP.sig.ShellResponse.defineSubtype('TSHRunResponse');

//  ========================================================================
//  TP.tsh.RunService
//  ========================================================================

/**
 * @type {TP.tsh.RunService}
 * @summary The primary "working service" for execution of TSH scripts.
 */

TP.core.Service.defineSubtype('tsh.RunService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  What type of signal do we react to?
TP.tsh.RunService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.TSHRunRequest')));

TP.tsh.RunService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.RunService.Inst.defineHandler('TSHRunRequest',
function(aRequest) {

    /**
     * @method handleTSHRunRequest
     * @summary Processes individual execution requests, dispatching the
     *     request to the proper targeting method so that command tags can
     *     implement fine-grained processing logic easier.
     * @param {TP.sig.TSHRunRequest} aRequest The request instance to process.
     */

    var node,
        shell,
        cmdns,
        nodetype,

        tagname,
        parts,
        prefix,
        fname,

        type,

        start,
        pipe,
        async;

    aRequest.isActive(true);

    node = aRequest.at('cmdNode');
    shell = aRequest.at('cmdShell');

    if (TP.sys.cfg('log.tsh_run')) {
        TP.ifTrace() ?
            TP.trace('tsh_run:\n' + TP.str(node)) : 0;
    }

    //  capture the current command prefix for defaulting purposes.
    cmdns = shell.getType().get('commandPrefix');

    //  make sure we're processing the right kind of node...element or PI.
    nodetype = node.nodeType;
    if (nodetype !== Node.ELEMENT_NODE &&
        nodetype !== Node.PROCESSING_INSTRUCTION_NODE) {
        aRequest.fail();
        return;
    }

    //  a few cases here, external action tags, tags that represent
    //  built-ins, or embedded markup. we look for built-ins first, which
    //  implies you can't replace a built-in with an external tag definition
    pipe = TP.elementGetAttribute(node, 'tsh:pipe', true);
    pipe = TP.isEmpty(pipe) ? pipe : TP.xmlEntitiesToLiterals(pipe);

    //  update the request with any command flags for iteration and
    //  storage/commit that may be on the symbol
    if (TP.notEmpty(pipe)) {
        if (pipe.indexOf('*') !== TP.NOT_FOUND) {
            aRequest.atPut('cmdIterate', true);
        }

        //  ! means either commit or refresh depending on source vs. sink
        if (pipe.indexOf('!') !== TP.NOT_FOUND) {
            aRequest.atPut('cmdCommit', true);
            aRequest.atPut('cmdRefresh', true);
        }

        //  map the basic pipe symbols into a common action type
        if (pipe.indexOf('>>') !== TP.NOT_FOUND) {
            aRequest.atPut('cmdAction', TP.ADD);
        } else if (pipe.indexOf('<') !== TP.NOT_FOUND) {
            aRequest.atPut('cmdAction', TP.GET);
        } else if (pipe.indexOf('>') !== TP.NOT_FOUND) {
            aRequest.atPut('cmdAction', TP.SET);
        } else if (pipe.indexOf('?') !== TP.NOT_FOUND) {
            aRequest.atPut('cmdAction', TP.FILTER);
        } else {
            aRequest.atPut('cmdAction', TP.TRANSFORM);
        }
    }

    async = TP.elementGetAttribute(node, 'tsh:async', true);
    async = TP.isEmpty(async) ? false : TP.bc(async);
    aRequest.atPut('async', async);

    //  TODO:   this will need verification for PIs
    tagname = TP.qname(node);
    parts = tagname.split(':');
    prefix = parts.at(0);
    if (prefix === cmdns) {
        //  prefix matches, may be a built in
        fname = 'execute' +
                TP.makeStartUpper(shell.translateSymbol(parts.at(1)));

        if (TP.canInvoke(shell, fname)) {
            start = Date.now();
            aRequest.atPut('cmdStart', start);

            //  Configure the default stdin values for the most typical
            //  case, no splatting and at most a single object in stdin
            //  buffer.
            shell.updateExecutionInstance(aRequest);

            //  NOTE that we invoke the built-in here and rely entirely on
            //  that to fail/complete
            shell[fname](aRequest);

            return;
        }

        //  clear any leftovers before we fall through
        fname = null;
    }

    //  doesn't match the shell prefix and/or isn't a built-in,
    //  so we move on to specific external tag types.
    type = TP.sys.getTypeByName(tagname);
    if (TP.notValid(type)) {
        aRequest.at('rootRequest').stderr('Invalid command: ' +
            tagname + '. Try ? or :help.', aRequest);
        aRequest.fail();
        return;
    }

    /* eslint-disable no-fallthrough */
    switch (pipe) {
        case '.|':
        case '.|*':
        case '.*':

        case '.&':
        case '.&*':

        case '.|&':
        case '.|&*':

        case '.%':
        case '.%*':

        case '.|%':
        case '.|%*':

        case '.&%':
        case '.&%*':

        case '.|&%':
        case '.|&%*':

            if (TP.canInvoke(type, 'cmdTransformInput')) {
                fname = 'cmdTransformInput';
            }
            break;

        case '.?':
        case '.?*':

        case '.|?':
        case '.|?*':

        case '.&?':
        case '.&?*':

        case '.|&?':
        case '.|&?*':

            if (TP.canInvoke(type, 'cmdFilterInput')) {
                fname = 'cmdFilterInput';
            }
            break;

        case '.>':
        case '.>!':

        case '.&>':
        case '.&>!':

        case '.>&':
        case '.>&!':

            //  temporary sink, set content, but no commit
            if (TP.canInvoke(type, 'cmdSetContent')) {
                fname = 'cmdSetContent';
            }
            break;

        case '.>>':
        case '.>>!':

        case '.&>>':
        case '.&>>!':

        case '.>>&':
        case '.>>&!':

            //  temporary sink via append
            if (TP.canInvoke(type, 'cmdAddContent')) {
                fname = 'cmdAddContent';
            }
            aRequest.atPut('cmdAppend', true);
            break;

        case '.<':      //  stdin
        case '.<!':     //  stdin with refresh
        case '.<<':     //  here document

            if (TP.canInvoke(type, 'cmdGetContent')) {
                fname = 'cmdGetContent';
            }
            break;

        default:

            //  conditional, or perhaps no pipe at all.
            break;
    }
    /* eslint-enable no-fallthrough */

    //  set a start time for "tag exec" before taking the final step
    start = Date.now();
    aRequest.atPut('cmdStart', start);

    //  if we didn't set it to something more specific up above then see if
    //  we can invoke the default execution phase method.
    if (TP.isEmpty(fname)) {
        fname = 'cmdRunContent';
    }

    if (!TP.canInvoke(type, fname)) {
        aRequest.at('rootRequest').stderr('Unable to execute ' +
            tagname + '.' + fname, aRequest);
        aRequest.fail();
        return;
    }

    //  Configure the default stdin values for the most typical case, no
    //  splatting and at most a single object in stdin buffer.
    shell.updateExecutionInstance(aRequest);

    //  trigger the command function and let it complete/fail/etc.
    type[fname](aRequest);

    //  return a break to keep from having shell loop descend into children
    return TP.BREAK;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
