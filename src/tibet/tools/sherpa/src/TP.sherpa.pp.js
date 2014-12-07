//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.sherpa.pp}
 * @synopsis The "pretty-print" formatter for the TIBET Shell when running under
 *      the Sherpa. Since this type is a formatter at heart most of the methods
 *      are built to support decent output for common JavaScript data types.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa:pp');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Objects that respond to as()/from()
//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromArray',
function(anObject, optFormat) {

    var len,

        output,

        count,
        colcount,

        i;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (anObject.$$format_sherpa_pp) {
        return TP.recursion(anObject);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    anObject.$$format_sherpa_pp = true;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    len = anObject.getSize();

    output = TP.ac();

    output.push('<span class="sherpa_pp Array">');

    count = 0;
    colcount = 1;

    for (i = 0; i < len; i++) {
        if (count > (colcount - 1)) {
            count = 0;
        }

        output.push('<span data-name="', i, '">',
                    //TP.boot.$dump(anObject.at(i), '', true),
                    TP.format(anObject.at(i), TP.sherpa.pp.Type),
                    '</span>');

        count++;
    }

    output.push('</span>');

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_sherpa_pp;

    return output.join('');
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromBoolean',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="sherpa_pp Number">' +
            this.runJSModeOn(TP.str(anObject)) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromDate',
function(anObject, optFormat) {

    var obj;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    obj = anObject.toISOString().asEscapedXML();
    return '<span class="sherpa_pp Number">' +
            this.runJSModeOn(obj) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromError',
function(anObject, optFormat) {

    var stack;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    stack = '';
    if (TP.sys.shouldLogStack()) {
        stack = '<br/>' +
                TP.getStackInfo(anObject).collect(
                    function(infoPiece) {
                        return infoPiece.asEscapedXML();
                    }).join('<br/>');
    }

    return '<span class="sherpa_pp Error">' +
            anObject.message.asEscapedXML() +
            stack +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromFunction',
function(anObject, optFormat) {

    var str;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    if (TP.isValid(TP.extern.CodeMirror)) {
        str = this.runJSModeOn(anObject);

        str = str.replace(/\n/g, '<br/>');

        return '<span class="sherpa_pp Function">' +
                str +
                '</span>';
    } else {
        str = TP.str(anObject);

        //  NOTE the CDATA blocks here combined with <span> of
        //  'white-space: pre' to hold on to remaining whitespace while
        //  ensuring we ignore any embedded < or > symbols etc.
        return '<span class="sherpa_pp Function">' +
                    '<![CDATA[' + str + ']]>' +
                '</span>';
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromNamedNodeMap',
function(anObject, optFormat) {

    var content,

        len,
        i,

        item;

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    content = TP.ac();

    len = anObject.length;
    for (i = 0; i < len; i++) {
        item = anObject.item(i);

        content.push('<span data-name="' + TP.name(item) + '">' +
                        TP.val(item) +
                        '</span>');
    }

    return '<span class="sherpa_pp NamedNodeMap">' +
            content.join('') +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromNode',
function(anObject, optFormat) {

    var str;

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    if (TP.isValid(TP.extern.CodeMirror)) {
        str = '';
        TP.extern.CodeMirror.runMode(
            TP.str(anObject),
            {
                name: 'application/xml'
            },
            function (text, style) {

                if (style) {
                    str += '<span class="cm-' + style + '">' +
                             text.asEscapedXML() +
                             '</span>';
                } else {
                    str += text.asEscapedXML();
                }
            });

        str = str.replace(/\n/g, '<br/>');

        return '<span class="sherpa_pp Node">' +
                str +
                '</span>';
    } else {
    return '<span class="sherpa_pp Node">' +
            TP.str(anObject).asEscapedXML() +
            '</span>';
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromNodeList',
function(anObject, optFormat) {

    var arr,

        len,
        i;

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    arr = TP.ac();

    len = anObject.length;
    for (i = 0; i < len; i++) {
        arr.push(
                '<span data-name="', i, '">',
                    //TP.str(anObject[i]).asEscapedXML(),
                    TP.format(anObject[i], TP.sherpa.pp.Type),
                '</span>');
    }

    return '<span class="sherpa_pp NodeList">' + arr.join('') + '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromNumber',
function(anObject, optFormat) {

    var obj;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    obj = anObject.asEscapedXML();
    return '<span class="sherpa_pp Number">' +
            this.runJSModeOn(obj) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromObject',
function(anObject, optFormat) {

    var type,
        output,

        keys,
        key,
        value,

        i,
        len;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    type = TP.name(TP.type(anObject)).replace(/\./g, '_');
    output = TP.ac();

    output.push('<span class="sherpa_pp Object">');

    keys = TP.keys(anObject);
    keys.sort();
    keys.compact();
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);
        value = anObject[keys.at(i)];

        output.push(
                '<span data-name="' + key + '">',
                //TP.boot.$dump(anObject[keys.at(i)], '\n', true),
                TP.format(anObject[keys.at(i)], TP.sherpa.pp.Type),
                '</span>');
    }

    output.push('</span>');

    return output.join('');
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromRegExp',
function(anObject, optFormat) {

    var obj;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    obj = anObject.asEscapedXML();

    return '<span class="sherpa_pp RegExp">' +
            this.runJSModeOn(obj) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromString',
function(anObject, optFormat) {

    var obj;

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', false);
        optFormat.atPut('cmdAwaken', false);
    }

    if (TP.regex.CONTAINS_ELEM_MARKUP.test(anObject)) {
        if (TP.isValid(optFormat)) {
            optFormat.atPut('cmdAsIs', true);
        }
    }

    obj = anObject.asEscapedXML();

    return '<span class="sherpa_pp String">' +
            this.runJSModeOn(obj) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_boot_Annotation',
function(anObject, optFormat) {

    //  Annotations are an object/message pairing within a primitive
    //  wrapper. The object in TP.boot.Annotation instances is almost always
    //  an Error object of some kind.

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="sherpa_pp TP_boot_Annotation">' +
                '<span data-name="object">' +
                    TP.htmlstr(anObject.object) +
                '</span>' +
                '<span data-name="message">' +
                    TP.htmlstr(anObject.message) +
                '</span>' +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_boot_Log',
function(anObject, optFormat) {

    var obj,

        str,
        len,
        i;

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    obj = anObject.getEntries();

    str = '';
    len = obj.getSize();

    for (i = 0; i < len; i++) {
        str += '<span class="Date" data-name="timestamp">' +
                    obj[i][TP.boot.LOG_ENTRY_DATE] +
                '</span>' +
                '<span class="String" data-name="log-name">' +
                    obj[i][TP.boot.LOG_ENTRY_NAME] +
                '</span>' +
                '<span class="Number" data-name="log-level">' +
                    obj[i][TP.boot.LOG_ENTRY_LEVEL] +
                '</span>' +
                '<span class="String" data-name="log-entry">' +
                    obj[i][TP.boot.LOG_ENTRY_PAYLOAD] +
                '</span>' +
                '<span class="String" data-name="log-delta">' +
                    obj[i][TP.boot.LOG_ENTRY_DELTA] +
                '</span>';
    }

    return '<span class="sherpa_pp TP_boot_Log">' +
            str +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_core_JSONContent',
function(anObject, optFormat) {

    var str,
        level,
        tabSpaces;

    if (TP.isValid(TP.extern.CodeMirror)) {
        str = '';
        level = 0;
        tabSpaces = 4;
        TP.extern.CodeMirror.runMode(
            anObject.asString(),
            {
                name: 'application/ld+json'
            },
            function (text, style) {

                //  Collapse a brace followed by a comma with a brace coming
                //  next to a single line
                if ((text === '{') && str.slice(-7) === '},<br/>') {
                    str = str.slice(0, -5) + '&#160;';
                } else if (str.slice(-5) === '<br/>') {
                    //  Otherwise, if we're starting a new line, 'tab in' the
                    //  proper number of spaces.
                    str += '&#160;'.times(level * tabSpaces);
                }

                if (style) {
                    str += '<span class="cm-' + style + '">' +
                             text +
                             '</span>';
                } else {
                    if (text === '{' || text === '[') {
                        level++;
                        str += text + '<br/>';
                    }
                    if (text === '}' || text === ']') {
                        level--;
                        str += '<br/>' +
                                '&#160;'.times(level * tabSpaces) + text;
                    }
                    if (text === ':') {
                        str += '&#160;' + text + '&#160;';
                    }
                    if (text === ',') {
                        str += text + '<br/>';
                    }
                }
            });

        return '<span class="sherpa_pp TP_core_JSONContent">' +
                str +
                '</span>';
    } else {
        return '<span class="sherpa_pp TP_core_JSONContent">' +
                    anObject.asString().asEscapedXML() +
                '</span>';
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_lang_Hash',
function(anObject, optFormat) {

    var output,
        keys,
        key,
        len,
        i;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (anObject.$$format_sherpa_pp) {
        return TP.recursion(anObject);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    anObject.$$format_sherpa_pp = true;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    output = TP.ac();

    output.push('<span class="sherpa_pp TP_lang_Hash">');

    keys = TP.keys(anObject);
    keys.sort();
    keys.compact();
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);

        output.push('<span data-name="' + key + '">' +
                    //TP.boot.$dump(anObject.at(keys.at(i)), '\n', true) +
                    TP.format(anObject.at(keys.at(i)), TP.sherpa.pp.Type),
                    '</span>');
    }

    output.push('</span>');

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_sherpa_pp;

    return output.join('');
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_core_Node',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="sherpa_pp TP_core_Node">' +
            //TP.str(anObject.getNativeNode()).asEscapedXML() +
            TP.format(TP.unwrap(anObject), TP.sherpa.pp.Type) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_sig_ShellRequest',
function(anObject, optFormat) {

    var data;

    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    // Requests that are not yet processed should format their command.
    if (anObject.isCompleted()) {
        data = anObject.getResult();
    } else {
        data = anObject.at('cmd');
    }

    return '<span class="sherpa_pp">' + data + '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_core_URI',
function(anObject, optFormat) {

    return this.fromObject(anObject);
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_core_Window',
function(anObject, optFormat) {

    var nativeWin,

        arr,
        keys,
        len,
        i;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    nativeWin = anObject.getNativeWindow();

    arr = TP.ac();

    keys = TP.sys.$windowkeys;
    len = keys.length;

    for (i = 0; i < len; i++) {
        if (keys[i] === 'document') {
            arr.push('<span data-name="', keys[i], '">',
                        TP.str(nativeWin.document).asEscapedXML(), '</span>');
            continue;
        }

        try {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(nativeWin[keys[i]]), '</span>');
        } catch (e) {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(undefined), '</span>');
        }
    }

    return '<span class="sherpa_pp TP_core_Window" gid="' +
                TP.gid(anObject) + '">' +
            arr.join('') +
            '</span>';
});

//  ------------------------------------------------------------------------

//  Since this is supplied on TP.lang.RootObject, we need to 'rewire' it here
TP.sherpa.pp.Type.defineMethod('fromTP_sig_Signal', TP.sherpa.pp.fromObject);

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromWindow',
function(anObject, optFormat) {

    var arr,
        keys,
        len,
        i;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    arr = TP.ac();

    keys = TP.sys.$windowkeys;
    len = keys.length;

    for (i = 0; i < len; i++) {
        if (keys[i] === 'document') {
            arr.push('<span data-name="', keys[i], '">',
                        TP.str(anObject.document).asEscapedXML(), '</span>');
            continue;
        }

        try {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(anObject[keys[i]]), '</span>');
        } catch (e) {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(undefined), '</span>');
        }
    }

    return '<span class="sherpa_pp Window" gid="' + TP.gid(anObject) + '">' +
            arr.join('') +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('runJSModeOn',
function(anObject) {

    var str;

    str = '';
    TP.extern.CodeMirror.runMode(
        TP.str(anObject),
        {
            name: 'javascript'
        },
        function (text, style) {

            if (style) {
                str += '<span class="cm-' + style + '">' +
                         text.asEscapedXML() +
                         '</span>';
            } else {
                str += text.asEscapedXML();
            }
        });

    return str;
});

//  ========================================================================
//  Objects with no as() (invalid, Error, etc) attempt this.transform()
//  ========================================================================

TP.sherpa.pp.Type.defineMethod('transformError', function(anObject, optFormat) {

    /**
     * Format error objects for output. We output stack information if the
     * system is configured for it and we can access it from the Error.
     * @param {Error} anObject The error object to format.
     * @param {Object} optFormat
     */

    return this.fromError(anObject);
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('transformNull',
function(anObject, optFormat) {

    return '<span class="sherpa_pp Null">' +
            this.runJSModeOn(anObject) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('transformObject',
function(anObject, optFormat) {

    var methodName;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    //  Sometimes, we're invoked because we were handed an Object that lives in
    //  a Window that wasn't instrumented with TIBET. We try to redispatch
    //  against a matching from*() method on ourself that would do the job.

    if (TP.notValid(anObject)) {
        // 'null' or 'undefined', as you'd expect.
        return '<span class="sherpa_pp Object">' + anObject + '</span>';
    }

    if (TP.isValid(anObject)) {
        if (TP.notEmpty(methodName =
                        this.getBestMethodName(arguments, anObject, 'from'))) {
            return this[methodName].apply(this, arguments);
        }
    }

    return this.fromObject(anObject);
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('transformUndefined',
function(anObject, optFormat) {

    return '<span class="sherpa_pp Undefined">' +
            this.runJSModeOn(anObject) +
            '</span>';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
