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
The types and methods in this file support data formatting, particularly
producing string representations for various input/output requirements.

NOTE: The functionality here is integrated with TP.i18n.Locale support to enable
formatters to be driven by the current locale.
*/

/* JSHint checking */

//  ========================================================================
//  Object Formatters
//  ========================================================================

/**
The methods defined in this section provide support for common data formats via
TIBET's as() and from() method interfaces. Using obj.as(format) where format is
any type will cause TIBET to automatically dispatch to either a local method
specific to the receiver, or to the type to invoke it's from() method. The
formats here support string and Node representations suitable for display or
storage of HTML, XML (defaulting to XMLRPC), or JSON strings.

When the format is a string the receiver's asString method is called. Many of
the common types in TIBET will respond to this by using type-specific rules for
processing format strings. For example, Date and Number allow you to provide a
UTC #35 (http://www.unicode.org/reports/tr35/tr35-4.html) format string.
*/

//  ------------------------------------------------------------------------
//  "AS" Support
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asHTMLNode',
function(aDocument) {

    /**
     * @method asHTMLNode
     * @summary Produces an HTML node representation of the receiver if
     *     possible. By default this method relies on the markup string produced
     *     by asHTMLString for source text. NOTE that when a string would
     *     produce multiple "top level" nodes for the receiver a document
     *     fragment is returned with the list.
     * @param {HTMLDocument} aDocument The document which should own the result
     *     node. Defaults to the current canvas's document.
     * @returns {Node} The receiver in HTML node format.
     */

    return TP.stringAsHTMLNode(this.asHTMLString(), aDocument);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    var marker,
        arr,
        keys,
        len,
        i,
        key;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asHTMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }

    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this[marker] = true;
    } catch (e) {
        void 0;
    }

    //  perform a simple conversion based on filtering rule if any

    arr = TP.ac();

    keys = this.getKeys();
    len = keys.getSize();

    arr.push('<span class="Object ', TP.escapeTypeName(TP.tname(this)), '">');

    try {
        for (i = 0; i < len; i++) {
            key = keys.at(i);
            arr.push('<span data-name="', key, '">',
                          TP.htmlstr(this.at(key)),
                        '</span>');
        }
    } finally {
        arr.push('</span>');
        try {
            delete this[marker];
        } catch (e) {
            void 0;
        }
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asXHTMLNode',
function() {

    /**
     * @method asXHTMLNode
     * @summary Produces an XHTML node representation of the receiver if
     *     possible. By default this method relies on the markup string produced
     *     by asXHTMLString for source text.
     * @returns {Node} The receiver in XHTML node format.
     */

    return TP.nodeFromString(this.asXHTMLString());
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asXHTMLString',
function() {

    /**
     * @method asXHTMLString
     * @summary Produces an XHTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XHTML string format.
     */

    return this.asString();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asXMLNode',
function() {

    /**
     * @method asXMLNode
     * @summary Produces an XML node representation of the receiver if
     *     possible. By default this method relies on the markup string produced
     *     by asXMLString for source text.
     * @returns {Node} The receiver in XML node format.
     */

    return TP.nodeFromString(this.asXMLString());
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asXMLString',
function(aFilterName) {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @param {String} aFilterName A get*Interface() filter spec.
     * @returns {String} The receiver in XML string format.
     */

    var marker,
        arr,
        keys,
        len,
        i,
        key;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asXMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }

    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this[marker] = true;
    } catch (e) {
        void 0;
    }

    //  perform a simple conversion based on filtering rule if any

    arr = TP.ac();

    keys = this.getKeys(aFilterName);
    len = keys.getSize();

    try {
        for (i = 0; i < len; i++) {
            key = keys.at(i);
            arr.push('<', key, '>', TP.xmlstr(this.at(key)), '</', key, '>');
        }
    } finally {
        try {
            delete this[marker];
        } catch (e) {
            void 0;
        }
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var marker,
        joinCh,
        joinArr,
        str,
        thisref,
        $depth,
        $level;

    this.$sortIfNeeded();

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asDumpString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinCh = this.$get('delimiter');

    if (!TP.isString(joinCh)) {
        //  If 'joinCh' is not a String, maybe it's a hash or other Object with
        //  a 'join' property.
        if (!TP.isString(joinCh = joinCh.get('join'))) {
            joinCh = '';
        }
    }

    str = '[' + TP.tname(this) + ' :: ';

    $depth = TP.ifInvalid(depth, 1);
    $level = TP.ifInvalid(level, 0);

    thisref = this;
    try {
        joinArr = this.collect(
            function(item, index) {
                if (item === thisref) {
                    if (TP.canInvoke(item, 'asRecursionString')) {
                        return item.asRecursionString();
                    } else {
                        return 'this';
                    }
                }

                if ($level > $depth && TP.isMutable(this)) {
                    return str + '@' + TP.id(this) + ']';
                } else {
                    return TP.dump(item, $depth, $level + 1);
                }
            });

        str += '[' + joinArr.join(joinCh) + ']]';
    } catch (e) {
        str += '[' + this.join(', ') + ']]';
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    var marker,
        arr,
        len,
        i;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asHTMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    arr = TP.ac();
    len = this.getSize();
    arr.push('<span class="Array">');

    try {
        for (i = 0; i < len; i++) {
            arr.push(
                '<span data-name="', i, '">',
                    TP.htmlstr(this.at(i)),
                '</span>');
        }
    } finally {
        arr.push('</span>');
        delete this[marker];
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var marker,
        joinArr,
        i,
        len,
        joinStr;

    this.$sortIfNeeded();

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asPrettyString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();
    len = this.getSize();

    try {
        for (i = 0; i < len; i++) {
            joinArr.push(
                TP.join('<dt class="pretty key">', i, '</dt>',
                        '<dd class="pretty value">',
                            TP.pretty(this.at(i)),
                        '</dd>'));
        }

        joinStr = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                        '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    joinArr.join('') +
                    '</dl>';
    } catch (e) {
        joinStr = Object.prototype.toString.call(this);
    } finally {
        delete this[marker];
    }

    return joinStr;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    var marker,
        arr,
        len,
        i;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asXMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    //  perform a simple conversion based on filtering rule if any
    arr = TP.ac();
    len = this.getSize();

    try {
        for (i = 0; i < len; i++) {
            arr.push(
                '<item index="', i, '">',
                    TP.xmlstr(this.at(i)),
                '</item>');
        }
    } finally {
        delete this[marker];
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty Boolean"><dt/><dd>' +
            TP.str(this) +
            '</dd></dl>';
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var str;

    str = '[' + TP.tname(this) + ' :: ';

    try {
        if (TP.sys.hasKernel()) {
            str += TP.sys.getLocale().localizeDate(this) + ']';
        } else {
            str += this.toUTCString() + ']';
        }
    } catch (e) {
        str += TP.id(this) + ']';
    }

    return str;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return this.toISOString().quoted('"');
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    //  '.toISOString()' is an ECMA ed5 addition
    return '<dl class="pretty Date"><dt/><dd>' +
            TP.str(this) +
            '</dd></dl>';
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var str;

    str = '[' + TP.tname(this) + ' :: ';

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        return str + this.getName() + ']';
    }

    //  Function instances dump their signature.
    return str + this.getSignature() + ']';
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        return '<span class="NativeType">' +
                this.getName() +
                '</span>';
    }

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asJSONSource',
function(aFilterName, aLevel) {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @param {String} aFilterName Ignored.
     * @param {Number} aLevel If 0, returns function() {...}
     * @returns {String} A JSON-formatted string.
     */

    var supertypeName,

        str,
        lvl;

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        supertypeName = this !== Object ? '"Object"' : '""';

        return '{"type":"NativeType",' +
                '"data":{"name":' + this.getName().quoted('"') + ',' +
                '"supertypes":[' + supertypeName + ']}}';
    }

    if (TP.isType(this)) {
        return TP.join(this.getSupertype().getName(),
                        '.defineSubtype(\'', this.getNamespacePrefix(), ':',
                        this.getLocalName(), '\');');
    }

    lvl = TP.notDefined(aLevel) ? TP.sys.cfg('stack.max_descent') :
                                Math.max(0, aLevel);

    if (lvl === 0) {
        str = '(function () {})';
    } else {
        str = TP.join(
                '(',
                this.toString().tokenizeWhitespace().replace('{ }', '{}'),
                ')');
    }

    return str;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        return '<dl class="pretty NativeType">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        'NativeType.&lt;' + TP.name(this) + '&gt;' +
                    '</dd>' +
                    '<dt/>' +
                    '<dd class="pretty value">' +
                        this.getName() +
                    '</dd>' +
                    '</dl>';
    }

    return '<dl class="pretty Function"><dt/><dd>' +
            TP.objectToString(this) +
            '</dd></dl>';
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        return '<type>' + this.getName() + '</type>';
    }

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty Number"><dt/><dd>' +
            TP.str(this) +
            '</dd></dl>';
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    //   We use 'toString()' rather than the 'source' property, since it
    //   includes the flags, etc.
    return '[' + TP.tname(this) + ' :: ' + this.toString() + ']';
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    //   We use 'toString()' rather than the 'source' property, since it
    //   includes the flags, etc.
    return this.toString().quoted('"');
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty RegExp"><dt/><dd>' +
            this.toString() +
            '</dd></dl>';
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    var str;

    str = this.toString();

    if (TP.regex.IS_ELEM_MARKUP.test(str)) {
        return str;
    }

    return TP.htmlLiteralsToEntities(str);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var str;

    str = this.toString();

    if (TP.regex.CONTAINS_ELEM_MARKUP.test(str)) {

        str = str.asEscapedXML();
    }

    return '<dl class="pretty String"><dt/><dd>' +
            str +
            '</dd></dl>';
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    var str;

    str = this.toString();

    if (TP.regex.IS_ELEM_MARKUP.test(str)) {
        return str;
    }

    return TP.xmlLiteralsToEntities(TP.htmlEntitiesToXMLEntities(str));
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    return '[' + TP.tname(this) + ' :: ' + this.getName() + ']';
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    return '<span class="TP.lang.RootObject">' +
            this.getName() +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var stNames;

    stNames = this.getSupertypeNames().collect(
                                function(aName) {
                                    return aName.quoted('"');
                                });

    return '{"type":"TP.lang.RootObject",' +
            '"data":{"name":' + this.getName().quoted('"') + ',' +
            '"supertypes":[' + stNames.join(',') + ']}}';
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty TP.lang.RootObject">' +
                '<dt>Type name</dt>' +
                '<dd class="pretty typename">' +
                    'TP.lang.RootObject.&lt;' + TP.name(this) + '&gt;' +
                '</dd>' +
                '<dt/>' +
                '<dd class="pretty value">' +
                    this.getName() +
                '</dd>' +
                '</dl>';
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    return '<type>' + this.getName() + '</type>';
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var marker,
        joinArr,
        keys,
        len,
        i,
        str,
        val,
        $depth,
        $level;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asDumpString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();
    keys = TP.keys(this);
    len = keys.getSize();

    str = '[' + TP.tname(this) + ' :: ';

    $depth = TP.ifInvalid(depth, 1);
    $level = TP.ifInvalid(level, 0);

    try {
        for (i = 0; i < len; i++) {
            //  Filter out internal keys.
            if (TP.regex.INTERNAL_SLOT.test(keys.at(i))) {
                continue;
            }

            val = this.get(keys.at(i));

            if (val === this) {
                if (TP.canInvoke(val, 'asRecursionString')) {
                    joinArr.push(
                        TP.join(keys.at(i), ' => ', val.asRecursionString()));
                } else {
                    joinArr.push(TP.join(keys.at(i), ' => this'));
                }
            } else {
                if ($level > $depth && TP.isMutable(this)) {
                    joinArr.push(TP.join(keys.at(i), ' => ',
                        '@' + TP.id(this) + ']'));
                } else {
                    joinArr.push(TP.join(keys.at(i), ' => ',
                        TP.dump(val, $depth, $level + 1)));
                }
            }
        }

        str += '(' + joinArr.join(', ') + ')' + ']';
    } catch (e) {
        TP.warn(e.message + ' in ' + TP.id(this) + ' dump string for key ' +
            keys.at(i));
        str += '(' + TP.str(this) + ')' + ']';
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var marker,
        joinArr,
        keys,
        len,
        i,
        joinStr;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asHTMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();
    keys = TP.keys(this);
    len = keys.getSize();

    try {
        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join('<span data-name="', keys.at(i), '">',
                            TP.htmlstr(this.get(keys.at(i))),
                            '</span>'));
        }

        joinStr = '<span class="TP_lang_Object ' +
                        TP.escapeTypeName(TP.tname(this)) + '">' +
                     joinArr.join('') +
                     '</span>';
    } catch (e) {
        joinStr = Object.prototype.toString.call(this);
    } finally {
        delete this[marker];
    }

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var marker,
        joinArr,
        keys,
        len,
        i,
        joinStr;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asJSONSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();
    keys = TP.keys(this);
    len = keys.getSize();

    try {
        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join(keys.at(i).quoted('"'),
                            ':',
                            TP.jsonsrc(this.get(keys.at(i)))));
        }

        joinStr = '{"type":"' + TP.tname(this) + '",' +
                    '"data":{' + joinArr.join(',') + '}}';
    } catch (e) {
        joinStr = Object.prototype.toString.call(this);
    } finally {
        delete this[marker];
    }

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var marker,
        joinArr,
        keys,
        len,
        i,
        joinStr;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asPrettyString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();
    keys = TP.keys(this);
    len = keys.getSize();

    try {
        for (i = 0; i < len; i++) {
            joinArr.push(
                TP.join('<dt class="pretty key">', keys.at(i), '</dt>',
                        '<dd class="pretty value">',
                            TP.pretty(this.at(keys.at(i))),
                        '</dd>'));
        }

        joinStr = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                        '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    joinArr.join('') +
                    '</dl>';
    } catch (e) {
        joinStr = Object.prototype.toString.call(this);
    } finally {
        delete this[marker];
    }

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var marker,
        joinArr,
        keys,
        len,
        i,
        joinStr;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asXMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();
    keys = TP.keys(this);
    len = keys.getSize();

    try {
        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join('<', keys.at(i), '>',
                            TP.xmlstr(this.get(keys.at(i))),
                            '</', keys.at(i), '>'));
        }

        joinStr = '<instance type="' + TP.tname(this) + '">' +
                     joinArr.join('') +
                     '</instance>';
    } catch (e) {
        joinStr = Object.prototype.toString.call(this);
    } finally {
        delete this[marker];
    }

    return joinStr;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
