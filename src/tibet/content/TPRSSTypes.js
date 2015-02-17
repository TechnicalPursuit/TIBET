//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/*
Types supporting RSS-formatted XML content. TIBET provides built-in support
for RSS as a lightweight data-feed content format for form-based workflow.
*/

//  ========================================================================
//  TP.core.RSSFeed
//  ========================================================================

/**
 * @type {TP.core.RSSFeed}
 * @summary Represents a single RSS feed. This type is an abstract type
 *     intended to support construction of version-specific subtypes.
 */

//  ------------------------------------------------------------------------

TP.core.XMLDocumentNode.defineSubtype('RSSFeed');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.RSSFeed.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @method init
     * @summary Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.core.URI|String} aURI An optional URI from which the Node
     *     received its content.
     * @returns {TP.core.Node} The initialized instance.
     */

    this.callNextMethod();

    if (TP.isNode(aNode)) {
        this.$set('node',
                    TP.nodeAddDefaultXMLNS(aNode, TP.w3.Xmlns.RSS20),
                    false);
    } else {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.isURI(aURI)) {
        this.$set('uri', aURI.asString(), false);
        this.addTIBETSrc();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.RSSFeed.Inst.defineMethod('getChannelElement',
function() {

    /**
     * @method getChannelElement
     * @summary Returns the element containing the data associated with this
     *     channel.
     * @returns {TP.core.RSSChannel} The channel element.
     */

    return this.getElementsByTagName('channel').first();
});

//  ========================================================================
//  TP.core.RSSElement
//  ========================================================================

/**
 * @type {TP.core.RSSElement}
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('RSSElement');

//  can't construct concrete instances of this
TP.core.RSSElement.isAbstract(true);

//  ------------------------------------------------------------------------

TP.core.RSSElement.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided.
     * @param {Node} aNode The native node to wrap.
     * @returns {TP.lang.RootObject.<TP.core.Node>} A TP.core.Node subtype type
     *     object.
     */

    var localName,
        typeName,

        nodeType;

    localName = TP.elementGetLocalName(aNode);
    if (localName.toLowerCase() === 'category') {
        if (TP.elementGetLocalName(aNode.parentNode).toLowerCase() ===
                                                                'channel') {
            return TP.core.RSSChannelCategory;
        }

        if (TP.elementGetLocalName(aNode.parentNode).toLowerCase() ===
                                                                'item') {
            return TP.core.RSSItemCategory;
        }
    }

    typeName = 'TP.core.RSS' + localName.asTitleCase();

    //  Can't determine a proper subtype? Return the 'standard XML element'.
    if (!TP.isType(nodeType = TP.sys.getTypeByName(typeName))) {
        return TP.core.XMLElementNode;
    }

    return nodeType;
});

//  ========================================================================
//  TP.core.RSSChannel
//  ========================================================================

/**
 * @type {TP.core.RSSChannel}
 * @summary Represents a single RSS channel. This type is an abstract type
 *     intended to support construction of version-specific subtypes.
 */

//  ------------------------------------------------------------------------

TP.core.RSSElement.defineSubtype('RSSChannel');

//  we'll rely on subtypes to manage version differences
TP.core.RSSChannel.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.RSSChannel.Type.defineAttribute('channelVersion');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.RSSChannel.Type.defineMethod('canConstruct',
function(aChannelElement) {

    /**
     * @method canConstruct
     * @summary Returns true or false whether or not a channel can be created
     *     from the underlying XML. Note that since this type is abstract,
     *     subtypes will inherit this method and they have real channel version
     *     numbers so this method will mean something to them ;-).
     * @param {XMLElement} aChannelElement An RSS 'channel' element, hopefully
     *     :).
     * @returns {Boolean} Whether or not an instance can be generated from this
     *     type depending on the RSS channel version number.
     */

    var rssDoc,

        elems;

    if (!TP.isElement(aChannelElement)) {
        return false;
    }

    rssDoc = TP.nodeGetDocument(aChannelElement);

    if (TP.isEmpty(elems = TP.nodeGetElementsByTagName(rssDoc, 'rss'))) {
        return false;
    }

    //  If the XML data's channel version number is the same as ours, then
    //  we can return true.
    /* eslint-disable no-extra-parens */
    return (TP.elementGetAttribute(elems.first(), 'version') ===
                                        this.get('channelVersion'));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.core.RSSChannel.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided.
     * @param {Node} aNode The native node to wrap.
     * @returns {TP.lang.RootObject.<TP.core.Node>} A TP.core.Node subtype type
     *     object.
     */

    //  not something you see every day, but we need to skip past
    //  TP.core.DocumentNode's implementation since it wants to default to 'this'
    //  as a return value which will cause recursions. so we jump up a level
    //  and run the super-supertype version this way
    return TP.lang.RootObject.getConcreteType.apply(this, arguments);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.RSSChannel.Inst.defineMethod('getVersion',
function() {

    /**
     * @method getVersion
     * @summary Returns the version of an RSS channel that we are.
     * @returns {Number} The version of an RSS channel that we are.
     */

    return this.getType().get('channelVersion');
});

//  ------------------------------------------------------------------------

TP.core.RSSChannel.Inst.defineMethod('getItems',
function() {

    /**
     * @method getItems
     * @summary Returns an Array of TP.core.RSSItems. Defined this way because
     *     'getItems' is already defined as a method on TP.core.CollectionNode
     *     and therefore a getter built from a type schema entry won't be built.
     * @returns {Array} An Array of TP.core.RSSItems.
     */

    return this.getElementsByTagName('item');
});

//  ========================================================================
//  TP.core.RSS091Channel
//  ========================================================================

/**
 * @type {TP.core.RSS091Channel}
 * @summary A subtype of TP.core.RSSChannel that represents a Version 0.91 RSS
 *     Channel.
 */

//  ------------------------------------------------------------------------

TP.core.RSSChannel.defineSubtype('RSS091Channel');

TP.core.RSS091Channel.set('channelVersion', '0.91');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.core.RSS091Channel.Inst.defineAttribute(
        'title',
        {value: TP.xpc('./$def:title',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'link',
        {value: TP.xpc('./$def:link',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'description',
        {value: TP.xpc('./$def:description',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'language',
        {value: TP.xpc('./$def:language',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'copyright',
        {value: TP.xpc('./$def:copyright',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'managingEditor',
        {value: TP.xpc('./$def:managingEditor',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'webMaster',
        {value: TP.xpc('./$def:webMaster',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'pubDate',
        {value: TP.xpc('./$def:pubDate',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'lastBuildDate',
        {value: TP.xpc('./$def:lastBuildDate',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'docs',
        {value: TP.xpc('./$def:docs',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'rating',
        {value: TP.xpc('./$def:rating',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'skipDays',
        {value: TP.xpc('./$def:skipDays/$def:day',
                        TP.hc('shouldCollapse', false,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'skipHours',
        {value: TP.xpc('./$def:skipHours/$def:hour',
                        TP.hc('shouldCollapse', false,
                                'extractWith', 'value'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'items',
        {value: TP.xpc('./$def:item',
                        TP.hc('shouldCollapse', false,
                                'packageWith', 'TP.core.RSSItem'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'image',
        {value: TP.xpc('./$def:image',
                        TP.hc('shouldCollapse', true,
                                'packageWith', 'TP.core.RSSImage'))
        });

TP.core.RSS091Channel.Inst.defineAttribute(
        'textInput',
        {value: TP.xpc('./$def:textInput',
                        TP.hc('shouldCollapse', true,
                                'packageWith', 'TP.core.RSSTextInput'))
        });

//  ========================================================================
//  TP.core.RSS092Channel
//  ========================================================================

/**
 * @type {TP.core.RSS092Channel}
 * @summary A subtype of a Version 0.91 RSS Channel that represents a Version
 *     0.92 RSS Channel.
 */

//  ------------------------------------------------------------------------

TP.core.RSS091Channel.defineSubtype('RSS092Channel');

TP.core.RSS092Channel.set('channelVersion', '0.92');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.core.RSS092Channel.Inst.defineAttribute(
        'cloud',
        {value: TP.xpc('./$def:cloud',
                        TP.hc('shouldCollapse', true,
                                'packageWith', 'TP.core.RSSCloud'))
        });

//  ========================================================================
//  TP.core.RSS20Channel
//  ========================================================================

/**
 * @type {TP.core.RSS20Channel}
 * @summary A subtype of a Version 0.92 RSS Channel that represents a Version
 *     2.0 RSS Channel.
 */

//  ------------------------------------------------------------------------

TP.core.RSS092Channel.defineSubtype('RSS20Channel');

TP.core.RSS20Channel.set('channelVersion', '2.0');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.core.RSS20Channel.Inst.defineAttribute(
        'generator',
        {value: TP.xpc('./$def:generator',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS20Channel.Inst.defineAttribute(
        'ttl',
        {value: TP.xpc('./$def:ttl',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS20Channel.Inst.defineAttribute(
        'category',
        {value: TP.xpc('./$def:category',
                        TP.hc('shouldCollapse', true,
                                'packageWith', 'TP.core.RSSChannelCategory'))
        });

//  ------------------------------------------------------------------------
//  RSS Channel Subelements
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.core.RSSChannelSubelement
//  ========================================================================

/**
 * @type {TP.core.RSSChannelSubelement}
 * @summary Represents a sub-element of an RSS channel element.
 */

//  ------------------------------------------------------------------------

TP.core.RSSElement.defineSubtype('RSSChannelSubelement');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.RSSChannelSubelement.Inst.defineMethod('getChannel',
function() {

    /**
     * @method getChannel
     * @summary Returns the channel we are associated with.
     * @returns {TP.core.RSSChannel} The channel we are associated with.
     */

    return this.getDocument().getChannelElement();
});

//  ========================================================================
//  TP.core.RSSChannelCategory
//  ========================================================================

/**
 * @type {TP.core.RSSChannelCategory}
 * @summary Represents an RSS 0.92 / 2.0 item category element embedded in a
 *     channel element.
 */

//  ------------------------------------------------------------------------

TP.core.RSSChannelSubelement.defineSubtype('RSSChannelCategory');

//  ========================================================================
//  TP.core.RSSCloud
//  ========================================================================

/**
 * @type {TP.core.RSSCloud}
 * @summary Represents an RSS cloud node. RSS cloud nodes are a new element in
 *     RSS 0.92 that define a Web service that can be used to be notified about
 *     updates to the channel.
 */

//  ------------------------------------------------------------------------

TP.core.RSSChannelSubelement.defineSubtype('RSSCloud');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.RSSCloud.Inst.defineAttribute(
        'domain',
        {value: TP.xpc('./@domain',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSCloud.Inst.defineAttribute(
        'port',
        {value: TP.xpc('./@port',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSCloud.Inst.defineAttribute(
        'path',
        {value: TP.xpc('./@path',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSCloud.Inst.defineAttribute(
        'registerProcedure',
        {value: TP.xpc('./@registerProcedure',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSCloud.Inst.defineAttribute(
        'protocol',
        {value: TP.xpc('./@protocol',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ========================================================================
//  TP.core.RSSImage
//  ========================================================================

/**
 * @type {TP.core.RSSImage}
 * @summary Represents an RSS image element (that is, the icon representing the
 *     channel).
 */

//  ------------------------------------------------------------------------

TP.core.RSSChannelSubelement.defineSubtype('RSSImage');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.core.RSSImage.Inst.defineAttribute(
        'title',
        {value: TP.xpc('./$def:title',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSImage.Inst.defineAttribute(
        'url',
        {value: TP.xpc('./$def:url',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSImage.Inst.defineAttribute(
        'link',
        {value: TP.xpc('./$def:link',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSImage.Inst.defineAttribute(
        'width',
        {value: TP.xpc('./$def:width',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSImage.Inst.defineAttribute(
        'height',
        {value: TP.xpc('./$def:height',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSImage.Inst.defineAttribute(
        'description',
        {value: TP.xpc('./$def:description',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ========================================================================
//  TP.core.RSSItem
//  ========================================================================

/**
 * @type {TP.core.RSSItem}
 * @summary Represents an RSS item in an abstract form. Specific subtypes are
 *     used to manage the differences between RSS versions.
 */

//  ------------------------------------------------------------------------

TP.core.RSSChannelSubelement.defineSubtype('RSSItem');

TP.core.RSSItem.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.RSSItem.Type.defineAttribute('itemVersion');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.RSSItem.Type.defineMethod('canConstruct',
function(anItemElement) {

    /**
     * @method canConstruct
     * @summary Returns true or false whether or not an item can be created
     *     from the underlying XML. Note that since this type is abstract,
     *     subtypes will inherit this method and they have real channel version
     *     numbers so this method will mean something to them ;-).
     * @param {XMLElement} anItemElement An RSS 'item' element, hopefully :).
     * @returns {Boolean} Whether or not an instance can be generated from this
     *     type depending on the RSS channel version number.
     */

    var rssDoc,

        elems;

    if (TP.notValid(anItemElement)) {
        return false;
    }

    rssDoc = TP.nodeGetDocument(anItemElement);

    if (TP.isEmpty(elems = TP.nodeGetElementsByTagName(rssDoc, 'rss'))) {
        return false;
    }

    //  If the XML data's channel version number is the same as ours, then
    //  we can return true.
    /* eslint-disable no-extra-parens */
    return (TP.elementGetAttribute(elems.first(), 'version') ===
                                        this.get('itemVersion'));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.core.RSSItem.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided.
     * @param {Node} aNode The native node to wrap.
     * @returns {TP.lang.RootObject.<TP.core.Node>} A TP.core.Node subtype type
     *     object.
     */

    //  not something you see every day, but we need to skip past
    //  TP.core.DocumentNode's implementation since it wants to default to 'this'
    //  as a return value which will cause recursions. so we jump up a level
    //  and run the super-supertype version this way
    return TP.lang.RootObject.getConcreteType.apply(this, arguments);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.RSSItem.Inst.defineMethod('getVersion',
function() {

    /**
     * @method getVersion
     * @summary Returns the version of an RSS item that we are.
     * @returns {Number} The version of an RSS item that we are.
     */

    return this.getType().get('itemVersion');
});

//  ========================================================================
//  TP.core.RSS091Item
//  ========================================================================

/**
 * @type {TP.core.RSS091Item}
 * @summary A subtype of TP.core.RSSItem that represents a version 0.91 RSS
 *     item. It provides getter properties for the standard 3 properties of a
 *     0.91 item - title, link and description.
 */

//  ------------------------------------------------------------------------

TP.core.RSSItem.defineSubtype('RSS091Item');

TP.core.RSS091Item.set('itemVersion', '0.91');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.core.RSS091Item.Inst.defineAttribute(
        'title',
        {value: TP.xpc('./$def:title',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Item.Inst.defineAttribute(
        'link',
        {value: TP.xpc('./$def:link',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS091Item.Inst.defineAttribute(
        'description',
        {value: TP.xpc('./$def:description',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ========================================================================
//  TP.core.RSS092Item
//  ========================================================================

/**
 * @type {TP.core.RSS092Item}
 * @summary A subtype of a Version 0.91 RSS Item that represents a Version 0.92
 *     RSS Item. It provides getter properties for the additional 3 properties
 *     of a 0.92 item - category, enclosure and source.
 */

//  ------------------------------------------------------------------------

TP.core.RSS091Item.defineSubtype('RSS092Item');

TP.core.RSS092Item.set('itemVersion', '0.92');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.core.RSS092Item.Inst.defineAttribute(
        'category',
        {value: TP.xpc('./$def:category',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS092Item.Inst.defineAttribute(
        'enclosure',
        {value: TP.xpc('./$def:enclosure',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS092Item.Inst.defineAttribute(
        'source',
        {value: TP.xpc('./$def:source',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ========================================================================
//  TP.core.RSS20Item
//  ========================================================================

/**
 * @type {TP.core.RSS20Item}
 * @summary A subtype of RSS Item that represents a Version 2.0 RSS Item. It
 *     provides getter functionality for the additional properties of a 2.0
 *     item: comments, author, pubDate, and guid.
 */

//  ------------------------------------------------------------------------

TP.core.RSS092Item.defineSubtype('RSS20Item');

TP.core.RSS20Item.set('itemVersion', '2.0');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.core.RSS20Item.Inst.defineAttribute(
        'comments',
        {value: TP.xpc('./$def:comments',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS20Item.Inst.defineAttribute(
        'author',
        {value: TP.xpc('./$def:author',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS20Item.Inst.defineAttribute(
        'pubDate',
        {value: TP.xpc('./$def:pubDate',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSS20Item.Inst.defineAttribute(
        'guid',
        {value: TP.xpc('./$def:guid',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ========================================================================
//  TP.core.RSSTextInput
//  ========================================================================

/**
 * @type {TP.core.RSSTextInput}
 * @summary Represents an RSS textinput element. This element is usually
 *     ignored by user agents.
 */

//  ------------------------------------------------------------------------

TP.core.RSSChannelSubelement.defineSubtype('RSSTextInput');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.core.RSSTextInput.Inst.defineAttribute(
        'title',
        {value: TP.xpc('./$def:title',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSTextInput.Inst.defineAttribute(
        'name',
        {value: TP.xpc('./$def:name',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSTextInput.Inst.defineAttribute(
        'link',
        {value: TP.xpc('./$def:link',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSTextInput.Inst.defineAttribute(
        'description',
        {value: TP.xpc('./$def:description',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ------------------------------------------------------------------------
//  RSS Item Subelements
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.core.RSSItemSubelement
//  ========================================================================

/**
 * @type {TP.core.RSSItemSubelement}
 * @summary Represents a sub-element of an RSS item element.
 */

//  ------------------------------------------------------------------------

TP.core.RSSElement.defineSubtype('RSSItemSubelement');

//  ========================================================================
//  TP.core.RSSEnclosure
//  ========================================================================

/**
 * @type {TP.core.RSSEnclosure}
 * @summary Represents an RSS 0.92 / 2.0 enclosure element. An enclosure is a
 *     new element in RSS 0.92 that defines a url, length and type for
 *     out-of-band data that goes with the item, such as some sort of binary
 *     file.
 */

//  ------------------------------------------------------------------------

TP.core.RSSItemSubelement.defineSubtype('RSSEnclosure');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.RSSEnclosure.Inst.defineAttribute(
        'length',
        {value: TP.xpc('./@length',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSEnclosure.Inst.defineAttribute(
        'enclosureType',
        {value: TP.xpc('./@type',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.core.RSSEnclosure.Inst.defineAttribute(
        'url',
        {value: TP.xpc('./@url',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ========================================================================
//  TP.core.RSSGUID
//  ========================================================================

/**
 * @type {TP.core.RSSGUID}
 * @summary Represents an RSS 2.0 GUID element. A GUID is a new element in RSS
 *     2.0 that is a globally unique identifier for the item.
 */

//  ------------------------------------------------------------------------

TP.core.RSSItemSubelement.defineSubtype('RSSGUID');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.RSSGUID.Inst.defineAttribute(
        'isPermaLink',
        {value: TP.xpc('./@isPermaLink',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ========================================================================
//  TP.core.RSSItemCategory
//  ========================================================================

/**
 * @type {TP.core.RSSItemCategory}
 * @summary Represents an RSS 0.92 / 2.0 item category element embedded in an
 *     item element.
 */

//  ------------------------------------------------------------------------

TP.core.RSSItemSubelement.defineSubtype('RSSItemCategory');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.RSSItemCategory.Inst.defineAttribute(
        'domain',
        {value: TP.xpc('./@domain',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ========================================================================
//  TP.core.RSSSource
//  ========================================================================

/**
 * @type {TP.core.RSSSource}
 * @summary Represents an RSS 0.92 / 2.0 source element. A source is a new
 *     element in RSS 0.92 that defines a url for RSS channel that the item came
 *     from as derived from its title.
 */

//  ------------------------------------------------------------------------

TP.core.RSSItemSubelement.defineSubtype('RSSSource');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.RSSItemSubelement.Inst.defineAttribute(
        'path',
        {value: TP.xpc('./@url',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
