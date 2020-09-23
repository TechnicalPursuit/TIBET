//  ========================================================================
/**
 * @copyright Copyright (C) 2020, Technical Pursuit Inc. (TPI) All Rights
 *     Reserved.
 */
//  ========================================================================

/**
 * @type APP.tibetlama.RouteController
 * @summary The default application route controller.
 */

TP.core.RouteController.defineSubtype('APP.tibetlama.RouteController');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

/**
 */
APP.tibetlama.RouteController.Inst.defineHandler('PanelHide',
function(aSignal) {
    console.log('RouteController instance PanelHide');
});

//  ------------------------------------------------------------------------

/**
 */
APP.tibetlama.RouteController.Inst.defineHandler('PanelShow',
function(aSignal) {
    console.log('RouteController instance PanelShow' +
    ' from ' + aSignal.getPayload().at('title'));
});

//  ------------------------------------------------------------------------

/**
 */
APP.tibetlama.RouteController.Inst.defineHandler('SidebarHide',
function(aSignal) {
    console.log('RouteController instance SidebarHide');
});

//  ------------------------------------------------------------------------

/**
 */
APP.tibetlama.RouteController.Inst.defineHandler('SidebarShow',
function(aSignal) {
    console.log('RouteController instance SidebarShow');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
