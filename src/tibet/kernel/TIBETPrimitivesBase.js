//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
@file           TIBETPrimitivesBase.js
@abstract       Common base primitives.
*/

//  ------------------------------------------------------------------------
//  TIBET PLUGIN QUERYING
//  ------------------------------------------------------------------------

//  Install a custom 'version matcher' RegExp for Flash that will pull apart
//  the version string in the proper way.

TP.PLUGIN_INFO.at(TP.FLASH_PLUGIN).atPut(
    'versionMatcher',
    /(^| )(\d+)\.?(\d*)\s*r([\d\.]*)/);

//  ------------------------------------------------------------------------

TP.$$pluginVersionMatcher = /(^| )(\d+)\.?(\d*)\.?([\d\.]*)/;
TP.$$pluginVersionFunction = function(plugin, pluginEntry) {

    /**
     * @method $$pluginVersionFunction
     * @summary The 'standard version' of the function that retrieves the
     *     version information from the supplied plugin and populated the
     *     pluginEntry with it.
     * @param {Object} plugin The native plugin Object from the browser's
     *     'navigator.plugins' Array.
     * @param {TP.core.Hash} pluginEntry The entry to populate with the version
     *     information.
     */

    var versionMatcher,
        versionData;

    //  If the plugin info entry doesn't have a 'custom' version matcher, we
    //  use the standard one.
    if (TP.notValid(versionMatcher = pluginEntry.at('versionMatcher'))) {
        versionMatcher = TP.$$pluginVersionMatcher;
    }

    //  First we try to execute the version matcher on the plugin's name.
    versionData = versionMatcher.exec(plugin.name);

    //  If we couldn't find version numbers on the plugin's name, then we
    //  try to find the them on the plugin's description.
    if (TP.notValid(versionData)) {
        versionData = versionMatcher.exec(plugin.description);
    }

    //  If we got valid data, go ahead and populate the plugin info entry's
    //  'revMajor', 'revMinor' and 'revPatch' entries.
    if (TP.isValid(versionData)) {
        pluginEntry.atPut('revMajor', versionData[2]);
        pluginEntry.atPut('revMinor', versionData[3]);
        pluginEntry.atPut('revPatch', versionData[4]);
    }

    return;
};

//  ------------------------------------------------------------------------

TP.definePrimitive('getPluginInfo',
function(pluginKey) {

    /**
     * @method getPluginInfo
     * @summary Returns a TP.core.Hash containing information about the plugin
     *     matching the supplied plugin key.
     * @param {String} pluginKey The key for a particular key matching keys in
     *     the TP.PLUGIN_INFO hash.
     * @returns {TP.core.Hash} The plugin's information entry.
     */

    var pluginInfo,

        allPlugins,
        thePlugin,

        installedFunc,
        versionFunc,

        i,

        isInstalled;

    //  If there isn't any entry at all, we don't even have the most basic
    //  information about the plugin, so just return null here.
    if (TP.notValid(pluginInfo = TP.PLUGIN_INFO.at(pluginKey))) {
        return null;
    }

    //  If there is no value (either 'true' or 'false') in the 'isInstalled'
    //  slot in the entry, then we haven't actually run the detection code
    //  to see if the plugin is installed or not.
    if (TP.notValid(pluginInfo.at('isInstalled'))) {
        thePlugin = null;

        //  If there is no custom 'is installed' function, then we just loop
        //  over the plugins in the 'navigator.plugins' Array until we find
        //  one that matches the value defined in the 'name' slot.
        if (TP.notValid(installedFunc =
                        pluginInfo.at('isInstalledFunction'))) {
            allPlugins = navigator.plugins;

            for (i = 0; i < allPlugins.length; i++) {
                if (allPlugins[i].name.indexOf(pluginInfo.at('name')) !== -1) {
                    thePlugin = allPlugins[i];

                    //  Found a matching native plugin Object in the system,
                    //  so exit here.
                    break;
                }
            }

            //  Set 'isInstalled' to whether we found a valid native plugin
            //  Object or not.
            isInstalled = TP.isValid(thePlugin);
        } else {
            //  Set 'isInstalled' to the return value of the custom 'is
            //  installed' function.
            isInstalled = installedFunc();
        }

        pluginInfo.atPut('isInstalled', isInstalled);

        //  If the plugin is installed, try to get its version.
        if (isInstalled) {
            //  If there is no custom 'get version' function, use the
            //  standard 'get version' function.
            if (TP.notValid(versionFunc =
                            pluginInfo.at('getVersionFunction'))) {
                versionFunc = TP.$$pluginVersionFunction;
            }

            //  Execute the 'get version' function to populate the version
            //  entries in the plugin info. Note that plugins that have
            //  custom 'isInstalled' functions will not have set 'thePlugin'
            //  to anything here, so it will be null and this function is
            //  expected to handle that.
            versionFunc(thePlugin, pluginInfo);
        }
    }

    return pluginInfo;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
