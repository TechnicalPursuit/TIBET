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

TP.sherpa.thumbnail.Inst.defineHandler('AddLocation',
function(aSignal) {

    /**
     * @method handleAddLocation
     * @summary Handles when the user wants to add a location to the set of
     *     TSH managed locations
     * @param {TP.sig.AddLocation} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.thumbnail} The receiver.
     */

    TP.prompt('Enter URI address for the new location:',
                '~app/').then(
        function(userValue) {

            if (TP.isEmpty(userValue) || userValue === '~app/') {
                return;
            }

            //  Pass true here since we don't care if the URI has a scheme.
            if (!TP.isURIString(userValue, true)) {
                TP.alert('Invalid URI string');
                return;
            }

            TP.bySystemId('Sherpa').addScreenLocation(userValue);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineHandler('NavigateToScreen',
function(aSignal) {

    /**
     * @method handleNavigateToScreen
     * @summary Handles when the user wants to navigate to the screen containing
     *     the location from the set of TSH managed locations. If
     * @param {TP.sig.NavigateToScreen} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.thumbnail} The receiver.
     */

    var targetTPElem,
        index,

        screenLocEntries,
        location,

        world;

    targetTPElem = TP.wrap(aSignal.getTarget());
    index = targetTPElem.getValue();

    screenLocEntries =
        TP.uc('urn:tibet:sherpa_screenlocs').getResource().get(
                                                        'result');
    location = screenLocEntries.at(index);

    //  Pass true here since we don't care if the URI has a scheme.
    if (TP.isURIString(location, true)) {
        world = TP.byId('SherpaWorld', TP.sys.getUIRoot());

        //  Pass true here so that if a screen containing that location doesn't
        //  exist, one will be created.
        world.switchToScreenWithLocation(location, true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineHandler('RemoveLocation',
function(aSignal) {

    /**
     * @method handleRemoveLocation
     * @summary Handles when the user wants to remove a location from the set of
     *     TSH managed locations.
     * @param {TP.sig.RemoveLocation} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.thumbnail} The receiver.
     */

    var targetTPElem,
        location;

    targetTPElem = TP.wrap(aSignal.getTarget());
    location = TP.wrap(aSignal.getResolvedDOMTarget().previousSibling).
                                                            getTextContent();

    //  Pass true here since we don't care if the URI has a scheme.
    if (TP.isURIString(location, true)) {
        TP.bySystemId('Sherpa').removeScreenLocation(location);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineHandler('ShowAllScreens',
function(aSignal) {

    /**
     * @method handleShowAllScreens
     * @summary Handles when the user wants to show all the world's screens.
     * @param {TP.sig.ShowAllScreens} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.thumbnail} The receiver.
     */

    var world,
        currentMode;

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());

    currentMode = world.getAttribute('mode');

    if (currentMode === 'thumbnail') {
        world.setAttribute('mode', 'normal');
    } else {
        world.setAttribute('mode', 'thumbnail');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
