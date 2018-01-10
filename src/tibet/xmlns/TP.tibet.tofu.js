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
 * @type {TP.tibet.tofu}
 * @summary Bland and easily flavored :-)
 * @description Instances of this tag type 'stand in' for as-yet-defined tag
 *     types. It is used during development by the Sherpa to give a 'handle' in
 *     a GUI context so that further manipulation can be done to it (like
 *     actually defining it).
 */

//  ------------------------------------------------------------------------

TP.core.CustomTag.defineSubtype('tibet:tofu');

//  This tag has no theme CSS. Note how this properties is TYPE_LOCAL, by
//  design.
TP.tibet.tofu.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tibet.tofu.Type.defineMethod('replaceOccurrencesOf',
function(aTagTypeName) {

    /**
     * @method replaceOccurrencesOf
     * @summary Replaces any occurrences of the 'tibet:tofu' tag that is a proxy
     *     for the supplied tag name with an instance of that tag in all
     *     currently loaded screen document in the Sherpa.
     * @param {String} aTagTypeName The name of the tags to find the proxy
     *     tibet:tofu tags with and replace.
     * @returns {TP.tibet.tofu} The receiver.
     */

    var tagType,
        tagName,

        allTofus,

        screens;

    //  Make sure that we can get a tag type with the supplied tag name
    if (!TP.isType(tagType = TP.sys.getTypeByName(aTagTypeName))) {
        //  TODO: Raise exception
        return this;
    }

    //  Create a tag name from the type's namespace prefix and local name.
    tagName = tagType.getNamespacePrefix() + ':' + tagType.getLocalName();

    //  Search the UI canvases currently loaded into the Sherpa world for any
    //  'tibet:tofu' tags that are proxies for the supplied tag.

    allTofus = TP.ac();

    //  Grab all of the screens from the world and iterate over them, looking
    //  for tofus.
    screens = TP.byId('SherpaWorld', TP.win('UIROOT')).get('screens');
    screens.forEach(
        function(aScreen) {

            var tpDoc,
                docTofus;

            //  Grab the TP.core.Document that the screen contains (*not* the
            //  one that contains the screen ;-)).
            tpDoc = aScreen.getContentDocument();
            docTofus =
                TP.byCSSPath('tibet|tofu[proxyfor="' + tagName + '"]', tpDoc);

            allTofus = allTofus.concat(docTofus);
        });

    if (TP.notEmpty(allTofus)) {

        if (TP.sys.hasFeature('sherpa')) {
            TP.bySystemId('Sherpa').set('shouldProcessDOMMutations', true);
        }

        //  Iterate over all of the found instances, create an empty tag with
        //  the created tag name and replace the tofu with it. This will cause
        //  the new tag to replace this empty tag version of itself with either
        //  compiled or templated content.
        allTofus.forEach(
                function(tofuTPElem) {

                    var newElem,
                        newTPElem;

                    newElem = TP.nodeFromString('<' + tagName + '/>');
                    if (TP.isElement(newElem)) {

                        //  Capture the return value of replacing the tofu and
                        //  make sure to null out its global ID. This will help
                        //  the Sherpa halo to obtain the proper lock on the new
                        //  element and allow it to let go of the tofu element.
                        newTPElem = tofuTPElem.replaceWith(newElem);
                        TP.unwrap(newTPElem)[TP.GLOBAL_ID] = null;
                    }
                });
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.tofu.Inst.defineMethod('getChildElements',
function() {

    /**
     * @method getChildElements
     * @summary Returns an Array of the children of the receiver which are
     *     Element nodes. For this type, this returns the empty Array since tofu
     *     elements are 'opaque' and don't show their structure.
     * @returns {Array} An Array of the Element children of the supplied Node.
     */

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.tibet.tofu.Inst.defineHandler('TagAssist',
function(aSignal) {

    /**
     * @method handleTagAssist
     * @summary Handles signals to have this type assist in defining the tag
     *     type that it is standing in for. This is usually configured to fire
     *     from an event handler on the visual representation of it.
     * @param {TP.sig.TagAssist} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.tibet.tofu} The receiver.
     */

    var newTagName;

    newTagName = this.getAttribute('proxyfor');

    //  Fire a 'ConsoleCommand' with a ':tag --assist' command, supplying the
    //  name and the DNA for a templated tag.

    //  NB: 'tsh:roottype' is a TSH-only parameter used just for communicating
    //  where to 'root' the supertype list.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText',
                        ':type --assist' +
                                ' --name=\'' + newTagName + '\'' +
                                ' --dna=\'templatedtag\'' +
                                ' --roottype=\'TP.core.ElementNode\''
                ));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
