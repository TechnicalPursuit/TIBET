//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.html.noscript
//  ========================================================================

/**
 * @type {TP.html.noscript}
 * @summary 'noscript' tag. When client-side scripts disabled/unsupported.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('noscript');

//  ========================================================================
//  TP.html.script
//  ========================================================================

/**
 * @type {TP.html.script}
 * @summary 'script' tag. Embedded programming -- hmmm sounds familiar ;)
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('script');

TP.html.script.Type.set('booleanAttrs', TP.ac('async', 'defer'));

TP.html.script.Type.set('uriAttrs', TP.ac('src', 'source'));
TP.html.script.Type.set('reloadableUriAttrs', TP.ac('src', 'source'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.script.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time type initialization.
     */

    var watchSources,
        query,
        scripts,
        req,
        len,
        i;

    if (TP.sys.cfg('uri.source.watch_changes')) {

        //  Build a CSS query of the watched source paths that can be tested
        //  against all of the 'script' elements in the top-level window's
        //  document. This is where all TIBET code resides. We only want to set
        //  up observations on scripts that are under those paths.
        watchSources = TP.sys.cfg('tds.watch.include');
        query = 'script[src^="' + TP.uriExpandPath(watchSources.at(0)) + '"]';

        for (i = 1; i < watchSources.getSize(); i++) {
            query += ', script[src^="' +
                        TP.uriExpandPath(watchSources.at(i)) +
                        '"]';
        }

        //  Query for them.
        scripts = TP.byCSSPath(query, TP.sys.getLaunchDocument(), false, false);

        req = TP.request();

        //  Loop over each script element found and manually call 'tagAttachDOM'
        //  with a manually constructed request.
        len = scripts.getSize();
        for (i = 0; i < len; i++) {
            req.atPut('node', scripts.at(i));
            TP.html.script.tagAttachDOM(req);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.html.script.Type.defineMethod('$xmlifyContent',
function(src) {

    //  TODO:   optimize for sugared XHTML input
    return src;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.script.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles notification of a change.
     * @description For 'html:script' elements, when they are (re)imported, we
     *     do *not* respond to value changes, as that is handled specially by
     *     the system.
     * @param {TP.sig.Signal} aSignal The signal instance to respond to.
     * @returns {TP.html.script} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.html.script.Inst.defineMethod('reloadFromAttrSrc',
function(aSrc) {

    /**
     * @method reloadFromAttrSrc
     * @summary Reloads the receiver with the content found at the end of the
     *     src by refreshing the 'src' attribute. This will *not* cause the
     *     'whole source text' to be brought in.
     * @param {String} aSrc The URL that the receiver will use to reload its
     *     content.
     * @returns {TP.html.script} The receiver.
     */

    //  For now, we just use the same routine as loading script using the whole
    //  text source.

    //  TODO: Convert this to using the boot system to (re)load by setting the
    //  'src' attribute of the native node.
    return this.reloadFromAttrSource(aSrc);
});

//  ------------------------------------------------------------------------

TP.html.script.Inst.defineMethod('reloadFromAttrSource',
function(aSource) {

    /**
     * @method reloadFromAttrSource
     * @summary Reloads the receiver with the content found at the end of the
     *     source by bringing in the whole source content and refreshing it.
     * @param {String} aSource The URL that the receiver will use to reload its
     *     content.
     * @returns {TP.html.script} The receiver.
     */

    var srcURL,
        resp,
        src,
        defining,
        typenames;

    if (TP.notEmpty(aSource)) {

        srcURL = TP.uc(aSource);
        if (!TP.isURI(srcURL)) {
            return this.raise('InvalidURI',
                                'Not a valid \'src\' URI: ' + aSource);
        }

        resp = srcURL.getResource(
                TP.hc('async', false, 'resultType', TP.TEXT, 'refresh', true));
        src = resp.get('result');

        if (TP.notValid(src)) {
            return this.raise('InvalidString',
                                'No valid Javascript source from: ' + aSource);
        }


        //  A little trick here to intercept which types load in the source.
        defining = TP.sys.definingTypename;

        typenames = TP.ac();

        TP.sys.definingTypename = function(typename) {
            typenames.push(typename);
        };

        try {
            //  Do the job of importing the source. Note that this uses the
            //  actual supplied source code in the src argument for eval'ing
            //  purposes. The location is provided for source code tracking.
            TP.boot.$sourceImport(src, null, srcURL.getLocation(), true);
        } finally {
            TP.sys.definingTypename = defining;
        }

        typenames.forEach(
                function(typename) {
                    var type;

                    type = TP.sys.getTypeByName(typename);
                    if (TP.canInvoke(type, 'refreshInstances')) {
                        type.refreshInstances();
                    }
                });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.script.Inst.defineMethod('setAttrSource',
function(aSource) {

    /**
     * @method setAttrSource
     * @summary Sets the 'source' that the receiver will use to retrieve its
     *     content. Note that this refreshes the source by causing the entire
     *     text content of the script node to be brought in.
     * @param {String} aSource The URL that the receiver will use to fetch its
     *     content.
     */

    this.$setAttribute('source', aSource);

    //  reload from the content found at the 'source'.
    this.reloadFromAttrSource(aSource);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.html.script.Inst.defineMethod('setAttrSrc',
function(aSrc) {

    /**
     * @method setAttrSrc
     * @summary Sets the src that the receiver will use to retrieve its
     *     content. Note that this just refreshes the 'src' attribute and does
     *     not cause the entire text content of the script node to be brought
     *     in.
     * @param {String} aSrc The URL that the receiver will use to fetch its
     *     content.
     */

    this.$setAttribute('src', aSrc);

    //  reload from the content found at the src.
    this.reloadFromAttrSrc(aSrc);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
