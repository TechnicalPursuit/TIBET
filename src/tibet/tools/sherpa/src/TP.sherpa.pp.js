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

    var output,

        len,
        i;

    if (TP.isEmpty(anObject)) {
        return this.fromString('[]', optFormat);
    }

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (anObject.$$format_sherpa_pp) {
        return TP.recursion(anObject);
    }

    //  If an optional format was supplied, then, if it has a level, check the
    //  level and if we're at that level, then just print the name of the
    //  object. If we haven't, increment the level and proceed.
    if (TP.isValid(optFormat)) {
        if (optFormat.at('currentLevel') >= optFormat.at('level')) {
            return TP.name(anObject);
        } else if (TP.notValid(optFormat.at('currentLevel'))) {
            optFormat.atPut('currentLevel', 1);
        } else {
            optFormat.atPut('currentLevel', optFormat.at('currentLevel') + 1);
        }
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
    output.push('<span class="sherpa_pp Array">');

    len = anObject.getSize();
    for (i = 0; i < len; i++) {
        output.push('<span data-name="', i, '">',
                    TP.format(anObject.at(i), TP.sherpa.pp.Type, optFormat),
                    '</span>');
    }

    output.push('</span>');

    //  Decrement the traversal level
    if (TP.isValid(optFormat)) {
        optFormat.atPut('currentLevel', optFormat.at('currentLevel') - 1);
    }

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

    //  Believe it or not, objects that are not a Date can make it to this
    //  routine. They are usually invalid Dates that were created with bad
    //  syntax. Their type and type name report 'Date', but they're not. We need
    //  to catch them here before we try to 'toISOString()' them below.
    if (TP.isInvalidDate(anObject)) {
        return this.fromString('Invalid Date', optFormat);
    }

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

    var str,

        stackStr,
        stackEntries,

        thisArg;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    str = this.fromString(anObject.message);

    if (TP.sys.shouldLogStack() &&
        TP.notEmpty(stackEntries = TP.getStackInfo(anObject))) {
        stackStr = '';

        thisArg = this;
        stackStr = stackEntries.collect(
            function(infoPiece) {
                var infoStr;

                infoStr =
                    'at ' +
                    thisArg.fromString(infoPiece.at(0), optFormat) +
                    '(' +
                    thisArg.fromString(infoPiece.at(1), optFormat) +
                    ':' +
                    thisArg.fromString(infoPiece.at(2), optFormat) +
                    ':' +
                    thisArg.fromString(infoPiece.at(3), optFormat) +
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

        content.push('<span data-name="' + TP.name(item).asEscapedXML() + '">',
                        TP.format(TP.val(item), TP.sherpa.pp.Type, optFormat),
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

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    if (TP.isValid(TP.extern.CodeMirror)) {
        str = this.runXMLModeOn(anObject);
        str = str.replace(/\n/g, '<br/>');

    } else {
        str = TP.str(anObject).asEscapedXML();
    }

    str = '<span class="sherpa_pp Node">' +
            str +
            '</span>';

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_sherpa_pp;

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromNodeList',
function(anObject, optFormat) {

    var content,

        len,
        i;

    //  If an optional format was supplied, then, if it has a level, check the
    //  level and if we're at that level, then just print the name of the
    //  object. If we haven't, increment the level and proceed.
    if (TP.isValid(optFormat)) {
        if (optFormat.at('currentLevel') >= optFormat.at('level')) {
            return TP.name(anObject);
        } else if (TP.notValid(optFormat.at('currentLevel'))) {
            optFormat.atPut('currentLevel', 1);
        } else {
            optFormat.atPut('currentLevel', optFormat.at('currentLevel') + 1);
        }
    }

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    content = TP.ac();

    len = anObject.length;
    for (i = 0; i < len; i++) {
        content.push(
                '<span data-name="', TP.str(i).asEscapedXML(), '">',
                    TP.format(anObject[i], TP.sherpa.pp.Type, optFormat),
                '</span>');
    }

    //  Decrement the traversal level
    if (TP.isValid(optFormat)) {
        optFormat.atPut('currentLevel', optFormat.at('currentLevel') - 1);
    }

    return '<span class="sherpa_pp NodeList">' + content.join('') + '</span>';
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromNumber',
function(anObject, optFormat) {

    var obj;

    //  Believe it or not, objects that are NaNs can make it to this routine.
    //  Their type and type name report 'Number', but they're not. We should
    //  catch them here.
    if (TP.isNaN(anObject)) {
        return this.fromString('NaN', optFormat);
    }

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

    var output,

        formatInLoop,

        keys,
        key,
        value,

        i,
        len;

    if (TP.isEmpty(TP.keys(anObject))) {
        return this.fromString('{}', optFormat);
    }

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (anObject.$$format_sherpa_pp) {
        return TP.recursion(anObject);
    }

    //  If an optional format was supplied, then, if it has a level, check the
    //  level and if we're at that level, then just print the name of the
    //  object. If we haven't, increment the level and proceed.
    if (TP.isValid(optFormat)) {
        if (optFormat.at('currentLevel') >= optFormat.at('level')) {
            return TP.name(anObject);
        } else if (TP.notValid(optFormat.at('currentLevel'))) {
            optFormat.atPut('currentLevel', 1);
        } else {
            optFormat.atPut('currentLevel', optFormat.at('currentLevel') + 1);
        }
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

        keys.sort();
        keys.compact();
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            key = keys.at(i);
            value = TP.format(anObject[key], TP.sherpa.pp.Type, optFormat);
            //value = value.asEscapedXML();

            output.push(
                '<span data-name="' + TP.str(key).asEscapedXML() + '">',
                value,
                '</span>');
        }
    }

    output.push('</span>');

    //  Decrement the traversal level
    if (TP.isValid(optFormat)) {
        optFormat.atPut('currentLevel', optFormat.at('currentLevel') - 1);
    }

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_sherpa_pp;

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

    if (TP.isEmpty(anObject)) {
        return this.runJSModeOn('\'\'');
    }

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

        obj = TP.str(anObject);

        return '<span class="sherpa_pp String">' +
                this.runXMLModeOn(obj) +
                '</span>';
    } else {

        obj = anObject;

        return '<span class="sherpa_pp String">' +
                this.runJSModeOn(obj) +
                '</span>';
    }
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

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

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
            case TP.boot.SEVERE:
                return 'severe';
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
            function(text, style) {

                //  Collapse a brace followed by a comma with a brace coming
                //  next to a single line
                if (text === '{' && str.slice(-7) === '},<br/>') {
                    str = str.slice(0, -5) + '&#160;';
                } else if (str.slice(-5) === '<br/>') {
                    //  Otherwise, if we're starting a new line, 'tab in' the
                    //  proper number of spaces.
                    str += '&#160;'.times(level * tabSpaces);
                }

                if (style) {
                    str += '<span class="cm-' + style + '">' +
                             text.asEscapedXML() +
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

    if (TP.isEmpty(anObject)) {
        return this.fromString('TP.hc()', optFormat);
    }

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (anObject.$$format_sherpa_pp) {
        return TP.recursion(anObject);
    }

    //  If an optional format was supplied, then, if it has a level, check the
    //  level and if we're at that level, then just print the name of the
    //  object. If we haven't, increment the level and proceed.
    if (TP.isValid(optFormat)) {
        if (optFormat.at('currentLevel') >= optFormat.at('level')) {
            return TP.name(anObject);
        } else if (TP.notValid(optFormat.at('currentLevel'))) {
            optFormat.atPut('currentLevel', 1);
        } else {
            optFormat.atPut('currentLevel', optFormat.at('currentLevel') + 1);
        }
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

        output.push('<span data-name="' + TP.str(key).asEscapedXML() + '">' +
                    TP.format(anObject.at(keys.at(i)),
                                TP.sherpa.pp.Type,
                                optFormat),
                    '</span>');
    }

    output.push('</span>');

    //  Decrement the traversal level
    if (TP.isValid(optFormat)) {
        optFormat.atPut('currentLevel', optFormat.at('currentLevel') - 1);
    }

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_sherpa_pp;

    return output.join('');
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_core_Node',
function(anObject, optFormat) {

    var str;

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

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
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

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_sherpa_pp;

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.pp.Type.defineMethod('fromTP_sig_ShellRequest',
function(anObject, optFormat) {

    var data,
        str;

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

    str = '<span class="sherpa_pp">' + data + '</span>';

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_sherpa_pp;

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

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

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

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

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
        if (anObject === null) {
            return this.transformNull(anObject, optFormat);
        } else if (anObject === undefined) {
            return this.transformUndefined(anObject, optFormat);
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
