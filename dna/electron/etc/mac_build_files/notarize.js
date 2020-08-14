const {notarize} = require('electron-notarize');

exports.default = async function(context) {
    const {electronPlatformName, appOutDir} = context,
            appName = context.packager.appInfo.productFilename;

    if (electronPlatformName !== 'darwin') {
        return;
    }

    /* eslint-disable no-return-await */
    return await notarize({
        appBundleId: context.packager.appInfo.appId,
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASS
    });
    /* eslint-enable no-return-await */
};
