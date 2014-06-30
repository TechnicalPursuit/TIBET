//  ========================================================================
/*
NAME:   tsh_pp.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.tsh.pp}
 * @synopsis The default "pretty-print" formatter for the TIBET Shell. Since
 *     this type is a formatter at heart most of the methods are built to
 *     support decent output for common JavaScript data types.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('tsh:pp');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Objects that respond to as()/from()
//  ------------------------------------------------------------------------

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
        if (count > (colcount - 1)) {
            count = 0;
        }

        output.push('<span data-name="', i, '">',
                    TP.format(anObject.at(i), 'TP.tsh.pp', optFormat),
                    '<\/span>');

        count++;
    }

    output.push('<\/span><\/span>');

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_tsh_pp;

    return output.join('');
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
        arr.push(
                '<span data-name="key">',
                    TP.name(anObject.item(i)),
                '<\/span>',
                '<span data-name="value">',
                    TP.val(anObject.item(i)),
                '<\/span>');
    }
    arr.push('<\/span>');

    return '<span class="tsh_pp">' + arr.join('') + '<\/span>';
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
            '<\/span>';
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
        arr.push(
                '<span data-name="', i, '">',
                    TP.str(anObject[i]).asEscapedXML(),
                '<\/span>');
    }
    arr.push('<\/span>');

    return '<span class="tsh_pp">' + arr.join('') + '<\/span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromObject',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator, and we want the
    //  markup here to actually render, but not awake.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    if (anObject === TP || anObject === TP.sys) {
        return '<span class="tsh_pp">' +
                TP.htmlstr(TP.keys(anObject).sort()) +
                '<\/span>';
    }

    return '<span class="tsh_pp">' + TP.htmlstr(anObject) + '<\/span>';
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

    return '<span class="tsh_pp">' + TP.htmlstr(obj) + '<\/span>';
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
                        TP.htmlstr(anObject.object) +
                    '<\/span>' +
                    '<span data-name="message">' +
                        TP.htmlstr(anObject.message) +
                    '<\/span>' +
                '<\/span>' +
            '<\/span>';
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
                    obj[i][TP.LOG_ENTRY_DATE] +
                '<\/span>' +
                '<span class="String" data-name="log-name">' +
                    obj[i][TP.LOG_ENTRY_NAME] +
                '<\/span>' +
                '<span class="Number" data-name="log-level">' +
                    obj[i][TP.LOG_ENTRY_LEVEL] +
                '<\/span>' +
                '<span class="String" data-name="log-entry">' +
                    obj[i][TP.LOG_ENTRY_PAYLOAD] +
                '<\/span>' +
                '<span class="String" data-name="log-context">' +
                    obj[i][TP.LOG_ENTRY_CONTEXT] +
                '<\/span>' +
                '<span class="String" data-name="log-delta">' +
                    obj[i][TP.LOG_ENTRY_DELTA] +
                '<\/span>';
    }

    return '<span class="tsh_pp">' +
            str +
            '<\/span>';
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_lang_Hash',
function(anObject, optFormat) {

    var output,
        keys,
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

    output.push('<span class="tsh_pp"><span class="TP_lang_Hash">');

    keys = TP.keys(anObject);
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        output.push('<span data-name="', keys.at(i), '">',
                        TP.format(anObject.at(keys.at(i)),
                                    'TP.tsh.pp',
                                    optFormat),
                    '<\/span>');
    }

    output.push('<\/span><\/span>');

    //  We're done - we can remove the recursion flag.
    delete anObject.$$format_tsh_pp;

    return output.join('');
});

//  ------------------------------------------------------------------------

TP.tsh.pp.Type.defineMethod('fromTP_core_Node',
function(anObject, optFormat) {

    //  Don't need to box output from our own markup generator.
    if (TP.isValid(optFormat)) {
        optFormat.atPut('cmdBox', false);
        optFormat.atPut('cmdAsIs', true);
        optFormat.atPut('cmdAwaken', false);
    }

    return '<span class="tsh_pp">' +
            TP.str(anObject.getNativeNode()).asEscapedXML() +
            '<\/span>';
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

    arr.push('<span class="TP_core_Window ',
                TP.escapeTypeName(TP.tname(nativeWin)), '">',
                '<span class="Window" gid="', TP.gid(nativeWin), '">');

    for (i = 0; i < len; i++) {
        if (keys[i] === 'document') {
            arr.push('<span data-name="', keys[i], '">',
                        TP.str(nativeWin.document).asEscapedXML(), '<\/span>');
            continue;
        }

        try {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(nativeWin[keys[i]]), '<\/span>');
        } catch (e) {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(undefined), '<\/span>');
        }
    }

    arr.push('<\/span><\/span>');

    return '<span class="tsh_pp">' + arr.join('') + '<\/span>';
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

    arr.push('<span class="Window" gid="', TP.gid(anObject), '">');

    for (i = 0; i < len; i++) {
        if (keys[i] === 'document') {
            arr.push('<span data-name="', keys[i], '">',
                        TP.str(anObject.document).asEscapedXML(), '<\/span>');
            continue;
        }

        try {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(anObject[keys[i]]), '<\/span>');
        } catch (e) {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(undefined), '<\/span>');
        }
    }

    arr.push('<\/span>');

    return '<span class="tsh_pp">' + arr.join('') + '<\/span>';
});

//  ------------------------------------------------------------------------
//  Objects that can't an as()/from() can't be computed from
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

    //  We only try this if we were not 'null' or 'undefined'.
    if (TP.isValid(anObject)) {
        if (TP.notEmpty(methodName =
                        this.getBestMethodName(arguments, anObject, 'from'))) {
            return this[methodName].apply(this, arguments);
        }
    }

    return '<span class="tsh_pp">' + TP.htmlstr(anObject) + '<\/span>';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
