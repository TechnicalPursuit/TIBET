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
 * @summary The "pretty-print" formatter for the TIBET Shell when running under
 *      the Sherpa. Since this type is a formatter at heart most of the methods
 *      are built to support decent output for common JavaScript data types.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa.pp');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Objects that respond to as()/from()
//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromArray',
function(anObject, optFormat) {

    var marker,
        format,
        output,
        len,
        i;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_sherpa_pp';
    if (TP.owns(anObject, marker)) {
        return TP.recursion(anObject, marker);
    }

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    //  If an optional format was supplied, then, if it has a level, check the
    //  level and if we're at that level, then just print the name of the
    //  object. If we haven't, increment the level and proceed.
    if (format.at('currentLevel') >= format.at('level')) {
        return TP.name(anObject);
    } else if (TP.notValid(format.at('currentLevel'))) {
        format.atPut('currentLevel', 1);
    } else {
        format.atPut('currentLevel', format.at('currentLevel') + 1);
    }

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    format.atPut('cmdBox', false);
    format.atPut('cmdAsIs', true);
    format.atPut('cmdAwaken', false);

    if (TP.isEmpty(anObject)) {
        return this.fromString('[]', format);
    }

    try {
        anObject[marker] = true;
    } catch (e) {
        void 0;
    }

    output = TP.ac();
    output.push('<span class="sherpa_pp Array">');
    len = anObject.getSize();

    try {
        for (i = 0; i < len; i++) {
            output.push('<span data-name="', i, '">',
                        TP.format(anObject.at(i), TP.sherpa.pp.Type, format),
                        '</span>');
        }
    } finally {
        output.push('</span>');

        //  Decrement the traversal level
        format.atPut('currentLevel', format.at('currentLevel') - 1);

        try {
            delete anObject[marker];
        } catch (e) {
            void 0;
        }
    }

    return output.join('');
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromBoolean',
function(anObject, optFormat) {

    return '<span class="sherpa_pp Number">' +
            this.runJSModeOn(TP.str(anObject)) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromDate',
function(anObject, optFormat) {

    var obj,
        format;

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    //  Believe it or not, objects that are not a Date can make it to this
    //  routine. They are usually invalid Dates that were created with bad
    //  syntax. Their type and type name report 'Date', but they're not. We need
    //  to catch them here before we try to 'toISOString()' them below.
    if (TP.isInvalidDate(anObject)) {
        return this.fromString('Invalid Date', format);
    }

    obj = anObject.toISOString().asEscapedXML();
    return '<span class="sherpa_pp Number">' +
            this.runJSModeOn(obj) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromError',
function(anObject, optFormat) {

    var str,
        format,
        stackStr,
        stackEntries;

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    format.atPut('cmdBox', false);
    format.atPut('cmdAsIs', true);
    format.atPut('cmdAwaken', false);

    if (TP.notEmpty(anObject.message)) {
        str = anObject.message;
    } else {
        str = '';
    }

    if (TP.sys.shouldLogStack() && TP.sys.cfg('sherpa.console_stack') &&
        TP.notEmpty(stackEntries = TP.getStackInfo(anObject))) {
        stackStr = '';

        stackStr = stackEntries.collect(
            function(infoPiece) {
                var infoStr;

                infoStr =
                    'at ' +
                    infoPiece.at(0) +
                    '(' +
                    infoPiece.at(1) +
                    ':' +
                    infoPiece.at(2) +
                    ':' +
                    infoPiece.at(3) +
                    ')\n';
                return infoStr;
            });
        str += '\n' + stackStr.join('');
    }

    return '<span class="sherpa_pp Error">' + str + '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromFunction',
function(anObject, optFormat) {

    var str,
        obj,
        format,
        level,
        sigonly;

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    level = format.at('currentLevel');
    if (level && level >= TP.sys.cfg('sherpa.pp.function_level')) {
        sigonly = true;
    }

    if (sigonly) {
        try {
            str = anObject.getSignature();
            if (TP.sys.cfg('sherpa.pp.function_comments')) {
                str += '\n' + TP.ifInvalid(anObject.getCommentText(), '');
            }
        } catch (e) {
            //  Must not have been an instrumented function. Fall back.
            str = anObject.toString();
            str = str.slice(str.indexOf('{'));
        }

        obj = str;
    } else {
        obj = anObject;
    }

    if (TP.isValid(TP.extern.CodeMirror)) {
        str = this.runJSModeOn(obj);

        str = str.replace(/\n/g, '<br/>');

        return '<span class="sherpa_pp Function">' +
                str +
                '</span>';
    } else {
        str = TP.str(obj);

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
        format,
        len,
        i,
        item;

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    //  Don't need to box output from our own markup generator.
    format.atPut('cmdBox', false);
    format.atPut('cmdAsIs', true);
    format.atPut('cmdAwaken', false);

    content = TP.ac();

    len = anObject.length;
    for (i = 0; i < len; i++) {
        item = anObject.item(i);

        content.push('<span data-name="' + TP.name(item).asEscapedXML() + '">',
                        TP.format(TP.val(item), TP.sherpa.pp.Type, format),
                        '</span>');
    }

    return '<span class="sherpa_pp NamedNodeMap">' +
            content.join('') +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromNode',
function(anObject, optFormat) {

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_sherpa_pp';
    if (TP.owns(anObject, marker)) {
        return TP.recursion(anObject, marker);
    }

    try {
        anObject[marker] = true;
    } catch (e) {
        void 0;
    }

    try {
        if (TP.isValid(TP.extern.CodeMirror)) {
            str = this.runXMLModeOn(anObject);
            str = str.replace(/\n/g, '<br/>');

        } else {
            str = TP.str(anObject).asEscapedXML();
        }

        str = '<span class="sherpa_pp Node">' +
            str + '</span>';
    } finally {
        try {
            delete anObject[marker];
        } catch (e) {
            void 0;
        }
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromNodeList',
function(anObject, optFormat) {

    var content,
        format,
        len,
        i;

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    //  If an optional format was supplied, then, if it has a level, check the
    //  level and if we're at that level, then just print the name of the
    //  object. If we haven't, increment the level and proceed.
    if (format.at('currentLevel') >= format.at('level')) {
        return TP.name(anObject);
    } else if (TP.notValid(format.at('currentLevel'))) {
        format.atPut('currentLevel', 1);
    } else {
        format.atPut('currentLevel', format.at('currentLevel') + 1);
    }

    //  Don't need to box output from our own markup generator.
    format.atPut('cmdBox', false);
    format.atPut('cmdAsIs', true);
    format.atPut('cmdAwaken', false);

    content = TP.ac();

    len = anObject.length;
    for (i = 0; i < len; i++) {
        content.push(
                '<span data-name="', TP.str(i).asEscapedXML(), '">',
                    TP.format(anObject[i], TP.sherpa.pp.Type, format),
                '</span>');
    }

    //  Decrement the traversal level
    format.atPut('currentLevel', format.at('currentLevel') - 1);

    return '<span class="sherpa_pp NodeList">' + content.join('') + '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromNumber',
function(anObject, optFormat) {

    var obj,
        format;

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    format.atPut('cmdBox', false);
    format.atPut('cmdAsIs', true);
    format.atPut('cmdAwaken', false);

    //  Believe it or not, objects that are NaNs can make it to this routine.
    //  Their type and type name report 'Number', but they're not. We should
    //  catch them here.
    if (TP.isNaN(anObject)) {
        return this.fromString('NaN', format);
    }

    obj = anObject.asEscapedXML();
    return '<span class="sherpa_pp Number">' +
            this.runJSModeOn(obj) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromObject',
function(anObject, optFormat) {

    var marker,
        output,
        formatInLoop,
        format,
        keys,
        key,
        value,
        i,
        len;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_sherpa_pp';
    if (TP.owns(anObject, marker)) {
        return TP.recursion(anObject, marker);
    }

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    format.atPut('cmdBox', false);
    format.atPut('cmdAsIs', true);
    format.atPut('cmdAwaken', false);

    if (TP.isEmpty(TP.keys(anObject))) {
        return this.fromString('{}', format);
    }

    //  If an optional format was supplied, then, if it has a level, check the
    //  level and if we're at that level, then just print the name of the
    //  object. If we haven't, increment the level and proceed.
    if (format.at('currentLevel') >= format.at('level')) {
        return TP.name(anObject);
    } else if (TP.notValid(format.at('currentLevel'))) {
        format.atPut('currentLevel', 1);
    } else {
        format.atPut('currentLevel', format.at('currentLevel') + 1);
    }

    try {
        anObject[marker] = true;
    } catch (e) {
        void 0;
    }

    output = TP.ac();
    output.push('<span class="sherpa_pp Object">');

    formatInLoop = true;
    try {
        keys = TP.keys(anObject);
    } catch (e) {
        formatInLoop = false;
        try {
            // Some objects don't even like Object.keys....sigh...
            output.push('<span data-name="value">',
                        Object.prototype.toString.call(anObject),
                        '</span>');
        } catch (e2) {
            //  And some don't even like that... double sigh...
            output.push('<span data-name="value">',
                        '[object Object]',
                        '</span>');
        }
    }

    if (formatInLoop) {

        keys.compact();
        len = keys.getSize();

        try {
            for (i = 0; i < len; i++) {
                key = keys.at(i);
                value = TP.format(anObject[key], TP.sherpa.pp.Type, format);
                // value = value.asEscapedXML();

                output.push(
                    '<span data-name="' + TP.str(key).asEscapedXML() + '">',
                    value,
                    '</span>');
            }
        } catch (e) {
            output.push(e.message);
        }
    }

    output.push('</span>');

    //  Decrement the traversal level
    format.atPut('currentLevel', format.at('currentLevel') - 1);

    try {
        delete anObject[marker];
    } catch (e) {
        void 0;
    }

    return output.join('');
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromRegExp',
function(anObject, optFormat) {

    var obj;

    obj = anObject.asEscapedXML();

    return '<span class="sherpa_pp RegExp">' +
            this.runJSModeOn(obj) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromString',
function(anObject, optFormat) {

    var obj;

    if (TP.isEmpty(anObject)) {
        return this.runJSModeOn('\'\'');
    }

    if (TP.regex.STARTS_WITH_ELEM_MARKUP.test(anObject)) {
        obj = TP.str(anObject);

        return '<span class="sherpa_pp String">' +
                this.runXMLModeOn(obj) +
                '</span>';
    } else {

        obj = anObject;

        if (TP.isJSONString(obj)) {
            return '<span class="sherpa_pp String">' +
                    this.runJSONModeOn(obj) +
                    '</span>';
        } else {
            return '<span class="sherpa_pp String">' +
                    this.runJSModeOn(obj) +
                    '</span>';
        }
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_boot_Annotation',
function(anObject, optFormat) {

    //  Annotations are an object/message pairing within a primitive
    //  wrapper. The object in TP.boot.Annotation instances is almost always
    //  an Error object of some kind.

    return '<span class="sherpa_pp TP_boot_Annotation">' +
                '<span data-name="object">' +
                    TP.xhtmlstr(anObject.object) +
                '</span>' +
                '<span data-name="message">' +
                    TP.xhtmlstr(anObject.message) +
                '</span>' +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_boot_Log',
function(anObject, optFormat) {

    var getLogLevelName,

        obj,

        str,
        len,
        i;

    getLogLevelName = function(aLogLevel) {

        switch (aLogLevel) {
            case TP.boot.TRACE:
                return 'trace';
            case TP.boot.DEBUG:
                return 'debug';
            case TP.boot.INFO:
                return 'info';
            case TP.boot.WARN:
                return 'warn';
            case TP.boot.ERROR:
                return 'error';
            case TP.boot.FATAL:
                return 'fatal';
            case TP.boot.SYSTEM:
                return 'system';
            default:
                return 'trace';
        }
    };

    obj = anObject.getEntries();

    str = '';
    len = obj.getSize();

    for (i = 0; i < len; i++) {
        str += '<span>';
        str += '<span data-name="timestamp">' +
                    (obj[i][TP.boot.LOG_ENTRY_DATE] ?
                    obj[i][TP.boot.LOG_ENTRY_DATE].getTime() :
                    '') +
                '</span>' +
                '<span data-name="log-name">' +
                    (obj[i][TP.boot.LOG_ENTRY_NAME] ?
                    ' ' + obj[i][TP.boot.LOG_ENTRY_NAME] :
                    '') +
                '</span>' +
                '<span data-name="log-level">' +
                    (obj[i][TP.boot.LOG_ENTRY_LEVEL] ?
                    '- ' + getLogLevelName(obj[i][TP.boot.LOG_ENTRY_LEVEL]) :
                    '') +
                '</span>' +
                '<span data-name="log-entry">' +
                    (obj[i][TP.boot.LOG_ENTRY_PAYLOAD] ?
                    obj[i][TP.boot.LOG_ENTRY_PAYLOAD].asEscapedXML() :
                    '') +
                '</span>' +
                '<span data-name="log-delta">' +
                    (obj[i][TP.boot.LOG_ENTRY_DELTA] ?
                    '' + obj[i][TP.boot.LOG_ENTRY_DELTA].asEscapedXML() :
                    '') +
                '</span>';

        str += '</span>';
    }

    return '<span class="sherpa_pp TP_boot_Log">' +
            str +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_core_JSONContent',
function(anObject, optFormat) {

    if (TP.isValid(TP.extern.CodeMirror)) {
        return '<span class="sherpa_pp TP_core_JSONContent">' +
                    this.runJSONModeOn(anObject) +
                '</span>';
    } else {
        return '<span class="sherpa_pp TP_core_JSONContent">' +
                    anObject.asString().asEscapedXML() +
                '</span>';
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_core_Hash',
function(anObject, optFormat) {

    var marker,
        format,
        output,
        keys,
        key,
        len,
        i;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_sherpa_pp';
    if (TP.owns(anObject, marker)) {
        return TP.recursion(anObject, marker);
    }

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    format.atPut('cmdBox', false);
    format.atPut('cmdAsIs', true);
    format.atPut('cmdAwaken', false);

    //  If an optional format was supplied, then, if it has a level, check the
    //  level and if we're at that level, then just print the name of the
    //  object. If we haven't, increment the level and proceed.
    if (format.at('currentLevel') >= format.at('level')) {
        return TP.name(anObject);
    } else if (TP.notValid(format.at('currentLevel'))) {
        format.atPut('currentLevel', 1);
    } else {
        format.atPut('currentLevel', format.at('currentLevel') + 1);
    }

    if (TP.isEmpty(anObject)) {
        return this.fromString('TP.hc()', format);
    }

    try {
        anObject[marker] = true;
    } catch (e) {
        void 0;
    }

    output = TP.ac();
    output.push('<span class="sherpa_pp TP_core_Hash">');

    keys = TP.keys(anObject);
    keys.compact();
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);

        output.push('<span data-name="' + TP.str(key).asEscapedXML() + '">' +
                    TP.format(anObject.at(keys.at(i)),
                                TP.sherpa.pp.Type,
                                format),
                    '</span>');
    }

    output.push('</span>');

    //  Decrement the traversal level
    format.atPut('currentLevel', format.at('currentLevel') - 1);

    try {
        delete anObject[marker];
    } catch (e) {
        void 0;
    }

    return output.join('');
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_core_Node',
function(anObject, optFormat) {

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_sherpa_pp';
    if (TP.owns(anObject, marker)) {
        return TP.recursion(anObject, marker);
    }

    try {
        anObject[marker] = true;
    } catch (e) {
        void 0;
    }

    if (TP.isValid(TP.extern.CodeMirror)) {
        str = this.runXMLModeOn(TP.unwrap(anObject));
        str = str.replace(/\n/g, '<br/>');
    } else {
        str = TP.str(anObject).asEscapedXML();
    }

    str = '<span class="sherpa_pp TP_core_Node">' +
            str +
            '</span>';

    try {
        delete anObject[marker];
    } catch (e) {
        void 0;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_sig_ShellRequest',
function(anObject, optFormat) {

    var marker,
        data,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_sherpa_pp';
    if (TP.owns(anObject, marker)) {
        return TP.recursion(anObject, marker);
    }

    try {
        anObject[marker] = true;
    } catch (e) {
        void 0;
    }

    // Requests that are not yet processed should format their command.
    if (anObject.isCompleted()) {
        data = anObject.getResult();
    } else {
        data = anObject.at('cmd');
    }

    str = '<span class="sherpa_pp">' + data + '</span>';

    try {
        delete anObject[marker];
    } catch (e) {
        void 0;
    }

    return str;
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

        content,

        keys,
        len,
        i;

    nativeWin = anObject.getNativeWindow();

    content = TP.ac();

    keys = TP.sys.$windowkeys;
    len = keys.length;
    for (i = 0; i < len; i++) {
        if (keys[i] === 'document') {
            content.push('<span data-name="', keys[i], '">',
                        TP.str(nativeWin.document).asEscapedXML(), '</span>');
            continue;
        }

        try {
            content.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(nativeWin[keys[i]]), '</span>');
        } catch (e) {
            content.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(undefined), '</span>');
        }
    }

    return '<span class="sherpa_pp TP_core_Window" gid="' +
                TP.gid(anObject) + '">' +
            content.join('') +
            '</span>';
});

//  ------------------------------------------------------------------------

//  Since this is supplied on TP.lang.RootObject, we need to 'rewire' it here
TP.sherpa.pp.Type.defineMethod('fromTP_sig_Signal', TP.sherpa.pp.fromObject);

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromWindow',
function(anObject, optFormat) {

    var content,

        keys,
        len,
        i;

    content = TP.ac();

    keys = TP.sys.$windowkeys;
    len = keys.length;

    for (i = 0; i < len; i++) {
        if (keys[i] === 'document') {
            content.push('<span data-name="', keys[i].asEscapedXML(), '">',
                        TP.str(anObject.document).asEscapedXML(), '</span>');
            continue;
        }

        try {
            content.push('<span data-name="', keys[i].asEscapedXML(), '">',
                        TP.htmlstr(anObject[keys[i]]), '</span>');
        } catch (e) {
            content.push('<span data-name="', keys[i].asEscapedXML(), '">',
                        TP.htmlstr(undefined), '</span>');
        }
    }

    return '<span class="sherpa_pp Window" gid="' + TP.gid(anObject) + '">' +
            content.join('') +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('runCSSModeOn',
function(anObject) {

    var str;

    str = '';
    TP.extern.CodeMirror.runMode(
        TP.str(anObject),
        {
            name: 'css'
        },
        function(text, style) {

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
        function(text, style) {

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

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('runJSONModeOn',
function(anObject, optFormat) {

    var str,

        level,
        tabSpaces,

        newlineChar,
        indentChar,
        newlineCharSize,

        plainText;

    if (TP.isValid(TP.extern.CodeMirror)) {

        str = '';
        level = 0;
        tabSpaces = 4;

        if (TP.isValid(optFormat) &&
            optFormat.at('outputFormat') === TP.PLAIN_TEXT_ENCODED) {

            newlineChar = '\n';
            indentChar = ' ';

            newlineCharSize = 1;

            plainText = true;
        } else {
            newlineChar = '<br/>';
            indentChar = '&#160;';

            newlineCharSize = 5;

            plainText = false;
        }

        TP.extern.CodeMirror.runMode(
            anObject.asString(),
            {
                name: 'application/ld+json'
            },
            function(text, style) {

                //  Collapse a brace followed by a comma with a brace coming
                //  next to a single line
                if (text === '{' &&
                    str.slice(-(newlineCharSize + 2)) === '},' + newlineChar) {

                    str = str.slice(0, -newlineCharSize) + indentChar;
                } else if (str.slice(-newlineCharSize) === newlineChar) {
                    //  Otherwise, if we're starting a new line, 'tab in' the
                    //  proper number of spaces.
                    str += indentChar.times(level * tabSpaces);
                }

                if (style) {

                    if (plainText) {
                        str += text;
                    } else {
                        str += '<span class="cm-' + style + '">' +
                                 text.asEscapedXML() +
                                 '</span>';
                    }
                } else {
                    if (text === '{' || text === '[') {
                        level++;
                        str += text + newlineChar +
                                indentChar.times(level * tabSpaces);
                    }
                    if (text === '}' || text === ']') {
                        level--;
                        str += newlineChar +
                                indentChar.times(level * tabSpaces) + text;
                    }
                    if (text === ':') {
                        str += indentChar + text + indentChar;
                    }
                    if (text === ',') {
                        str += text + newlineChar +
                                indentChar.times(level * tabSpaces);
                    }
                }
            });
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('runXMLModeOn',
function(anObject) {

    var str;

    str = '';
    TP.extern.CodeMirror.runMode(
        TP.str(anObject),
        {
            name: 'application/xml'
        },
        function(text, style) {

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

TP.sherpa.pp.Type.defineMethod('transformError',
function(anObject, optFormat) {

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

    var methodName,
        format;

    format = TP.hc(optFormat);
    format.atPutIfAbsent('level', TP.sys.cfg('sherpa.pp.level'));

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    format.atPut('cmdBox', false);
    format.atPut('cmdAsIs', true);
    format.atPut('cmdAwaken', false);

    //  Sometimes, we're invoked because we were handed an Object that lives in
    //  a Window that wasn't instrumented with TIBET. We try to redispatch
    //  against a matching from*() method on ourself that would do the job.

    if (TP.notValid(anObject)) {
        // 'null' or 'undefined', as you'd expect.
        if (anObject === null) {
            return this.transformNull(anObject, format);
        } else if (anObject === undefined) {
            return this.transformUndefined(anObject, format);
        }

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
