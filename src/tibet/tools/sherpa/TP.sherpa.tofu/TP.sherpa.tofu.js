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
 * @type {TP.sherpa.tofu}
 * @summary Bland and easily flavored :-)
 * @description Instances of this tag type 'stand in' for as-yet-defined tag
 *     types. It is used during development by the Sherpa to give a 'handle' in
 *     a GUI context so that further manipulation can be done to it (like
 *     actually defining it).
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('sherpa:tofu');

//  This tag has no theme CSS. Note how this properties is TYPE_LOCAL, by
//  design.
TP.sherpa.tofu.defineAttribute('themeURI', TP.NO_RESULT);

//  The setting that determines whether or not we descend into our descendants
//  when serializing. We override the value from our supertype and set this to
//  TP.CONTINUE. This means that only select descendants, as determined by this
//  type's getDescendantsForSerialization method will be serialized.
TP.sherpa.tofu.Type.set('serializationTraversal', TP.CONTINUE);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.tofu.Type.defineMethod('replaceOccurrencesOf',
function(aTagTypeName) {

    /**
     * @method replaceOccurrencesOf
     * @summary Replaces any occurrences of the 'sherpa:tofu' tag that is a
     *     proxy for the supplied tag name with an instance of that tag in all
     *     currently loaded screen document in the Sherpa.
     * @param {String} aTagTypeName The name of the tags to find the proxy
     *     sherpa:tofu tags with and replace.
     * @returns {TP.meta.sherpa.tofu} The receiver.
     */

    var tagType,
        tagName,

        allTofus,

        screens,

        replacementTPElem,
        replacementTPDoc,

        haloTPElem,

        handler;

    //  Make sure that we can get a tag type with the supplied tag name
    if (!TP.isType(tagType = TP.sys.getTypeByName(aTagTypeName))) {
        //  TODO: Raise exception
        return this;
    }

    //  Create a tag name from the type's namespace prefix and local name.
    tagName = tagType.getNamespacePrefix() + ':' + tagType.getLocalName();

    //  Search the UI canvases currently loaded into the Sherpa world for any
    //  'sherpa:tofu' tags that are proxies for the supplied tag.

    allTofus = TP.ac();

    //  Grab all of the screens from the world and iterate over them, looking
    //  for tofus.
    screens = TP.byId('SherpaWorld', TP.sys.getUIRoot()).get('screens');
    screens.forEach(
        function(aScreen) {

            var tpDoc,
                docTofus;

            //  Grab the TP.dom.Document that the screen contains (*not* the
            //  one that contains the screen ;-)).
            tpDoc = aScreen.getContentDocument();
            docTofus =
                TP.byCSSPath('sherpa|tofu[proxyfor="' + tagName + '"]', tpDoc);

            allTofus = allTofus.concat(docTofus);
        });

    if (TP.notEmpty(allTofus)) {

        if (TP.sys.hasFeature('sherpa')) {
            TP.bySystemId('Sherpa').set('shouldProcessDOMMutations', true);
        }

        //  Iterate over all of the found instances, create an empty tag with
        //  the created tag name and replace the tofu with it. This will cause
        //  the new tag to replace this empty tag version of itself with either
        //  computed or templated content.
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

                        replacementTPElem = newTPElem;
                    }
                });

        //  If at least one tofu got replaced, then set up a handler to focus
        //  the halo on the element the (last) replacement when the document
        //  finishes mutating.
        if (TP.isValid(replacementTPElem)) {

            replacementTPDoc = TP.tpdoc(replacementTPElem);

            haloTPElem = TP.byId('SherpaHalo', TP.sys.getUIRoot());

            //  NB: We don't bother checking to make sure that the halo's
            //  current target can be blurred here, since we know it is halo'ed
            //  on us.

            haloTPElem.blur();

            //  Install a handler looking for a MutationAttach signal that will
            //  complete when the document has reflowed.
            handler = function(aSignal) {

                //  Make sure to uninstall the handler.
                handler.ignore(replacementTPDoc,
                                'TP.sig.MutationAttach');

                haloTPElem.focusOn(replacementTPElem, true);
            };

            //  Set up the MutationAttach observation on the replacement
            //  element's Document.
            handler.observe(replacementTPDoc, 'TP.sig.MutationAttach');
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.tofu.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.dom.Node[]} An Array of descendant nodes to serialize.
     */

    return this.getChildNodes();
});

//  ------------------------------------------------------------------------

TP.sherpa.tofu.Inst.defineHandler('TagAssist',
function(aSignal) {

    /**
     * @method handleTagAssist
     * @summary Handles signals to have this type assist in defining the tag
     *     type that it is standing in for. This is usually configured to fire
     *     from an event handler on the visual representation of it.
     * @param {TP.sig.TagAssist} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.sherpa.tofu} The receiver.
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
                                ' --roottype=\'TP.lang.Object\''
                ));

    return this;
});

//  ------------------------------------------------------------------------
//  Sherpa Methods
//  ------------------------------------------------------------------------

TP.sherpa.tofu.Inst.defineMethod('sherpaGetChildElements',
function() {

    /**
     * @method sherpaGetChildElements
     * @summary Returns an Array of the receiver's child elements that should be
     *    relevant to the Sherpa. For this type, this returns the empty Array
     *    since tofu elements are 'opaque' and don't show their structure.
     * @returns {Element[]} An Array of the receiver's child elements that are
     *    relevant to the Sherpa.
     */

    return TP.ac();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
