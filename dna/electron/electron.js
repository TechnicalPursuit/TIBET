var app,
    BrowserWindow,
    window;

app = require('app'); // Module to control application life.
BrowserWindow = require('browser-window'); // Module to create native browser window.

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
window = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //  TODO:   make this a preference.
    //if (process.platform !== 'darwin') {
        app.quit();
    //}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    //window = new BrowserWindow({width: 1024, height: 768, show: false});
    window = new BrowserWindow({
        width: 1024,
        height: 768,
        show: true //,
        //'node-integration': false
    });

    window.webContents.on('did-finish-load', function() {
        //window.webContents.executeJavaScript("alert('Hello There!');");
    });

    // and load the index.html of the app.
    //  TODO:   read command line args for boot profile etc.
    window.loadUrl('file://' + __dirname + '/index.html');

    //  TODO: configurable
    // Open the devtools.
    //window.openDevTools();

    // Emitted when the window is closed.
    window.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        window = null;
    });
});
