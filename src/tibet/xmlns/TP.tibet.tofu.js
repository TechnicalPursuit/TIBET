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
 */

//  ------------------------------------------------------------------------

TP.core.CustomTag.defineSubtype('tibet:tofu');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tibet.tofu.Type.defineMethod('replaceOccurrencesOf',
function(aTagTypeName) {

    var tagType,
        tagName,

        uidoc,
        instances;

    //  Make sure that we can get a tag type with the supplied tag name
    if (!TP.isType(tagType = TP.sys.getTypeByName(aTagTypeName))) {
        //  TODO: Raise exception
        return this;
    }

    //  Create a tag name from the type's namespace prefix and local name.
    tagName = tagType.getNamespacePrefix() + ':' + tagType.getLocalName();

    //  Search the current UI canvas for any 'tibet:tofu' tags that are proxies
    //  for the supplied tag.
    //  TODO: This should probably search other loaded pages too.

    uidoc = TP.sys.uidoc();
    instances = TP.byCSSPath('tibet|tofu[proxyfor="' + tagName + '"]', uidoc);

    //  Iterate over all of the found instances, create an empty tag with the
    //  created tag name and replace the tofu with it. This will cause the new
    //  tag to replace this empty tag version of itself with either compiled or
    //  templated content.
    instances.forEach(
            function(tofuTPElem) {

                var newElem;

                newElem = TP.nodeFromString('<' + tagName + '/>');
                if (TP.isElement(newElem)) {
                    tofuTPElem.replaceContent(newElem);
                }
            });

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.tofu.Inst.defineHandler('TagAssist',
function(aSignal) {

    /**
     * @method handleTagAssist
     * @summary
     * @param {TP.sig.TagAssist} aSignal The signal that caused this handler to
     *     trip.
     */

    var newTagName,

        newTagContentSection,
        newTagContent;

    newTagName = this.getAttribute('proxyfor');

    //  Grab all of the tag content in the CDATA section. This will be any tag
    //  content that the user originally authored and that the 'tibet:tofu' tag
    //  is wrapping. It will form the initial template of our tag.
    newTagContentSection = this.getFirstDescendantByType(Node.CDATA_SECTION_NODE);
    newTagContent = newTagContentSection.getTextContent();

    //  Fire a 'ConsoleCommand' with a ':tag --assist' command, supplying the
    //  name and the template.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText',
                        ':type --assist' +
                                ' --name=\'' + newTagName + '\'' +
                                ' --dna=\'templatedtag\''
                ));

    TP.info('tag content was to be: ' + newTagContent);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
