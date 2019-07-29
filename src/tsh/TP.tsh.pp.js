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
 * @type {TP.tsh.pp}
 * @summary The default "pretty-print" formatter for the TIBET Shell. Since
 *     this type is a formatter at heart most of the methods are built to
 *     support decent output for common JavaScript data types.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('tsh.pp');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ========================================================================
//  Objects with as() but without an asTP_tsh_pp...
//  ========================================================================

TP.tsh.pp.Type.defineMethod('fromArray',
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
    if (anObject.$$format_tsh_pp) {
        return TP.recursion(anObject);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    anObject.$$format_tsh_pp = true;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    len = anObject.getSize();

    output = TP.ac();

    output.push('<span class="tsh_pp"><span class="Array">');

    count = 0;
    colcount = 1;

    for (i = 0; i < len; i++) {
        if (count > colcount - 1) {
            count = 0;
        }

        output.push('<span data-name="' + i + '">' +
            TP.boot.$stringify(anObject.at(i), '', true) +
                    '</span>');

        count++;
    }

    output.push('</span></span>');

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_tsh_pp;

    return output.join('\n');
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromBoolean',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="tsh_pp">' + anObject.toString() + '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromDate',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="tsh_pp">' + anObject.toISOString() + '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromError',
function(anObject, optFormat) {

    var stackStr,
        stackEntries;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    stackStr = '';
    if (TP.sys.shouldLogStack() &&
        TP.notEmpty(stackEntries = TP.getStackInfo(anObject))) {
        stackStr = '<br/>' +
                    stackEntries.collect(
                        function(infoPiece) {
                            return infoPiece.asEscapedXML();
                        }).join('<br/>');
    }

    return '<span class="tsh_pp">' +
                anObject.message.asEscapedXML() +
                stackStr +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromFunction',
function(anObject, optFormat) {

    var str;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    str = TP.str(anObject);

    //  NOTE the CDATA blocks here combined with <pre> to hold on to remaining
    //  whitespace while ensuring we ignore any embedded < or > symbols etc.
    return '<span class="tsh_pp Function"><pre><![CDATA[' + str +
        ']]></pre></span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromNamedNodeMap',
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
    arr.push('<span class="NamedNodeMap">');
    for (i = 0; i < len; i++) {
        arr.push('<span data-name="key">' +
                    TP.name(anObject.item(i)) +
                '</span>' + '\n' +
                '<span data-name="value">' +
                    TP.val(anObject.item(i)) +
                '</span>');
    }
    arr.push('</span>');

    return '<span class="tsh_pp">' + arr.join('\n') + '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromNode',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="tsh_pp">' +
            TP.str(anObject).asEscapedXML() +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromNodeList',
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
    arr.push('<span class="NodeList">');
    for (i = 0; i < len; i++) {
        arr.push('<span data-name="' + i + '">' +
            TP.str(anObject[i]).asEscapedXML() +
        '</span>');
    }
    arr.push('</span>');

    return '<span class="tsh_pp">' + arr.join('\n') + '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromNumber',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="tsh_pp">' + anObject.toString() + '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromObject',
function(anObject, optFormat) {

    var type,
        output,
        i,
        len,
        keys,
        key;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    if (TP.notValid(anObject)) {
        // 'null' or 'undefined', as you'd expect.
        return '<span class="tsh_pp">' + anObject + '</span>';
    }

    type = TP.name(TP.type(anObject)).replace(/\./g, '_');
    output = TP.ac();

    output.push('<span class="tsh_pp"><span class="' + type + '">');

    keys = TP.keys(anObject);
    keys.sort();
    keys.compact();
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);

        output.push('<span data-name="' + key + '">' +
            TP.boot.$stringify(anObject[keys.at(i)], '\n', true) +
                    '</span>');
    }

    output.push('</span></span>');

    return output.join('\n');
    /*
    if (anObject === TP || anObject === TP.sys) {
        return '<span class="tsh_pp">' +
                TP.xhtmlstr(TP.keys(anObject).sort()) +
                '<\/span>';
    }

    return '<span class="tsh_pp">' + TP.xhtmlstr(anObject) + '<\/span>';
    */
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromRegExp',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="tsh_pp">' + anObject.toString() + '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromString',
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

    return '<span class="tsh_pp">' + TP.xhtmlstr(obj) + '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_boot_Annotation',
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

    return '<span class="tsh_pp">' +
                '<span class="TP_boot_Annotation">' +
                    '<span data-name="object">' +
                        TP.xhtmlstr(anObject.object) +
                    '</span>' +
                    '<span data-name="message">' +
                        TP.xhtmlstr(anObject.message) +
                    '</span>' +
                '</span>' +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_boot_Log',
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

    return '<span class="tsh_pp">' +
            str +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_core_JSONContent',
function(anObject, optFormat) {

    return '<span class="tsh_pp">' +
        anObject.asString().asEscapedXML() +
    '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_uri_URI',
function(anObject, optFormat) {

    return this.fromObject(anObject);
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_core_Hash',
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
    if (anObject.$$format_tsh_pp) {
        return TP.recursion(anObject);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    anObject.$$format_tsh_pp = true;

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    output = TP.ac();

    output.push('<span class="tsh_pp"><span class="TP_core_Hash">');

    keys = TP.keys(anObject);
    keys.sort();
    keys.compact();
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);

        output.push('<span data-name="' + key + '">' +
            TP.boot.$stringify(anObject.at(keys.at(i)), '\n', true) +
                    '</span>');
    }

    output.push('</span></span>');

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_tsh_pp;

    return output.join('\n');
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_dom_Node',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="tsh_pp">' +
            TP.str(anObject.getNativeNode()).asEscapedXML() +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_sig_ShellRequest',
function(anObject, optFormat) {

    var data;

    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    //  Requests that are not yet processed should format their command.
    if (anObject.isCompleted()) {
        data = anObject.getResult();
    } else {
        data = anObject.at('cmd');
    }

    return '<span class="tsh_pp">' + data + '</span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_core_Window',
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

    arr.push('<span class="TP_core_Window ' +
                TP.escapeTypeName(TP.tname(nativeWin)) + '">' +
                '<span class="Window" gid="' + TP.gid(nativeWin) + '">');

    for (i = 0; i < len; i++) {
        if (keys[i] === 'document') {
            arr.push('<span data-name="' + keys[i] + '">' +
                TP.str(nativeWin.document).asEscapedXML() + '</span>');
            continue;
        }

        try {
            arr.push('<span data-name="' + keys[i] + '">' +
                TP.xhtmlstr(nativeWin[keys[i]]) + '</span>');
        } catch (e) {
            arr.push('<span data-name="' + keys[i] + '">' +
                'undefined' + '</span>');
        }
    }

    arr.push('</span></span>');

    return '<span class="tsh_pp">' + arr.join('\n') + '</span>';
});

//  ------------------------------------------------------------------------

//  Since this is supplied on TP.lang.RootObject, we need to 'rewire' it here
TP.tsh.pp.Type.defineMethod('fromTP_sig_Signal', TP.tsh.pp.fromObject);

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromWindow',
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

    arr.push('<span class="Window" gid="' + TP.gid(anObject) + '">');

    for (i = 0; i < len; i++) {
        if (keys[i] === 'document') {
            arr.push('<span data-name="' + keys[i] + '">' +
                TP.str(anObject.document).asEscapedXML() + '</span>');
            continue;
        }

        try {
            arr.push('<span data-name="' + keys[i] + '">' +
                TP.xhtmlstr(anObject[keys[i]]) + '</span>');
        } catch (e) {
            arr.push('<span data-name="' + keys[i] + '">' +
                'undefined' + '</span>');
        }
    }

    arr.push('</span>');

    return '<span class="tsh_pp">' + arr.join('\n') + '</span>';
});

//  ========================================================================
//  Objects with no as() (invalid, Error, etc) attempt this.transform()
//  ========================================================================

TP.tsh.pp.Type.defineMethod('transformError',
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

TP.tsh.pp.Type.defineMethod('transformObject',
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
        return '<span class="tsh_pp">' + anObject + '</span>';
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
//  end
//  ========================================================================
