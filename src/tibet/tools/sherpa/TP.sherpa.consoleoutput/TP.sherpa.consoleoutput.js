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
 * @type {TP.sherpa.consoleoutputoutput}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('consoleoutput');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineAttribute('$inlineStyleElem');

TP.sherpa.consoleoutput.Inst.defineAttribute('rawOutEntryTemplate');

TP.sherpa.consoleoutput.Inst.defineAttribute('outputCoalesceEntries');
TP.sherpa.consoleoutput.Inst.defineAttribute('outputCoalesceLock');

TP.sherpa.consoleoutput.Inst.defineAttribute('wrapper',
    TP.cpc('> .wrapper', TP.hc('shouldCollapse', true)));

TP.sherpa.consoleoutput.Inst.defineAttribute('outputItemsContents',
    TP.cpc('sherpa|consoleoutputitem > .flex-item > .content'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the TP.sherpa.consoleoutput
     *     object.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var styleElem,

        origins;

    //  Manually inject a <style> element with an entry that will be used to
    //  control the maximum height of a item's content. This will be manipulated
    //  further by this type as content is added and removed.
    styleElem = TP.documentAddCSSStyleElement(
    this.getNativeDocument(),
    '@namespace sherpa url(http://www.technicalpursuit.com/2014/sherpa);\n' +
    '.flex-item > .content {\n' +
        'max-height: none;' +
        '\n' +
    '}');

    //  Give it a unique ID to easily distinguish it in the DOM.
    TP.elementSetAttribute(styleElem,
                            'id',
                            'TP_shera_consoleoutputitem_inline');

    //  Cache a reference to it for later easy access.
    this.set('$inlineStyleElem', styleElem);

    //  Set up some instance variables for this instance of console output.
    this.set('outputCoalesceEntries', TP.hc());

    this.adjustItemMaxHeight();

    //  Manually add TP.sherpa.scrollbutton's stylesheet to our document, since
    //  we don't awaken item content for performance reasons.
    TP.sherpa.scrollbutton.addStylesheetTo(this.getNativeDocument());

    //  Observe the 'north' and 'south' drawer. When they open or close, then we
    //  adjust the maximum item height to the smaller or larger space.
    origins = TP.ac(TP.byId('north', this.getNativeDocument()),
                    TP.byId('south', this.getNativeDocument()));

    origins.isOriginSet(true);

    (function(aSignal) {

        var targetDrawerTPElement;

        this.adjustItemMaxHeight();

        targetDrawerTPElement = TP.wrap(aSignal.getTarget());

        if (TP.isTrue(TP.bc(targetDrawerTPElement.getAttribute('closed')))) {

            //  TODO: Cheesy. This is an 'empirically derived' value - we need
            //  to compute it from real numbers.
            this.scrollBy(TP.DOWN, 120);
        }

    }.bind(this)).observe(
        origins,
        'TP.sig.DOMTransitionEnd');

    //  Various signal observations

    this.observe(this.getDocument(), 'TP.sig.DOMResize');

    this.observe(TP.byId('SherpaHUD', this.getNativeWindow()),
                    'ClosedChange');

    this.observe(TP.ANY, TP.ac('TP.sig.DOMDNDInitiate',
                                'TP.sig.DOMDNDTerminate'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineHandler('ClosedChange',
function(aSignal) {

    /**
     * @method handleClosedChange
     * @summary Handles when the HUD's 'closed' state changes. We track that by
     *     showing/hiding ourself.
     * @param {TP.sig.ClosedChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var hud,
        hudIsHidden;

    hud = TP.byId('SherpaHUD', this.getNativeWindow());

    hudIsHidden = TP.bc(hud.getAttribute('closed'));

    this.setAttribute('hidden', hudIsHidden);

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ----------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineHandler('DOMDNDInitiate',
function(aSignal) {

    /**
     * @method handleDOMDNDInitiate
     * @summary Handles when the drag and drop system initiates a dragging
     *     session.
     * @param {TP.sig.DOMDNDInitiate} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    this.setAttribute('hidden', true);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineHandler('DOMDNDTerminate',
function(aSignal) {

    /**
     * @method handleDOMDNDTerminate
     * @summary Handles when the drag and drop system terminates a dragging
     *     session.
     * @param {TP.sig.DOMDNDTerminate} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    this.setAttribute('hidden', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @summary Handles when our document size changes. This may cause output
     *     items to resize.
     * @param {TP.sig.DOMResize} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    this.adjustItemMaxHeight();

    return this;
});

//  ------------------------------------------------------------------------
//  Output management methods
//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('adjustItemMaxHeight',
function() {

    /**
     * @method adjustItemMaxHeight
     * @summary Adjusts the maximum item height for an output item.
     * @description For a variety of reasons, the visual size of the console
     *     output may change (the window resizes, the north/south drawers close
     *     and open, etc.) The 'maximum size' (i.e. the size it can be before
     *     its contents start to scroll) for an output item needs to be
     *     recomputed at that time.
     * @returns {TP.sherpa.console} The receiver.
     */

    var styleSheet,
        outputItemRules,

        centerHeight,
        offset;

    styleSheet = TP.cssElementGetStyleSheet(this.get('$inlineStyleElem'));
    outputItemRules = TP.styleSheetGetStyleRulesMatching(
                            styleSheet,
                            '.flex-item > .content');

    centerHeight = TP.byId('center', this.getDocument()).getHeight();

    //  TODO: This is cheesy - make these computed.

    offset =
        20 +    //  sherpa:consoleoutput top & bottom values
        4 +     //  sherpa:consoleoutputitem top & bottom margin values
        2 +     //  .flex-item top & bottom border values
        21 +    //  .flex-item > .header height + margin top & bottom +
                //                          border top & bottom
        6;      //  .flex-item > .content margin top & bottom +
                //                          border top & bottom

    /* eslint-disable no-extra-parens */
    outputItemRules.at(0).style.maxHeight = (centerHeight - offset) + 'px';
    /* eslint-enable no-extra-parens */

    //  Iterate over all of the item content elements and recompute whether we
    //  need to add the 'overflowing' class, based on the size of their content.
    //  Note how we do this after layout so that our computations are correct.
    (function() {

        var itemContentElems;

        itemContentElems = TP.unwrap(this.get('outputItemsContents'));

        itemContentElems.forEach(
                function(aContentElem) {
                    var itemElem;

                    itemElem = aContentElem.parentNode.parentNode;

                    if (aContentElem.scrollHeight > aContentElem.offsetHeight) {
                        TP.elementAddClass(itemElem, 'overflowing');
                        TP.wrap(itemElem).updateScrollButtons(aContentElem);
                    } else {
                        TP.elementRemoveClass(itemElem, 'overflowing');
                    }
                });
    }.bind(this)).queueForNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('clear',
function() {

    /**
     * @method clear
     * @summary Clears the console of all console output items.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var outputItems;

    //  We need to iterate over each one and call it's 'teardown' before we rip
    //  them out of our content wrapper.
    outputItems = TP.byCSSPath('> .wrapper > sherpa|consoleoutputitem',
                                this,
                                false,
                                true);
    outputItems.forEach(
            function(anItem) {
                anItem.teardown();
            });

    this.get('wrapper').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('createOutputItem',
function(uniqueID, dataRecord) {

    /**
     * @method createOutputItem
     * @summary Creates an output item within the overall console output element
     *     that will be used to hold the output of a single command processed by
     *     the console (and very likely an underlying shell).
     * @param {String} uniqueID A unique ID that will be used to look up for an
     *     existing output item. This is usually supplied by the caller when the
     *     intent is to reuse an existing output item for a new command. In the
     *     case when an existing output item can be found, this method just
     *     returns without creating a new one.
     * @param {TP.core.Hash} dataRecord A hash containing the data that will be
     *     used for the output. At this stage, this includes:
     *          'hid'       The shell history ID
     *          'cssClass'  Any desired additional CSS classes *for the output
     *                      item itself* (the output content very well might
     *                      contain CSS classes to style it's output in a
     *                      special way).
     *          'cmdText'   The command that was executed to produce the output
     *                      that this item is being created for.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var doc,

        hid,
        hidstr,

        cmdText,

        cssClass,

        inputData,

        resp,
        entryStr,

        allItemsWrapper,

        outElem;

    doc = this.getNativeDocument();

    //  See if the output item already exists. If it doesn't, then we create a
    //  new one.
    if (TP.isElement(outElem = doc.getElementById(uniqueID))) {
        return this;
    }

    //  Extract the history ID, any additional CSS class that the output
    //  wanted to specify *for the output item itself* (not for it's
    //  internal content) and the command text that will be printed in the
    //  item header.
    hid = dataRecord.at('hid');
    hidstr = TP.isEmpty(hid) ? '' : '!' + hid;

    cssClass = dataRecord.at('cssClass');
    cssClass = TP.isEmpty(cssClass) ? '' : cssClass;

    cmdText = TP.ifInvalid(dataRecord.at('cmdText'), '');

    //  If there's ACP in the text, we need to escape it before feeding it
    //  into the template transformation machinery.
    if (TP.regex.HAS_ACP.test(cmdText)) {
        cmdText = cmdText.replace(/\{\{/g, '\\{{').
                            replace(/\}\}/g, '\\}}');
    }

    //  Make sure to escape any characters in the command text into
    //  entities, if need be.
    cmdText = cmdText.asEscapedXML();

    //  Encode all of this into a hash that will be passed to the template
    //  transform() method below.
    inputData = TP.hc(
                    'id', uniqueID,
                    'inputclass', cssClass,
                    'hid', hidstr,
                    'cmdText', cmdText,
                    'empty', '',
                    'resultType', '',
                    'stats', '&#8230;');

    //  Grab the proper template for a console item from the Sherpa' shared
    //  template file and transform the above data into it. This will
    //  produce a item with no output content, but with a fully prepared
    //  'outer' content, such as the command that was being executed, the
    //  history ID, etc.
    resp = TP.uc('~ide_root/xhtml/sherpa_console_templates.xhtml' +
                        '#xpath1(//*[@name="consoleItem"])').transform(
                            inputData,
                            TP.request(
                                'async', false, 'shouldSignal', false));

    //  The String will be in the result.
    entryStr = resp.get('result');

    //  Grab our content wrapper, which will contain all of the output
    //  items, and insert the new content just before it's end. Note how we
    //  create an XHTML node of our result String so that we get the proper
    //  default namespace, etc.
    allItemsWrapper = TP.unwrap(this.get('wrapper'));
    outElem = TP.xmlElementInsertContent(
                    allItemsWrapper,
                    TP.xhtmlnode(entryStr),
                    TP.BEFORE_END);

    //  Make sure to remove the 'name' attribute so that we end up with
    //  completely unique console items that don't share identifying
    //  attributes.
    TP.elementRemoveAttribute(outElem, 'name');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('createTiledOutput',
function(itemElem, uniqueID, dataRecord) {

    /**
     * @method createTiledOutput
     * @summary Creates a tiled output from the information that can be derived
     *     from the supplied item element and the data record.
     * @param {Element} itemElem The original item Element that the tile is
     *     being created for.
     * @param {String} The unique ID to stamp onto the tile element that we'll
     *     create here.
     * @param {TP.core.Hash} dataRecord A hash containing the data that will be
     *     used for the output. At this stage, this includes:
     *          'hid'       The shell history ID
     *          'cssClass'  Any desired additional CSS classes *for the output
     *                      item itself* (the output content very well might
     *                      contain CSS classes to style it's output in a
     *                      special way).
     *          'cmdText'   The command that was executed to produce the output
     *                      that this item is being created for.
     *          'typeinfo'  Type information for the 'top-level' object that is
     *                      being output. This can also contain the semaphore
     *                      text of 'LOG' to let this method know that the data
     *                      being output is part of a logging sequence.
     *          'stats'     Execution statistics from the shell that indicate
     *                      how long it took to produce the output.
     *          'rawData'   The raw data produced by the shell. It is different
     *                      than the 'output' field in that 'output' may have
     *                      already undergone some kind of formatting through a
     *                      pipeline or some other mechanism. If 'output' is
     *                      empty, then this raw data is used as the visual
     *                      output.
     *          'output'    The fully formatted data. If this is empty, then the
     *                      content in 'rawData' is used.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var cmdText,

        tileID,

        tileTPElem;

    //  Append '_Tile' onto the end of the unique ID, to differentiate it from
    //  the item it's being created for.
    tileID = uniqueID + '_Tile';

    //  We don't supply a parent to the makeTile() call, so it will be placed in
    //  the common tile tier.
    tileTPElem = TP.bySystemId('Sherpa').makeTile(tileID);

    //  Grab the command text from the element's header.
    cmdText = TP.byCSSPath('> .flex-item .header .content',
                            itemElem,
                            true).getTextContent();

    //  Set the command text as the tile's header.
    tileTPElem.set('headerText', cmdText);

    /*
     * TODO: Figure this out - are we missing a parameter here or should the
     * content element be created from the itemElem's output content?
    if (TP.isValid(tileContentTPElem)) {

        tileContentTPElem = tileTPElem.setContent(tileContentTPElem);

        tileContentTPElem.set('tileTPElem', tileTPElem);

        tileContentTPElem.awaken();
    }
    */

    tileTPElem.toggle('hidden');

    return tileID;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('getInputStats',
function(aSignal) {

    /**
     * @method getInputStats
     * @summary Gets various 'input statistics' from the supplied signal and
     *     returns a String with that information.
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     * @returns {String} The input statistics formatted into a String.
     */

    var val,
        str;

    //  TODO: Isn't aSignal the same as our signal and, if not, is that an
    //  error?

    //  ---
    //  execution statistics, when available
    //  ---

    //  update the last command execution time
    val = aSignal.get('evaltime');
    str = TP.ifInvalid(val, '0');

    /*
     For now, since it always seems that these values are 0, we don't include
     them.
    val = aSignal.get('tagtime');
    str += ' | ' + TP.ifInvalid(val, '0');

    val = aSignal.get('exectime');
    str += ' | ' + TP.ifInvalid(val, '0');
    */

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('getOutputTypeInfo',
function(aSignal) {

    /**
     * @method getOutputTypeInfo
     * @summary Returns a String containing the type information of the result
     *     contained in the supplied signal.
     * @param {TP.sig.ShellRequest} aSignal The request to extract the output
     *     type of the result information from.
     * @returns {String} The output type information.
     */

    var val,
        str,
        values,
        len,
        startTN,
        wasSame,
        i;

    //  if no action pending then display current result type/id
    if (TP.canInvoke(aSignal, 'getResult')) {
        val = aSignal.getResult();
    }

    //  If the signal is currently in a failing state, then just return
    //  'undefined', since that's what the type of the result will be.
    if (aSignal.isFailing() || aSignal.didFail()) {
        return 'undefined';
    }

    //  Got a valid result
    if (TP.isValid(val)) {

        //  Start with the type name
        str = '' + TP.tname(val);

        //  If we got a collection of data, then try to probe inside to see what
        //  the collection actually contains.
        if (TP.isCollection(val)) {

            //  Empty collection - just append '()'
            if (TP.isEmpty(val)) {
                str += '()';
            } else {

                //  If it's a TIBET collection (or a retrofitted one like
                //  Array), we can use 'getValues'
                if (TP.canInvoke(val, 'getValues')) {
                    values = val.getValues();
                } else {
                    //  Otherwise, it's probably a native collection like
                    //  HTMLCollection etc.
                    values = TP.ac();
                    len = val.length;
                    for (i = 0; i < len; i++) {
                        values.push(val[i]);
                    }
                }

                //  Start with the length, an initial type name and a flag that
                //  indicates that all of the items are the same.
                len = values.getSize();
                startTN = TP.tname(values.at(0));
                wasSame = true;

                //  Iterate across the rest of the values and compute whether
                //  the rest of the items in the collection are of the same
                //  type.
                for (i = 1; i < len; i++) {
                    if (TP.tname(values.at(i)) !== startTN) {
                        wasSame = false;
                        break;
                    }
                }

                //  If they were all of the same type, then report that type
                //  name. Otherwise, just use '(Object)
                //  //  If they were all of the same type, then report that type
                //  name. Otherwise, just use '(Object)'.
                if (TP.isTrue(wasSame)) {
                    str += '(' + startTN + ')';
                } else {
                    str += '(Object)';
                }

                str += ' (' + len + ')';
            }
        }

    } else if (TP.isNull(val)) {
        //  If it's strictly null, report that.
        str = 'null';
    } else {
        //  Otherwise, it's undefined.
        str = 'undefined';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('growlModeForceDisplayToggle',
function() {

    /**
     * @method growlModeForceDisplayToggle
     * @summary Forces the receiver, which will be in 'growl' mode, to display
     *     or hide, depending on its current state.
     * @description When the receiver is in growl mode it show the last item for
     *     a bit and then fades out. 'Force toggling' the receiver's display
     *     will either a) force it to show the last item any time during the
     *     fade-out process or b) toggle it instantly between showing and hiding
     *     after its faded out.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var elem;

    elem = this.getNativeNode();

    //  We always set 'sticky' to true
    TP.elementSetAttribute(elem, 'sticky', 'true', true);

    //  At this point, we'll remove the fade out class - we're doing straight
    //  ahead toggling.
    TP.elementRemoveClass(elem, 'fade_out');

    //  If the receiver is currently 'exposed', then remove that class and put
    //  the 'concealed' class on to hide the receiver.
    if (TP.elementHasAttribute(elem, 'exposed', true)) {
        TP.elementRemoveAttribute(elem, 'exposed', true);
        TP.elementSetAttribute(elem, 'concealed', 'true', true);
    } else {
        //  Otherwise, do the reverse to show the receiver.
        TP.elementRemoveAttribute(elem, 'concealed', true);
        TP.elementSetAttribute(elem, 'exposed', 'true', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineHandler('ShowTile',
function(aSignal) {

    /**
     * @method handleShowTile
     * @summary Handles notifications of document scrolling changes from the
     *     overall canvas that the halo is working with.
     * @param {TP.sig.ShowTile} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var tileID,
        tileTPElem;

    if (TP.notEmpty(tileID = aSignal.at('tileID'))) {
        tileID = tileID.unquoted();

        if (TP.isValid(tileTPElem = TP.byId(tileID, this.getDocument()))) {
            tileTPElem.setAttribute('hidden', false);
        }

    } else {
        //  TODO: Log an exception
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('scrollOutputToEnd',
function() {

    /**
     * @method scrollOutputToEnd
     * @summary Scrolls the receiver's output wrapper to the end of it's
     *     scrolling container. This has the effect of scrolling the console
     *     output to the bottom (i.e to where the latest output is).
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var consoleOutputElem;

    consoleOutputElem = this.getNativeNode();
    consoleOutputElem.scrollTop = consoleOutputElem.scrollHeight;

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('updateOutputItem',
function(uniqueID, dataRecord) {

    /**
     * @method updateOutputItem
     * @summary Updates the output item specified by the supplied unique ID with
     *     the data contained in the supplied data record.
     * @discussion The supplied unique ID will be used to look up an existing
     *     output item. If an output item does not exist with this ID, this
     *     method will try to create one using the createOutputItem(). If one
     *     still cannot be created, this method will raise an error.
     * @param {String} uniqueID A unique ID that will be used to look up for an
     *     existing output item.
     * @param {TP.core.Hash} dataRecord A hash containing the data that will be
     *     used for the output. At this stage, this includes:
     *          'hid'       The shell history ID
     *          'cssClass'  Any desired additional CSS classes *for the output
     *                      item itself* (the output content very well might
     *                      contain CSS classes to style it's output in a
     *                      special way).
     *          'cmdText'   The command that was executed to produce the output
     *                      that this item is being created for.
     *          'typeinfo'  Type information for the 'top-level' object that is
     *                      being output. This can also contain the semaphore
     *                      text of 'LOG' to let this method know that the data
     *                      being output is part of a logging sequence.
     *          'stats'     Execution statistics from the shell that indicate
     *                      how long it took to produce the output.
     *          'rawData'   The raw data produced by the shell. It is different
     *                      than the 'output' field in that 'output' may have
     *                      already undergone some kind of formatting through a
     *                      pipeline or some other mechanism. If 'output' is
     *                      empty, then this raw data is used as the visual
     *                      output.
     *          'output'    The fully formatted data. If this is empty, then the
     *                      content in 'rawData' is used.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var doc,
        itemElem,

        fadeFinishedFunc,
        elem,

        typeinfo,
        rawData,
        outputObj,

        msgLevel,

        tileID,

        outputClass,
        resultClass,

        outputData,
        resp,
        outputStr,

        outputCoalesceEntries,
        coalesceEntry,

        coalesceFragment,
        insertionPoint,
        flushLock,
        updateStats,

        request,

        rawOutEntryTemplate,

        outputElem;

    doc = this.getNativeDocument();

    //  If we can't find the output item that this output was using before
    //  (sometimes outputs like to reuse the same item - i.e. logging), then
    //  attempt to recreate it.
    if (!TP.isElement(itemElem = doc.getElementById(uniqueID))) {

        //  Note here how we pass in no output data - we'll fill that in below.
        this.createOutputItem(uniqueID, TP.hc());

        //  If we still couldn't create the item, then notify with an error
        //  message and bail out.
        if (!TP.isElement(itemElem = doc.getElementById(uniqueID))) {
            TP.ifError() ?
                    TP.error(
                        'Couldn\'t find out item for: ' + uniqueID) : 0;

            return this;
        }
    }

    elem = this.getNativeNode();

    //  If we're currently shifted into 'none' mode and haven't begun a 'fade
    //  out' session, then switch our mode into 'growl', which will show the
    //  last item, but set us up to fade out.
    if (this.getAttribute('mode') === 'none' &&
        !TP.elementHasClass(elem, 'fade_out')) {

        this.setAttribute('mode', 'growl');

        //  When the fade effect is finished, then we remove the class that
        //  causes the fade out and, if we're not 'sticky' (which means the
        //  user toggled us to continue to show), then set our mode back to
        //  'none'.
        (fadeFinishedFunc = function(aSignal) {

            fadeFinishedFunc.ignore(elem, 'TP.sig.DOMTransitionEnd');

            TP.elementRemoveClass(elem, 'fade_out');

            if (!TP.elementHasAttribute(elem, 'sticky', true) &&
                this.getAttribute('mode') === 'growl') {
                this.setAttribute('mode', 'none');
            }

        }.bind(this)).observe(elem, 'TP.sig.DOMTransitionEnd');

        //  Add the class that causes us to fade out, but do so after allowing
        //  the browser machinery to repaint. Otherwise the transition won't
        //  take effect (due to the way that CSS transition interact with the
        //  DOM style system).
        (function() {
            var styleObj;

            TP.elementAddClass(elem, 'fade_out');

            styleObj = TP.elementGetStyleObj(elem);

            styleObj.transitionDelay =
                TP.sys.cfg('sherpa.tdc.item_fadeout_delay', 2000) + 'ms';
            styleObj.transitionDuration =
                TP.sys.cfg('sherpa.tdc.item_fadeout_duration', 2000) + 'ms';

        }).queueForNextRepaint(this.getNativeWindow());
    }

    //  Grab all of the 'meta' data about the output from the supplied data
    //  record.
    typeinfo = dataRecord.at('typeinfo');
    rawData = dataRecord.at('rawData');
    outputObj = dataRecord.at('output');

    //  If we're outputting logging data, add the '.logoutput' class to the
    //  output item element and set the content of the input line to 'Log'.
    if (typeinfo === 'LOG') {

        TP.elementAddClass(itemElem, 'logoutput');

        msgLevel = dataRecord.at('messageLevel');
        if (TP.isEmpty(msgLevel)) {
            msgLevel = '';
        } else {
            msgLevel = ' (' + msgLevel.get('name') + ')';
        }

        TP.nodeSetTextContent(
                TP.byCSSPath('> .flex-item .header', itemElem, true, false),
                'Log' + msgLevel);
    }

    //  Grab the output entry template if it hasn't already been cached and
    //  cache it.
    if (TP.notValid(rawOutEntryTemplate = this.get('rawOutEntryTemplate'))) {
        resp = TP.uc(
            '~ide_root/xhtml/sherpa_console_templates.xhtml' +
                '#xpath1(//*[@name="raw_outputEntry"])').getResource(
                TP.request('async', false,
                            'resultType', TP.WRAP,
                            'shouldSignal', false));

        rawOutEntryTemplate = resp.get('result');
        this.set('rawOutEntryTemplate', rawOutEntryTemplate);
    }

    //  If the output text is empty and the user is asking for tiled output,
    //  then created a tile and set the raw data as its source object.
    if (TP.isEmpty(outputObj) && TP.isTrue(dataRecord.at('tiledOutput'))) {

        //  Create a tiled output which will exist outside of the main wrapper
        //  surrounding the output items.
        tileID = this.createTiledOutput(itemElem, uniqueID, dataRecord);

        //  Output a link that will cause the tile to show (if it hasn't been
        //  closed - just hidden). This throws a signal that this object listens
        //  for.
        outputObj = TP.xhtmlnode(
                        '<a href="#" on:click="' +
                        '{signal: \'ShowTile\', ' +
                        'payload: {tileID: \'' + tileID + '\'}}">' +
                        'Show Tile' +
                        '</a>');
    }

    //  If we're not outputting real output, then set the outputStr to the empty
    //  String and skip executing the output template.
    if ((TP.isEmpty(outputObj) || rawData === TP.TSH_NO_VALUE) &&
            TP.isEmpty(tileID)) {
        outputStr = '';
    } else {
        outputClass = dataRecord.at('cssClass');

        if (TP.notEmpty(outputClass)) {
            TP.elementAddClass(itemElem, outputClass);
        }

        //  For now, this is special cased to handle iframe results.
        resultClass = '';
        if (TP.isValid(request = dataRecord.at('request'))) {
            if (TP.isTrue(request.at('cmdAsIs'))) {
                resultClass = 'asis-container';
            }
        }

        //  Run the output template and fill in the data
        outputData = TP.hc('output', outputObj,
                            'outputclass', outputClass,
                            'resultclass', resultClass);

        outputStr = rawOutEntryTemplate.transform(outputData);

        if (!TP.isString(outputStr)) {

            //  Something went wrong during templating. The outputData didn't
            //  get converted and now our outputStr is just a reference to
            //  outputData.

            //  Try retemplating the output since 99% of the errors will be DOM
            //  parse issues meaning something in the data wasn't properly
            //  escaped.
            outputData.atPut(
                    'output',
                    TP.boot.$stringify(outputData.at('output'), '', true));

            outputStr = rawOutEntryTemplate.transform(outputData);
        }
    }

    //  Define a Function that will take statistical information, such as the
    //  result type and the execution statistics, make XHTML nodes from that
    //  data and set them into the proper places in the output item.
    updateStats = function(record, groupElem) {

        var recordTypeInfo,

            statsStr,
            resultTypeStr,

            statsElem;

        //  Now, update statistics and result type data that was part of the
        //  entry that we inserted before with the input content.
        if (TP.isValid(request = record.at('request'))) {

            recordTypeInfo = record.at('typeinfo');
            if (recordTypeInfo === 'LOG') {
                return;
            }

            resultTypeStr = TP.isEmpty(recordTypeInfo) ?
                            this.getOutputTypeInfo(request) :
                            recordTypeInfo;
            if (TP.isEmpty(resultTypeStr)) {
                return;
            }

            statsStr = TP.isEmpty(record.at('stats')) ?
                            this.getInputStats(request) :
                            record.at('stats');
        } else {
            resultTypeStr = '';
            statsStr = '';
        }

        //  Update the result type output information
        statsElem = TP.byCSSPath('> .header .typeinfo', groupElem, true, false);
        if (TP.isElement(statsElem)) {
            TP.xmlElementSetContent(
                    statsElem,
                    TP.xhtmlnode(resultTypeStr));
        }

        //  Update the result type output information
        statsElem = TP.byCSSPath('> .header .stats', groupElem, true, false);
        if (TP.isElement(statsElem)) {
            TP.xmlElementSetContent(
                    statsElem,
                    TP.xhtmlnode(statsStr));
        }
    }.bind(this);

    //  For superior performance, we 'coalesce' output. This allows quite a bit
    //  of data to be accumulated in a DocumentFragment and then, every so often
    //  via a timer, be appended to the output element. This avoids a lot of
    //  document reflows for the console output.

    //  There should be an 'output coalescing record' for each piece of data
    //  that we're trying to output. This can be more than one since our results
    //  can be asynchronous and we need to write them to the correct fragment
    //  which will then get appended to the correct output element for that
    //  result set.
    outputCoalesceEntries = this.get('outputCoalesceEntries');
    if (TP.notValid(coalesceEntry = outputCoalesceEntries.at(uniqueID))) {

        //  If we couldn't find an existing coalescing record for the supplied
        //  ID, then we create a coalescing fragment and a record holding it,
        //  the data record and the overall output element.
        coalesceFragment = TP.documentConstructFragment(doc);
        insertionPoint = TP.byCSSPath('> .flex-item', itemElem, true, false);

        outputCoalesceEntries.atPut(
                uniqueID,
                TP.hc('fragment', coalesceFragment,
                        'dataRecord', dataRecord,
                        'insertionPoint', insertionPoint));
    } else {
        //  Otherwise, we're coalescing for output that is already in the
        //  process of being written - just grab the fragment.
        coalesceFragment = coalesceEntry.at('fragment');
    }

    //  Create an XHTML node from our output String, thereby defaulting the XML
    //  namespace to the HTML namespace, etc.
    outputElem = TP.xhtmlnode(outputStr);

    //  Append it onto the coalescing DocumentFragment.
    coalesceFragment.appendChild(outputElem);

    //  Make sure that we have a coalescing lock set up. We do this by
    //  scheduling this refresh function 'upon repaint' - see below.
    if (!(flushLock = this.get('outputCoalesceLock'))) {
        flushLock = function() {
            var uniqueItemElem,
                rawOutputElem,

                embeddedIFrameElem,
                embeddedLoc;

            //  Iterate over all of the coalescing records, append whatever
            //  is in the fragment onto the output element and update the
            //  item's statistics.
            outputCoalesceEntries.getValues().forEach(
                function(anEntry) {
                    anEntry.at('insertionPoint').appendChild(
                                        anEntry.at('fragment'));

                    updateStats(anEntry.at('dataRecord'),
                                anEntry.at('insertionPoint'));
                });

            //  Grab the output element according to the supplied unique ID
            uniqueItemElem = TP.byId(uniqueID,
                                this.getNativeDocument(),
                                false);

            //  If it doesn't have a 'isSetUp' class, then set it up and add
            //  that class
            if (!TP.elementHasClass(uniqueItemElem, 'isSetUp')) {
                TP.wrap(uniqueItemElem).setup();
                TP.elementAddClass(uniqueItemElem, 'isSetUp');
            }

            //  Empty the set of coalescing records. We'll generate more the
            //  next time around.
            outputCoalesceEntries.empty();

            //  Scroll our output wrapper to the end. We're appending content,
            //  so this is what the user will expect.
            this.scrollOutputToEnd();

            //  Adjust the maxium item height based on drawer height(s) etc.
            //  This will give the new item a chance to size it's content and
            //  possibly set up scrollbars if necessary based on the latest
            //  Sherpa HUD configuration.
            this.adjustItemMaxHeight();

            TP.elementBubbleXMLNSAttributesOnDescendants(uniqueItemElem);

            flushLock = null;
            this.set('outputCoalesceLock', null);

            //  Scroll the raw output element to its end. This is useful in
            //  cases where there's very long output (i.e. 'history') and we
            //  want to see the bottom of it first.
            rawOutputElem = TP.byCSSPath(
                                '> .flex-item *[name="raw_outputEntry"]',
                                uniqueItemElem,
                                true,
                                false);

            if (TP.isElement(rawOutputElem)) {
                rawOutputElem.scrollTop = rawOutputElem.scrollHeight;
            }

            //  If there is an embedded iframe element within the output and
            //  there is a valid request with a configured 'cmdLocation', then
            //  set the iframe's 'src' to that location.
            embeddedIFrameElem = TP.byCSSPath('> * iframe',
                                                uniqueItemElem,
                                                true,
                                                false);
            if (TP.isElement(embeddedIFrameElem)) {
                if (TP.isValid(request = dataRecord.at('request'))) {

                    embeddedLoc = request.at('cmdLocation');
                    if (TP.notEmpty(embeddedLoc)) {
                        embeddedIFrameElem.src = embeddedLoc;
                    }
                }
            }

        }.bind(this).queueForNextRepaint(this.getNativeWindow());

        //  Capture the output coalescing lock.
        this.set('outputCoalesceLock', flushLock);
    }

    return this;
});

//  ========================================================================
//  TP.sherpa.consoleoutputitem
//  ========================================================================

TP.sherpa.Element.defineSubtype('consoleoutputitem');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. It inherits the fact that it has no 'theme'
//  CSS from TP.sherpa.Element. Note how this property is TYPE_LOCAL, by design.
TP.sherpa.consoleoutputitem.defineAttribute('styleURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.consoleoutputitem.Inst.defineHandler('DOMScroll',
function(aSignal) {

    /**
     * @method handleDOMScroll
     * @summary Handles notifications of document scrolling changes from the
     *     overall canvas that the halo is working with.
     * @param {TP.sig.DOMScroll} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.consoleoutputitem} The receiver.
     */

    if (this.hasClass('overflowing')) {
        this.updateScrollButtons();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutputitem.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Sets up the console output item by configuring its scroll
     *     buttons and like observing signals it needs to be aware of, etc.
     * @returns {TP.sherpa.consoleoutputitem} The receiver.
     */

    var itemContentTPElem,
        arrows;

    itemContentTPElem = TP.byCSSPath(
                            '> .flex-item > .content', this, true, true);

    //  If we got back more than 1 or none (i.e. a 'header only' output item)
    //  then just skip the rest.
    if (TP.isArray(itemContentTPElem) || TP.notValid(itemContentTPElem)) {
        return this;
    }

    arrows = TP.byCSSPath(' sherpa|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', itemContentTPElem);
            });


    this.observe(this, 'TP.sig.DOMScroll');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutputitem.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the console output item by performing housekeeping
     *     cleanup, like ignoring signals it's observing, etc.
     * @returns {TP.sherpa.consoleoutputitem} The receiver.
     */

    this.ignore(this, 'TP.sig.DOMScroll');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutputitem.Inst.defineMethod('updateScrollButtons',
function() {

    /**
     * @method updateScrollButtons
     * @summary Updates the receiver's scroll buttons
     * @returns {TP.sherpa.consoleoutputitem} The receiver.
     */

    var arrows;

    //  Grab any scrollbuttons that are under us.
    arrows = TP.byCSSPath(' sherpa|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    //  Iterate and have each arrow update.
    arrows.forEach(
            function(anArrow) {
                anArrow.updateForScrollingContent();
            });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
