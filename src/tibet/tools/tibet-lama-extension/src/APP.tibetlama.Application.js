//  ========================================================================
/**
 * @type APP.tibetlama.Application
 * @summary The default application controller.
 */
//  ------------------------------------------------------------------------


TP.core.Application.defineSubtype('APP.tibetlama.Application');

APP.tibetlama.Application.Inst.defineHandler('UIActivate',
function(aSignal) {
    console.log('Application instance UIActivate');
});

APP.tibetlama.Application.Inst.defineHandler('DevtoolsInbound',
function(aSignal) {
    console.log('message to devtools: ' + TP.str(aSignal));
});

//  ------------------------------------------------------------------------

APP.tibetlama.Application.Inst.defineHandler('DevtoolsInput',
function(aSignal) {

    this.callNextMethod();

    if (aSignal.shouldStop()) {
        return this;
    }

    TP.info('APP.tibetlama.Application Devtools.Input');

    return this;
});

//  ------------------------------------------------------------------------

APP.tibetlama.Application.Inst.defineHandler('DevtoolsOutput',
function(aSignal) {

    this.callNextMethod();

    if (aSignal.shouldStop()) {
        return this;
    }

    TP.info('APP.tibetlama.Application Devtools.Output');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
