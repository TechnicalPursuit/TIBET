//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.xctrls.wayfinder}
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('wayfinder');

//  The wayfinder itself is an wayfinder source for the 'root' entries.
TP.xctrls.wayfinder.addTraits(TP.xctrls.WayfinderSource);

TP.xctrls.wayfinder.Inst.resolveTrait('init', TP.xctrls.TemplatedTag);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  Path aliases for use in the system
TP.xctrls.wayfinder.Type.defineConstant(
    'ALIASES', TP.hc(
        '_TYPES_', TP.ac('TIBET', 'Types')
    ));

//  Commonly used options
TP.xctrls.wayfinder.Type.defineConstant(
    'OPTIONS', TP.ac(
        TP.ATTR + '_childtype',
        TP.ATTR + '_class'
    ));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The states that are toggleable on this type and subtypes via the
//  TP.sig.UIToggle signal. By default, for TP.xctrls.wayfinder, the 'closed'
//  state is toggleable.
TP.xctrls.wayfinder.Type.defineAttribute('toggleableStateNames', TP.ac('closed'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Type.defineMethod('buildPath',
function(varargs) {

    /**
     * @method buildPath
     * @summary Builds a path, using all of the arguments supplied to the
     *     method, by resolving each alias and then joining it all back together
     *     with TP.PATH_SEP.
     * @param {arguments} varargs 0 to N variable args to put together to form a
     *     path.
     * @returns {String} The path, with aliases resolved, joined together with
     *     TP.PATH_SEP.
     */

    var args,
        pathParts;

    args = TP.args(arguments);

    pathParts = this.resolvePathAliases(args);

    return pathParts.join(TP.PATH_SEP);
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Type.defineMethod('resolvePathAliases',
function(pathParts) {

    /**
     * @method resolvePathAliases
     * @summary Resolves aliases in each supplied path part.
     * @param {String[]} pathParts The Array of path parts to resolve aliases
     *     in.
     * @returns {String[]} The supplied path parts, with the aliases resolved.
     */

    var newPathParts,

        aliases,

        i,
        pathPart;

    if (TP.isEmpty(pathParts)) {
        return pathParts;
    }

    newPathParts = TP.ac();

    aliases = this.get('ALIASES');

    for (i = 0; i < pathParts.getSize(); i++) {

        pathPart = pathParts.at(i);

        if (aliases.hasKey(pathPart)) {
            newPathParts.push(aliases.at(pathPart));
        } else {
            newPathParts.push(pathPart);
        }
    }

    newPathParts = newPathParts.flatten();

    return newPathParts;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    tpElem = TP.wrap(elem);

    tpElem.setup();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineAttribute('$haloAddedTarget');
TP.xctrls.wayfinder.Inst.defineAttribute('$lastHaloTargetGID');

TP.xctrls.wayfinder.Inst.defineAttribute('$noFillerBaysWidth');

TP.xctrls.wayfinder.Inst.defineAttribute('$dataKeys');

//  The data as massaged into what this control needs. This is reset whenever
//  the control's whole data set is reset.
TP.xctrls.wayfinder.Inst.defineAttribute('$convertedData');

TP.xctrls.wayfinder.Inst.defineAttribute('data');

TP.xctrls.wayfinder.Inst.defineAttribute('dynamicContentEntries');

TP.xctrls.wayfinder.Inst.defineAttribute('selectedItems');

TP.xctrls.wayfinder.Inst.defineAttribute('pathStack');
TP.xctrls.wayfinder.Inst.defineAttribute('pathStackIndex');

TP.xctrls.wayfinder.Inst.defineAttribute('extraTargetInfo');

TP.xctrls.wayfinder.Inst.defineAttribute('container',
    TP.cpc('> xctrls|content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @method init
     * @summary Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.uri.URI|String} aURI An optional URI from which the Node
     *     received its content.
     * @returns {TP.xctrls.wayfinder} The initialized instance.
     */

    this.callNextMethod();

    this.$set('entries', TP.hc(), false);
    this.$set('additionalConfig', TP.hc(), false);

    this.$set('pathStack', TP.ac(), false);
    this.$set('pathStackIndex', -1, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('addDynamicRoot',
function(target, forceRebuild) {

    /**
     * @method addDynamicRoot
     * @summary Adds a 'dynamic' root entry. That is, a root entry that can be
     *     added, renamed or removed at will.
     * @param {Object} target The target object to add as a dynamic root.
     * @param {Boolean} [forceRebuild=false] Whether or not to rebuild the
     *     receiver's root data.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    //  TODO: Update root with label config - look for it in the current list.
    //  If it's there, we should highlight it. Otherwise, add to the 'recents'
    //  part of the list (a LIFO queue with a 'sherpa.wayfinder.recent_max'
    //  count).

    var dynamicEntries;

    dynamicEntries = this.get('dynamicContentEntries');

    //  If the halo currently added the target, then we don't have to modify the
    //  dynamic entries or refresh the root data entries, but we do have to flip
    //  this flag so that when the halo blurs this target, it doesn't remove it.
    if (this.get('$haloAddedTarget')) {
        this.set('$haloAddedTarget', false);
        return this;
    }

    //  Make sure that we don't already have the target in our list of dynamic
    //  entries.
    if (!dynamicEntries.contains(target, TP.IDENTITY)) {

        //  It wasn't found - add it and rebuild the root data.
        dynamicEntries.unshift(target);
        this.buildRootBayData();

    } else if (forceRebuild) {

        //  The caller wanted to force rebuild - do it.
        this.buildRootBayData();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('addBay',
function(bayContent, bayConfig, process) {

    /**
     * @method addBay
     * @summary Adds a bay to the receiver using the supplied content and
     *     configuration.
     * @param {Element} bayContent The element containing the content of the
     *     bay.
     * @param {TP.core.Hash} bayConfig The bay configuration. This could have
     *     the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay wayfinder item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     * @param {Boolean} [process=true] Whether or not to process the supplied
     *     content. The default is true.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var id,
        childType,
        pathParts,
        bay;

    id = this.getLocalID();

    //  Start computing the unique ID by using the 'childType' (i.e. the type of
    //  control) if available.
    childType = bayConfig.at('attr_childtype');
    if (TP.notEmpty(childType)) {
        id += childType;
    }

    //  Then, if there are path parts, join them using '_' and append them to
    //  the id.
    pathParts = bayConfig.at('pathParts');
    if (TP.notEmpty(pathParts)) {
        id += '_' + pathParts.join('_');
    } else {
        //  Otherwise, this must be the ROOT list.
        id += '_' + 'ROOT';
    }

    //  Replace any invalid characters in the ID with '_'.
    TP.regex.INVALID_ID_CHARS.lastIndex = 0;
    id = id.replace(TP.regex.INVALID_ID_CHARS, '_');

    //  Create an wayfinderitem element with that ID.
    bay = TP.tpelem('<xctrls:wayfinderitem/>');
    bay.setAttribute('id', id);

    //  NOTE: We use setRawContent() here to avoid compiling twice. The content
    //  will be processed when it, along with it's item, is added to the
    //  inspector's overall container.
    bay.setRawContent(TP.wrap(bayContent));

    if (TP.notFalse(process)) {
        //  Append the new inspector item to the container here. Content
        //  compilation will take place here.
        //  Note the reassignment here.
        bay = this.get('container').addContent(bay);
    } else {
        bay = this.get('container').addRawContent(bay);
    }

    //  Awaken the content here.
    bay.awaken();

    //  Configure the bay.
    this.configureBay(bay, bayConfig);

    this.signal('WayfinderDidAddBay');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('buildRootBayData',
function() {

    /**
     * @method buildRootBayData
     * @summary Builds the root bay data.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var data,
        dataURI;

    data = this.getDataForWayfinder(TP.hc());

    dataURI = TP.uc(this.createDataLocation('_bay_0'));
    dataURI.setResource(data);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('createDataLocation',
function(uriSuffix) {

    /**
     * @method createDataLocation
     * @summary
     * @param {String} [uriSuffix]
     * @returns {String} The receiver.
     */

    var suffix;

    suffix = TP.ifEmpty(uriSuffix, '');

    return 'urn:tibet:' + this.getLocalID() + suffix;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('createHistoryEntry',
function(newPathParts) {

    /**
     * @method createHistoryEntry
     * @summary Creates a history entry for the receiver using the provided path
     *     parts.
     * @param {String[]} newPathParts The path parts used to create a history
     *     entry from.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var pathStack,
        pathStackIndex,
        historyPathParts;

    pathStack = this.get('pathStack');
    pathStackIndex = this.get('pathStackIndex');

    //  If the supplied index is somewhere in the current range of the entries
    //  that we're holding, then slice from the start through that index plus 1
    //  to create the new path stack. This clears everything "after" the
    //  supplied index.
    if (pathStackIndex < pathStack.getSize() - 1) {
        pathStack = pathStack.slice(0, pathStackIndex + 1);
        this.set('pathStack', pathStack);
    }

    //  See if the caller supplied specific path parts we should use for our
    //  history entry. If not, just use the currently selected path.
    historyPathParts = newPathParts;
    if (TP.isEmpty(historyPathParts)) {
        historyPathParts = TP.copy(this.get('selectedItems'));
    }

    pathStack.push(historyPathParts);
    this.set('pathStackIndex', pathStack.getSize() - 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('configureBay',
function(aBay, bayConfig) {

    /**
     * @method configureBay
     * @summary Configures the bay to accept a particular content using the
     *     configuration data provided.
     * @param {TP.xctrls.wayfinderitem} aBay The bay element to configure.
     * @param {TP.core.Hash} bayConfig The bay configuration. This could have
     *     the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay wayfinder item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var bayConfigKeys,
        commonOptions;

    bayConfigKeys = bayConfig.getKeys();

    //  Iterate over the common options and, if the key starts with 'TP.ATTR'
    //  and it's not in the config we're about to set, make sure that that value
    //  is removed from the bay's item element to give us a 'clean slate'.
    commonOptions = this.getType().OPTIONS;
    commonOptions.forEach(
            function(aKey) {

                //  Note here how we slice off 5 characters for the value of
                //  TP.ATTR.
                if (aKey.startsWith(TP.ATTR + '_') &&
                    bayConfigKeys.indexOf(aKey.slice(5)) === TP.NOT_FOUND) {
                    aBay.removeAttribute(aKey.slice(5));
                }
            });

    //  Iterate over the supplied configuration data and, if the key starts with
    //  'TP.ATTR', then use that key/value pair to set an attribute on the bay's
    //  item element.
    bayConfigKeys.forEach(
            function(aKey) {

                //  Note here how we slice off 5 characters for the value of
                //  TP.ATTR.
                if (aKey.startsWith(TP.ATTR + '_')) {
                    aBay.setAttribute(aKey.slice(5), bayConfig.at(aKey));
                }
            });

    aBay.set('config', bayConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('emptyBay',
function(aBay) {

    /**
     * @method emptyBay
     * @summary Empties a bay in the receiver.
     * @param {TP.xctrls.wayfinderitem} aBay The bay element to empty.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    aBay.empty();

    this.signal('WayfinderDidEmptyBay');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('emptyBaysAfter',
function(startBay) {

    /**
     * @method emptyBaysAfter
     * @summary Empties all of the bays that occur after the supplied bay.
     * @param {TP.xctrls.wayfinderitem} startBay The bay element to begin
     *     emptying from. This bay itself will *not* be emptied.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var existingBays,

        startIndex,

        len,
        i;

    existingBays = TP.byCSSPath(' xctrls|wayfinderitem', this);
    if (TP.isEmpty(existingBays)) {
        return this;
    }

    startIndex = existingBays.indexOf(startBay, TP.IDENTITY);

    len = existingBays.getSize();
    for (i = startIndex + 1; i < len; i++) {
        this.emptyBay(existingBays.at(i));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('finishUpdateAfterNavigation',
function(info) {

    /**
     * @method finishUpdateAfterNavigation
     * @summary Finishes updating the wayfinder, including the wayfinder target
     *     and toolbar. This also sizes and scrolls the wayfinder to the last
     *     bay.
     * @param {TP.core.Hash} info A hash containing the target object and aspect
     *     and the path parts.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var inspectorElem,

        target,

        targetURI,

        baysWidth,

        screenWidthAndHeight,
        screenWidth,

        diff,
        inspectorBays,
        inspectorItemsStyleSheetElem,
        inspectorBaySize,
        numToAdd,
        bayConfig,
        newTPElem,
        i;

    inspectorElem = this.getNativeNode();

    target = info.at('targetObject');

    //  Update the target value holder with the current target object.
    targetURI = TP.uc(this.createDataLocation('_wayfinder_target'));
    if (targetURI !== TP.NO_RESULT) {
        targetURI.setResource(target, TP.request('signalChange', false));
    }

    //  Grab the sum total of all of the widths of the bays and set an instance
    //  variable with the value, which we'll use for scrolling, etc. purposes.
    baysWidth = this.getInspectorBaysWidth();
    this.set('$noFillerBaysWidth', baysWidth);

    //  Grab the screen width. We'll use this below to determine whether or not
    //  we need 'filler bays'. Most of the time we will, since the user can
    //  emlarge the window past the end of the last 'real' bay.
    screenWidthAndHeight = TP.windowGetScreenWidthAndHeight(
                            TP.nodeGetTopWindow(inspectorElem));
    screenWidth = screenWidthAndHeight.first();

    //  If the width of the 'real bays' is less than the screen width (more than
    //  likely), then add 'filler' bays to 'fill out' the rest of the space.
    if (baysWidth < screenWidth) {

        //  The difference between the screen width and the bays width.
        diff = screenWidth - baysWidth;

        //  Grab the inspector bays (but not the filler bays).
        inspectorBays = this.getInspectorBays();

        //  This should never be empty (we should always have at least one 'real
        //  bay'), but just in case.
        if (TP.notEmpty(inspectorBays)) {

            //  Grab the style sheet element that contains the rule that gives
            //  us our minimum width for inspector bays.
            inspectorItemsStyleSheetElem =
                TP.styleSheetGetOwnerNode(
                    inspectorBays.first().getStylesheetForStyleResource());

            //  Query it for the custom CSS property that defines the minimum
            //  bay width.
            inspectorBaySize = TP.cssElementGetCustomCSSPropertyValue(
                                        inspectorItemsStyleSheetElem,
                                        'xctrls|wayfinderitem',
                                        '--xctrls-wayfinder-item-minwidth');
            inspectorBaySize = inspectorBaySize.asNumber();

            //  Divide it and round up (it's better to add 1 more than be short
            //  1 bay).
            numToAdd = (diff / inspectorBaySize).ceil();

            bayConfig = TP.getConfigForTool(
                        this,
                        'inspector',
                        TP.hc('pathParts', TP.ac('FILLER'),
                                'targetAspect', null,
                                'targetObject', null));

            //  Create new 'filler' bay content.
            newTPElem = TP.wrap(TP.xhtmlnode('<div class="filler"/>'));

            //  Iterate and add filler bays.
            for (i = 0; i < numToAdd; i++) {
                bayConfig.atPut('pathParts', TP.ac('FILLER_' + i));
                this.addBay(newTPElem.clone(), bayConfig, false);
            }
        }
    }

    (function() {
        //  Scroll them to the end (of the real bays).
        this.scrollBaysToEnd();

        this.signal('WayfinderDidFocus');

        //  Grab the inspector bays (but not the filler bays).
        inspectorBays = this.getInspectorBays();
        if (TP.notEmpty(inspectorBays)) {
            inspectorBays.last().focus();
        }
    }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('focusInspectorOnHome',
function() {

    /**
     * @method focusInspectorOnHome
     * @summary Focus the wayfinder on the 'home' target, which is when there is
     *     no target selected, the leftmost bay is showing the root content and
     *     there are no selected items.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var info;

    info = TP.hc('targetObject', this,
                    'targetAspect', this.getID(),
                    'bayIndex', 0);

    //  Note here how we pass false to avoid creating a history entry for this
    //  action.
    this.populateBayUsing(info, false);

    this.finishUpdateAfterNavigation(info);

    this.get('selectedItems').empty();

    this.signal('WayfinderDidFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('focusUsingInfo',
function(anInfo) {

    /**
     * @method focusUsingInfo
     * @summary Focuses the receiver using the information provided in anInfo.
     * @param {TP.core.Hash} options A hash of data available to the receiver to
     *     focus. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object to be
     *                              focused.
     *          'targetAspect':     The property of the target object to be
     *                              focused.
     *          'targetPath':       A specific path to navigate the receiver to.
     *          'showBusy':         Whether or not show the 'busy' animation
     *                              while focusing.
     *          'extraTargetInfo':  Extra target information to pass along to
     *                              the focusing process.
     *          'addTargetAsRoot':  Whether or not to add the target object as a
     *                              'root' level entry in the receiver.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var currentBayIndex,

        domTarget,
        inspectorBay,
        inspectorBays,

        target,
        targetAspect,
        targetPath,

        initialSelectedItemValues,

        resolver,

        info,

        dynamicContentEntries,

        haloDidAddTarget,

        rootEntryResolver,
        rootBayItem,

        originalPathParts,
        pathParts,
        rootInfo,

        i,

        nextBay,

        historyPathParts;

    targetAspect = anInfo.at('targetAspect');
    target = anInfo.at('targetObject');
    targetPath = anInfo.at('targetPath');

    if (TP.notEmpty(targetPath)) {
        //  Convert '/'s to TP.PATH_SEP (but preserve backslashed '/'s)
        targetPath = TP.stringSplitSlashesAndRejoin(targetPath, TP.PATH_SEP);
    }

    //  Grab all of the inspector bays in the receiver.
    //  NB: inspectorBays could be empty here, and that's ok.

    //  Grab the inspector bays (but not the filler bays).
    inspectorBays = this.getInspectorBays();

    //  Pass along any extra targeting information that editors or property
    //  panels would want by putting that onto one of our slots.
    this.set('extraTargetInfo', anInfo.at('extraTargetInfo'));

    initialSelectedItemValues = this.get('selectedItems');

    //  If the path is already selected, then we're already there - exit early.
    if (TP.notEmpty(initialSelectedItemValues) &&
        initialSelectedItemValues.join(TP.PATH_SEP) === targetPath) {
        return this;
    }

    //  Try to determine the current bay index.

    currentBayIndex = anInfo.at('bayIndex');
    domTarget = anInfo.at('domTarget');

    //  If one isn't provided, but a DOM target is, then try to compute one from
    //  there.
    if (!TP.isNumber(currentBayIndex) && TP.isNode(domTarget)) {

        inspectorBay = TP.nodeGetFirstAncestorByTagName(
                                domTarget, 'xctrls:wayfinderitem');

        inspectorBay = TP.wrap(inspectorBay);

        currentBayIndex = inspectorBay.getBayIndex();
    }

    //  Try to determine the current target.

    //  If a valid target wasn't supplied, but we do have a current bay index,
    //  go to the wayfinder item located in that bay and obtain it's 'resolver'.
    if (TP.notValid(target) && TP.isNumber(currentBayIndex)) {

        inspectorBay = inspectorBays.at(currentBayIndex);
        resolver = inspectorBay.get('config').at('resolver');

        //  If we have a valid resolver, use it to compute the target from the
        //  target aspect.
        if (TP.isValid(resolver)) {
            target = TP.resolveAspectForTool(
                        resolver,
                        'wayfinder',
                        targetAspect,
                        TP.hc('pathParts',
                                this.get('selectedItems')));
        }

        if (target === TP.BREAK) {
            return this;
        }
    }

    info = TP.hc('targetObject', target, 'targetAspect', targetAspect);

    dynamicContentEntries = this.get('dynamicContentEntries');

    //  If the target is the wayfinder itself, build the root data, load up bay
    //  0 and return.
    if (target === this) {

        this.buildRootBayData();

        //  Populate bay 0
        info.atPut('bayIndex', 0);
        info.atPut('targetAspect', this.getID());

        this.populateBayUsing(info);

        this.finishUpdateAfterNavigation(info);

        this.signal('WayfinderDidFocus');

        return this;
    }

    if (TP.isTrue(anInfo.at('addTargetAsRoot'))) {

        //  Add the target as a 'dynamic root' (if it's not already there).
        this.addDynamicRoot(target);

        this.selectItemInBay(this.getEntryLabel(target), 0);

        info.atPut('bayIndex', 1);

        //  Select the item (in bay 0) and populate bay 1
        this.populateBayUsing(info);

        //  Now that we have more inspector items, obtain the list again.

        //  Grab the inspector bays (but not the filler bays).
        inspectorBays = this.getInspectorBays();

    } else if (TP.isValid(target) && TP.isValid(resolver)) {

        //  No target object was supplied, but the current bay had a resolver
        //  that it resolved the target aspect against to get the target object.

        if (TP.isNumber(currentBayIndex)) {
            info.atPut('bayIndex', currentBayIndex + 1);
        }

        info.atPut('targetObject', target);

        this.populateBayUsing(info);

        this.finishUpdateAfterNavigation(info);

        this.signal('WayfinderDidFocus');

        return this;
    } else if (TP.isValid(target) && TP.isEmpty(targetPath)) {

        //  We're not going to add as dynamic root, but try to traverse to
        //  instead.

        //  First, see if the target can produce a path that we can try.
        originalPathParts = TP.getPathPartsForTool(
                                target,
                                'wayfinder',
                                TP.hc('pathParts',
                                        this.get('selectedItems')));

        if (TP.isEmpty(originalPathParts)) {
            //  TODO: Raise an exception
            return this;
        }

        //  If any of these path parts returned an alias, look it up here.
        pathParts = this.getType().resolvePathAliases(originalPathParts);

        if (TP.isEmpty(pathParts)) {
            //  TODO: Raise an exception
            return this;
        }

        //  Compute the root resolver

        //  First, try the dynamic entries

        //  See if we've already got the root resolver as a current dynamic
        //  root.
        rootEntryResolver = dynamicContentEntries.detect(
                            function(anItem) {
                                return TP.id(anItem) === pathParts.first();
                            });

        if (TP.notValid(rootEntryResolver)) {
            rootEntryResolver = this.getEntryAt(pathParts.first());
        }

        //  If we got a valid root resolver entry
        if (TP.isValid(rootEntryResolver)) {

            //  Reset the target to the resolver - we've gotten the path to it
            //  now, so we need to start from the root resolved object
            target = rootEntryResolver;

            rootBayItem = pathParts.shift();
            targetPath = pathParts.join(TP.PATH_SEP);

            if (dynamicContentEntries.contains(target, TP.IDENTITY)) {
                this.selectItemInBay(TP.id(target), 0);
            } else {
                this.selectItemInBay(this.getEntryLabel(target), 0);
            }

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc('bayIndex', 1,
                                'targetAspect', rootBayItem,
                                'targetObject', target);
            this.populateBayUsing(rootInfo);

            //  If there were no more segments to the path, then just exit here.
            if (TP.isEmpty(targetPath)) {
                return this;
            }

            info.atPut('targetPath', targetPath);

            //  We computed a target path and navigated the first bay. We need
            //  to reset the target aspect to be the first item of the remaining
            //  path
            info.atPut('targetAspect', targetPath.first());

            info.atPut('bayIndex', 2);

            //  Now that we have more inspector items, obtain the list again.

            //  Grab the inspector bays (but not the filler bays).
            inspectorBays = this.getInspectorBays();
        } else {
            //  No root resolver - can't go any further
            return this;
        }
    } else if (TP.notValid(target) && TP.notEmpty(targetPath)) {

        pathParts = targetPath.split(TP.PATH_SEP);

        //  If any of these path parts returned an alias, look it up here.
        pathParts = this.getType().resolvePathAliases(pathParts);

        //  Compute the target

        //  First, try the static entries
        target = this.getEntryAt(pathParts.first());

        //  If a target couldn't be found, try the dynamic entries
        if (TP.notValid(target)) {

            //  See if we've already got the target as a current dynamic root.
            target = dynamicContentEntries.detect(
                            function(anItem) {
                                return TP.id(anItem) === pathParts.first();
                            });
        }

        //  If not, see if we can find the target somewhere in the system.
        //  Because the 'path' that gets bookmarked when a dynamic root is
        //  bookmarked is the target's global ID, we can use TP.bySystemId() to
        //  see if the target can be found somewhere in the system.

        if (TP.notValid(target)) {
            target = TP.bySystemId(pathParts.first());

            //  If we found a valid target, add it as a dynamic root. It is now
            //  available for the rest of the session.
            if (TP.isValid(target)) {

                //  For now, we flip this flag to false since if there's another
                //  object that has been halo'ed on and the halo has added that
                //  reference to the root bays, the call to 'addDynamicRoot'
                //  will flip this flag false and just return - which is
                //  definitely not what we want.
                haloDidAddTarget = this.get('$haloAddedTarget');
                this.set('$haloAddedTarget', false);

                this.addDynamicRoot(target);

                this.set('$haloAddedTarget', haloDidAddTarget);
            }
        }

        //  If we got a valid target
        if (TP.isValid(target)) {

            rootBayItem = pathParts.shift();

            if (dynamicContentEntries.contains(target, TP.IDENTITY)) {
                this.selectItemInBay(TP.id(target), 0);
            } else {
                this.selectItemInBay(this.getEntryLabel(target), 0);
            }

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc('bayIndex', 1,
                                'targetAspect', rootBayItem,
                                'targetObject', target);
            this.populateBayUsing(rootInfo, false);

            info.atPut('bayIndex', 2);

            //  Now that we have more inspector items, obtain the list again.

            //  Grab the inspector bays (but not the filler bays).
            inspectorBays = this.getInspectorBays();

        } else {

            //  Get the root resolver
            rootEntryResolver = this.getEntryAt(pathParts.first());

            //  If we got a valid root resolver entry
            if (TP.isValid(rootEntryResolver)) {

                //  Reset the target to the resolver - we've gotten the path to
                //  it now, so we need to start from the root resolved object
                target = rootEntryResolver;

                rootBayItem = pathParts.shift();
                targetPath = pathParts.join(TP.PATH_SEP);

                this.selectItemInBay(rootBayItem, 0);

                //  Select the item (in bay 0) and populate bay 1
                rootInfo = TP.hc('bayIndex', 1,
                                    'targetAspect', rootBayItem,
                                    'targetObject', target);
                this.populateBayUsing(rootInfo, false);

                info.atPut('bayIndex', 2);

                //  Now that we have more inspector items, obtain the list again.

                //  Grab the inspector bays (but not the filler bays).
                inspectorBays = this.getInspectorBays();
            }
        }
    }

    if (TP.notEmpty(targetPath)) {

        if (TP.isEmpty(pathParts)) {
            pathParts = targetPath.split(TP.PATH_SEP);
        }

        //  If the first path part is '__TARGET__', then we compute a path to
        //  the target object and replace that entry with it.
        if (pathParts.first() === '__TARGET__') {

            originalPathParts = TP.getPathPartsForTool(
                                target,
                                'wayfinder',
                                TP.hc('pathParts',
                                        this.get('selectedItems')));

            //  Replace the entry by slicing off the '__TARGET__' entry and
            //  appending that to the computed path parts.
            pathParts = originalPathParts.concat(pathParts.slice(1));

            //  If any of these path parts returned an alias, look it up here.
            pathParts = this.getType().resolvePathAliases(pathParts);

            rootBayItem = pathParts.shift();

            if (dynamicContentEntries.contains(target, TP.IDENTITY)) {
                this.selectItemInBay(TP.id(target), 0);
                rootEntryResolver = target;
            } else {
                this.selectItemInBay(rootBayItem, 0);
                rootEntryResolver = this.getEntryAt(rootBayItem);
            }

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc('bayIndex', 1,
                                'targetAspect', rootBayItem,
                                'targetObject', rootEntryResolver);
            this.populateBayUsing(rootInfo, false);

            //  Now that we have more inspector items, obtain the list again.

            //  Grab the inspector bays (but not the filler bays).
            inspectorBays = this.getInspectorBays();
        } else {
            //  If any of these path parts returned an alias, look it up here.
            pathParts = this.getType().resolvePathAliases(pathParts);
        }

        for (i = 0; i < pathParts.getSize(); i++) {

            //  If we have a valid bay at a spot one more than the path
            //  segment that we're processing for, then grab its resolver and
            //  try to traverse that segment.
            nextBay = inspectorBays.at(i + 1);

            if (TP.isValid(nextBay)) {
                resolver = nextBay.get('config').at('resolver');

                targetAspect = pathParts.at(i);

                //  Resolve the targetAspect to a target object
                target = TP.resolveAspectForTool(
                                resolver,
                                'wayfinder',
                                targetAspect,
                                TP.hc('pathParts',
                                        this.get('selectedItems')));

                if (TP.notValid(target)) {
                    break;
                }

                //  Select the item named. Note that targetAspect could be a
                //  RegExp here and it's up to the control to do the right thing
                //  with that.
                this.selectItemInBay(targetAspect, i + 1);

                //  If targetAspect is a RegExp, then we can't use that as the
                //  final value for selection - go to the control that's
                //  embedded in the wayfinder item at i + 1 and get it's
                //  currentValue to use as the targetAspect.
                if (TP.isRegExp(targetAspect)) {
                    targetAspect = this.getInspectorBayContentItem(
                                                i + 1).get('value');
                }

                //  If we got original path parts above (which might be
                //  aliased), those are the ones that we want to pass along for
                //  history purposes here. If it's empty, then just use the path
                //  parts that we computed (prepended by the rootBayItem, if we
                //  have one).
                if (TP.notEmpty(originalPathParts)) {
                    historyPathParts = originalPathParts;
                } else {
                    historyPathParts = pathParts.slice(0, i + 1);
                    if (TP.notEmpty(rootBayItem)) {
                        historyPathParts.unshift(rootBayItem);
                    }
                }

                info = TP.hc('targetObject', target,
                                'targetAspect', targetAspect,
                                'bayIndex', i + 2,
                                'historyPathParts', historyPathParts);

                //  Only create a history entry if we're processing the last
                //  item in the path.
                if (i < pathParts.getSize() - 1) {
                    this.populateBayUsing(info, false);
                } else {
                    this.populateBayUsing(info);
                }

                //  Now that we have more inspector items, obtain the list
                //  again.

                //  Grab the inspector bays (but not the filler bays).
                inspectorBays = this.getInspectorBays();
            }
        }
    } else {

        if (TP.isValid(info.at('targetObject'))) {
            if (TP.isNumber(currentBayIndex)) {
                info.atPut('bayIndex', currentBayIndex + 1);
            }

            this.populateBayUsing(info);
        }
    }

    //  If there was no computed target and no target path, then we have an
    //  uninspectable object on our hands. Redirect to ourself (by setting the
    //  targetObject to be ourself), but with a target aspect of TP.NOT_FOUND.
    //  This will trigger the config, content, etc. methods on ourself to return
    //  config and content suitable for an uninspectable object. Note how we
    //  supply an alternate 'selectedAspect' here (set to be the original
    //  aspect). This allows controls that rely on the selectedItems property to
    //  still gain access to the original aspect, while we signal to the rest of
    //  the wayfinder machinery that we have an uninspectable object.
    if (TP.notValid(target) && TP.isEmpty(targetPath)) {
        info = TP.hc('targetObject', this,
                        'targetAspect', TP.NOT_FOUND,
                        'bayIndex', currentBayIndex + 1,
                        'selectedAspect', targetAspect);

        //  Note here how we pass false to avoid creating a history entry for
        //  this action.
        this.populateBayUsing(info, false);
    }

    //  Note here how we use the last populated 'info' object
    this.finishUpdateAfterNavigation(info);

    this.signal('WayfinderDidFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getBayFromSlotPosition',
function(aSlotPosition) {

    /**
     * @method getBayFromSlotPosition
     * @summary Returns the bay from the supplied 'slot' position.
     * @description Because bays can take more than 1 'slot' in the wayfinder
     *     (i.e. they can be 'double wide' and take up 2 slots), there needs to
     *     be a way to translate between bays and slot numbers.
     * @param {Number} aSlotPosition The slot position to return the bay for.
     * @returns {TP.xctrls.wayfinderitem} The bay occupying the supplied slot
     *     position.
     */

    var inspectorBays,
        currentSlotCount,

        len,
        i;

    if (!TP.isNumber(aSlotPosition)) {
        return null;
    }

    //  Grab the inspector bays (but not the filler bays).
    inspectorBays = this.getInspectorBays();
    if (TP.isEmpty(inspectorBays)) {
        return null;
    }

    if (aSlotPosition === 0) {
        return inspectorBays.first();
    }

    //  Grab the first bay 'multiplier'.
    currentSlotCount = inspectorBays.first().getBayMultiplier();

    //  Iterate over the remaining bays, summing up the bay 'multiplier's across
    //  them.
    len = inspectorBays.getSize();
    for (i = 1; i < len; i++) {
        currentSlotCount += inspectorBays.at(i).getBayMultiplier();

        //  If we're at a bay where we're more than the slot position (the bay
        //  numbers are 0-based, but the count is 1-based), then return that
        //  bay.
        if (currentSlotCount > aSlotPosition) {
            return inspectorBays.at(i);
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getBayNumForPathParts',
function(pathParts) {

    /**
     * @method getBayNumForPathParts
     * @summary Returns the number of the bay that the supplied path is
     *     currently loaded into.
     * @param {String[]} pathParts The Array of path parts to use to obtain the
     *     content item.
     * @returns {Number} The number of the bay that the path is loaded into.
     */

    var matcher,
        currentPathParts,
        currentPath,

        bayNum;

    //  Compute a RegExp from the path parts joined together with the path
    //  separator, looking for an exact match from start to end.
    matcher = TP.rc('^' +
                    TP.PATH_START + pathParts.join(TP.PATH_SEP) + TP.PATH_END +
                    '$');

    //  Grab the set of currently selected labels and copy them.
    currentPathParts = TP.copy(this.getSelectedLabels());

    while (!currentPathParts.isEmpty()) {
        //  Start with the most specific path.

        //  Join the path together with the PATH_SEP and then bookend it
        //  PATH_START and PATH_END. This will provide the most accurate match
        //  with the registered method matchers.
        currentPath = TP.PATH_START +
                        currentPathParts.join(TP.PATH_SEP) +
                        TP.PATH_END;

        //  Test that path against the RegExp computed from the supplied path
        //  parts. If it matches, then return the bay number as computed from
        //  the size of the current path parts. Note that this is a '1-index'
        //  Number by design.
        if (matcher.test(currentPath)) {
            bayNum = currentPathParts.getSize();
            return bayNum;
        }

        //  Didn't match the path. Pop an entry off of the end and try again
        //  with the next most specific path.
        currentPathParts.pop();
    }

    return TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getCurrentHistoryEntryAsPath',
function() {

    /**
     * @method getCurrentHistoryEntryAsPath
     * @summary Returns the current history entry as a path, doing whatever
     *     substitutions or escaping is necessary.
     * @returns {String} The current history entry as a path.
     */

    var currentHistoryEntry,

        pathParts,

        len,
        i,

        str;

    //  Grab the current history entry as computed by the xctrls wayfinder.
    currentHistoryEntry = this.get('currentHistoryEntry');

    if (TP.isEmpty(currentHistoryEntry)) {
        return '';
    }

    pathParts = TP.ac();

    //  Iterate over each piece of the current history entry.
    len = currentHistoryEntry.getSize();
    for (i = 0; i < len; i++) {

        //  If the current piece is 'TIBET', then a special 'resolved' value
        //  might be in the next part of the entry.
        if (currentHistoryEntry.at(i) === 'TIBET') {

            //  If the next piece is 'URIs', then push '_URIS_' (the original
            //  value alias for URIs) and increment by 1, thereby basically
            //  skipping the original 'TIBET' entry. Continue on to avoid
            //  pushing any more parts.
            if (currentHistoryEntry.at(i + 1) === 'URIs') {
                pathParts.push('_URIS_');
                i++;
                continue;
            }
        }

        //  Push the part, but replace slashes with an escaped slash first.
        pathParts.push(currentHistoryEntry.at(i).replace(/\//g, '\\/'));
    }

    //  Join them together with a slash
    str = pathParts.join('/');

    return str;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getCurrentPropertyValueForTool',
function(propertyName, toolName) {

    /**
     * @method getCurrentPropertyValueForTool
     * @summary Returns the value of the named property for the named tool.
     * @param {String} propertyName The name of the property to return the value
     *     for.
     * @param {String} toolName The name of the tool to return the property
     *     value for.
     * @returns {Object} The current property value for the named property and
     *     tool.
     */

    var currentResolver,

        params,

        methodName,
        result;

    //  Grab the current resolver. If there is none, then just exit and return
    //  null.
    currentResolver = this.getCurrentResolver();
    if (TP.notValid(currentResolver)) {
        return null;
    }

    //  Construct a 'pathParts' by using our currently selected items.
    params = TP.hc('pathParts', this.get('selectedItems'));

    //  Compute a method name for the 'TP' object that will attempt to retrieve
    //  the named property value.
    methodName = 'get' + propertyName.asTitleCase() + 'ForTool';
    result = TP[methodName](currentResolver, toolName, params);

    return result;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getCurrentResolver',
function() {

    /**
     * @method getCurrentResolver
     * @summary Returns the resolver object of the currently selected bay.
     * @returns {Object} The resolver object of the current bay.
     */

    var inspectorBays,

        lastResolver;

    //  Grab the inspector bays (but not the filler bays).
    inspectorBays = this.getInspectorBays();
    if (TP.isEmpty(inspectorBays)) {
        return null;
    }

    //  Grab the 'resolver' for the last wayfinder bay. This is the object that
    //  will be messaged to get the data.
    lastResolver = inspectorBays.last().get('config').at('resolver');
    if (TP.notValid(lastResolver)) {
        return null;
    }

    return lastResolver;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getInspectorBayContentItem',
function(aBayNum) {

    /**
     * @method getInspectorBayContentItem
     * @summary Retrieves the content item under the bay at the supplied bay
     *     number.
     * @param {Number} [aBayNum] The bay number to retrieve the content for. If
     *     this is not supplied, the "last" bay's content is retrieved.
     * @returns {TP.dom.ElementNode} The content element under the wayfinder
     *     item representing the bay at the supplied bay number.
     */

    var inspectorBayContentItems,
        bayNum;

    if (TP.notEmpty(inspectorBayContentItems =
                    TP.byCSSPath(' xctrls|wayfinderitem > *', this))) {

        bayNum = aBayNum;
        if (!TP.isNumber(bayNum)) {
            bayNum = inspectorBayContentItems.getSize() - 1;
        }

        return inspectorBayContentItems.at(bayNum);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getSelectedLabels',
function() {

    /**
     * @method getSelectedLabels
     * @summary Returns the labels for the set of currently selected items. Note
     *     that the aspects which represent the selected items are not
     *     necessarily the labels that are being shown to the user. This method
     *     traverses those items and converts them into labels.
     * @returns {String[]} The list of labels representing the currently
     *     selected items.
     */

    var selectedItems,
        resolver,

        result,

        len,
        i;

    selectedItems = this.get('selectedItems');

    /* eslint-disable consistent-this */
    resolver = this;
    /* eslint-enable consistent-this */

    result = TP.ac();

    len = selectedItems.getSize();
    for (i = 0; i < len; i++) {

        //  Query the resolver for the label for the item.
        result.push(resolver.getEntryLabel(selectedItems.at(i)));

        //  Traverse down, performing a getEntryAt() at each step, which
        //  will return the next resolver.
        resolver = resolver.getEntryAt(selectedItems.at(i));

        //  If we couldn't compute a 'next resolver' and we're not at the end,
        //  then exit from the loop. Can't query a missing resolver.

        /* eslint-disable no-extra-parens */
        if (TP.notValid(resolver) && (i < len - 1)) {
            //  TODO: Log a warning.
            break;
        }
        /* eslint-enable no-extra-parens */
    }

    //  Sometimes entry labels contain backslashed slashes because they're
    //  created from entries that are also used in the data to navigate the
    //  wayfinder. That's unnecessary for labels, though, so remove them.
    result = result.collect(
                function(aLabel) {
                    return TP.stringUnescapeSlashes(aLabel);
                });

    return result;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromLamaHUD
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var hudIsClosed;

    //  Grab the HUD and see if it's currently open or closed.
    hudIsClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    if (hudIsClosed) {
        this.toggleObservations(false);
    } else {
        this.toggleObservations(true);
    }

    return this;
}, {
    origin: 'LamaHUD'
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineHandler('AppDidStart',
function(aSignal) {

    /**
     * @method handleAppDidStart
     * @summary Handles notifications of when the document containing the
     *     receiver or one of its elements resizes.
     * @param {TP.sig.DOMResize} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    TP.sys.getApplication().removeController(this);

    this.focusUsingInfo(TP.hc('targetObject', this));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @summary Handles notifications of when the document containing the
     *     receiver or one of its elements resizes.
     * @param {TP.sig.DOMResize} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    //  Make sure to update the scroll buttons :-).
    this.updateScrollButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineHandler('FocusWayfinderForEditing',
function(aSignal) {

    /**
     * @method handleFocusWayfinderForEditing
     * @summary Handles notifications of when the wayfinder should be focused to
     *     edit an object.
     * @param {TP.sig.FocusWayfinderForEditing} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineHandler('FocusWayfinderForBrowsing',
function(aSignal) {

    /**
     * @method handleFocusWayfinderForBrowsing
     * @summary Handles notifications of when the wayfinder should be focused to
     *     browser an object.
     * @param {TP.sig.FocusWayfinderForBrowsing} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var payload,

        showBusy;

    //  Grab the payload and see if it has a 'showBusy' flag set to true. If so,
    //  then show the wayfinder's 'busy' panel before beginning the focusing
    //  process.
    payload = aSignal.getPayload();

    showBusy = payload.at('showBusy');
    if (TP.isTrue(showBusy)) {

        this.displayBusy();

        //  NB: We put this in a call to refresh after the next repaint so that
        //  the busy panel has a chance to show before proceeding with the
        //  focusing process.
        (function() {
            this.focusUsingInfo(payload);

            this.hideBusy();
        }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());

    } else {
        this.focusUsingInfo(payload);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineHandler('NavigateWayfinder',
function(aSignal) {

    /**
     * @method handleNavigateWayfinder
     * @summary Handles notifications of when the system wants the wayfinder to
     *     'navigate' in a particular direction: TP.HOME, TP.PREVIOUS or
     *     TP.NEXT. It is used in conjunction with the 'path stack'.
     * @param {TP.sig.NavigateWayfinder} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var pathStack,
        pathStackIndex,

        payload,

        newPathStackIndex,

        showBusy;

    pathStack = this.get('pathStack');
    pathStackIndex = this.get('pathStackIndex');

    payload = aSignal.getPayload();

    //  Depending on the 'direction' given in the signal, 'navigate' the
    //  receiver.
    switch (payload.at('direction')) {

        case TP.HOME:
            this.focusInspectorOnHome();
            return this;

        case TP.PREVIOUS:
            newPathStackIndex = (0).max(pathStackIndex - 1);
            break;

        case TP.NEXT:
            newPathStackIndex = (pathStackIndex + 1).min(
                                this.get('pathStack').getSize() - 1);
            break;

        default:
            return this;
    }

    //  If the newly computed path stack index did not equal the current path
    //  stack index, then a real navigation took place and we need to traverse
    //  the new path.
    if (newPathStackIndex !== pathStackIndex) {

        this.set('pathStackIndex', newPathStackIndex);

        //  See if the payload has a 'showBusy' flag set to true. If so, then
        //  show the wayfinder's 'busy' panel before beginning the traversal
        //  process.
        showBusy = payload.at('showBusy');
        if (TP.isTrue(showBusy)) {

            this.displayBusy();

            //  NB: We put this in a call to refresh after the next repaint so
            //  that the busy panel has a chance to show before proceeding with
            //  the traversal process.
            (function() {
                this.traversePath(pathStack.at(newPathStackIndex));

                this.hideBusy();
            }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());

        } else {
            this.traversePath(pathStack.at(newPathStackIndex));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineHandler('UIDeselect',
function(aSignal) {

    /**
     * @method handleUIDeselect
     * @summary Handles notifications of when the user has cleared a selection.
     * @param {TP.sig.UIDeselect} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var domTarget,
        targetBay;

    //  Grab the 'value' from the current DOM target.
    domTarget = aSignal.getTarget();

    targetBay = TP.nodeGetFirstAncestorByTagName(
                            domTarget, 'xctrls:wayfinderitem');

    targetBay = TP.wrap(targetBay);

    //  Remove any bays after (i.e. to the right of) the target bay.
    this.removeBaysAfter(targetBay);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineHandler('UISelect',
function(aSignal) {

    /**
     * @method handleUISelect
     * @summary Handles notifications of when the user has made a selection.
     * @param {TP.sig.UISelect} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var domTarget,
        domTargetParentTPElem,
        value;

    //  Grab the 'value' from the current DOM target.
    domTarget = aSignal.getTarget();

    //  If the parent of the DOM target is not an wayfinder item, then we bail
    //  out here - we don't want selection signals in panel content to trigger
    //  navigation.
    domTargetParentTPElem = TP.wrap(domTarget.parentNode);
    if (!TP.isKindOf(domTargetParentTPElem, TP.xctrls.wayfinderitem)) {
        return this;
    }

    value = TP.wrap(domTarget).get('value');

    //  No value? Then just exit.
    if (TP.isEmpty(value)) {
        return this;
    }

    //  Otherwise, call the 'FocusWayfinderForBrowsing' handler directly. Note
    //  how we do this after we allow the browser to reflow layout.
    this[TP.composeHandlerName('FocusWayfinderForBrowsing')](
                TP.hc('targetAspect', value,
                        'domTarget', domTarget));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getCurrentHistoryEntry',
function() {

    /**
     * @method getCurrentHistoryEntry
     * @summary Returns the set of path parts that make up the history entry at
     *     the top of the history path stack.
     * @returns {String[]} The Array of path parts that make up the current
     *     history entry.
     */

    return this.get('pathStack').at(this.get('pathStackIndex'));
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getInspectorBays',
function(shouldIncludeFillers) {

    /**
     * @method getInspectorBays
     * @summary Returns the receiver's inspector bay items.
     * @param {Boolean} [shouldIncludeFillers=false] Whether or not to include
     *     'filler' bays in the list of returned bays.
     * @returns {TP.xctrls.wayfinderitem[]} An Array of the receiver's inspector
     *     bay items.
     */

    var includeFillers,

        existingBays,

        filteredBays,

        len,
        i;

    includeFillers = TP.ifInvalid(shouldIncludeFillers, false);

    //  Grab all of the existing bays.
    existingBays = TP.byCSSPath(' xctrls|wayfinderitem', this);

    //  If we *are* including filler bays, just return the list here.
    if (includeFillers) {
        return existingBays;
    }

    //  Otherwise, iterate over all of the bays and filter out the fillers.

    filteredBays = TP.ac();

    len = existingBays.getSize();
    for (i = 0; i < len; i++) {
        if (existingBays.at(i).getLocalID().contains('FILLER')) {
            continue;
        }

        filteredBays.push(existingBays.at(i));
    }

    return filteredBays;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getInspectorBaysWidth',
function(shouldIncludeFillers) {

    /**
     * @method getInspectorBaysWidth
     * @summary Returns the sum total of the receiver's inspector bay items
     *     widths.
     * @param {Boolean} [shouldIncludeFillers=false] Whether or not to include
     *     'filler' bays in the list of returned bays.
     * @returns {Number} The width of the inspector bay items summed together.
     */

    var includeFillers,

        existingBays,
        baysWidth,

        len,
        i;

    includeFillers = TP.ifInvalid(shouldIncludeFillers, false);

    existingBays = TP.byCSSPath(' xctrls|wayfinderitem', this);

    baysWidth = 0;

    //  Iterate over the bays and sum up their widths

    len = existingBays.getSize();
    for (i = 0; i < len; i++) {
        if (existingBays.at(i).getLocalID().contains('FILLER') &&
            !includeFillers) {
            continue;
        }
        baysWidth += existingBays.at(i).getWidth();
    }

    return baysWidth;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('populateBayUsing',
function(info, createHistoryEntry) {

    /**
     * @method populateBayUsing
     * @summary This method causes the receiver to populate the bay given in the
     *     supplied info's 'bay index'
     * @param {TP.core.Hash} info The information used to traverse the
     *     hierarchy. This could have the following keys, amongst others:
     *          'targetObject':     The object to start the query process from.
     *          'targetAspect':     The property of the target object to use to
     *                              query the target object for the next object
     *                              to query, thereby traversing.
     * @param {Boolean} [createHistoryEntry=true] Whether or not to create a
     *     history entry after traversing.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var target,
        aspect,
        bayConfig,

        selectedItems,

        selectedAspect,

        newBayNum,

        bindLoc,

        params,

        existingBays,

        hasMinimumNumberOfBays,

        canReuseContent,

        targetBay,

        data,
        dataURI,

        bayContent;

    target = info.at('targetObject');
    aspect = info.at('targetAspect');

    //  Grab the inspector bays (*including* the filler bays).
    //  NB: existingBays could be empty here, and that's ok.
    existingBays = this.getInspectorBays(true);

    newBayNum = info.at('bayIndex');

    //  The bay we're actually going to put content into. Note that this might
    //  *not* necessarily be the *last* bay - but we'll clear those out as part
    //  of filling this one.
    targetBay = existingBays.at(newBayNum);

    selectedItems = this.get('selectedItems');

    //  We need to do this first since we need to add the aspect before we make
    //  the calls for the final target and data.
    if (newBayNum > 0) {

        //  Put the (new) aspect name at the spot we're on now in the selected
        //  items.
        selectedAspect = TP.ifInvalid(info.at('selectedAspect'), aspect);

        selectedItems.atPut(newBayNum - 1, selectedAspect);

        //  'Slice back' to the spot just after us.
        selectedItems = selectedItems.slice(0, newBayNum);

        //  Reset the selectedItems to what we just computed.
        this.set('selectedItems', selectedItems);
    }

    //  Compute whether we already have the minimum number of bays to display
    //  the content we're traversing to. Note that we might have *more* bays
    //  than what we need - we'll remove them below. But we need to have at
    //  least the number that we need to display this content - or we'll have to
    //  create them from scratch.
    hasMinimumNumberOfBays = existingBays.getSize() > newBayNum;

    bindLoc = this.createDataLocation('_bay_' + newBayNum);

    params = TP.hc('bindLoc', bindLoc,
                    'targetAspect', aspect,
                    'targetObject', target,
                    'pathParts', selectedItems);

    //  Finalize the target object that will be used. Note that the default here
    //  is just to return the target itself.
    target = TP.getFinalTargetForTool(
                target,
                'wayfinder',
                params);

    //  Make sure to reset the target in the info hash to the final one.
    info.atPut('targetObject', target);

    //  Grab the wayfinder data and set the resource of the bind location (i.e.
    //  a URN pointing to a specific bay's data) to that data.
    data = TP.getDataForTool(
            target,
            'wayfinder',
            params);

    //  If there wasn't a valid target , then clean up/out any unused bays, let
    //  any observers know that we 'focused' (on null) and return.
    if (TP.notValid(target)) {

        //  If there was already a bay to the right
        if (TP.isValid(targetBay)) {

            //  Remove any bays after (i.e. to the right of) the target bay.
            this.removeBaysAfter(targetBay);

            //  Then, empty the target bay itself.
            this.emptyBay(targetBay);
        }

        //  Make sure to update our toolbar, etc.
        this.finishUpdateAfterNavigation(info);

        this.signal('WayfinderDidFocus');

        return this;
    }

    dataURI = TP.uc(bindLoc);
    dataURI.setResource(data, TP.request('signalChange', false));

    //  At first, we're not sure that we can reuse content, so we configure this
    //  flag to be false.
    canReuseContent = false;

    //  If we already have the minimum number of bays, then see if we can reuse
    //  the content that's already there.
    if (hasMinimumNumberOfBays) {

        //  Remove any bays after (i.e. to the right of) the target bay.
        this.removeBaysAfter(targetBay);

        //  Put the targeted bay into the params and ask the target whether we
        //  can reuse the content from it and just refresh the data.
        params.atPut('baywayfinderitem', targetBay);

        canReuseContent = TP.canReuseContentForTool(
                                target,
                                'wayfinder',
                                params);
    }

    //  Grab the configuration for the current target.
    bayConfig = TP.getConfigForTool(
                target,
                'wayfinder',
                TP.hc('targetAspect', aspect,
                        'targetObject', target,
                        'pathParts', selectedItems));

    if (TP.notValid(bayConfig)) {
        return this;
    }

    //  Configure it with the current target as the resolver.
    bayConfig.atPutIfAbsent('resolver', target);

    //  If we're not reusing existing content, then we have to get the new
    //  content for the wayfinder and place it into the wayfinder.
    if (!canReuseContent) {

        bayContent = TP.getContentForTool(
                        target,
                        'wayfinder',
                        params);

        if (!TP.isElement(bayContent)) {
            return this;
        }

        //  If we already have at least the minimum number of bays, then replace
        //  the item content in the target bay with the new content (clearing
        //  all of the bays to the right of it in the process).
        if (hasMinimumNumberOfBays) {
            this.replaceBayContent(targetBay, bayContent, bayConfig);
        } else {
            //  If we're creating the root bay, clear any content out of the
            //  core container.
            if (newBayNum === 0) {
                this.get('container').empty();
            }

            //  Otherwise, just add a bay with the new content.
            this.addBay(bayContent, bayConfig);
        }
    } else {
        //  We're reusing content, so we didn't get new content for the existing
        //  bay, but we still need to set it's configuration.
        this.configureBay(targetBay, bayConfig);
    }

    //  Signal changed on the URI that we're using as our data source. The bay
    //  content should've configured itself to observe this data when awoken.
    if (TP.notEmpty(bindLoc)) {
        TP.uc(bindLoc).$changed();
    }

    //  If the caller wants a history entry, we create one. Note here that
    //  the default is true, so the flag must be explicitly false.
    if (TP.notFalse(createHistoryEntry)) {
        this.createHistoryEntry(info.at('historyPathParts'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('refreshBay',
function(aBayNum) {

    /**
     * @method refreshBay
     * @summary Refreshes the content in the bay at the supplied index, or the
     *     "last" bay if it is not supplied.
     * @param {Number} [aBayNum] The bay number to refresh. If this is not
     *     supplied, the "last" bay is refreshed.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var selectedItems,
        bayNum,

        inspectorBays,
        inspectorBay,
        resolver,
        data,

        bindLoc;

    selectedItems = this.get('selectedItems');
    bayNum = aBayNum;
    if (TP.notValid(bayNum)) {

        //  We're interested in refreshing the 'next bay over' where there is
        //  currently no selection.
        bayNum = selectedItems.getSize();
    }

    //  Grab the inspector bay corresponding to that bay number

    //  Grab the inspector bays (but not the filler bays).
    inspectorBays = this.getInspectorBays();
    if (TP.isEmpty(inspectorBays)) {
        return this;
    }

    inspectorBay = inspectorBays.at(bayNum);

    if (TP.notValid(inspectorBay)) {
        //  TODO: Raise an exception - can't find a bay object
        return this;
    }

    resolver = inspectorBay.get('config').at('resolver');

    if (TP.notValid(resolver)) {
        //  TODO: Raise an exception - can't find a bay resolver
        return this;
    }

    //  Grab the data for the wayfinder using the resolver for that bay. Note
    //  that we do not supply any other params, just an empty Hash.
    data = TP.getDataForTool(
                    resolver,
                    'wayfinder',
                    TP.hc('pathParts', selectedItems));

    //  Set the resource of the URI holding the bound data for that bay to the
    //  refreshed data that we just obtained.
    bindLoc = this.createDataLocation('_bay_' + bayNum);

    TP.uc(bindLoc).setResource(data);

    this.signal('WayfinderDidRefreshBay');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('reloadCurrentBay',
function(scrollToLastBay) {

    /**
     * @method reloadCurrentBay
     * @summary Reloads the current bay's content.
     * @param {Boolean} [scrollToLastBay=true] Whether or not to scroll to the
     *     end of the list of bays.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    this.repopulateBay();

    if (TP.notFalse(scrollToLastBay)) {
        this.scrollBaysToEnd();
    }

    this.signal('WayfinderDidReloadBay');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('repopulateBay',
function(aBayNum) {

    /**
     * @method repopulateBay
     * @summary Repopulates the content in the bay at the supplied index, or the
     *     "last" bay if it is not supplied.
     * @param {Number} [aBayNum] The bay number to repopulate. If this is not
     *     supplied, the "last" bay is repopulated.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var selectedItems,
        bayNum,

        inspectorBays,
        inspectorBay,

        config,

        info;

    selectedItems = this.get('selectedItems');
    bayNum = aBayNum;
    if (TP.notValid(bayNum)) {

        //  We're interested in refreshing the 'next bay over' where there is
        //  currently no selection.
        bayNum = selectedItems.getSize();
    }

    //  Grab the inspector bay corresponding to that bay number

    //  Grab the inspector bays (but not the filler bays).
    inspectorBays = this.getInspectorBays();
    if (TP.isEmpty(inspectorBays)) {
        return this;
    }

    inspectorBay = inspectorBays.at(bayNum);

    if (TP.notValid(inspectorBay)) {
        //  TODO: Raise an exception - can't find a bay object
        return this;
    }

    config = inspectorBay.get('config');

    if (TP.notValid(config.at('targetObject'))) {
        //  TODO: Raise an exception - can't find a target object
        return this;
    }

    info = TP.hc('targetObject', config.at('targetObject'),
                    'targetAspect', config.at('targetAspect'),
                    'bayIndex', bayNum,
                    'pathParts', this.get('selectedItems'));

    this.populateBayUsing(info);

    this.signal('WayfinderDidRepopulateBay');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('removeDynamicRoot',
function(target, forceRefresh) {

    /**
     * @method removeDynamicRoot
     * @summary Removes a 'dynamic' root entry. That is, a root entry that can
     *     be added, renamed or removed at will.
     * @param {Object} target The target object to remove as a dynamic root.
     * @param {Boolean} [forceRebuild=false] Whether or not to rebuild the
     *     receiver's root data.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var dynamicEntries,
        targetIndex;

    dynamicEntries = this.get('dynamicContentEntries');

    targetIndex = dynamicEntries.indexOf(target);

    //  If we found the target, then 'splice' it out and rebuild the root data.
    if (targetIndex !== TP.NOT_FOUND) {

        dynamicEntries.splice(targetIndex, 1);
        this.buildRootBayData();

    } else if (forceRefresh) {

        //  The caller wanted to force rebuild - do it.
        this.buildRootBayData();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('removeBay',
function(aBay) {

    /**
     * @method removeBay
     * @summary Removes a bay from the receiver.
     * @param {TP.xctrls.wayfinderitem} aBay The bay element to remove.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var natBay;

    natBay = aBay.getNativeNode();
    TP.nodeDetach(natBay);

    this.signal('WayfinderDidRemoveBay');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('removeBaysAfter',
function(startBay) {

    /**
     * @method removeBaysAfter
     * @summary Removes all of the bays that occur after the supplied bay.
     * @param {TP.xctrls.wayfinderitem} startBay The bay element to begin
     *     removals from. This bay itself will *not* be removed.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var existingBays,

        startIndex,

        len,
        i;

    existingBays = TP.byCSSPath(' xctrls|wayfinderitem', this);
    if (TP.isEmpty(existingBays)) {
        return this;
    }

    startIndex = existingBays.indexOf(startBay, TP.IDENTITY);

    len = existingBays.getSize();
    for (i = startIndex + 1; i < len; i++) {
        this.removeBay(existingBays.at(i));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('replaceBayContent',
function(aBay, bayContent, bayConfig) {

    /**
     * @method replaceBayContent
     * @summary Replaces the content of the supplied bay using the supplied
     *     content and configuration.
     * @param {TP.xctrls.wayfinderitem} aBay The bay element to replace the
     *     content of.
     * @param {Element} bayContent The element containing the new content of the
     *     bay.
     * @param {TP.core.Hash} bayConfig The bay configuration. This could have
     *     the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay wayfinder item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var content,
        id,
        childType,
        pathParts;

    this.removeBaysAfter(aBay);

    id = this.getLocalID();

    //  Start computing the unique ID by using the 'childType' (i.e. the type of
    //  control) if available.
    childType = bayConfig.at('attr_childtype');
    if (TP.notEmpty(childType)) {
        id += childType;
    }

    //  Then, if there are path parts, join them using '_' and append them to
    //  the id.
    pathParts = bayConfig.at('pathParts');
    if (TP.notEmpty(pathParts)) {
        id += '_' + pathParts.join('_');
    } else {
        //  Otherwise, this must be the ROOT list.
        id += '_' + 'ROOT';
    }

    //  Replace any invalid characters in the ID with '_'.
    TP.regex.INVALID_ID_CHARS.lastIndex = 0;
    id = id.replace(TP.regex.INVALID_ID_CHARS, '_');

    //  Set the current bay wayfinderitem element with that ID.
    TP.elementSetAttribute(aBay.getNativeNode(), 'id', id, true);

    content = aBay.setContent(bayContent);
    content.awaken();

    this.configureBay(aBay, bayConfig);

    this.signal('WayfinderDidReplaceBay');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('scrollBy',
function(direction) {

    /**
     * @method scrollBy
     * @summary 'Scrolls' the receiver in the supplied direction.
     * @param {String} direction A named direction to scroll the element. Any
     *     one of:
     *          TP.RIGHT
     *          TP.LEFT
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var inspectorElem,

        inspectorBays,

        len,
        i,

        currentBay,
        computedBay,

        eastEdgeX,
        newEdge;

    inspectorElem = this.getNativeNode();

    //  Grab the inspector bays (but not the filler bays).
    inspectorBays = this.getInspectorBays();
    if (TP.isEmpty(inspectorBays)) {
        return this;
    }

    len = inspectorBays.getSize();

    //  Depending on the direction, grab the bay before or after the leftmost
    //  bay.
    if (direction === TP.LEFT) {

        //  Find first bay from the lefthand side that is wholly visible. Note
        //  that we start at 1, since if the leftmost bay is wholly visible,
        //  then we don't need to do any scrolling from the left at all.
        for (i = 1; i < len; i++) {

            currentBay = inspectorBays.at(i);

            //  If the bay is completely visible
            if (currentBay.isVisible()) {
                computedBay = inspectorBays.at(i - 1);
                break;
            }

            if (currentBay.isVisible(true)) {
                computedBay = currentBay;
                break;
            }
        }

        inspectorElem.scrollLeft = computedBay.getOffsetPoint().getX();
    } else if (direction === TP.RIGHT) {

        //  Find first bay from the righthand side that is wholly visible. Note
        //  that we're iterating backwards, which would normally mean that we
        //  start at len - 1, but because if the rightmost bay is wholly
        //  visible, then we don't need to do any scrolling from the right at
        //  all, we start at len - 2.
        for (i = len - 1; i >= 0; i--) {
            currentBay = inspectorBays.at(i);

            if (currentBay.isVisible()) {
                computedBay = inspectorBays.at(i + 1);
                break;
            }

            if (currentBay.isVisible(true)) {
                computedBay = currentBay;
                break;
        }
    }

        eastEdgeX = computedBay.getOffsetRect().getEdgePoint(TP.EAST).getX();

        newEdge = eastEdgeX - this.getWidth();

        newEdge = newEdge.max(0);

        //  If the scrollLeft is already at the new edge and we're not yet to
        //  end of the list, then that must mean we're right on the edge of the
        //  bay.
        //  This means that this calculation won't allow us to proceed, which
        //  means that we need to force the inspector to go one more bay to the
        //  right.
        if (inspectorElem.scrollLeft === newEdge && i < len - 1) {
            //  Grab one more bay to the right, get it's 'east' edge and use
            //  that to recompute the new edge.
            computedBay = inspectorBays.at(i + 1);
            eastEdgeX = computedBay.getOffsetRect().getEdgePoint(TP.EAST).getX();
            newEdge = eastEdgeX - this.getWidth();
        }

        inspectorElem.scrollLeft = newEdge;
    }

    this.signal('WayfinderDidScroll');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('scrollBaysToEnd',
function() {

    /**
     * @method scrollBaysToEnd
     * @summary 'Scrolls' the receiver to the last bay.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var inspectorBays,

        currentBay,

        eastEdgeX;

    //  Grab the inspector bays (but not the filler bays).
    inspectorBays = this.getInspectorBays();
    if (TP.isEmpty(inspectorBays)) {
        return this;
    }

    currentBay = inspectorBays.last();

    eastEdgeX = currentBay.getOffsetRect().getEdgePoint(TP.EAST).getX();

    this.getNativeNode().scrollLeft = eastEdgeX - this.getWidth();

    this.signal('WayfinderDidScroll');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('selectItemInBay',
function(itemLabel, aBayNum) {

    /**
     * @method selectItemInBay
     * @summary Selects the item with the supplied name in the bay matching the
     *     supplied bay number. Note that what 'select' means is really up to
     *     the bay content.
     * @param {String} itemLabel The name of the item to select.
     * @param {Number} [aBayNum] The bay number to select the item in. If this is
     *     not supplied, the "last" bay is used.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var inspectorBayContentItems,

        bayNum,
        bayContent,

        label;

    if (TP.notEmpty(inspectorBayContentItems =
                    TP.byCSSPath(' xctrls|wayfinderitem > *', this))) {

        bayNum = aBayNum;
        if (TP.notValid(bayNum)) {

            //  We're interested in refreshing the 'next bay over' where there is
            //  currently no selection.
            bayNum = this.get('selectedItems').getSize();
        }

        bayContent = inspectorBayContentItems.at(bayNum);

        //  Sometimes entries come in with escaped slashes. Unescape that.
        label = TP.stringUnescapeSlashes(itemLabel);

        //  The bay content here will have already been re-rendered because of
        //  data binding, but we need to select what the new item will be.
        if (TP.canInvoke(bayContent, 'selectLabel')) {
            bayContent.selectLabel(label, null, false);
        } else if (TP.canInvoke(bayContent, 'select')) {
            bayContent.select(label, null, false);
        }
    }

    this.signal('WayfinderDidSelectItem');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('setData',
function(aDataObject, shouldSignal, isFiltered) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @param {Boolean} [shouldSignal=true] Whether or not to signal change.
     * @param {Boolean} [isFiltered=false] Whether or not this is a filtered
     *     data set being set by our filtering machinery.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var dataObj,
        keys,
        obj,

        filteringSource;

    if (TP.notValid(aDataObject)) {
        return this;
    }

    //  Make sure to unwrap this from any TP.core.Content objects, etc.
    dataObj = TP.val(aDataObject);

    //  If the data object is an Array and only has 1 item, which must be a
    //  non-Array Collection (Hash, POJO, NodeList, NamedNodeMap), then we use
    //  the entries collection as our data object.
    if (TP.isArray(dataObj) &&
        dataObj.getSize() === 1 &&
        TP.isCollection(dataObj.first()) &&
        !TP.isArray(dataObj.first())) {
        dataObj = TP.entries(dataObj.first());
    }

    this.$set('data', dataObj, false);

    //  Make sure to clear our converted data.
    this.set('$convertedData', null, false);

    //  This object needs to see keys in 'Array of keys' format. Therefore, the
    //  following conversions are done:

    //  POJO / Hash:    {'foo':'bar','baz':'goo'}   -> ['foo','baz']
    //  Array of pairs: [[0,'a'],[1,'b'],[2,'c']]   -> [0, 1, 2]
    //  Array of items: ['a','b','c']               -> [0, 1, 2]

    if (TP.isValid(dataObj)) {

        //  If we have a hash as our data, this will convert it into an Array of
        //  ordered pairs (i.e. an Array of Arrays) where the first item in each
        //  Array is the key and the second item is the value.
        if (TP.isHash(dataObj)) {
            keys = dataObj.getKeys();
            filteringSource = dataObj.getValues();
        } else if (TP.isPlainObject(dataObj)) {
            //  Make sure to convert a POJO into a TP.core.Hash
            obj = TP.hc(dataObj);
            keys = obj.getKeys();
            filteringSource = obj.getValues();
        } else if (TP.isPair(dataObj.first())) {
            keys = TP.ac();
            filteringSource = TP.ac();
            dataObj.perform(
                    function(item) {
                        //  Note that we want a String here.
                        keys.push(item.first().toString());
                        filteringSource.push(item.last().toString());
                    });
        } else if (TP.isArray(dataObj)) {
            keys = dataObj.getIndices().collect(
                    function(item) {
                        //  Note that we want a String here.
                        return item.toString();
                    });
            filteringSource = dataObj;
        }

        this.set('$dataKeys', keys, false);
    } else {
        this.set('$dataKeys', null, false);
    }

    if (TP.isEmpty(keys)) {
        return this;
    }

    keys.forEach(
        function(aKey, anIndex) {
            var type,
                resolver;

            type = filteringSource.at(anIndex);

            type = TP.sys.getTypeByName(type);
            if (!TP.isType(type)) {
                //  TODO: Raise an exception - can't find type
                return;
            }

            resolver = type.construct();

            this.addEntry(resolver.getEntryLabel(aKey), resolver);
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the TP.xctrls.wayfinder object.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    //  Dynamic root entries
    this.set('dynamicContentEntries', TP.ac());

    //  Selected items
    this.set('selectedItems', TP.ac());

    TP.sys.getApplication().pushController(this);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('stylesheetReady',
function(aStyleTPElem) {

    /**
     * @method stylesheetReady
     * @summary A method that is invoked when the supplied stylesheet is
     *     'ready', which means that it's attached to the receiver's Document
     *     and all of it's style has been parsed and applied.
     * @description Typically, the supplied stylesheet Element is the one that
     *     the receiver is waiting for so that it can finalized style
     *     computations. This could be either the receiver's 'core' stylesheet
     *     or it's current 'theme' stylesheet, if the receiver is executing in a
     *     themed environment.
     * @param {TP.html.style} aStyleTPElem The XHTML 'style' element that is
     *     ready.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    //  If we're not awakening this tag, then exit - we want none of the
    //  machinery here to execute.
    if (this.hasAttribute('tibet:no-awaken')) {
        return this;
    }

    //  Note how we put this in a Function to wait until the screen refreshes.
    (function() {

        //  Call render one-time to get things going.
        this.render();

    }.bind(this)).queueBeforeNextRepaint(this.getNativeWindow());

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('traversePath',
function(pathParts) {

    /**
     * @method traversePath
     * @summary This method causes the receiver to traverse a path (via
     *     'select'ing the content in each bay as it traverses), thereby
     *     navigating the receiver to a particular place in a hierarchy.
     * @description Note that this method will *not* create a history entry
     *     after it traverses the path.
     * @param {String[]} The Array of path parts to follow in the traversal
     *     operation.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    var inspectorBays,

        rootEntryResolver,

        resolvedPathParts,

        target,

        i,

        nextBay,
        resolver,

        targetAspect,
        info;

    //  Grab the inspector bays (but not the filler bays).
    inspectorBays = this.getInspectorBays();
    if (TP.isEmpty(inspectorBays)) {
        return this;
    }

    rootEntryResolver = this.getEntryAt(pathParts.first());

    //  If any of these path parts returned an alias, look it up here.
    resolvedPathParts = this.getType().resolvePathAliases(pathParts);

    if (TP.isEmpty(resolvedPathParts)) {
        this.focusInspectorOnHome();

        return this;
    }

    //  We start the target at the root entry resolver.
    target = rootEntryResolver;

    for (i = 0; i < resolvedPathParts.getSize(); i++) {

        //  If we have a valid bay at a spot one more than the path segment that
        //  we're processing for, then grab its resolver and try to traverse
        //  that segment.
        nextBay = inspectorBays.at(i);

        if (TP.isValid(nextBay)) {
            resolver = nextBay.get('config').at('resolver');

            targetAspect = resolvedPathParts.at(i);

            //  Resolve the targetAspect to a target object
            target = TP.resolveAspectForTool(
                            resolver,
                            'wayfinder',
                            targetAspect,
                            TP.hc('pathParts',
                                    this.get('selectedItems')));

            if (TP.notValid(target)) {
                break;
            }

            this.selectItemInBay(targetAspect, i);

            //  NB: Don't worry about not supplying 'historyPathParts' here,
            //  since we don't want to create history entries anyway - hence the
            //  'false' below.
            info = TP.hc('targetObject', target,
                            'targetAspect', targetAspect,
                            'bayIndex', i + 1);

            this.populateBayUsing(info, false);

            //  Now that we have more wayfinder items, obtain the list
            //  again.

            //  Grab the inspector bays (but not the filler bays).
            inspectorBays = this.getInspectorBays();
        }
    }

    //  Note here how we use the last populated 'info' object
    this.finishUpdateAfterNavigation(info);

    this.signal('WayfinderDidFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.xctrls.wayfinder} The receiver.
     */

    if (shouldObserve) {
        //  Listen for when our document resizes. Note that we actually filter
        //  out other resize events coming from elements under the document. See
        //  the 'DOMResize' handler for more information.
        this.observe(this.getDocument(), 'TP.sig.DOMResize');

        this.observe(TP.ANY, 'TP.sig.NavigateWayfinder');

    } else {
        this.ignore(this.getDocument(), 'TP.sig.DOMResize');

        this.ignore(TP.ANY, 'TP.sig.NavigateWayfinder');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.xctrls.ToolAPI Methods
//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getContentForWayfinder',
function(options) {

    /**
     * @method getContentForWayfinder
     * @summary Returns the source's content that will be hosted in an wayfinder
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

    //  If the targetAspect is TP.NOT_FOUND, then we have an uninspectable
    //  object.
    if (options.at('targetAspect') === TP.NOT_FOUND) {
        return TP.xhtmlnode(
                '<div class="wrapped noselect usermessage">' +
                    '<div>Uninspectable Object</div>' +
                '</div>');
    }

    dataURI = TP.uc(options.at('bindLoc'));

    elem = TP.elem(
            '<xctrls:list filter="true"' +
            ' alwayschange="true" itemtoggle="false"/>');

    TP.elementSetAttribute(
            elem, 'bind:in', '{data: ' + dataURI.asString() + '}', true);

    return elem;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getDataForWayfinder',
function(options) {

    /**
     * @method getDataForWayfinder
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an wayfinder bay. In most cases, this data will be bound to
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

    var entries,

        dynamicData,
        staticData,

        data;

    //  If the targetAspect is TP.NOT_FOUND, then we have an uninspectable
    //  object.
    if (options.at('targetAspect') === TP.NOT_FOUND) {
        return TP.ac();
    }

    //  This logic must produce values in its first slot that can then be
    //  resolved by 'resolveAspectForWayfinder' below.

    entries = this.get('dynamicContentEntries');
    dynamicData = entries.collect(
                    function(entry) {
                        return TP.ac(TP.id(entry), this.getEntryLabel(entry));
                    }.bind(this));

    entries = this.get('entries');
    staticData = entries.collect(
                    function(kvPair) {
                        return TP.ac(
                                kvPair.first(),
                                this.getEntryLabel(kvPair.last()));
                    }.bind(this));

    data = dynamicData.concat(staticData);

    return data;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var srcName,

        target,
        dynamicContentEntries;

    //  If the targetAspect is TP.NOT_FOUND, then we have an uninspectable
    //  object.
    if (aSourceName === TP.NOT_FOUND) {
        return null;
    }

    //  Sometimes entries come in with escaped slashes. Unescape that.
    srcName = TP.stringUnescapeSlashes(aSourceName);

    dynamicContentEntries = this.get('dynamicContentEntries');
    target = dynamicContentEntries.detect(
                    function(anItem) {
                        return TP.id(anItem) === srcName;
                    });

    if (TP.notValid(target)) {
        target = this.get('entries').at(srcName);
    }

    if (TP.notValid(target)) {
        target = TP.bySystemId(srcName);
    }

    if (TP.notValid(target)) {
        target = TP.bySystemId('TSH').resolveObjectReference(
                                                srcName, TP.request());
    }

    return target;
});

//  ------------------------------------------------------------------------

TP.xctrls.wayfinder.Inst.defineMethod('resolveAspectForWayfinder',
function(anAspect, options) {

    /**
     * @method resolveAspectForWayfinder
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

TP.sig.Signal.defineSubtype('NavigateWayfinder');

TP.sig.Signal.defineSubtype('WayfinderDidAddBay');
TP.sig.Signal.defineSubtype('WayfinderDidEmptyBay');
TP.sig.Signal.defineSubtype('WayfinderDidFocus');
TP.sig.Signal.defineSubtype('WayfinderDidRefreshBay');
TP.sig.Signal.defineSubtype('WayfinderDidReloadBay');
TP.sig.Signal.defineSubtype('WayfinderDidRemoveBay');
TP.sig.Signal.defineSubtype('WayfinderDidRepopulateBay');
TP.sig.Signal.defineSubtype('WayfinderDidReplaceBay');
TP.sig.Signal.defineSubtype('WayfinderDidScroll');
TP.sig.Signal.defineSubtype('WayfinderDidSelectItem');

TP.sig.ResponderSignal.defineSubtype('FocusWayfinderForBrowsing');
TP.sig.ResponderSignal.defineSubtype('FocusWayfinderForEditing');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
