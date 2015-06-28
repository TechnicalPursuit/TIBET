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

TP.html.script.Type.set('uriAttrs', TP.ac('src'));
TP.html.script.Type.set('reloadableUriAttrs', TP.ac('src'));

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

    //  If we're not watching remote sources, then just exit.
    if (!TP.sys.cfg('uri.remote_watch')) {
        return;
    }

    //  Build a CSS query of the watched source paths that can be tested against
    //  all of the 'script' elements in the top-level window's document. This is
    //  where all TIBET code resides. We only want to set up observations on
    //  scripts that are under those paths.
    watchSources = TP.sys.cfg('uri.remote_watch_sources');
    query = 'script[src^="' + TP.uriExpandPath(watchSources.at(0)) + '"]';

    for (i = 1; i < watchSources.getSize(); i++) {
        query += ', script[src^="' +
                    TP.uriExpandPath(watchSources.at(i)) +
                    '"]';
    }

    //  Query for them.
    scripts = TP.byCSSPath(query, top.document, false, false);

    req = TP.request();

    //  Loop over each script element found and manually call 'tagAttachDOM'
    //  with a manually constructed request.
    len = scripts.getSize();
    for (i = 0; i < len; i++) {
        req.atPut('node', scripts.at(i));
        TP.html.script.tagAttachDOM(req);
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

TP.html.script.Inst.defineMethod('reloadFromAttrSrc',
function(aSrc) {

    /**
     * @method reloadFromAttrSrc
     * @summary Reloads the receiver with the content found at the end of the
     *     src.
     * @param {String} aSrc The URL that the receiver will use to reload its
     *     content.
     * @returns {TP.html.script} The receiver.
     */

    var srcURL,
        src;

    if (TP.notEmpty(aSrc)) {

        srcURL = TP.uc(aSrc);
        if (!TP.isURI(srcURL)) {
            return this.raise('InvalidURI', 'Not a valid \'src\' URI: ' + aSrc);
        }

        //  NB: We do *not* force 'refresh' here, since this URL will have
        //  already (probably) had its content reloaded by the change machinery
        //  setting the 'isLoaded' flag to false and then calling 'getResource'.
        src = srcURL.getContent(TP.hc('async', false));

        if (TP.notValid(src)) {
            return this.raise('InvalidString',
                                'No valid Javascript source from: ' + aSrc);
        }

        //  Do the job of importing the source. Note that this uses the actual
        //  supplied source code in the src argument for eval()ing purposes. The
        //  location is provided for source code tracking purposes.
        TP.boot.$sourceImport(src, null, srcURL.getLocation(), null, true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.script.Inst.defineMethod('setAttrSrc',
function(aSrc) {

    /**
     * @method setAttrSrc
     * @summary Sets the src that the receiver will use to retrieve its
     *     content.
     * @param {String} aSrc The URL that the receiver will use to fetch its
     *     content.
     */

    this.$setAttribute('href', aSrc);

    //  reload from the content found at the src.
    this.reloadFromAttrSrc();

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
