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
//  TP.rss.RSSFeed
//  ========================================================================

/**
 * @type {TP.rss.RSSFeed}
 * @summary Represents a single RSS feed. This type is an abstract type
 *     intended to support construction of version-specific subtypes.
 */

//  ------------------------------------------------------------------------

TP.core.XMLDocumentNode.defineSubtype('rss.RSSFeed');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.rss.RSSFeed.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @method init
     * @summary Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.uri.URI|String} aURI An optional URI from which the Node
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

TP.rss.RSSFeed.Inst.defineMethod('getChannelElement',
function() {

    /**
     * @method getChannelElement
     * @summary Returns the element containing the data associated with this
     *     channel.
     * @returns {TP.rss.RSSChannel} The channel element.
     */

    return this.getElementsByTagName('channel').first();
});

//  ========================================================================
//  TP.rss.RSSElement
//  ========================================================================

/**
 * @type {TP.rss.RSSElement}
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('rss.RSSElement');

//  can't construct concrete instances of this
TP.rss.RSSElement.isAbstract(true);

//  ------------------------------------------------------------------------

TP.rss.RSSElement.Type.defineMethod('getConcreteType',
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

        type;

    localName = TP.elementGetLocalName(aNode);
    if (localName.toLowerCase() === 'category') {
        if (TP.elementGetLocalName(aNode.parentNode).toLowerCase() ===
                                                                'channel') {
            return TP.rss.RSSChannelCategory;
        }

        if (TP.elementGetLocalName(aNode.parentNode).toLowerCase() ===
                                                                'item') {
            return TP.rss.RSSItemCategory;
        }
    }

    typeName = 'TP.rss.RSS' + localName.asTitleCase();

    type = TP.sys.getTypeByName(typeName);

    //  Can't determine a proper subtype? Return the 'standard XML element'.
    if (!TP.isType(type) || type.isAbstract()) {
        return TP.core.XMLElementNode;
    }

    return type;
});

//  ========================================================================
//  TP.rss.RSSChannel
//  ========================================================================

/**
 * @type {TP.rss.RSSChannel}
 * @summary Represents a single RSS channel. This type is an abstract type
 *     intended to support construction of version-specific subtypes.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSElement.defineSubtype('RSSChannel');

//  we'll rely on subtypes to manage version differences
TP.rss.RSSChannel.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.rss.RSSChannel.Type.defineAttribute('channelVersion');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.rss.RSSChannel.Type.defineMethod('canConstruct',
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

TP.rss.RSSChannel.Type.defineMethod('getConcreteType',
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

TP.rss.RSSChannel.Inst.defineMethod('getVersion',
function() {

    /**
     * @method getVersion
     * @summary Returns the version of an RSS channel that we are.
     * @returns {Number} The version of an RSS channel that we are.
     */

    return this.getType().get('channelVersion');
});

//  ------------------------------------------------------------------------

TP.rss.RSSChannel.Inst.defineMethod('getItems',
function() {

    /**
     * @method getItems
     * @summary Returns an Array of TP.rss.RSSItems. Defined this way because
     *     'getItems' is already defined as a method on TP.core.CollectionNode
     *     and therefore a getter built from a type schema entry won't be built.
     * @returns {Array} An Array of TP.rss.RSSItems.
     */

    return this.getElementsByTagName('item');
});

//  ========================================================================
//  TP.rss.RSS091Channel
//  ========================================================================

/**
 * @type {TP.rss.RSS091Channel}
 * @summary A subtype of TP.rss.RSSChannel that represents a Version 0.91 RSS
 *     Channel.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSChannel.defineSubtype('RSS091Channel');

TP.rss.RSS091Channel.set('channelVersion', '0.91');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.rss.RSS091Channel.Inst.defineAttribute(
    'title', TP.xpc('./$def:title', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'link', TP.xpc('./$def:link', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'description', TP.xpc('./$def:description', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'language', TP.xpc('./$def:language', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'copyright', TP.xpc('./$def:copyright', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'managingEditor', TP.xpc('./$def:managingEditor', TP.hc('shouldCollapse',
            true, 'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'webMaster', TP.xpc('./$def:webMaster', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'pubDate', TP.xpc('./$def:pubDate', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'lastBuildDate', TP.xpc('./$def:lastBuildDate', TP.hc('shouldCollapse',
            true, 'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'docs', TP.xpc('./$def:docs', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'rating', TP.xpc('./$def:rating', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'skipDays', TP.xpc('./$def:skipDays/$def:day', TP.hc('shouldCollapse',
            false, 'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'skipHours', TP.xpc('./$def:skipHours/$def:hour', TP.hc('shouldCollapse',
            false, 'extractWith', 'value')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'items', TP.xpc('./$def:item', TP.hc('shouldCollapse', false, 'packageWith',
            'TP.rss.RSSItem')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'image', TP.xpc('./$def:image', TP.hc('shouldCollapse', true, 'packageWith',
            'TP.rss.RSSImage')));

TP.rss.RSS091Channel.Inst.defineAttribute(
    'textInput', TP.xpc('./$def:textInput', TP.hc('shouldCollapse', true,
            'packageWith', 'TP.rss.RSSTextInput')));

//  ========================================================================
//  TP.rss.RSS092Channel
//  ========================================================================

/**
 * @type {TP.rss.RSS092Channel}
 * @summary A subtype of a Version 0.91 RSS Channel that represents a Version
 *     0.92 RSS Channel.
 */

//  ------------------------------------------------------------------------

TP.rss.RSS091Channel.defineSubtype('RSS092Channel');

TP.rss.RSS092Channel.set('channelVersion', '0.92');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.rss.RSS092Channel.Inst.defineAttribute(
    'cloud', TP.xpc('./$def:cloud', TP.hc('shouldCollapse', true, 'packageWith',
            'TP.rss.RSSCloud')));

//  ========================================================================
//  TP.rss.RSS20Channel
//  ========================================================================

/**
 * @type {TP.rss.RSS20Channel}
 * @summary A subtype of a Version 0.92 RSS Channel that represents a Version
 *     2.0 RSS Channel.
 */

//  ------------------------------------------------------------------------

TP.rss.RSS092Channel.defineSubtype('RSS20Channel');

TP.rss.RSS20Channel.set('channelVersion', '2.0');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.rss.RSS20Channel.Inst.defineAttribute(
    'generator', TP.xpc('./$def:generator', TP.hc('shouldCollapse', true,
        'extractWith', 'value')));

TP.rss.RSS20Channel.Inst.defineAttribute(
    'ttl', TP.xpc('./$def:ttl', TP.hc('shouldCollapse', true, 'extractWith',
        'value')));

TP.rss.RSS20Channel.Inst.defineAttribute(
    'category', TP.xpc('./$def:category', TP.hc('shouldCollapse', true,
        'packageWith', 'TP.rss.RSSChannelCategory')));

//  ------------------------------------------------------------------------
//  RSS Channel Subelements
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.rss.RSSChannelSubelement
//  ========================================================================

/**
 * @type {TP.rss.RSSChannelSubelement}
 * @summary Represents a sub-element of an RSS channel element.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSElement.defineSubtype('RSSChannelSubelement');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.rss.RSSChannelSubelement.Inst.defineMethod('getChannel',
function() {

    /**
     * @method getChannel
     * @summary Returns the channel we are associated with.
     * @returns {TP.rss.RSSChannel} The channel we are associated with.
     */

    return this.getDocument().getChannelElement();
});

//  ========================================================================
//  TP.rss.RSSChannelCategory
//  ========================================================================

/**
 * @type {TP.rss.RSSChannelCategory}
 * @summary Represents an RSS 0.92 / 2.0 item category element embedded in a
 *     channel element.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSChannelSubelement.defineSubtype('RSSChannelCategory');

//  ========================================================================
//  TP.rss.RSSCloud
//  ========================================================================

/**
 * @type {TP.rss.RSSCloud}
 * @summary Represents an RSS cloud node. RSS cloud nodes are a new element in
 *     RSS 0.92 that define a Web service that can be used to be notified about
 *     updates to the channel.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSChannelSubelement.defineSubtype('RSSCloud');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.rss.RSSCloud.Inst.defineAttribute(
    'domain', TP.xpc('./@domain', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSCloud.Inst.defineAttribute(
    'port', TP.xpc('./@port', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSCloud.Inst.defineAttribute(
    'path', TP.xpc('./@path', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSCloud.Inst.defineAttribute(
    'registerProcedure', TP.xpc('./@registerProcedure', TP.hc('shouldCollapse',
            true, 'extractWith', 'value')));

TP.rss.RSSCloud.Inst.defineAttribute(
    'protocol', TP.xpc('./@protocol', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

//  ========================================================================
//  TP.rss.RSSImage
//  ========================================================================

/**
 * @type {TP.rss.RSSImage}
 * @summary Represents an RSS image element (that is, the icon representing the
 *     channel).
 */

//  ------------------------------------------------------------------------

TP.rss.RSSChannelSubelement.defineSubtype('RSSImage');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.rss.RSSImage.Inst.defineAttribute(
    'title', TP.xpc('./$def:title', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSImage.Inst.defineAttribute(
    'url', TP.xpc('./$def:url', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSImage.Inst.defineAttribute(
    'link', TP.xpc('./$def:link', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSImage.Inst.defineAttribute(
    'width', TP.xpc('./$def:width', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSImage.Inst.defineAttribute(
    'height', TP.xpc('./$def:height', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSSImage.Inst.defineAttribute(
    'description', TP.xpc('./$def:description', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

//  ========================================================================
//  TP.rss.RSSItem
//  ========================================================================

/**
 * @type {TP.rss.RSSItem}
 * @summary Represents an RSS item in an abstract form. Specific subtypes are
 *     used to manage the differences between RSS versions.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSChannelSubelement.defineSubtype('RSSItem');

TP.rss.RSSItem.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.rss.RSSItem.Type.defineAttribute('itemVersion');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.rss.RSSItem.Type.defineMethod('canConstruct',
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

TP.rss.RSSItem.Type.defineMethod('getConcreteType',
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

TP.rss.RSSItem.Inst.defineMethod('getVersion',
function() {

    /**
     * @method getVersion
     * @summary Returns the version of an RSS item that we are.
     * @returns {Number} The version of an RSS item that we are.
     */

    return this.getType().get('itemVersion');
});

//  ========================================================================
//  TP.rss.RSS091Item
//  ========================================================================

/**
 * @type {TP.rss.RSS091Item}
 * @summary A subtype of TP.rss.RSSItem that represents a version 0.91 RSS
 *     item. It provides getter properties for the standard 3 properties of a
 *     0.91 item - title, link and description.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSItem.defineSubtype('RSS091Item');

TP.rss.RSS091Item.set('itemVersion', '0.91');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.rss.RSS091Item.Inst.defineAttribute(
    'title', TP.xpc('./$def:title', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSS091Item.Inst.defineAttribute(
    'link', TP.xpc('./$def:link', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSS091Item.Inst.defineAttribute(
    'description', TP.xpc('./$def:description', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

//  ========================================================================
//  TP.rss.RSS092Item
//  ========================================================================

/**
 * @type {TP.rss.RSS092Item}
 * @summary A subtype of a Version 0.91 RSS Item that represents a Version 0.92
 *     RSS Item. It provides getter properties for the additional 3 properties
 *     of a 0.92 item - category, enclosure and source.
 */

//  ------------------------------------------------------------------------

TP.rss.RSS091Item.defineSubtype('RSS092Item');

TP.rss.RSS092Item.set('itemVersion', '0.92');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.rss.RSS092Item.Inst.defineAttribute(
    'category', TP.xpc('./$def:category', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS092Item.Inst.defineAttribute(
    'enclosure', TP.xpc('./$def:enclosure', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS092Item.Inst.defineAttribute(
    'source', TP.xpc('./$def:source', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

//  ========================================================================
//  TP.rss.RSS20Item
//  ========================================================================

/**
 * @type {TP.rss.RSS20Item}
 * @summary A subtype of RSS Item that represents a Version 2.0 RSS Item. It
 *     provides getter functionality for the additional properties of a 2.0
 *     item: comments, author, pubDate, and guid.
 */

//  ------------------------------------------------------------------------

TP.rss.RSS092Item.defineSubtype('RSS20Item');

TP.rss.RSS20Item.set('itemVersion', '2.0');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.rss.RSS20Item.Inst.defineAttribute(
    'comments', TP.xpc('./$def:comments', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS20Item.Inst.defineAttribute(
    'author', TP.xpc('./$def:author', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS20Item.Inst.defineAttribute(
    'pubDate', TP.xpc('./$def:pubDate', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSS20Item.Inst.defineAttribute(
    'guid', TP.xpc('./$def:guid', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

//  ========================================================================
//  TP.rss.RSSTextInput
//  ========================================================================

/**
 * @type {TP.rss.RSSTextInput}
 * @summary Represents an RSS textinput element. This element is usually
 *     ignored by user agents.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSChannelSubelement.defineSubtype('RSSTextInput');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.rss.RSSTextInput.Inst.defineAttribute(
    'title', TP.xpc('./$def:title', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSTextInput.Inst.defineAttribute(
    'name', TP.xpc('./$def:name', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSTextInput.Inst.defineAttribute(
    'link', TP.xpc('./$def:link', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSTextInput.Inst.defineAttribute(
    'description', TP.xpc('./$def:description', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

//  ------------------------------------------------------------------------
//  RSS Item Subelements
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.rss.RSSItemSubelement
//  ========================================================================

/**
 * @type {TP.rss.RSSItemSubelement}
 * @summary Represents a sub-element of an RSS item element.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSElement.defineSubtype('RSSItemSubelement');

//  ========================================================================
//  TP.rss.RSSEnclosure
//  ========================================================================

/**
 * @type {TP.rss.RSSEnclosure}
 * @summary Represents an RSS 0.92 / 2.0 enclosure element. An enclosure is a
 *     new element in RSS 0.92 that defines a url, length and type for
 *     out-of-band data that goes with the item, such as some sort of binary
 *     file.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSItemSubelement.defineSubtype('RSSEnclosure');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.rss.RSSEnclosure.Inst.defineAttribute(
    'length', TP.xpc('./@length', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

TP.rss.RSSEnclosure.Inst.defineAttribute(
    'enclosureType', TP.xpc('./@type', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

TP.rss.RSSEnclosure.Inst.defineAttribute(
    'url', TP.xpc('./@url', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

//  ========================================================================
//  TP.rss.RSSGUID
//  ========================================================================

/**
 * @type {TP.rss.RSSGUID}
 * @summary Represents an RSS 2.0 GUID element. A GUID is a new element in RSS
 *     2.0 that is a globally unique identifier for the item.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSItemSubelement.defineSubtype('RSSGUID');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.rss.RSSGUID.Inst.defineAttribute(
    'isPermaLink', TP.xpc('./@isPermaLink', TP.hc('shouldCollapse', true,
            'extractWith', 'value')));

//  ========================================================================
//  TP.rss.RSSItemCategory
//  ========================================================================

/**
 * @type {TP.rss.RSSItemCategory}
 * @summary Represents an RSS 0.92 / 2.0 item category element embedded in an
 *     item element.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSItemSubelement.defineSubtype('RSSItemCategory');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.rss.RSSItemCategory.Inst.defineAttribute(
    'domain', TP.xpc('./@domain', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

//  ========================================================================
//  TP.rss.RSSSource
//  ========================================================================

/**
 * @type {TP.rss.RSSSource}
 * @summary Represents an RSS 0.92 / 2.0 source element. A source is a new
 *     element in RSS 0.92 that defines a url for RSS channel that the item came
 *     from as derived from its title.
 */

//  ------------------------------------------------------------------------

TP.rss.RSSItemSubelement.defineSubtype('RSSSource');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.rss.RSSItemSubelement.Inst.defineAttribute(
    'path', TP.xpc('./@url', TP.hc('shouldCollapse', true, 'extractWith',
            'value')));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
