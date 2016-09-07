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
 * @type {TP.sherpa.worldthumbnails}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('worldthumbnails');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineAttribute(
        'thumbnailList',
        {value: TP.cpc('> .content > ul', TP.hc('shouldCollapse', true))});

TP.sherpa.worldthumbnails.Inst.defineAttribute('selectedIndex');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        thumbnailListTPElem,

        arrows;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.set('selectedIndex', -1);

    thumbnailListTPElem = tpElem.get('thumbnailList');
    tpElem.observe(thumbnailListTPElem, 'TP.sig.DOMScroll');

    arrows = TP.byCSSPath('sherpa|scrollbutton',
                            elem,
                            false,
                            true);

    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', thumbnailListTPElem);
            });

    tpElem.observe(TP.ANY, 'TP.sig.ToggleScreen');

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        thumbnailListTPElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    thumbnailListTPElem = tpElem.get('thumbnailList');
    tpElem.ignore(thumbnailListTPElem, 'TP.sig.DOMScroll');

    tpElem.ignore(TP.ANY, 'TP.sig.ToggleScreen');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineHandler('DOMScroll',
function(aSignal) {

    if (this.hasClass('overflowing')) {
        this.updateScrollButtons();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineHandler('SelectThumbnail',
function(aSignal) {

    var canvasElem,
        listElem,

        indexVal,
        screenIndex;

    canvasElem = aSignal.getDOMTarget();
    listElem = canvasElem.parentNode.parentNode;

    indexVal = TP.elementGetAttribute(listElem, 'data-index', true);

    if (TP.notEmpty(indexVal)) {
        screenIndex = TP.nc(indexVal);
    }

    if (TP.isNumber(screenIndex)) {
        this.selectThumbnailAt(screenIndex);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineHandler('ToggleScreen',
function(aSignal) {

    var screenIndex,

        thumbnailListTPElem,
        thumbnailItems,

        currentIndex,
        oldItem,

        screens,
        screen,
        screenTPDoc,

        newItem;

    screenIndex = aSignal.at('screenIndex');

    if (screenIndex === -1) {
        this.uninstallCurrentMutationObserver();
        this.set('selectedIndex', -1);

        return this;
    }

    screens = TP.byId('SherpaWorld', this.getNativeWindow()).get('screens');
    screen = screens.at(screenIndex);

    thumbnailListTPElem = this.get('thumbnailList');

    thumbnailItems = TP.byCSSPath('li', thumbnailListTPElem, false, true);

    currentIndex = this.get('selectedIndex');
    if (currentIndex >= 0) {
        this.uninstallCurrentMutationObserver();
        oldItem = thumbnailItems.at(currentIndex);
        oldItem.setAttribute('selected', false);
    }

    screenTPDoc = screen.getContentDocument();
    this.installMutationObserverOn(TP.unwrap(screenTPDoc));

    newItem = thumbnailItems.at(screenIndex);
    newItem.setAttribute('selected', true);

    this.set('selectedIndex', screenIndex);

    thumbnailListTPElem.scrollTo(TP.BOTTOM);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineMethod('installMutationObserverOn',
function(aDocument) {

    var thumbnailViewer,
        recordsHandler,
        observerConfig;

    thumbnailViewer = this;

    recordsHandler = function(mutationRecords) {
        thumbnailViewer.refreshThumbnailFor(aDocument);
    };

    observerConfig = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: false
    };

    TP.addMutationObserver(
            aDocument, recordsHandler, observerConfig, 'THUMBNAIL_OBSERVER');

    TP.activateMutationObserver('THUMBNAIL_OBSERVER');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineMethod('refreshAllThumbnails',
function() {

    /**
     * @method refreshAllThumbnails
     * @summary
     * @returns
     */

    var screens;

    screens = TP.byId('SherpaWorld', this.getNativeWindow()).get('screens');

    screens.forEach(
        function(screenTPElem, index) {

            var thumbnailListTPElem,
                divs,

                canvasAssignFunc,

                tpDoc,
                iframeBodyElem;

            thumbnailListTPElem = this.get('thumbnailList');
            divs = TP.byCSSPath('div', thumbnailListTPElem, false, false);

            canvasAssignFunc = function(aCanvas) {

                var item,
                    existingCanvases;

                if (!TP.isElement(aCanvas)) {
                    return;
                }

                item = divs.at(canvasAssignFunc.itemIndex);
                existingCanvases = TP.nodeGetElementsByTagName(item, 'canvas');

                //  NB: We *must* use primitive node replacement/appending
                //  methods here or the canvas element doesn't show properly.
                if (TP.notEmpty(existingCanvases)) {
                    item.replaceChild(aCanvas, existingCanvases.first());
                } else {
                    item.appendChild(aCanvas);
                }
            };

            canvasAssignFunc.itemIndex = index;

            tpDoc = screenTPElem.get('contentIFrame').getContentDocument();

            iframeBodyElem = TP.unwrap(tpDoc.getBody());

            if (TP.isElement(iframeBodyElem)) {

                TP.extern.html2canvas(iframeBodyElem).then(canvasAssignFunc);
            }
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineMethod('refreshThumbnailFor',
function(aDocument) {

    var iframeElem,

        screen,
        screenID,

        thumbnailListTPElem,

        div;

    //  First, find the corresponding 'sherpa:screen' element containing the
    //  iframe & window that contains the document
    iframeElem = aDocument.defaultView.frameElement;

    if (!TP.isElement(iframeElem)) {
        //  TODO: Raise an exception
        return this;
    }

    //  Now, go to it's parent, which will be the 'sherpa:screen' element.
    screen = iframeElem.parentNode;

    if (!TP.isElement(screen)) {
        //  TODO: Raise an exception
        return this;
    }

    //  Get it's ID.
    screenID = TP.elementGetAttribute(screen, 'id', true);

    //  Now, use that ID to look inside ourself for the list item that matches
    //  that on it's 'data-screenid' attribute. Grab the div under that.
    thumbnailListTPElem = this.get('thumbnailList');
    div = TP.byCSSPath('li[data-screenid="' + screenID + '"] > div',
                        thumbnailListTPElem,
                        true,
                        false);

    if (!TP.isElement(div)) {
        //  TODO: Raise an exception
        return this;
    }

    this.updateThumbnailEntryWith(div, TP.documentGetBody(aDocument));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary
     * @returns
     */

    var screens,
        str,

        thumbnailListTPElem;

    screens = TP.byId('SherpaWorld', this.getNativeWindow()).get('screens');

    //  No valid bookmark data - empty the menu content list and exit.
    if (TP.isEmpty(screens)) {
        this.get('thumbnailList').empty();

        return this;
    }

    str = '';

    thumbnailListTPElem = this.get('thumbnailList');

    screens.forEach(
        function(screenTPElem, index) {
            str += '<li data-index="' + index + '"' +
                    ' data-screenid="' + screenTPElem.getLocalID(true) + '">' +
                    '<div></div>' +
                    '</li>';
        });

    thumbnailListTPElem.setContent(TP.xhtmlnode(str));

    this.refreshAllThumbnails();

    (function() {
        if (thumbnailListTPElem.isOverflowing(TP.VERTICAL)) {
            this.addClass('overflowing');
            this.updateScrollButtons();
        } else {
            this.removeClass('overflowing');
        }

    }.bind(this)).fork(1000);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineMethod('selectThumbnailAt',
function(anIndex) {

    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(':screen ' + anIndex);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary
     * @returns
     */

    this.render();

    this.selectThumbnailAt(0);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineMethod('uninstallCurrentMutationObserver',
function() {

    TP.removeMutationObserver('THUMBNAIL_OBSERVER');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineMethod('updateScrollButtons',
function() {

    var arrows;

    arrows = TP.byCSSPath('sherpa|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    arrows.forEach(
            function(anArrow) {
                anArrow.updateForScrollingContent();
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.worldthumbnails.Inst.defineMethod('updateThumbnailEntryWith',
function(entryDiv, bodyElem) {

    var canvasAssignFunc;

    canvasAssignFunc = function(aCanvas) {

        var existingCanvases;

        if (!TP.isElement(aCanvas)) {
            return;
        }

        existingCanvases = TP.nodeGetElementsByTagName(entryDiv, 'canvas');

        //  NB: We *must* use primitive node replacement/appending
        //  methods here or the canvas element doesn't show properly.
        if (TP.notEmpty(existingCanvases)) {
            entryDiv.replaceChild(aCanvas, existingCanvases.first());
        } else {
            entryDiv.appendChild(aCanvas);
        }
    };

    if (TP.isElement(bodyElem)) {
        TP.extern.html2canvas(bodyElem).then(canvasAssignFunc);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
