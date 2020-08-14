/**
 * @type APP.{{appname}}.Application
 * @summary The default application controller.
 */

TP.core.Application.defineSubtype('APP.{{appname}}.Application');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineAttribute('isSilent');
APP.{{appname}}.Application.Inst.defineAttribute('updateDownloaded');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('AppDidStart',
function(aSignal) {

    this.observe(TP.core.ElectronMain,
                    TP.ac('CheckForUpdate',
                            'CheckingForUpdate',
                            'UpdateError',
                            'UpdateAvailable',
                            'UpdateNotAvailable',
                            'UpdateDownloaded'));

    this.set('isSilent', true);
    this.set('updateDownloaded', false);

    TP.core.ElectronMain.signalMain('TP.sig.AppDidStart');

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('CheckForUpdate',
function(aSignal) {

    var isSilent;

    isSilent = aSignal.getPayload().first();
    this.set('isSilent', isSilent);

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('CheckingForUpdate',
function(aSignal) {

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('UpdateAvailable',
function(aSignal) {

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('UpdateDownloaded',
function(aSignal) {

    this.set('updateDownloaded', true);

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('UpdateError',
function(aSignal) {

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('UpdateNotAvailable',
function(aSignal) {

    return this;
});

