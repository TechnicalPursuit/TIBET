var app,
    BrowserWindow,
    path,
    url,
    win;

electron = require('electron');
app = electron.app;
BrowserWindow = electron.BrowserWindow;
path = require('path');
url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
win = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

    // Create the browser window.
    win = new BrowserWindow({
        width: 1024,
        height: 768
    });

    // Load the index.html of the app. This will boot TIBET.
    //  TODO:   read command line args for boot profile etc.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    //  TODO: configurable
    // Open the devtools.
    /*
    win.openDevTools();
    */

    // Emitted when the window is closed.
    win.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //  TODO:   make this a preference.
    //if (process.platform !== 'darwin') {
        app.quit();
    //}
});
