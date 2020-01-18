const electron = require('electron'),
    sh = require('shelljs'),
    app = electron.app,    // Module to control application life.
    BrowserWindow = electron.BrowserWindow, // Module to create browser window.
    path = require('path'),
    url = require('url'),
    Package = require('./TIBET-INF/tibet/etc/common/tibet_package.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow,
    createWindow,
    package,
    fileUrl,
    json,
    profile,
    electronParams;

createWindow = function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768
    });

    package = new Package();

    //  Load JSON to acquire any params for the file URL we'll try to launch.
    json = require('./tibet.json');
    electronParams = json.electron || {};

    //  Verify build directory and add a development profile if not found.
    builddir = package.expandPath('~app_build');
    console.log(builddir);
    if (!sh.test('-d', builddir)) {

        //  Can't load a production profile...nothing's built.
        console.warn('No build directory. Must use a development boot.profile.');
        console.warn('Run `tibet build` to create your app\'s production build.');

        //  Don't replace existing...but ensure development as a base default.
        profile = electronParams['boot.profile'];
        if (!profile) {
            electronParams['boot.profile'] = 'development@developer';
            console.warn('No boot.profile. Forcing boot.profile ' +
                electronParams['boot.profile']);
        }
    }

    // and load the index.html of the app.
    fileUrl = 'file://' + __dirname + '/index.html';

    //  Loop over params and add them to the URL
    paramStr = '';
    Object.keys(electronParams).forEach(function(item) {
        paramStr += item + '=' + electronParams[item] + '&';
    });

    if (paramStr.length > 0) {
        fileUrl += '#?' + paramStr.slice(0, -1);
    }

    mainWindow.loadURL(fileUrl);

    // NOTE this is a TIBET-specific if block. The `tibet electron` command will
    // pass --devtools along so this flag is set, otherwise it's likely not there.
    if (process.argv.indexOf('--devtools') !== -1) {
        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
