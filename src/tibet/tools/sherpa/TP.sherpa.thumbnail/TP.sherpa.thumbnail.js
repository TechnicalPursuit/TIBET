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
 * @type {TP.sherpa.thumbnail}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('thumbnail');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineAttribute(
        'thumbnails',
        {value: TP.cpc('> .content > sherpa|worldthumbnails',
                                        TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineHandler('AddScreen',
function(aSignal) {

    var world,
        screenCount;

    world = TP.byId('SherpaWorld', TP.win('UIROOT'));

    screenCount = world.get('screens').getSize();

    //  Supplying null here will just append the screen to the end of the list
    //  of screens (in the DOM as well).
    world.createScreenElement(
            'SCREEN_' + screenCount,
            null,
            TP.uc(TP.sys.cfg('path.blank_page')),
            function() {
                var worldThumbnails;

                worldThumbnails = TP.byId('SherpaWorldThumbnails',
                                            this.getNativeWindow());

                worldThumbnails.render();
                worldThumbnails.selectThumbnailAt(screenCount);
            }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineHandler('ChangeView',
function(aSignal) {

    TP.byId('SherpaWorld', this.getNativeWindow()).setAttribute(
                                        'mode', aSignal.at('mode').unquoted());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineHandler('ChangeURI',
function(aSignal) {

    var uriValue,
        consoleStr;

    uriValue = TP.byId('screen_uri', this.getNativeWindow()).get('value');

    consoleStr = uriValue + ' .> @$UICANVAS';

    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(consoleStr);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineHandler('ShowAllScreens',
function(aSignal) {

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineHandler('ToggleScreen',
function(aSignal) {

    var screenIndex,

        screens,
        screen;

    screenIndex = aSignal.at('screenIndex');

    screens = TP.byId('SherpaWorld', this.getNativeWindow()).get('screens');
    screen = screens.at(screenIndex);

    this.refreshScreenInfoFor(screen);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary
     * @returns
     */

    this.observe(TP.ANY, 'TP.sig.ToggleScreen');

    this.get('thumbnails').setup();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineMethod('refreshScreenInfoFor',
function(screenTPElem) {

    var loc;

    if (TP.isValid(screenTPElem)) {
        loc = screenTPElem.getLocation();
        TP.byId('screen_uri', this.getNativeNode()).set('value', loc);
    } else {
        TP.byId('screen_uri', this.getNativeNode()).set('value', '');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
