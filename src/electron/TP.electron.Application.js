//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.electron.Application}
 * @summary The default application controller for Electron applications.
 */

//  ------------------------------------------------------------------------

TP.core.Application.defineSubtype('electron.Application');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineAttribute('isSilent');
TP.electron.Application.Inst.defineAttribute('updateDownloaded');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('AppDidStart',
function(aSignal) {

    /**
     * @method handleAppDidStart
     * @param {TP.sig.AppDidStart} aSignal The signal that caused this handler
     *     trip.
     * @returns {TP.electron.Application} The receiver.
     */

    this.observe(TP.electron.ElectronMain,
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

    //  Enable the 'About' menu item with the app name
    TP.electron.ElectronMain.signalMain(
        'TP.sig.UpdateMenuItem',
        {
            id: 'about',
            label: TP.sys.cfg('project.name')
        });

    //  Enable the 'version' menu item with the app version
    TP.electron.ElectronMain.signalMain(
        'TP.sig.UpdateMenuItem',
        {
            id: 'version',
            label: 'Version ' + TP.sys.cfg('project.version')
        });

    //  Enable the menu item that allows the user to manually check for updates.
    TP.electron.ElectronMain.signalMain(
        'TP.sig.UpdateMenuItem',
        {
            id: 'updater',
            enabled: true
        });

    //  Signal the main process that the TIBET application has started.
    TP.electron.ElectronMain.signalMain('TP.sig.AppDidStart');

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('AppShutdown',
function(aSignal) {

    /**
     * @method handleAppShutdown
     * @summary Handles when the app is about to be shut down. Used to save
     *     profile data for the application.
     * @param {TP.sig.AppShutdown} aSignal The signal indicating that the
     *     application is to be shut down.
     * @returns {TP.electron.Application} The receiver.
     */

    var profileData;

    //  Grab the profile. Note how we pass true as the last parameter to get a
    //  nested POJO back.
    profileData = TP.sys.getcfg('profile', {}, true);

    //  NB: We need to remove these keys before we send this data to Electron.
    //  They point to Function objects and the Structured Clone Algorithm has
    //  issues with that.
    delete profileData.at;
    delete profileData.atPut;
    delete profileData.getKeys;

    //  Invoke a method on the main process that TIBET wants to save profile
    //  data.
    TP.electron.ElectronMain.invokeMain(
                            'TIBET-SaveProfile',
                            {
                                data: profileData
                            });

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('AppWillInitialize',
function(aSignal) {

    /**
     * @method handleAppWillInitialize
     * @param {TP.sig.AppWillInitialize} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.electron.Application} The receiver.
     */

    //  Invoke a method on the main process that TIBET wants to load profile
    //  data.
    TP.electron.ElectronMain.invokeMain('TIBET-LoadProfile').then(
        function(profileData) {
            var data;

            data = TP.ifInvalid(profileData, {});

            TP.boot.$configureOptions(data);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('ApplicationDidExit',
function(aSignal) {

    /**
     * @method handleApplicationDidExit
     * @summary Handles when Electron is now shutting down the application. Note
     *     that this happens past 'the point of no return'.
     * @param {TP.sig.ApplicationDidExit} aSignal The signal indicating that
     *     Electron is in the final stages of shutting the application down.
     * @returns {TP.electron.Application} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('ApplicationWillExit',
function(aSignal) {

    /**
     * @method handleApplicationWillExit
     * @summary Handles when Electron has received an event from the user that
     *     they want to shut down the application.
     * @param {TP.sig.ApplicationWillExit} aSignal The signal indicating that
     *     the user wants the application to be shut down.
     * @returns {TP.electron.Application} The receiver.
     */

    var shouldTerminate;

    //  Terminate the app, but since we're on Electron we don't navigate to a
    //  different URL. Also, if this method returns false, then we do *not*
    //  complete the application exit and ApplicationDidExit will never be
    //  signaled.
    shouldTerminate = TP.sys.terminate(null, false);
    if (shouldTerminate) {
        TP.electron.ElectronMain.signalMain('TP.sig.CompleteExit');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('CheckForUpdate',
function(aSignal) {

    /**
     * @method handleCheckForUpdate
     * @param {TP.sig.CheckForUpdate} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.electron.Application} The receiver.
     */

    var isSilent;

    isSilent = aSignal.getPayload().first();
    this.set('isSilent', isSilent);

    //  Disable the menu item that allows the user to manually check for updates
    //  - we're in the middle of checking for updates.
    TP.electron.ElectronMain.signalMain('TP.sig.UpdateMenuItem',
        {
            id: 'updater',
            label: 'Checking for updates...',
            enabled: false
        });

    //  If we have an update that has been downloaded, then just go ahead and
    //  ask the user whether they want us to install it or not.
    if (TP.isTrue(this.get('updateDownloaded'))) {
        TP.electron.ElectronMain.invokeMain('TIBET-ShowNativeDialog',
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
                    TP.electron.ElectronMain.signalMain(
                            'TP.sig.InstallUpdateAndRestart');
                } else {
                    TP.electron.ElectronMain.signalMain(
                        'TP.sig.UpdateMenuItem',
                        {
                            id: 'updater',
                            label: 'Updates Available',
                            enabled: true
                        });
                }
            });
    } else {
        TP.electron.ElectronMain.signalMain('TP.sig.CheckForUpdates');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('CheckingForUpdate',
function(aSignal) {

    /**
     * @method handleCheckingForUpdate
     * @param {TP.sig.CheckingForUpdate} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.electron.Application} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('UpdateAvailable',
function(aSignal) {

    /**
     * @method handleUpdateAvailable
     * @param {TP.sig.UpdateAvailable} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.electron.Application} The receiver.
     */

    //  If we're not being 'silent', then prompt the user to the fact that an
    //  update is available and ask whether we should download it or not.
    if (!this.get('isSilent')) {
        TP.electron.ElectronMain.invokeMain('TIBET-ShowNativeDialog',
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
                    TP.electron.ElectronMain.signalMain('TP.sig.DownloadUpdate');
                } else {
                    TP.electron.ElectronMain.signalMain(
                        'TP.sig.UpdateMenuItem',
                        {
                            id: 'updater',
                            label: 'Check for updates',
                            enabled: true
                        });
                }
            });
    } else {
        TP.electron.ElectronMain.signalMain('TP.sig.DownloadUpdate');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('UpdateDownloaded',
function(aSignal) {

    /**
     * @method handleUpdateDownloaded
     * @param {TP.sig.UpdateDownloaded} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.electron.Application} The receiver.
     */

    this.set('updateDownloaded', true);

    //  Enable the menu item that allows the user to manually check for updates
    //  - we're no longer in the middle of checking for updates.
    TP.electron.ElectronMain.signalMain(
        'TP.sig.UpdateMenuItem',
        {
            id: 'updater',
            label: 'Updates available',
            enabled: true
        });

    //  If we're not being 'silent', then prompt the user to the fact that an
    //  update is ready to be installed and ask whether we should install it or
    //  not.
    if (!this.get('isSilent')) {
        TP.electron.ElectronMain.invokeMain('TIBET-ShowNativeDialog',
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
                    TP.electron.ElectronMain.signalMain(
                                'TP.sig.InstallUpdateAndRestart');
                } else {
                    TP.electron.ElectronMain.signalMain(
                        'TP.sig.UpdateMenuItem',
                        {
                            id: 'updater',
                            label: 'Updates Available',
                            enabled: true
                        });
                }
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('UpdateError',
function(aSignal) {

    /**
     * @method handleUpdateError
     * @param {TP.sig.UpdateError} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.electron.Application} The receiver.
     */

    var errMsg;

    //  Enable the menu item that allows the user to manually check for updates
    //  - we're no longer in the middle of checking for updates.
    TP.electron.ElectronMain.signalMain('TP.sig.UpdateMenuItem',
        {
            id: 'updater',
            label: 'Check for updates',
            enabled: true
        });

    //  If we're not being 'silent', then tell the user that there was an error
    //  installing the update.
    if (!this.get('isSilent')) {
        errMsg = TP.str(aSignal.getPayload().at(0).message);

        TP.electron.ElectronMain.invokeMain('TIBET-ShowNativeErrorDialog',
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

TP.electron.Application.Inst.defineHandler('UpdateNotAvailable',
function(aSignal) {

    /**
     * @method handleUpdateNotAvailable
     * @param {TP.sig.UpdateNotAvailable} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.electron.Application} The receiver.
     */

    //  Enable the menu item that allows the user to manually check for updates
    //  - we're no longer in the middle of checking for updates.
    TP.electron.ElectronMain.signalMain(
        'TP.sig.UpdateMenuItem',
        {
            id: 'updater',
            label: 'Check for updates',
            enabled: true
        });

    //  If we're not being 'silent', then tell the user that there were no
    //  updates to be installed.
    if (!this.get('isSilent')) {
        TP.electron.ElectronMain.invokeMain('TIBET-ShowNativeDialog',
            {
                type: 'info',
                title: 'No Updates Available',
                message: 'Current version is up-to-date'
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.Application.Inst.defineHandler('WindowMoved',
function(aSignal) {

    /**
     * @method handleWindowMoved
     * @summary Handles when Electron has detected a 'window moved' event from
     *     the user.
     * @param {TP.sig.WindowMoved} aSignal The signal indicating that
     *     Electron has received a 'window moved' event from the user.
     * @returns {TP.electron.Application} The receiver.
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

TP.electron.Application.Inst.defineHandler('WindowResized',
function(aSignal) {

    /**
     * @method handleWindowResized
     * @summary Handles when Electron has detected a 'window resize' event from
     *     the user.
     * @param {TP.sig.WindowResized} aSignal The signal indicating that
     *     Electron has received a 'window resize' event from the user.
     * @returns {TP.electron.Application} The receiver.
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
