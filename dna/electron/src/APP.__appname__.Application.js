{{{copyright}}}

/**
 * @type APP.{{appname}}.Application
 * @summary The default application controller.
 */

//  ------------------------------------------------------------------------

TP.core.Application.defineSubtype('APP.{{appname}}.Application');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

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

    /**
     * @method handleAppDidStart
     * @param {TP.sig.AppDidStart} aSignal The signal that caused this handler
     *     trip.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    this.observe(TP.core.ElectronMain,
                    TP.ac('ApplicationWillExit',
                            'ApplicationDidExit',
                            'CheckForUpdate',
                            'CheckingForUpdate',
                            'UpdateError',
                            'UpdateAvailable',
                            'UpdateNotAvailable',
                            'UpdateDownloaded',
                            'WindowMoved',
                            'WindowResized'));

    this.set('isSilent', true);
    this.set('updateDownloaded', false);

    //  Enable the menu item that allows the user to manually check for updates.
    TP.core.ElectronMain.signalMain(
        'TP.sig.ChangeUpdaterMenuItem',
        {
            enabled: true
        });

    //  Signal the main process that the TIBET application has started.
    TP.core.ElectronMain.signalMain('TP.sig.AppDidStart');

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('AppShutdown',
function(aSignal) {

    /**
     * @method handleAppShutdown
     * @summary Handles when the app is about to be shut down. Used to save
     *     profile data for the application.
     * @param {TP.sig.AppShutdown} aSignal The signal indicating that the
     *     application is to be shut down.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    var profileData;

    //  Grab the profile. Note how we pass true as the last parameter to get a
    //  nested POJO back.
    profileData = TP.sys.getcfg('profile', null, true);

    //  NB: We need to remove these keys before we send this data to Electron.
    //  They point to Function objects and the Structured Clone Algorithm has
    //  issues with that.
    delete profileData.at;
    delete profileData.atPut;
    delete profileData.getKeys;

    //  Signal the main process that TIBET wants to save profile data.
    TP.core.ElectronMain.signalMain(
                            'TP.sig.SaveProfile',
                            {
                                data: profileData
                            });

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('ApplicationDidExit',
function(aSignal) {

    /**
     * @method handleApplicationDidExit
     * @summary Handles when Electron is now shutting down the application. Note
     *     that this happens past 'the point of no return'.
     * @param {TP.sig.ApplicationDidExit} aSignal The signal indicating that
     *     Electron is in the final stages of shutting the application down.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('ApplicationWillExit',
function(aSignal) {

    /**
     * @method handleApplicationWillExit
     * @summary Handles when Electron has received an event from the user that
     *     they want to shut down the application.
     * @param {TP.sig.ApplicationWillExit} aSignal The signal indicating that
     *     the user wants the application to be shut down.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    var shouldTerminate;

    //  Terminate the app, but since we're on Electron we don't navigate to a
    //  different URL. Also, if this method returns false, then we do *not*
    //  complete the application exit and ApplicationDidExit will never be
    //  signaled.
    shouldTerminate = TP.sys.terminate(null, false);
    if (shouldTerminate) {
        TP.core.ElectronMain.signalMain('TP.sig.CompleteExit');
    }

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('CheckForUpdate',
function(aSignal) {

    /**
     * @method handleCheckForUpdate
     * @param {TP.sig.CheckForUpdate} aSignal The signal that caused this
     *     handler trip.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    var isSilent;

    isSilent = aSignal.getPayload().first();
    this.set('isSilent', isSilent);

    //  Disable the menu item that allows the user to manually check for updates
    //  - we're in the middle of checking for updates.
    TP.core.ElectronMain.signalMain('TP.sig.ChangeUpdaterMenuItem',
        {
            //  label: 'Checking for updates...',
            enabled: false
        });

    //  If we have an update that has been downloaded, then just go ahead and
    //  ask the user whether they want us to install it or not.
    if (TP.isTrue(this.get('updateDownloaded'))) {
        TP.core.ElectronMain.signalMain('TP.sig.ShowNativeDialog',
            {
                type: 'info',
                title: 'Updates Available',
                message: 'New updates are available and ready to be installed.',
                defaultId: 0,
                cancelId: 1,
                buttons: TP.ac('Install and restart', 'Close')
            }).then(
            function(buttonIndex) {
                if (buttonIndex === 0) {
                    TP.core.ElectronMain.signalMain(
                            'TP.sig.InstallUpdateAndRestart');
                } else {
                    TP.core.ElectronMain.signalMain(
                        'TP.sig.ChangeUpdaterMenuItem',
                        {
                            //  label: 'Updates Available',
                            enabled: true
                        });
                }
            });
    } else {
        TP.core.ElectronMain.signalMain('TP.sig.CheckForUpdates');
    }

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

    /**
     * @method handleUpdateAvailable
     * @param {TP.sig.UpdateAvailable} aSignal The signal that caused this
     *     handler trip.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    //  If we're not being 'silent', then prompt the user to the fact that an
    //  update is available and ask whether we should download it or not.
    if (!this.get('isSilent')) {
        TP.core.ElectronMain.signalMain('TP.sig.ShowNativeDialog',
            {
                type: 'info',
                title: 'Updates Available',
                message: 'New updates are available. Do you want to update now?',
                defaultId: 0,
                cancelId: 1,
                buttons: TP.ac('Yes', 'No')
            }).then(
            function(buttonIndex) {
                if (buttonIndex === 0) {
                    TP.core.ElectronMain.signalMain('TP.sig.DownloadUpdate');
                } else {
                    TP.core.ElectronMain.signalMain(
                        'TP.sig.ChangeUpdaterMenuItem',
                        {
                            //  label: 'Check for updates',
                            enabled: true
                        });
                }
            });
    } else {
        TP.core.ElectronMain.signalMain('TP.sig.DownloadUpdate');
    }

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('UpdateDownloaded',
function(aSignal) {

    /**
     * @method handleUpdateDownloaded
     * @param {TP.sig.UpdateDownloaded} aSignal The signal that caused this
     *     handler trip.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    this.set('updateDownloaded', true);

    //  Enable the menu item that allows the user to manually check for updates
    //  - we're no longer in the middle of checking for updates.
    TP.core.ElectronMain.signalMain(
        'TP.sig.ChangeUpdaterMenuItem',
        {
            //  label: 'Updates available',
            enabled: true
        });

    //  If we're not being 'silent', then prompt the user to the fact that an
    //  update is ready to be installed and ask whether we should install it or
    //  not.
    if (!this.get('isSilent')) {
        TP.core.ElectronMain.signalMain('TP.sig.ShowNativeDialog',
            {
                type: 'info',
                title: 'Install Updates',
                message: 'Updates are ready to be installed.',
                defaultId: 0,
                cancelId: 1,
                buttons: TP.ac('Install and restart', 'Close')
            }).then(
            function(buttonIndex) {
                if (buttonIndex === 0) {
                    TP.core.ElectronMain.signalMain(
                                'TP.sig.InstallUpdateAndRestart');
                } else {
                    TP.core.ElectronMain.signalMain(
                        'TP.sig.ChangeUpdaterMenuItem',
                        {
                            //  label: 'Updates Available',
                            enabled: true
                        });
                }
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('UpdateError',
function(aSignal) {

    /**
     * @method handleUpdateError
     * @param {TP.sig.UpdateError} aSignal The signal that caused this
     *     handler trip.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    var errMsg;

    //  Enable the menu item that allows the user to manually check for updates
    //  - we're no longer in the middle of checking for updates.
    TP.core.ElectronMain.signalMain('TP.sig.ChangeUpdaterMenuItem',
        {
            //  label: 'Check for updates',
            enabled: true
        });

    //  If we're not being 'silent', then tell the user that there was an error
    //  installing the update.
    if (!this.get('isSilent')) {
        errMsg = TP.str(aSignal.getPayload().at(0).message);

        TP.core.ElectronMain.signalMain('TP.sig.ShowNativeErrorDialog',
            {
                title: 'Error during the update',
                message: 'Application couldn\'t be updated:\n' +
                            errMsg +
                            '\nPlease try again or contact the support team'
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('UpdateNotAvailable',
function(aSignal) {

    /**
     * @method handleUpdateNotAvailable
     * @param {TP.sig.UpdateNotAvailable} aSignal The signal that caused this
     *     handler trip.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    //  Enable the menu item that allows the user to manually check for updates
    //  - we're no longer in the middle of checking for updates.
    TP.core.ElectronMain.signalMain(
        'TP.sig.ChangeUpdaterMenuItem',
        {
            //  label: 'Check for updates',
            enabled: true
        });

    //  If we're not being 'silent', then tell the user that there were no
    //  updates to be installed.
    if (!this.get('isSilent')) {
        TP.core.ElectronMain.signalMain('TP.sig.ShowNativeDialog',
            {
                type: 'info',
                title: 'No Updates Available',
                message: 'Current version is up-to-date'
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('WindowMoved',
function(aSignal) {

    /**
     * @method handleWindowMoved
     * @summary Handles when Electron has detected a 'window moved' event from
     *     the user.
     * @param {TP.sig.WindowResized} aSignal The signal indicating that
     *     Electron has received a 'window moved' event from the user.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    var windowInfo,
        windowCfgKey;

    //  NB: This is a POJO.
    windowInfo = aSignal.getPayload();

    windowCfgKey = 'profile.windows.' + windowInfo.name + '.';

    TP.sys.setcfg(windowCfgKey + 'top', windowInfo.top);
    TP.sys.setcfg(windowCfgKey + 'left', windowInfo.left);
    TP.sys.setcfg(windowCfgKey + 'width', windowInfo.width);
    TP.sys.setcfg(windowCfgKey + 'height', windowInfo.height);

    return this;
});

//  ------------------------------------------------------------------------

APP.{{appname}}.Application.Inst.defineHandler('WindowResized',
function(aSignal) {

    /**
     * @method handleWindowResized
     * @summary Handles when Electron has detected a 'window resize' event from
     *     the user.
     * @param {TP.sig.WindowResized} aSignal The signal indicating that
     *     Electron has received a 'window resize' event from the user.
     * @returns {APP.{{appname}}.Application} The receiver.
     */

    var windowInfo,
        windowCfgKey;

    //  NB: This is a POJO.
    windowInfo = aSignal.getPayload();

    windowCfgKey = 'profile.windows.' + windowInfo.name + '.';

    TP.sys.setcfg(windowCfgKey + 'top', windowInfo.top);
    TP.sys.setcfg(windowCfgKey + 'left', windowInfo.left);
    TP.sys.setcfg(windowCfgKey + 'width', windowInfo.width);
    TP.sys.setcfg(windowCfgKey + 'height', windowInfo.height);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
