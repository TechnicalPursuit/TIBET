//  ------------------------------------------------------------------------
//  TP.* wrappers
//  ------------------------------------------------------------------------

TP.definePrimitive('getConfigForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getConfigForTool')) {
        return anObject.getConfigForTool(toolName, options);
    }

    return TP.hc();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getContentForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getContentForTool')) {
        return anObject.getContentForTool(toolName, options);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getDataForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getDataForTool')) {
        return anObject.getDataForTool(toolName, options);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('resolveAspectForTool',
function(anObject, toolName, anID, options) {

    if (TP.canInvoke(anObject, 'resolveAspectForTool')) {
        return anObject.resolveAspectForTool(toolName, anID, options);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Assistant
//  ------------------------------------------------------------------------

TP.definePrimitive('getContentForAssistant',
function(anObject) {

    if (TP.canInvoke(anObject, 'getContentForAssistant')) {
        return anObject.getContentForAssistant();
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Editor
//  ------------------------------------------------------------------------

TP.definePrimitive('getDefaultEditingAspect',
function(anObject) {

    if (TP.canInvoke(anObject, 'getDefaultEditingAspect')) {
        return anObject.getDefaultEditingAspect();
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Tool API traits
//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa.ToolAPI');

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getConfigForTool',
function(toolName, options) {

    /**
     * @method getConfigForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getConfigFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    return TP.hc();
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getContentForTool',
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

TP.sherpa.ToolAPI.Inst.defineMethod('getDataForTool',
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

TP.sherpa.ToolAPI.Inst.defineMethod('resolveAspectForTool',
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
//  Editor
//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getContentForEditor',
function(options) {

    /**
     * @method getContentForEditor
     * @summary
     * @returns
     */

    var targetAspect,
        contentElem;

    targetAspect = options.at('targetAspect');

    contentElem = TP.xhtmlnode(
                '<div>' +
                '<textarea><![CDATA[' + this.get(targetAspect) + ']]></textarea>' +
                '</div>');

    if (!TP.isElement(contentElem)) {

        contentElem = TP.xhtmlnode(
                '<div>' +
                    '<textarea>' +
                        TP.xmlLiteralsToEntities(this.get(targetAspect)) +
                    '</textarea>' +
                '</div>');
    }

    return contentElem;
});

//  ------------------------------------------------------------------------
//  Inspector
//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
     * @summary
     * @returns
     */

    return TP.hc();
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary
     * @returns
     */

    var targetAspect,
        data,
        dataURI;

    targetAspect = options.at('targetAspect');

    if (targetAspect === this.getID()) {

        data = this.getDataForInspector(options);

        dataURI = TP.uc(options.at('bindLoc'));
        dataURI.setResource(data,
                            TP.request('signalChange', false));

        return TP.elem('<sherpa:navlist bind:in="' + dataURI.asString() + '"/>');
    }

    return this.getContentForEditor(options);
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary
     * @returns
     */

    return TP.keys(this);
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('resolveAspectForInspector',
function(anID, options) {

    /**
     * @method resolveAspectForInspector
     * @summary
     * @returns
     */

    return this;
});

//  ------------------------------------------------------------------------
//  Context Menu
//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getContentForContextMenu',
function(options) {

    /**
     * @method getContentForContextMenu
     * @summary
     * @returns
     */

    return TP.elem('<sherpa:haloMenuContent/>');
});

//  ========================================================================
//  Function Additions
//  ========================================================================

Function.Inst.defineMethod('getContentForEditor',
function(options) {

    /**
     * @method getContentForEditor
     * @summary
     * @returns
     */

    var dataURI,
        methodEditorTPElem;

    if (TP.isMethod(this)) {

        dataURI = TP.uc(options.at('bindLoc'));
        dataURI.setResource(options.at('target'),
                            TP.request('signalChange', false));

        methodEditorTPElem = TP.sherpa.methodeditor.getResourceElement(
                                'template',
                                TP.ietf.Mime.XHTML);
        methodEditorTPElem = methodEditorTPElem.clone();

        methodEditorTPElem.setAttribute('bind:in', dataURI.asString());

        return TP.unwrap(methodEditorTPElem);
    }

    return null;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary
     * @returns
     */

    return this.getContentForEditor(options);
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getContentForTool',
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

Function.Inst.defineMethod('getDataForBreadcrumb',
function() {

    var info,

        owner,
        superNames;

    info = TP.ac();

    if (TP.isMethod(this)) {

        if (!TP.isNamespace(owner = this[TP.OWNER])) {
            superNames = owner.getSupertypeNames().copy();
            superNames.reverse().perform(
                function(item) {
                    info.push(TP.ac('type', item));
                });
        }

        info.push(TP.ac('type', owner.getName()));
        info.push(TP.ac('method', this[TP.DISPLAY]));
    }

    return info;
});

//  ========================================================================
//  TP.lang.RootObject Additions
//  ========================================================================

TP.lang.RootObject.Type.defineMethod('getDataForBreadcrumb',
function() {

    var superNames,
        info;

    info = TP.ac();

    superNames = this.getSupertypeNames().copy();
    superNames.reverse().perform(
        function(item) {
            info.push(TP.ac('type', item));
        });

    info.push(TP.ac('type', this.getName()));

    return info;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary
     * @returns
     */

    var data,
        dataURI;

    data = this;

    dataURI = TP.uc(options.at('bindLoc'));
    dataURI.setResource(data,
                        TP.request('signalChange', false));

    return TP.elem('<sherpa:typedisplay bind:in="' + dataURI.asString() + '"/>');
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

TP.definePrimitive('getTypeInfoForInspector',
function(anObject) {

    if (TP.canInvoke(anObject, 'getTypeInfoForInspector')) {
        return anObject.getTypeInfoForInspector();
    }

    return TP.ac();
});

//  ---

TP.lang.RootObject.Type.defineMethod('getTypeInfoForInspector',
function() {

    var result,
        data,

        typeProto,
        instProto,

        superTypeProto,
        superInstProto,

        childrenData,
        rawData;

    result = TP.ac();

    typeProto = this.getPrototype();
    instProto = this.getInstPrototype();

    superTypeProto = this.getSupertype().getPrototype();
    superInstProto = this.getSupertype().getInstPrototype();

    //  ---

    data = TP.hc('name', 'Supertypes');

    rawData = this.getSupertypeNames();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var childData;

                childData = TP.hc('name', item);

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Subtypes');

    rawData = this.getSubtypeNames(true);

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var childData;

                childData = TP.hc('name', item);

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Introduced Methods (Type)');

    rawData = typeProto.getInterface('known_introduced_methods').sort();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var owner,
                    childData;

                childData = TP.hc('name', item);

                if (TP.isValid(typeProto[item]) &&
                    TP.isValid(owner = typeProto[item][TP.OWNER])) {
                    childData.atPut('owner', TP.name(owner));
                } else {
                    childData.atPut('owner', 'none');
                }

                childData.atPut('track', typeProto[item][TP.TRACK]);

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Overridden Methods (Type)');

    rawData = typeProto.getInterface('known_overridden_methods').sort();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var owner,
                    childData;

                childData = TP.hc('name', item);

                //  Note here how we get the owner from our supertype's version
                //  of the method - we know we've overridden it, so we want the
                //  owner we've overridden it from.
                if (TP.isValid(typeProto[item]) &&
                    TP.isValid(owner = superTypeProto[item][TP.OWNER])) {
                    childData.atPut('owner', TP.name(owner));
                } else {
                    childData.atPut('owner', 'none');
                }

                childData.atPut('track', typeProto[item][TP.TRACK]);

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Inherited Methods (Type)');

    rawData = typeProto.getInterface('known_inherited_methods').sort();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var owner,
                    childData;

                childData = TP.hc('name', item);

                if (TP.isValid(typeProto[item]) &&
                    TP.isValid(owner = typeProto[item][TP.OWNER])) {
                    childData.atPut('owner', TP.name(owner));
                } else {
                    childData.atPut('owner', 'none');
                }

                childData.atPut('track', typeProto[item][TP.TRACK]);

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Introduced Methods (Instance)');

    rawData = instProto.getInterface('known_introduced_methods').sort();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var owner,
                    childData;

                childData = TP.hc('name', item);

                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = instProto[item][TP.OWNER])) {
                    childData.atPut('owner', TP.name(owner));
                } else {
                    childData.atPut('owner', 'none');
                }

                childData.atPut('track', instProto[item][TP.TRACK]);

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Overridden Methods (Instance)');

    rawData = instProto.getInterface('known_overridden_methods').sort();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var owner,
                    childData;

                childData = TP.hc('name', item);

                //  Note here how we get the owner from our supertype's version
                //  of the method - we know we've overridden it, so we want the
                //  owner we've overridden it from.
                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = superInstProto[item][TP.OWNER])) {
                    childData.atPut('owner', TP.name(owner));
                } else {
                    childData.atPut('owner', 'none');
                }

                childData.atPut('track', instProto[item][TP.TRACK]);

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    //  ---

    data = TP.hc('name', 'Inherited Methods (Instance)');

    rawData = instProto.getInterface('known_inherited_methods').sort();

    childrenData = TP.ac();
    rawData.forEach(
            function(item) {
                var owner,
                    childData;

                childData = TP.hc('name', item);

                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = instProto[item][TP.OWNER])) {
                    childData.atPut('owner', TP.name(owner));
                } else {
                    childData.atPut('owner', 'none');
                }

                childData.atPut('track', instProto[item][TP.TRACK]);

                childrenData.push(childData);
            });

    data.atPut('children', childrenData);
    result.push(data);

    return result;
});

//  ========================================================================
//  TP.core.URI Additions
//  ========================================================================

TP.core.URI.Inst.defineMethod('getContentForEditor',
function(options) {

    /**
     * @method getContentForEditor
     * @summary
     * @returns
     */

    var uriEditorTPElem;

    uriEditorTPElem = TP.sherpa.urieditor.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML);

    return TP.unwrap(uriEditorTPElem);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary
     * @returns
     */

    return this.getContentForEditor(options);
});

//  ========================================================================
//  TP.core.ElementNode Additions
//  ========================================================================

TP.core.ElementNode.addTraits(TP.sherpa.ToolAPI);

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getDataForBreadcrumb',
function() {

    var info;

    info = TP.ac();

    this.ancestorsPerform(
            function(aNode) {
                var tpElem;

                if (TP.isElement(aNode)) {
                    tpElem = TP.wrap(aNode);

                    info.push(TP.ac('path', tpElem));
                }
            },
            true);

    info.push(TP.ac('path', this));

    return info;
});

//  ========================================================================
//  TP.core.CustomTag Additions
//  ========================================================================

TP.core.CustomTag.Inst.defineMethod('getContentForInspector',
function(options) {

    var targetAspect,
        data,
        dataURI,

        inspector,
        inspectorPath,
        tileTPElem,

        uriEditorTPElem;

    targetAspect = options.at('targetAspect');

    data = this.getDataForInspector(options);

    dataURI = TP.uc(options.at('bindLoc'));
    dataURI.setResource(data, TP.request('signalChange', false));

    if (targetAspect === this.getID()) {

        return TP.elem('<sherpa:navlist bind:in="' + dataURI.asString() + '"/>');

    } else if (targetAspect === 'Structure' || targetAspect === 'Style') {

        inspector = TP.byId('SherpaInspector', TP.win('UIROOT'));

        if (TP.isValid(inspector)) {
            inspectorPath =
                inspector.get('selectedItems').getValues().join(' :: ');

            if (TP.notEmpty(inspectorPath)) {

                tileTPElem =
                    TP.byCSSPath('sherpa|tile[path="' + inspectorPath + '"]',
                                    TP.win('UIROOT'),
                                    true);

                if (TP.isValid(tileTPElem)) {
                    return TP.xhtmlnode(
                    '<span>' + TP.sc('This content is open in a tile.') +
                    ' <button onclick="' +
                    'TP.byId(\'' + tileTPElem.getLocalID() + '\',' +
                        ' TP.win(\'UIROOT\'), true).' +
                    'setAttribute(\'hidden\', false)">' +
                    'Open Tile' +
                    '</button></span>');
                }
            }
        }

        uriEditorTPElem = TP.sherpa.urieditor.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML);
        uriEditorTPElem = uriEditorTPElem.clone();

        uriEditorTPElem.setAttribute('bind:in', dataURI.asString());

        return TP.unwrap(uriEditorTPElem);
    } else if (targetAspect === 'Type') {

        return TP.elem('<sherpa:typedisplay bind:in="' +
                        dataURI.asString() +
                        '"/>');
    }

    return TP.xhtmlnode('<div>' +
                        '<textarea>' + this.get(targetAspect) + '</textarea>' +
                        '</div>');
});

//  ------------------------------------------------------------------------

TP.core.CustomTag.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary
     * @returns
     */

    var targetAspect;

    if (TP.notEmpty(options)) {
        targetAspect = options.at('targetAspect');
    }

    if (targetAspect === this.getID()) {

        return TP.ac('Structure', 'Style', 'Tests', 'Type');

    } else if (targetAspect === 'Type') {

        return this.getType();

    } else {

        return this.getObjectForAspect(targetAspect);
    }
});

//  ------------------------------------------------------------------------

TP.core.CustomTag.Inst.defineMethod('getDefaultEditingAspect',
function(options) {

    /**
     * @method getDefaultEditingAspect
     * @summary
     * @returns
     */

    return 'Structure';
});

//  ------------------------------------------------------------------------

TP.core.CustomTag.Inst.defineMethod('getObjectForAspect',
function(anAspectName) {

    /**
     * @method
     * @summary
     * @returns
     */

    return null;
});

//  ========================================================================
//  TP.core.TemplatedTag Additions
//  ========================================================================

TP.core.TemplatedTag.Inst.defineMethod('getObjectForAspect',
function(anAspectName) {

    /**
     * @method
     * @summary
     * @returns
     */

    switch (anAspectName) {

        case 'Structure':
            //  NB: We're returning the TP.core.URI instance itself here.
            return this.getType().getResourceURI('template', TP.ietf.Mime.XHTML);

        case 'Style':
            //  NB: We're returning the TP.core.URI instance itself here.
            return this.getType().getResourceURI('style', TP.ietf.Mime.CSS);

        default:
            break;
    }

    return null;
});

//  ========================================================================
//  TP.core.CompiledTag Additions
//  ========================================================================

TP.core.CompiledTag.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary
     * @returns
     */

    var targetAspect,
        ourType;

    if (TP.notEmpty(options)) {
        targetAspect = options.at('targetAspect');
    }

    if (targetAspect === 'Structure') {

        ourType = this.getType();

        if (TP.owns(ourType, 'tagCompile')) {
            return ourType.tagCompile;
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.CompiledTag.Inst.defineMethod('getObjectForAspect',
function(anAspectName) {

    /**
     * @method
     * @summary
     * @returns
     */

    var ourType;

    switch (anAspectName) {

        case 'Structure':

            ourType = this.getType();

            if (TP.owns(ourType, 'tagCompile')) {
                return ourType.tagCompile;
            }

            break;

        case 'Style':
            return this.getType().getResourceURI('template', TP.ietf.Mime.CSS);

        default:
            break;
    }

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
