/**
 * @type APP.tibetlama.Application
 * @summary The default application controller.
 */

TP.core.Application.defineSubtype('APP.tibetlama.Application');

APP.tibetlama.Application.Inst.defineHandler('UIActivate',
function(aSignal) {
    console.log('Application instance UIActivate');
});

