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
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    //  Set up some instance variables for this instance of console output.
    TP.wrap(elem).set('outputCoalesceRecords', TP.hc());

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineAttribute('$inlineStyleElem');

TP.sherpa.consoleoutput.Inst.defineAttribute('rawOutEntryTemplate');

TP.sherpa.consoleoutput.Inst.defineAttribute('outputCoalesceRecords');
TP.sherpa.consoleoutput.Inst.defineAttribute('outputCoalesceTimer');

TP.sherpa.consoleoutput.Inst.defineAttribute(
        'wrapper',
        {value: TP.cpc('> .wrapper', TP.hc('shouldCollapse', true))});

TP.sherpa.consoleoutput.Inst.defineAttribute(
        'outputCellsContents',
        {value: TP.cpc('sherpa|consoleoutputitem .content')});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    var styleElem,

        northDrawerTPElement;

    this.observe(this.getDocument(), 'TP.sig.DOMResize');

    styleElem = TP.documentAddCSSStyleElement(
    this.getNativeDocument(),
    '@namespace sherpa url(http://www.technicalpursuit.com/2014/sherpa);\n' +
    '.flex-cell > .content {\n' +
        'max-height: none;' +
        '\n' +
    '}');

    TP.elementSetAttribute(styleElem,
                            'id',
                            'TP_shera_consoleoutputitem_inline');

    this.set('$inlineStyleElem', styleElem);

    this.adjustCellMaxHeight();

    this.observe(this.getDocument(), 'TP.sig.DOMResize');

    //  Manually add TP.sherpa.scrollbutton's stylesheet to our document, since
    //  we don't awaken cell content for performance reasons.
    TP.sherpa.scrollbutton.addStylesheetTo(this.getNativeDocument());

    northDrawerTPElement = TP.byId('north', this.getNativeDocument());

    (function(aSignal) {

        this.adjustCellMaxHeight();

        if (TP.isTrue(TP.bc(northDrawerTPElement.getAttribute('closed')))) {

            //  TODO: This is an 'empirically derived' value - need to compute
            //  it from real numbers.
            this.scrollBy(TP.DOWN, 120);
        }

    }.bind(this)).observe(northDrawerTPElement, 'TP.sig.DOMTransitionEnd');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineHandler('DOMResize',
function(aSignal) {

    this.adjustCellMaxHeight();

    return this;
});

//  ------------------------------------------------------------------------
//  Output management methods
//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('adjustCellMaxHeight',
function() {

    /**
     * @method adjustCellMaxHeight
     * @summary
     * @returns {TP.sherpa.console} The receiver.
     */

    var styleSheet,
        outputItemRules,

        centerHeight,
        offset;

    styleSheet = TP.cssElementGetStyleSheet(this.get('$inlineStyleElem'));
    outputItemRules = TP.styleSheetGetStyleRulesMatching(
                            styleSheet,
                            '.flex-cell > .content');

    centerHeight = TP.byId('center', this.getDocument()).getHeight();

    //  TODO: This is cheesy - make these computed.

    offset =
        20 +    //  sherpa:consoleoutput top & bottom values
        4 +     //  sherpa:consoleoutputitem top & bottom margin values
        2 +     //  .flex-cell top & bottom border values
        21 +    //  .flex-cell > .header height + margin top & bottom +
                //                          border top & bottom
        6;      //  .flex-cell > .content margin top & bottom +
                //                          border top & bottom

    /* eslint-disable no-extra-parens */
    outputItemRules.at(0).style.maxHeight = (centerHeight - offset) + 'px';
    /* eslint-enable no-extra-parens */

    (function() {

        var cellContentElems;

        cellContentElems = TP.unwrap(this.get('outputCellsContents'));

        cellContentElems.forEach(
                function(aContentElem) {
                    var cellElem;

                    cellElem = aContentElem.parentNode.parentNode;

                    if (aContentElem.scrollHeight > aContentElem.offsetHeight) {
                        TP.elementAddClass(cellElem, 'overflowing');
                        TP.wrap(cellElem).updateScrollButtons(aContentElem);
                    } else {
                        TP.elementRemoveClass(cellElem, 'overflowing');
                    }
                });
    }.bind(this)).fork(10);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('clear',
function() {

    var outputItems;

    outputItems = TP.byCSSPath('sherpa|consoleoutputitem', this, false, true);
    outputItems.forEach(
            function(anItem) {
                anItem.teardown();
            });

    this.get('wrapper').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('getInputStats',
function(aSignal) {

    /**
     * @method getInputStats
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     * @returns {TP.sherpa.consoleoutput} The receiver.
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
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var val,
        str,
        values,
        len,
        startTN,
        wasSame,
        i;

    //  TODO: Isn't aSignal the same as our signal and, if not, is that an
    //  error?

    //  if no action pending then display current result type/id
    if (TP.canInvoke(aSignal, 'getResult')) {
        val = aSignal.getResult();
    }

    if (aSignal.isFailing() || aSignal.didFail()) {
        return 'undefined';
    }

    if (TP.isValid(val)) {

        str = '' + TP.tname(val);

        if (TP.isCollection(val)) {
            if (TP.isEmpty(val)) {
                str += '()';
            } else {

                if (TP.canInvoke(val, 'getValues')) {
                    values = val.getValues();
                } else {
                    // Probably a native collection like HTMLCollection etc.
                    values = TP.ac();
                    len = val.length;
                    for (i = 0; i < len; i++) {
                        values.push(val[i]);
                    }
                }

                len = values.getSize();
                startTN = TP.tname(values.at(0));
                wasSame = true;

                for (i = 1; i < len; i++) {
                    if (TP.tname(values.at(i)) !== startTN) {
                        wasSame = false;
                        break;
                    }
                }

                if (TP.isTrue(wasSame)) {
                    str += '(' + startTN + ')';
                } else {
                    str += '(Object)';
                }

                str += ' (' + len + ')';
            }
        }

        if (TP.isEmpty(str) || str === 'ready') {
            str = 'Object';
        }
    } else if (TP.isNull(val)) {
        str = 'null';
    } else {
        str = 'undefined';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('growlModeToggle',
function() {

    /**
     * @method growlModeToggle
     * @param
     * @returns {TP.sherpa.consoleoutput} The receiver.
     */

    var elem;

    elem = this.getNativeNode();

    //  We always set 'sticky' to true
    TP.elementSetAttribute(elem, 'sticky', 'true', true);

    //  At this point, we'll remove the fade out class - we're doing straight
    //  ahead toggling.
    TP.elementRemoveClass(elem, 'fade_out');

    if (TP.elementHasAttribute(elem, 'exposed', true)) {
        TP.elementRemoveAttribute(elem, 'exposed', true);
        TP.elementSetAttribute(elem, 'concealed', 'true', true);
    } else {
        TP.elementRemoveAttribute(elem, 'concealed', true);
        TP.elementSetAttribute(elem, 'exposed', 'true', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('createOutputEntry',
function(uniqueID, dataRecord) {

    /**
     * @method createOutputEntry
     */

    var doc,

        hid,
        hidstr,

        cmdText,

        cssClass,

        inputData,

        resp,
        entryStr,

        insertionPoint,

        outElem;

    doc = this.getNativeDocument();

    if (!TP.isElement(outElem = doc.getElementById(uniqueID))) {

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

        cmdText = cmdText.asEscapedXML();

        inputData = TP.hc(
                        'id', uniqueID,
                        'inputclass', cssClass,
                        'hid', hidstr,
                        'cmdText', cmdText,
                        'empty', '',
                        'resultType', '',
                        'stats', '&#8230;');

        resp = TP.uc('~ide_root/xhtml/sherpa_console_templates.xhtml' +
                            '#xpath1(//*[@name="consoleEntry"])').transform(
                                inputData,
                                TP.request(
                                    'async', false, 'shouldSignal', false));
        entryStr = resp.get('result');

        insertionPoint = TP.unwrap(this.get('wrapper'));

        outElem = TP.xmlElementInsertContent(
                        insertionPoint,
                        TP.xhtmlnode(entryStr),
                        TP.BEFORE_END);

        TP.elementRemoveAttribute(outElem, 'name');

        TP.elementSetAttribute(outElem, 'tibet:noawaken', 'true', true);

    } else {
        //  TODO: Print an error
        //  empty
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('createTiledOutput',
function(cellElem, uniqueID, dataRecord) {

    /**
     * @method createTiledOutput
     */

    var cmdText,

        tileID,

        tileTPElem,

        tileContentTPElem;

    cmdText = TP.byCSSPath('.header .content', cellElem, true).getTextContent();

    tileID = uniqueID + '_Tile';

    //  We don't supply a parent to the makeTile() call, so it will be placed in
    //  the common tile tier.
    tileTPElem = TP.bySystemId('Sherpa').makeTile(tileID);

    tileTPElem.set('headerText', cmdText);

    if (TP.isValid(tileContentTPElem)) {

        tileContentTPElem = tileTPElem.setContent(tileContentTPElem);

        tileContentTPElem.set('tileTPElem', tileTPElem);

        tileContentTPElem.awaken();
    }

    tileTPElem.toggle('hidden');

    return tileID;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineHandler('ShowTile',
function(aSignal) {

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
     * @summary
     * @returns {TP.sherpa.console} The receiver.
     */

    var consoleOutputElem;

    consoleOutputElem = this.getNativeNode();
    consoleOutputElem.scrollTop = consoleOutputElem.scrollHeight;

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutput.Inst.defineMethod('updateOutputEntry',
function(uniqueID, dataRecord) {

    /**
     * @method updateOutputEntry
     */

    var doc,
        cellElem,

        fadeFinishedFunc,
        elem,

        typeinfo,
        rawData,
        outputObj,

        msgLevel,

        tileID,

        outputClass,

        outputData,
        resp,
        outputStr,

        outputCoalesceRecords,
        coalesceRecord,

        coalesceFragment,
        insertionPoint,
        flushTimer,
        updateStats,

        request,

        rawOutEntryTemplate,

        outputElem;

    doc = this.getNativeDocument();

    //  If we can't find the output cell that this output was using before
    //  (sometimes outputs like to reuse the same cell - i.e. logging), then
    //  attempt to recreate it.
    if (!TP.isElement(cellElem = doc.getElementById(uniqueID))) {

        //  Note here how we pass in no output data - we'll fill that in below.
        this.createOutputEntry(uniqueID, TP.hc());

        //  If we still couldn't create the cell, then notify with an error
        //  message and bail out.
        if (!TP.isElement(cellElem = doc.getElementById(uniqueID))) {
            TP.ifError() ?
                    TP.error(
                        'Couldn\'t find out cell for: ' + uniqueID) : 0;

            return this;
        }
    }

    elem = this.getNativeNode();

    //  If we're currently shifted into 'none' mode and haven't begun a 'fade
    //  out' session, then switch our mode into 'growl', which will show the
    //  last cell, but set us up to fade out.
    if (this.getAttribute('mode') === 'none' &&
        !TP.elementHasClass(elem, 'fade_out')) {

        this.setAttribute('mode', 'growl');

        //  When the fade effect is finished, then we remove the class that
        //  causes the fade out and, if we're not 'sticky' (which means the
        //  user toggled us to continue to show), then set our mode back to
        //  'none'.
        (fadeFinishedFunc = function(aSignal) {
            fadeFinishedFunc.ignore(
                elem, 'TP.sig.DOMTransitionEnd');

            TP.elementRemoveClass(elem, 'fade_out');

            if (!TP.elementHasAttribute(elem, 'sticky', true)) {
                this.setAttribute('mode', 'none');
            }

        }.bind(this)).observe(elem, 'TP.sig.DOMTransitionEnd');

        //  Add the class that causes us to fade out, but do so after a fork()
        //  since otherwise the transition won't take effect (due to the way
        //  that CSS transition interact with the DOM style system).
        (function() {
            var styleObj;

            TP.elementAddClass(elem, 'fade_out');

            styleObj = TP.elementGetStyleObj(elem);

            styleObj.transitionDelay =
                TP.sys.cfg('sherpa.tdc.cell_fadeout_delay', 2000) + 'ms';
            styleObj.transitionDuration =
                TP.sys.cfg('sherpa.tdc.cell_fadeout_duration', 2000) + 'ms';

        }).fork(10);
    }

    typeinfo = dataRecord.at('typeinfo');
    rawData = dataRecord.at('rawData');
    outputObj = dataRecord.at('output');

    //  If we're outputting logging data, add the '.logoutput' class to the
    //  output cell element and set the content of the input line to 'Log'.
    if (typeinfo === 'LOG') {
        TP.elementAddClass(cellElem, 'logoutput');
        msgLevel = dataRecord.at('messageLevel');
        if (TP.isEmpty(msgLevel)) {
            msgLevel = '';
        } else {
            msgLevel = ' (' + msgLevel + ')';
        }

        TP.nodeSetTextContent(
                TP.byCSSPath('.header', cellElem, true, false),
                'Log' + msgLevel);
    }

    //  Grab the output entry template
    if (TP.notValid(rawOutEntryTemplate = this.get('rawOutEntryTemplate'))) {
        resp = TP.uc(
            '~ide_root/xhtml/sherpa_console_templates.xhtml' +
                '#xpath1(//*[@name="raw_outputEntry"])').getResource(
                TP.request('async', false, 'shouldSignal', false));

        rawOutEntryTemplate = resp.get('result');
        this.set('rawOutEntryTemplate', rawOutEntryTemplate);
    }

    //  If the output text is empty and the user is asking for tiled output,
    //  then created a tile and set the raw data as its source object.
    if (TP.isEmpty(outputObj) && TP.isTrue(dataRecord.at('tiledOutput'))) {

        tileID = this.createTiledOutput(cellElem, uniqueID, dataRecord);

        //  Output a link that will cause the tile to show (if it hasn't been
        //  closed - just hidden).
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
            TP.elementAddClass(cellElem, outputClass);
        }

        //  Run the output template and fill in the data
        outputData = TP.hc('output', outputObj,
                            'outputclass', outputClass);

        outputStr = rawOutEntryTemplate.transform(outputData);

        if (!TP.isString(outputStr)) {

            //  Something went wrong during templating. The outputData didn't
            //  get converted and now our outputStr is just a reference to
            //  outputData.

            //  Try reprocessing the output since 99% of the errors will be DOM
            //  parse issues meaning something in the data wasn't properly
            //  escaped.
            outputData.atPut('output',
                    TP.boot.$stringify(outputData.at('output'), '', true));

            outputStr = rawOutEntryTemplate.transform(outputData);
        }
    }

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

        statsElem = TP.byCSSPath('.typeinfo', groupElem, true, false);
        if (TP.isElement(statsElem)) {
            TP.xmlElementSetContent(
                    statsElem,
                    TP.xhtmlnode(resultTypeStr));
        }

        statsElem = TP.byCSSPath('.stats', groupElem, true, false);
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
    outputCoalesceRecords = this.get('outputCoalesceRecords');
    if (TP.notValid(coalesceRecord = outputCoalesceRecords.at(uniqueID))) {

        //  If we couldn't find an existing coalescing record for the supplied
        //  ID, then we create a coalescing fragment and a record holding it,
        //  the data record and the overall output element.
        coalesceFragment = TP.documentConstructFragment(doc);
        insertionPoint = TP.byCSSPath('.flex-cell', cellElem, true, false);

        outputCoalesceRecords.atPut(
                uniqueID,
                TP.hc('fragment', coalesceFragment,
                        'dataRecord', dataRecord,
                        'insertionPoint', insertionPoint));
    } else {
        //  Otherwise, we're coalescing for output that is already in the
        //  process of being written - just grab the fragment.
        coalesceFragment = coalesceRecord.at('fragment');
    }

    outputElem = TP.xhtmlnode(outputStr);

    coalesceFragment.appendChild(outputElem);

    //  Make sure that we have a coalescing timer set up.
    if (!(flushTimer = this.get('outputCoalesceTimer'))) {
        flushTimer = setTimeout(
            function() {

                var outElem;

                //  Iterate over all of the coalescing records, append whatever
                //  is in the fragment onto the output element and update the
                //  cell's statistics.
                outputCoalesceRecords.getValues().forEach(
                    function(record) {
                        record.at('insertionPoint').appendChild(
                                            record.at('fragment'));

                        updateStats(record.at('dataRecord'),
                                    record.at('insertionPoint'));
                    });

                outElem = TP.byId(uniqueID,
                                    this.getNativeDocument(),
                                    false);

                if (!TP.elementHasClass(outElem, 'isSetUp')) {
                    TP.wrap(outElem).setup();
                    TP.elementAddClass(outElem, 'isSetUp');
                }

                //  Empty the set of coalescing records. We'll generate more the
                //  next time around.
                outputCoalesceRecords.empty();

                this.scrollOutputToEnd();

                this.adjustCellMaxHeight();

                flushTimer = null;
                this.set('outputCoalesceTimer', null);
            }.bind(this),
            80);

        this.set('outputCoalesceTimer', flushTimer);
    }

    return this;
});

//  ========================================================================
//  TP.sherpa.consoleoutputitem
//  ========================================================================

TP.sherpa.Element.defineSubtype('consoleoutputitem');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.consoleoutputitem.Inst.defineHandler('DOMScroll',
function(aSignal) {

    if (this.hasClass('overflowing')) {
        this.updateScrollButtons();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutputitem.Inst.defineMethod('setup',
function() {

    var arrows,
        upArrow,
        downArrow,

        cellContentTPElem;

    cellContentTPElem = TP.byCSSPath(
                            '.flex-cell > .content', this, true, true);

    //  If we got back more than 1 or none (i.e. a 'header only' output cell)
    //  then just skip the rest.
    if (TP.isArray(cellContentTPElem) || TP.notValid(cellContentTPElem)) {
        return this;
    }

    arrows = TP.byCSSPath('sherpa|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    upArrow = arrows.first();
    downArrow = arrows.last();

    upArrow.set('scrollingContentTPElem', cellContentTPElem);
    downArrow.set('scrollingContentTPElem', cellContentTPElem);

    this.observe(this, 'TP.sig.DOMScroll');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutputitem.Inst.defineMethod('teardown',
function() {

    this.ignore(this, 'TP.sig.DOMScroll');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.consoleoutputitem.Inst.defineMethod('updateScrollButtons',
function() {

    var arrows,

        upArrow,
        downArrow;

    arrows = TP.byCSSPath('sherpa|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    upArrow = arrows.first();
    downArrow = arrows.last();

    upArrow.updateForScrollingContent();
    downArrow.updateForScrollingContent();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
