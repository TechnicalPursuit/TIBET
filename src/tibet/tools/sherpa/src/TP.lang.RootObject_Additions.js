//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.lang.RootObject Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineAttribute('sourceName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  API conformance - Due to a limitation in the TIBET traits system, it is not
//  possible to add traits (like TP.sherpa.ToolAPI) to TP.lang.RootObject due to
//  meta-circular issues.
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('canReuseContentForTool',
function(toolName, options) {

    /**
     * @method canReuseContentForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'canReuseContentFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getConfigForTool',
function(toolName, options) {

    /**
     * @method getContentForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getConfigFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getContentForTool',
function(toolName, options) {

    /**
     * @method getContentForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getContentFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    //  TODO: As a fallback, we do a this.as(toolName + 'Content')
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getDataForTool',
function(toolName, options) {

    /**
     * @method getDataForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getDataFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getPathPartsForTool',
function(toolName, options) {

    /**
     * @method getPathPartsForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getPathPartsFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('resolveAspectForTool',
function(toolName, anID, options) {

    /**
     * @method resolveAspectForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'resolveAspectFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](anID, options);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('canReuseContentForInspector',
function(options) {

    /**
     * @method canReuseContentForInspector
     * @summary Returns whether or not content hosted in an inspector bay can be
     *     'reused', even though the underlying data will change. If this
     *     returns true, then the underlying content needs to be able to respond
     *     to its data changing underneath it. It can leverage the TIBET data
     *     binding system to do this.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     check the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Boolean} Whether or not the current content can be reused even
     *     though the underlying data is changing.
     */

    var config,
        bayInspectorItem,

        firstChildElem,

        bayContentElementName;

    config = this.getConfigForInspector(options);

    bayInspectorItem = options.at('bayInspectorItem');

    if (TP.notValid(bayInspectorItem)) {
        return false;
    }

    firstChildElem = TP.nodeGetFirstChildElement(
                                bayInspectorItem.getNativeNode());

    if (!TP.isNode(firstChildElem)) {
        return false;
    }

    bayContentElementName = TP.elementGetFullName(firstChildElem);

    if (bayContentElementName === config.at('attr_contenttype')) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
     * @summary Returns the source's configuration data to configure the bay
     *     that the source's content will be hosted in.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {TP.core.Hash} Configuration data used by the inspector for bay
     *     configuration. This could have the following keys, amongst others:
     *          TP.ATTR + '_contenttype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary Returns the source's content that will be hosted in an inspector
     *     bay.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Element} The Element that will be used as the content for the
     *     bay.
     */

    var dataURI,
        elem;

    dataURI = TP.uc(options.at('bindLoc'));

    elem = TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');

    return elem;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    return TP.ac(
            TP.ac('Instance Methods', 'Instance Methods'),
            TP.ac('Instance Handlers', 'Instance Handlers'),
            TP.ac('Type Methods', 'Type Methods'),
            TP.ac('Instance Attributes', 'Instance Attributes'),
            TP.ac('Type Attributes', 'Type Attributes'),
            TP.ac('Subtypes', 'Subtypes'),
            TP.ac('Tests', 'Tests')
        );
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getPathPartsForInspector',
function(options) {

    /**
     * @method getPathPartsForInspector
     * @summary Returns the source's path parts that the inspector should be
     *     navigated to when it has neither a current resolver to resolve to or
     *     a path that's been supplied by the caller.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the path parts. This will have the following keys, amongst
     *     others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {String[]} The path parts that will navigate the inspector to
     *     the receiver.
     */

    return TP.ac('_TYPES_', this.getName());
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var source;

    switch (aSourceName) {

        case 'Instance Methods':

            source = TP.sherpa.InstanceMethodsInspectorSource.construct();
            source.addEntry('primary', this);

            break;

        case 'Instance Handlers':

            source = TP.sherpa.InstanceHandlersInspectorSource.construct();
            source.addEntry('primary', this);

            break;

        case 'Type Methods':

            source = TP.sherpa.TypeMethodsInspectorSource.construct();
            source.addEntry('primary', this);

            break;

        case 'Subtypes':

            source = TP.sherpa.SubtypesInspectorSource.construct();
            source.addEntry('primary', this);

            break;

        case 'Tests':

            source = TP.sherpa.TypeTestsInspectorSource.construct();
            source.addEntry('primary', this);

            break;

        default:
            break;
    }

    return source;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getEntryLabel',
function(anItem) {

    /**
     * @method getEntryLabel
     * @summary Returns the 'entry label' used in the receiver for the supplied
     *     Object in the receiver.
     * @param {Object} anItem The object to return the label for.
     * @returns {String} The label to be used for the supplied item.
     */

    return anItem;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    return this.getEntryAt(anAspect);
});

//  ------------------------------------------------------------------------
//  Toolbar API
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getContentForToolbar',
function(options) {

    /**
     * @method getContentForToolbar
     * @summary Returns the source's content that will be hosted in an inspector
     *     toolbar.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Element} The Element that will be used as the content for the
     *     toolbar.
     */

    return TP.elem('<sherpa:typeToolbarContent' +
                    ' tibet:ctrl="urn:tibet:sherpa_inspector_target"/>');
});

//  ------------------------------------------------------------------------
//  Actions API
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineHandler('SherpaInspectorTestType',
function(aSignal) {

    var cmd;

    cmd = ':test ' + this.getName();

    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmd);

    return this;
});

//  ========================================================================
//  TP.sherpa.InstanceMethodsInspectorSource
//  ========================================================================

TP.sherpa.InspectorSource.defineSubtype('InstanceMethodsInspectorSource');

//  ------------------------------------------------------------------------

TP.sherpa.InstanceMethodsInspectorSource.Inst.defineMethod(
    'getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    var sourceType,

        result,

        instProto,
        superInstProto,

        rawData;

    sourceType = this.getEntryAt('primary');

    result = TP.ac();

    instProto = sourceType.getInstPrototype();
    superInstProto = sourceType.getSupertype().getInstPrototype();

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Introduced');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_introduced_methods).sort();

    rawData = rawData.filter(
                function(item) {
                    return !/^handle/.test(item);
                });

    result.push(rawData);

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Overridden');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_overridden_methods).sort();

    rawData.forEach(
            function(item) {
                var owner;

                if (/^handle/.test(item)) {
                    return;
                }

                //  Note here how we get the owner from our supertype's version
                //  of the method - we know we've overridden it, so we want the
                //  owner we've overridden it from.
                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = superInstProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Inherited');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_inherited_methods).sort();

    rawData.forEach(
            function(item) {
                var owner;

                if (/^handle/.test(item)) {
                    return;
                }

                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = instProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    result = result.flatten();

    result = result.collect(
                function(entry) {
                    return TP.ac(
                            entry,
                            this.getEntryLabel(entry));
                }.bind(this));

    return result;
});

//  ------------------------------------------------------------------------

TP.sherpa.InstanceMethodsInspectorSource.Inst.defineMethod(
    'resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    var sourceType,

        instProto,

        aspect,

        methodName,
        method;

    sourceType = this.getEntryAt('primary');

    instProto = sourceType.getInstPrototype();

    aspect = anAspect;
    if (TP.isRegExp(aspect)) {
        aspect = TP.regExpUnescape(aspect.source);
    }

    methodName = /(\S+)\s*\(?/.exec(aspect)[1];
    method = instProto[methodName];

    return method;
});

//  ------------------------------------------------------------------------
//  Toolbar API
//  ------------------------------------------------------------------------

TP.sherpa.InstanceMethodsInspectorSource.Inst.defineMethod(
    'getContentForToolbar',
function(options) {

    /**
     * @method getContentForToolbar
     * @summary Returns the source's content that will be hosted in an inspector
     *     toolbar.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Element} The Element that will be used as the content for the
     *     toolbar.
     */

    return TP.elem('<sherpa:methodsToolbarContent' +
                    ' tibet:ctrl="urn:tibet:sherpa_inspector_target"/>');
});

//  ------------------------------------------------------------------------
//  Actions API
//  ------------------------------------------------------------------------

TP.sherpa.InstanceMethodsInspectorSource.Inst.defineHandler(
    'SherpaInspectorAddMethod',
function(aSignal) {

    var typeName;

    typeName = this.getEntryAt('primary').getName();

    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText',
                        ':method --assist' +
                                ' --name=\'newmethod\'' +
                                ' --owner=\'' + typeName + '\''
                ));

    return this;
});

//  ========================================================================
//  TP.sherpa.InstanceHandlersInspectorSource
//  ========================================================================

TP.sherpa.InstanceMethodsInspectorSource.defineSubtype(
                                            'InstanceHandlersInspectorSource');

//  ------------------------------------------------------------------------

TP.sherpa.InstanceHandlersInspectorSource.Inst.defineMethod(
    'getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    var sourceType,

        result,

        instProto,
        superInstProto,

        rawData;

    sourceType = this.getEntryAt('primary');

    result = TP.ac();

    instProto = sourceType.getInstPrototype();
    superInstProto = sourceType.getSupertype().getInstPrototype();

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Introduced');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_introduced_methods).sort();

    rawData = rawData.filter(
                function(item) {
                    return /^handle/.test(item);
                });

    result.push(rawData);

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Overridden');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_overridden_methods).sort();

    rawData.forEach(
            function(item) {
                var owner;

                if (!/^handle/.test(item)) {
                    return;
                }

                //  Note here how we get the owner from our supertype's version
                //  of the method - we know we've overridden it, so we want the
                //  owner we've overridden it from.
                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = superInstProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Inherited');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_inherited_methods).sort();

    rawData.forEach(
            function(item) {
                var owner;

                if (!/^handle/.test(item)) {
                    return;
                }

                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = instProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    result = result.flatten();

    result = result.collect(
                function(entry) {
                    return TP.ac(
                            entry,
                            this.getEntryLabel(entry));
                }.bind(this));

    return result;
});

//  ------------------------------------------------------------------------
//  Actions API
//  ------------------------------------------------------------------------

TP.sherpa.InstanceHandlersInspectorSource.Inst.defineHandler(
    'SherpaInspectorAddMethod',
function(aSignal) {

    var typeName;

    typeName = this.getEntryAt('primary').getName();

    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText',
                        ':method --assist' +
                                ' --name=\'SignalName\'' +
                                ' --kind=\'handler\'' +
                                ' --owner=\'' + typeName + '\''
                ));

    return this;
});

//  ========================================================================
//  TP.sherpa.TypeMethodsInspectorSource
//  ========================================================================

TP.sherpa.InspectorSource.defineSubtype('TypeMethodsInspectorSource');

//  ------------------------------------------------------------------------

TP.sherpa.TypeMethodsInspectorSource.Inst.defineMethod(
    'getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    var sourceType,

        result,

        typeProto,
        supertypeProto,

        rawData;

    sourceType = this.getEntryAt('primary');

    result = TP.ac();

    typeProto = sourceType.getPrototype();
    supertypeProto = sourceType.getSupertype().getPrototype();

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Introduced');

    rawData = typeProto.getInterface(
                    TP.SLOT_FILTERS.known_introduced_methods).sort();

    result.push(rawData);

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Overridden');

    rawData = typeProto.getInterface(
                    TP.SLOT_FILTERS.known_overridden_methods).sort();

    rawData.forEach(
            function(item) {
                var owner;

                //  Note here how we get the owner from our supertype's version
                //  of the method - we know we've overridden it, so we want the
                //  owner we've overridden it from.
                if (TP.isValid(typeProto[item]) &&
                    TP.isValid(owner = supertypeProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Inherited');

    rawData = typeProto.getInterface(
                    TP.SLOT_FILTERS.known_inherited_methods).sort();

    rawData.forEach(
            function(item) {
                var owner;

                if (TP.isValid(typeProto[item]) &&
                    TP.isValid(owner = typeProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    result = result.flatten();

    result = result.collect(
                function(entry) {
                    return TP.ac(
                            entry,
                            this.getEntryLabel(entry));
                }.bind(this));

    return result;
});

//  ------------------------------------------------------------------------

TP.sherpa.TypeMethodsInspectorSource.Inst.defineMethod(
    'resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    var sourceType,

        typeProto,

        aspect,

        methodName,
        method;

    sourceType = this.getEntryAt('primary');

    typeProto = sourceType.getPrototype();

    aspect = anAspect;
    if (TP.isRegExp(aspect)) {
        aspect = TP.regExpUnescape(aspect.source);
    }

    methodName = /(\S+)\s*\(?/.exec(aspect)[1];
    method = typeProto[methodName];

    return method;
});

//  ------------------------------------------------------------------------
//  Toolbar API
//  ------------------------------------------------------------------------

TP.sherpa.TypeMethodsInspectorSource.Inst.defineMethod(
    'getContentForToolbar',
function(options) {

    /**
     * @method getContentForToolbar
     * @summary Returns the source's content that will be hosted in an inspector
     *     toolbar.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Element} The Element that will be used as the content for the
     *     toolbar.
     */

    return TP.elem('<sherpa:methodsToolbarContent' +
                    ' tibet:ctrl="urn:tibet:sherpa_inspector_target"/>');
});

//  ------------------------------------------------------------------------
//  Actions API
//  ------------------------------------------------------------------------

TP.sherpa.TypeMethodsInspectorSource.Inst.defineHandler(
    'SherpaInspectorAddMethod',
function(aSignal) {

    var typeName;

    typeName = this.getEntryAt('primary').getName();

    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText',
                        ':method --assist' +
                                ' --name=\'newmethod\'' +
                                ' --track=\'type\'' +
                                ' --owner=\'' + typeName + '\''
                ));

    return this;
});

//  ========================================================================
//  TP.sherpa.SubtypesInspectorSource
//  ========================================================================

TP.sherpa.InspectorSource.defineSubtype('SubtypesInspectorSource');

//  ------------------------------------------------------------------------

TP.sherpa.SubtypesInspectorSource.Inst.defineMethod(
    'getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    var result;

    result = this.getEntryAt('primary').getSubtypeNames(true);

    result = result.collect(
                function(entry) {
                    return TP.ac(
                            entry,
                            this.getEntryLabel(entry));
                }.bind(this));

    return result;
});

//  ------------------------------------------------------------------------

TP.sherpa.SubtypesInspectorSource.Inst.defineMethod(
    'resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    return TP.sys.getTypeByName(anAspect);
});

//  ========================================================================
//  TP.sherpa.TypeTestsInspectorSource
//  ========================================================================

TP.sherpa.InspectorSource.defineSubtype('TypeTestsInspectorSource');

//  ------------------------------------------------------------------------

TP.sherpa.TypeTestsInspectorSource.Inst.defineMethod(
    'getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    var sourceType,

        result,

        params,

        nsRoot,

        rawData;

    sourceType = this.getEntryAt('primary');

    result = TP.ac();

    params = TP.hc('ignore_only', false, 'ignore_skip', false);

    nsRoot = sourceType.get('nsRoot');
    if (nsRoot !== 'APP') {
        params.atPut('context', 'lib');
    } else {
        params.atPut('context', 'app');
    }

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Type');

    params.atPut('target', sourceType.Type);
    rawData = TP.test.getCases(params);

    rawData.forEach(
            function(item) {
                result.push(
                    item.get('caseName') +
                        ' (' + item.get('suite').get('suiteName') + ')');
            });

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Instance');

    params.atPut('target', sourceType.Inst);
    rawData = TP.test.getCases(params);

    rawData.forEach(
            function(item) {
                result.push(
                    item.get('caseName') +
                        ' (' + item.get('suite').get('suiteName') + ')');
            });

    //  ---

    result.push(TP.GROUPING_PREFIX + ' - Type Local');

    params.atPut('target', sourceType);
    rawData = TP.test.getCases(params);

    rawData.forEach(
            function(item) {
                result.push(
                    item.get('caseName') +
                        ' (' + item.get('suite').get('suiteName') + ')');
            });

    //  ---

    result = result.flatten();

    result = result.collect(
                function(entry) {
                    return TP.ac(
                            entry,
                            this.getEntryLabel(entry));
                }.bind(this));

    return result;
});

//  ------------------------------------------------------------------------

TP.sherpa.TypeTestsInspectorSource.Inst.defineMethod(
    'resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    var sourceType,

        matchName,

        params,

        nsRoot,

        rawData,

        caseFunc,

        len,
        i,

        item;

    sourceType = this.getEntryAt('primary');

    //  ---

    params = TP.hc('ignore_only', false,
                    'ignore_skip', false);

    nsRoot = sourceType.get('nsRoot');
    if (nsRoot !== 'APP') {
        params.atPut('context', 'lib');
    } else {
        params.atPut('context', 'app');
    }

    //  ---

    matchName = anAspect.slice(0, anAspect.indexOf('(') - 1);

    params.atPut('target', sourceType.Type);
    rawData = TP.test.getCases(params);

    caseFunc = null;

    //  ---

    len = rawData.getSize();
    for (i = 0; i < len; i++) {
        item = rawData.at(i);
        if (item.get('caseName') === matchName) {
            caseFunc = item.get('caseFunc');
            break;
        }
    }

    //  ---

    if (TP.notValid(caseFunc)) {
        params.atPut('target', sourceType.Inst);
        rawData = TP.test.getCases(params);

        len = rawData.getSize();
        for (i = 0; i < len; i++) {
            item = rawData.at(i);
            if (item.get('caseName') === matchName) {
                caseFunc = item.get('caseFunc');
                break;
            }
        }
    }

    //  ---

    if (TP.notValid(caseFunc)) {
        params.atPut('target', sourceType);
        rawData = TP.test.getCases(params);

        len = rawData.getSize();
        for (i = 0; i < len; i++) {
            item = rawData.at(i);
            if (item.get('caseName') === matchName) {
                caseFunc = item.get('caseFunc');
                break;
            }
        }
    }

    if (TP.isCallable(caseFunc)) {
        return caseFunc;
    }

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
