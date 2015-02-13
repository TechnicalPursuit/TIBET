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
Early-stage boot system and kernel elements as well as various native functions
get registered here so that TIBET's reflection subsystem can interrogate them
for name, owner, and track information effectively.

Over time we'll be migrating the registration methods lower and lower into the
kernel so we can reduce the amount of housekeeping required here.
*/

/* JSHint checking */

/* global $$getNextWindow:true,
          $$findTIBET:true,
          $$init:true
*/

//  ------------------------------------------------------------------------

//  ---
//  tibet_boot.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/boot/tibet_boot.js';

TP.boot.defineMethod('$$importAsync', TP.boot.$$importAsync);

TP.sys.defineMethod('hasLoaded', TP.sys.hasLoaded);
TP.sys.defineMethod('hasKernel', TP.sys.hasKernel);
TP.sys.defineMethod('hasInitialized', TP.sys.hasInitialized);
TP.sys.defineMethod('hasStarted', TP.sys.hasStarted);

TP.boot.defineMethod('$$getprop', TP.boot.$$getprop);
TP.boot.defineMethod('$$setprop', TP.boot.$$setprop);

TP.sys.defineMethod('cfg', TP.sys.cfg);
TP.sys.defineMethod('getcfg', TP.sys.getcfg);
TP.sys.defineMethod('setcfg', TP.sys.setcfg);

TP.sys.defineMethod('env', TP.sys.env);
TP.boot.defineMethod('$getenv', TP.boot.$getenv);
TP.boot.defineMethod('$$setenv', TP.boot.$$setenv);

TP.sys.defineMethod('hasFeature', TP.sys.hasFeature);
TP.sys.defineMethod('hasPackage', TP.sys.hasPackage);

TP.sys.defineMethod('defineGlobal', TP.sys.defineGlobal);

TP.boot.defineMethod('$alert', TP.boot.$alert);
TP.boot.defineMethod('$prompt', TP.boot.$prompt);
TP.boot.defineMethod('$confirm', TP.boot.$confirm);

TP.boot.defineMethod('$notify', TP.boot.$notify);

TP.boot.defineMethod('$stderr', TP.boot.$stderr);
TP.boot.defineMethod('$stdin', TP.boot.$stdin);
TP.boot.defineMethod('$stdout', TP.boot.$stdout);

TP.boot.defineMethod('$raise', TP.boot.$raise);

TP.sys.defineMethod('isHTTPBased', TP.sys.isHTTPBased);
TP.sys.defineMethod('isMac', TP.sys.isMac);
TP.sys.defineMethod('isNix', TP.sys.isNix);
TP.sys.defineMethod('isWin', TP.sys.isWin);

TP.sys.defineMethod('isUA', TP.sys.isUA);

if (TP.sys.isUA('IE')) {
    TP.sys.defineMethod('isMSXML', TP.sys.isMSXML);
}

TP.sys.defineMethod('isObsolete', TP.sys.isObsolete);
TP.sys.defineMethod('isSupported', TP.sys.isSupported);

TP.sys.defineMethod('getLaunchRoot', TP.sys.getLaunchRoot);
TP.sys.defineMethod('getHost', TP.sys.getHost);
TP.sys.defineMethod('getPathname', TP.sys.getPathname);
TP.sys.defineMethod('getPort', TP.sys.getPort);
TP.sys.defineMethod('getScheme', TP.sys.getScheme);

TP.boot.defineMethod('$httpCreate', TP.boot.$httpCreate);
TP.boot.defineMethod('$httpError', TP.boot.$httpError);
TP.boot.defineMethod('$httpCall', TP.boot.$httpCall);

TP.boot.defineMethod('$uriCollapsePath', TP.boot.$uriCollapsePath);
TP.boot.defineMethod('$uriExpandPath', TP.boot.$uriExpandPath);
TP.boot.defineMethod('$uriInLocalFormat', TP.boot.$uriInLocalFormat);
TP.boot.defineMethod('$uriJoinPaths', TP.boot.$uriJoinPaths);
TP.boot.defineMethod('$uriMinusFileScheme', TP.boot.$uriMinusFileScheme);
TP.boot.defineMethod('$uriPlusFileScheme', TP.boot.$uriPlusFileScheme);
TP.boot.defineMethod('$uriRelativeToPath', TP.boot.$uriRelativeToPath);
TP.boot.defineMethod('$uriResult', TP.boot.$uriResult);
TP.boot.defineMethod('$uriResultType', TP.boot.$uriResultType);

TP.boot.defineMethod('$uriWithRoot', TP.boot.$uriWithRoot);

TP.boot.defineMethod('$uriLocation', TP.boot.$uriLocation);
TP.boot.defineMethod('$uriLocationFile', TP.boot.$uriLocationFile);
TP.boot.defineMethod('$uriLocationHttp', TP.boot.$uriLocationHttp);

TP.boot.defineMethod('$uriLastModified', TP.boot.$uriLastModified);
TP.boot.defineMethod('$uriLastModifiedIEFile',
                                        TP.boot.$uriLastModifiedIEFile);
TP.boot.defineMethod('$uriLastModifiedMozFile',
                                        TP.boot.$uriLastModifiedMozFile);
TP.boot.defineMethod('$uriLastModifiedHttp',
                                        TP.boot.$uriLastModifiedHttp);

TP.boot.defineMethod('$uriCurrent', TP.boot.$uriCurrent);

TP.boot.defineMethod('$uriExists', TP.boot.$uriExists);
TP.boot.defineMethod('$uriExistsFile', TP.boot.$uriExistsFile);
TP.boot.defineMethod('$uriExistsHttp', TP.boot.$uriExistsHttp);

TP.boot.defineMethod('$uriLoad', TP.boot.$uriLoad);
TP.boot.defineMethod('$uriLoadCommonFile', TP.boot.$uriLoadCommonFile);
TP.boot.defineMethod('$uriLoadIEFile', TP.boot.$uriLoadIEFile);
TP.boot.defineMethod('$uriLoadMozFile', TP.boot.$uriLoadMozFile);
TP.boot.defineMethod('$uriLoadCommonHttp', TP.boot.$uriLoadCommonHttp);

TP.boot.defineMethod('$sourceImport', TP.boot.$sourceImport);
TP.boot.defineMethod('$uriImport', TP.boot.$uriImport);

TP.boot.defineMethod('$uriSave', TP.boot.$uriSave);
TP.boot.defineMethod('$uriSaveIEFile', TP.boot.$uriSaveIEFile);
TP.boot.defineMethod('$uriSaveMozFile', TP.boot.$uriSaveMozFile);
TP.boot.defineMethod('$uriSaveWebkitFile', TP.boot.$uriSaveWebkitFile);
TP.boot.defineMethod('$uriSaveHttp', TP.boot.$uriSaveHttp);

TP.boot.defineMethod('$documentCreate', TP.boot.$documentCreate);
TP.boot.defineMethod('$activeXDocumentCreateIE',
                                        TP.boot.$activeXDocumentCreateIE);

TP.boot.defineMethod('$nodeAppendChild', TP.boot.$nodeAppendChild);
TP.boot.defineMethod('$nodeInsertBefore', TP.boot.$nodeInsertBefore);
TP.boot.defineMethod('$nodeReplaceChild', TP.boot.$nodeReplaceChild);

TP.boot.defineMethod('$documentFromString', TP.boot.$documentFromString);
TP.boot.defineMethod('$documentFromStringCommon',
                                        TP.boot.$documentFromStringCommon);
TP.boot.defineMethod('$documentFromStringIE',
                                        TP.boot.$documentFromStringIE);

TP.boot.defineMethod('$nodeAsString', TP.boot.$nodeAsString);
TP.boot.defineMethod('$nodeAsStringCommon', TP.boot.$nodeAsStringCommon);

TP.sys.defineMethod('getWindowById', TP.sys.getWindowById);
TP.definePrimitive('windowIsInstrumented', TP.windowIsInstrumented);

TP.boot.defineMethod('$elementAddClass', TP.boot.$elementAddClass);
TP.boot.defineMethod('$elementSetInnerContent',
                                        TP.boot.$elementSetInnerContent);

TP.boot.defineMethod('$dump', TP.boot.$dump);

TP.boot.defineMethod('$trim', TP.boot.$trim);

TP.boot.defineMethod('$currentDocumentLocation',
                                        TP.boot.$currentDocumentLocation);

TP.boot.defineMethod('$annotate', TP.boot.$annotate);
TP.boot.defineMethod('$ec', TP.boot.$ec);
TP.boot.defineMethod('$join', TP.boot.$join);
TP.boot.defineMethod('$str', TP.boot.$str);

TP.sys.defineMethod('getBootLog', TP.sys.getBootLog);

TP.boot.defineMethod('log', TP.boot.log);

TP.boot.defineMethod('$releaseUIElements', TP.boot.$releaseUIElements);

TP.boot.defineMethod('$getProgressBarElement',
                                    TP.boot.$getProgressBarElement);

TP.boot.defineMethod('$setStage', TP.boot.$setStage);

TP.boot.defineMethod('$getAppRoot', TP.boot.$getAppRoot);
TP.boot.defineMethod('$getLibRoot', TP.boot.$getLibRoot);
TP.boot.defineMethod('$getRootPath', TP.boot.$getRootPath);
TP.boot.defineMethod('$setAppRoot', TP.boot.$setAppRoot);
TP.boot.defineMethod('$setLibRoot', TP.boot.$setLibRoot);

TP.boot.defineMethod('$configureEnvironment',
                                    TP.boot.$configureEnvironment);

TP.boot.defineMethod('$ifUnlessPassed', TP.boot.$ifUnlessPassed);
TP.boot.defineMethod('$getElementCount', TP.boot.$getElementCount);
TP.boot.defineMethod('$uniqueNodeList', TP.boot.$uniqueNodeList);

TP.boot.defineMethod('$importApplication', TP.boot.$importApplication);
TP.boot.defineMethod('$importComponents', TP.boot.$importComponents);

TP.sys.defineMethod('showBootLog', TP.sys.showBootLog);

TP.boot.defineMethod('boot', TP.boot.boot);
TP.boot.defineMethod('$config', TP.boot.$config);

TP.boot.defineMethod('launch', TP.boot.launch);

TP.boot.defineMethod('main', TP.boot.main);

//  ---
//  tibet_hook.js
//  ---

// TODO: eliminate these...they should all be on TP.
TP.defineGlobalMethod('$$getNextWindow', $$getNextWindow);
TP.defineGlobalMethod('$$findTIBET', $$findTIBET);
TP.defineGlobalMethod('$$init', $$init);

//  flags used to 'find' the codebase
TP.sys.defineGlobal('$$checked', null);
TP.sys.defineGlobal('$$TIBET', null);

//  the codebase window
TP.sys.defineGlobal('$$tibet', null);

//  whether or not we're autobooting
TP.sys.defineGlobal('$$autoboot', null);

//  whether or not we can move on to phase two processing
TP.sys.defineGlobal('$$phasetwo', null);

TP.boot.defineMethod('$isElement', TP.boot.$isElement);
TP.boot.defineMethod('$isEmpty', TP.boot.$isEmpty);
TP.boot.defineMethod('$isEvent', TP.boot.$isEvent);
TP.boot.defineMethod('$isTrue', TP.boot.$isTrue);
TP.boot.defineMethod('$isValid', TP.boot.$isValid);
TP.boot.defineMethod('$isWindow', TP.boot.$isWindow);
TP.boot.defineMethod('$notValid', TP.boot.$notValid);

TP.boot.defineMethod('$formatCookieSource', TP.boot.$formatCookieSource);
TP.boot.defineMethod('getCookie', TP.boot.getCookie);
TP.boot.defineMethod('setCookie', TP.boot.setCookie);

TP.boot.defineMethod('$byId', TP.boot.$byId);

TP.boot.defineMethod('hideContent', TP.boot.hideContent);
TP.boot.defineMethod('hideUICanvas', TP.boot.hideUICanvas);
TP.boot.defineMethod('hideUIRoot', TP.boot.hideUIRoot);

TP.boot.defineMethod('launchApp', TP.boot.launchApp);

TP.boot.defineMethod('showContent', TP.boot.showContent);
TP.boot.defineMethod('showUICanvas', TP.boot.showUICanvas);
TP.boot.defineMethod('showUIRoot', TP.boot.showUIRoot);

TP.boot.defineMethod('startGUI', TP.boot.startGUI);

TP.boot.defineMethod('autoBoot', TP.boot.autoBoot);
TP.boot.defineMethod('initializeCanvas', TP.boot.initializeCanvas);

//  ---
//  TIBETGlobals.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETGlobals.js';

TP.sys.defineMethod('defineGlobal', TP.sys.defineGlobal);
TP.sys.defineMethod('getGlobals', TP.sys.getGlobals);

TP.definePrimitive('LOG_ARGS', TP.LOG_ARGS);
TP.definePrimitive('NOTIFY_ARGS', TP.NOTIFY_ARGS);

TP.definePrimitive('TEST_HANDLER', TP.TEST_HANDLER);

TP.definePrimitive('RETURN_NULL', TP.RETURN_NULL);
TP.definePrimitive('RETURN_THIS', TP.RETURN_THIS);
TP.definePrimitive('RETURN_TRUE', TP.RETURN_TRUE);
TP.definePrimitive('RETURN_FALSE', TP.RETURN_FALSE);

TP.definePrimitive('RETURN_ARG0', TP.RETURN_ARG0);
TP.definePrimitive('RETURN_ARGS', TP.RETURN_ARGS);

TP.definePrimitive('RETURN_FIRST', TP.RETURN_FIRST);
TP.definePrimitive('RETURN_LAST', TP.RETURN_LAST);

TP.definePrimitive('RETURN_EMPTY', TP.RETURN_EMPTY);
TP.definePrimitive('RETURN_SPACE', TP.RETURN_SPACE);

TP.definePrimitive('RETURN_ORIG', TP.RETURN_ORIG);
TP.definePrimitive('RETURN_NEW', TP.RETURN_NEW);

TP.definePrimitive('RETURN_TOSTRING', TP.RETURN_TOSTRING);

TP.definePrimitive('CASE_INSENSITIVE_SORT', TP.CASE_INSENSITIVE_SORT);
TP.definePrimitive('NATURAL_ORDER_SORT', TP.NATURAL_ORDER_SORT);
TP.definePrimitive('COMPARE_SORT', TP.COMPARE_SORT);
TP.definePrimitive('DELETION_SORT', TP.DELETION_SORT);
TP.definePrimitive('DOCUMENT_ORDER_SORT', TP.DOCUMENT_ORDER_SORT);
TP.definePrimitive('EQUALITY_SORT', TP.EQUALITY_SORT);
TP.definePrimitive('FIRST_ITEM_SORT', TP.FIRST_ITEM_SORT);
TP.definePrimitive('IDENTITY_SORT', TP.IDENTITY_SORT);
TP.definePrimitive('NUMERIC_SORT', TP.NUMERIC_SORT);
TP.definePrimitive('SECOND_ITEM_SORT', TP.SECOND_ITEM_SORT);
TP.definePrimitive('SUBTYPE_SORT', TP.SUBTYPE_SORT);
TP.definePrimitive('UNICODE_SORT', TP.UNICODE_SORT);
TP.definePrimitive('ELEMENT_SORT', TP.ELEMENT_SORT);

//  ---
//  TIBETVersion.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETVersion.js';

//  ---
//  TIBETPrimitivesPre.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesPre.js';

TP.definePrimitive('objectSetLoadNode', TP.objectSetLoadNode);

TP.sys.defineGlobal(TP.ID, null);

//  ---
//  TIBETPrimitivesBase.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesBase.js';

//  ---
//  TIBETPrimitives[IE/Gecko/Webkit].js
//  ---

if (TP.sys.isUA('GECKO')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesGecko.js';
} else if (TP.sys.isUA('IE')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesIE.js';
} else if (TP.sys.isUA('WEBKIT')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesWebkit.js';
}

//  ---
//  TIBETPrimitivesPost.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesPost.js';

//  This slot is used by TP.objectGlobalID() below, sometimes on a Window,
//  which means that it needs to be tracked as a global.
TP.sys.defineGlobal('$$globalID', null);

//  unusual, but this keeps environment config centralized on TP.boot
TP.boot.defineMethod('$configurePluginEnvironment',
                                    TP.boot.$configurePluginEnvironment);

//  ---
//  TIBETDOMPrimitivesPre.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDOMPrimitivesPre.js';

//  ---
//  TIBETDOMPrimitivesBase.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDOMPrimitivesBase.js';

//  ---
//  TIBETDOMPrimitives[IE/Gecko/Webkit].js
//  ---

if (TP.sys.isUA('GECKO')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDOMPrimitivesGecko.js';
} else if (TP.sys.isUA('IE')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDOMPrimitivesIE.js';
} else if (TP.sys.isUA('WEBKIT')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDOMPrimitivesWebkit.js';
}

//  ---
//  TIBETDOMPrimitivesPost.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDOMPrimitivesPost.js';

//  ---
//  TIBETDevicePrimitivesPre.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDevicePrimitivesPre.js';

//  ---
//  TIBETDevicePrimitivesBase.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDevicePrimitivesBase.js';

//  ---
//  TIBETDevicePrimitives[IE/Gecko/Webkit].js
//  ---

if (TP.sys.isUA('GECKO')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDevicePrimitivesGecko.js';
} else if (TP.sys.isUA('IE')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDevicePrimitivesIE.js';
} else if (TP.sys.isUA('WEBKIT')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDevicePrimitivesWebkit.js';
}

//  ---
//  TIBETDevicePrimitivesPost.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDevicePrimitivesPost.js';

//  ---
//  TIBETDHTMLPrimitivesPre.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDHTMLPrimitivesPre.js';

//  ---
//  TIBETDHTMLPrimitivesBase.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDHTMLPrimitivesBase.js';

//  ---
//  TIBETDHTMLPrimitives[IE/Gecko/Webkit].js
//  ---

if (TP.sys.isUA('GECKO')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDHTMLPrimitivesGecko.js';
} else if (TP.sys.isUA('IE')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDHTMLPrimitivesIE.js';
} else if (TP.sys.isUA('WEBKIT')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDHTMLPrimitivesWebkit.js';
}

//  ---
//  TIBETDHTMLPrimitivesPost.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDHTMLPrimitivesPost.js';

//  This slot is used by TP.windowIsInstrumented() below on a Window,
//  which means that it needs to be tracked as a global.
TP.sys.defineGlobal('$$instrumented', null);

//  ---
//  TIBETGraphicsPrimitivesPre.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETGraphicsPrimitivesPre.js';

//  ---
//  TIBETGraphicsPrimitivesBase.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETGraphicsPrimitivesBase.js';

//  ---
//  TIBETGraphicsPrimitives[IE/Gecko/Webkit].js
//  ---

if (TP.sys.isUA('IE', 8, TP.UP)) {
    TP.boot[TP.SOURCE_PATH] =
        '~lib_src/tibet/kernel/TIBETGraphicsPrimitivesIE.js';
}

//  ---
//  TIBETStringPrimitivesIE.js
//  ---

if (TP.sys.isUA('IE')) {
    TP.boot[TP.SOURCE_PATH] =
        '~lib_src/tibet/kernel/TIBETStringPrimitivesIE.js';
}

//  ---
//  TIBETStringPrimitivesPost.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETStringPrimitivesPost.js';

//  ---
//  TIBETCSSPrimitivesPre.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETCSSPrimitivesPre.js';

//  ---
//  TIBETCSSPrimitivesBase.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETCSSPrimitivesBase.js';

//  ---
//  TIBETCSSPrimitives[IE/Gecko/Webkit].js
//  ---

if (TP.sys.isUA('GECKO')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETCSSPrimitivesGecko.js';
} else if (TP.sys.isUA('IE', 8, TP.UP)) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETCSSPrimitivesIE.js';
} else if (TP.sys.isUA('WEBKIT')) {
    TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETCSSPrimitivesWebkit.js';
}

//  ---
//  TIBETCSSPrimitivesPost.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETCSSPrimitivesPost.js';

//  ---
//  TIBETEncapsulation.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETEncapsulation.js';

//  ---
//  TIBETRegistration.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETRegistration.js';

//  ---
//  TIBETFoundation.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETFoundation.js';

//  ---
//  TIBETImportExport :)
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETImportExport.js';

//  ---
//  TIBETPrimitivesShortcuts
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesShortcut.js';

//  ------------------------------------------------------------------------
//  BUILT-IN METHODS
//  ------------------------------------------------------------------------

//  Faking out a load node here for the builtins
TP.boot[TP.LOAD_NODE] = TP.BUILTIN_LOAD_NODE;
TP.boot[TP.SOURCE_PATH] = '';

Array.Type.defineMethod('isArray', Array.isArray);

Array.Inst.defineMethod('concat', TP.ArrayProto.concat);
Array.Inst.defineMethod('every', TP.ArrayProto.every);
Array.Inst.defineMethod('filter', TP.ArrayProto.filter);
Array.Inst.defineMethod('forEach', TP.ArrayProto.forEach);
Array.Inst.defineMethod('indexOf', TP.ArrayProto.indexOf);
Array.Inst.defineMethod('join', TP.ArrayProto.join);
Array.Inst.defineMethod('lastIndexOf', TP.ArrayProto.lastIndexOf);
Array.Inst.defineMethod('map', TP.ArrayProto.map);
Array.Inst.defineMethod('pop', TP.ArrayProto.pop);
Array.Inst.defineMethod('push', TP.ArrayProto.push);
Array.Inst.defineMethod('reduce', TP.ArrayProto.reduce);
Array.Inst.defineMethod('reduceRight', TP.ArrayProto.reduceRight);
Array.Inst.defineMethod('reverse', TP.ArrayProto.reverse);
Array.Inst.defineMethod('shift', TP.ArrayProto.shift);
Array.Inst.defineMethod('slice', TP.ArrayProto.slice);
Array.Inst.defineMethod('some', TP.ArrayProto.some);
Array.Inst.defineMethod('sort', TP.ArrayProto.sort);
Array.Inst.defineMethod('splice', TP.ArrayProto.splice);
Array.Inst.defineMethod('toLocaleString', TP.ArrayProto.toLocaleString);
Array.Inst.defineMethod('toString', TP.ArrayProto.toString);
Array.Inst.defineMethod('unshift', TP.ArrayProto.unshift);

Boolean.Inst.defineMethod('toString', TP.BooleanProto.toString);
Boolean.Inst.defineMethod('valueOf', TP.BooleanProto.valueOf);

Date.Type.defineMethod('now', Date.now);
Date.Type.defineMethod('parse', Date.parse);
Date.Type.defineMethod('UTC', Date.UTC);

Date.Inst.defineMethod('getDate', TP.DateProto.getDate);
Date.Inst.defineMethod('getDay', TP.DateProto.getDay);
Date.Inst.defineMethod('getFullYear', TP.DateProto.getFullYear);
Date.Inst.defineMethod('getHours', TP.DateProto.getHours);
Date.Inst.defineMethod('getMilliseconds', TP.DateProto.getMilliseconds);
Date.Inst.defineMethod('getMinutes', TP.DateProto.getMinutes);
Date.Inst.defineMethod('getMonth', TP.DateProto.getMonth);
Date.Inst.defineMethod('getSeconds', TP.DateProto.getSeconds);
Date.Inst.defineMethod('getTime', TP.DateProto.getTime);
Date.Inst.defineMethod('getTimezoneOffset', TP.DateProto.getTimezoneOffset);
Date.Inst.defineMethod('getUTCDate', TP.DateProto.getUTCDate);
Date.Inst.defineMethod('getUTCDay', TP.DateProto.getUTCDay);
Date.Inst.defineMethod('getUTCFullYear', TP.DateProto.getUTCFullYear);
Date.Inst.defineMethod('getUTCHours', TP.DateProto.getUTCHours);
Date.Inst.defineMethod('getUTCMilliseconds', TP.DateProto.getUTCMilliseconds);
Date.Inst.defineMethod('getUTCMinutes', TP.DateProto.getUTCMinutes);
Date.Inst.defineMethod('getUTCMonth', TP.DateProto.getUTCMonth);
Date.Inst.defineMethod('getUTCSeconds', TP.DateProto.getUTCSeconds);
Date.Inst.defineMethod('getYear', TP.DateProto.getYear);
Date.Inst.defineMethod('setDate', TP.DateProto.setDate);
Date.Inst.defineMethod('setFullYear', TP.DateProto.setFullYear);
Date.Inst.defineMethod('setHours', TP.DateProto.setHours);
Date.Inst.defineMethod('setMilliseconds', TP.DateProto.setMilliseconds);
Date.Inst.defineMethod('setMinutes', TP.DateProto.setMinutes);
Date.Inst.defineMethod('setMonth', TP.DateProto.setMonth);
Date.Inst.defineMethod('setSeconds', TP.DateProto.setSeconds);
Date.Inst.defineMethod('setTime', TP.DateProto.setTime);
Date.Inst.defineMethod('setUTCDate', TP.DateProto.setUTCDate);
Date.Inst.defineMethod('setUTCFullYear', TP.DateProto.setUTCFullYear);
Date.Inst.defineMethod('setUTCHours', TP.DateProto.setUTCHours);
Date.Inst.defineMethod('setUTCMilliseconds', TP.DateProto.setUTCMilliseconds);
Date.Inst.defineMethod('setUTCMinutes', TP.DateProto.setUTCMinutes);
Date.Inst.defineMethod('setUTCMonth', TP.DateProto.setUTCMonth);
Date.Inst.defineMethod('setUTCSeconds', TP.DateProto.setUTCSeconds);
Date.Inst.defineMethod('setYear', TP.DateProto.setYear);
Date.Inst.defineMethod('toDateString', TP.DateProto.toDateString);
Date.Inst.defineMethod('toGMTString', TP.DateProto.toGMTString);
Date.Inst.defineMethod('toISOString', TP.DateProto.toISOString);
Date.Inst.defineMethod('toJSON', TP.DateProto.toJSON);
Date.Inst.defineMethod('toLocaleDateString', TP.DateProto.toLocaleDateString);
Date.Inst.defineMethod('toLocaleString', TP.DateProto.toLocaleString);
Date.Inst.defineMethod('toLocaleTimeString', TP.DateProto.toLocaleTimeString);
Date.Inst.defineMethod('toString', TP.DateProto.toString);
Date.Inst.defineMethod('toTimeString', TP.DateProto.toTimeString);
Date.Inst.defineMethod('toUTCString', TP.DateProto.toUTCString);
Date.Inst.defineMethod('valueOf', TP.DateProto.valueOf);

//  Error Object: no methods

Function.Inst.defineMethod('apply', TP.FunctionProto.apply);
//  We don't register 'bind' because we define our own version
//Function.Inst.defineMethod('bind', TP.FunctionProto.bind);
Function.Inst.defineMethod('call', TP.FunctionProto.call);
Function.Inst.defineMethod('toString', TP.FunctionProto.toString);

//  Math Object: don't expose publicly. See Number extensions.

Number.Inst.defineMethod('toExponential', TP.NumberProto.toExponential);
Number.Inst.defineMethod('toFixed', TP.NumberProto.toFixed);
Number.Inst.defineMethod('toLocaleString', TP.NumberProto.toLocaleString);
Number.Inst.defineMethod('toPrecision', TP.NumberProto.toPrecision);
Number.Inst.defineMethod('toString', TP.NumberProto.toString);
Number.Inst.defineMethod('valueOf', TP.NumberProto.valueOf);

Object.Type.defineMethod('create', Object.create);
Object.Type.defineMethod('defineProperty', Object.defineProperty);
Object.Type.defineMethod('defineProperties', Object.defineProperties);
Object.Type.defineMethod('freeze', Object.freeze);
Object.Type.defineMethod('getOwnPropertyDescriptor', Object.getOwnPropertyDescriptor);
Object.Type.defineMethod('getOwnPropertyNames', Object.getOwnPropertyNames);
Object.Type.defineMethod('getPrototypeOf', Object.getPrototypeOf);
Object.Type.defineMethod('isExtensible', Object.isExtensible);
Object.Type.defineMethod('isFrozen', Object.isFrozen);
Object.Type.defineMethod('isSealed', Object.isSealed);
Object.Type.defineMethod('keys', Object.keys);
Object.Type.defineMethod('preventExtensions', Object.preventExtensions);
Object.Type.defineMethod('seal', Object.seal);

//  We don't expose an 'Object.Inst', but we need to register these methods...
TP.defineMethodSlot(TP.ObjectProto, 'hasOwnProperty',
                    TP.ObjectProto.hasOwnProperty, TP.INST_TRACK,
                    false, 'Object.Inst.hasOwnProperty', Object);
TP.defineMethodSlot(TP.ObjectProto, 'isPrototypeOf',
                    TP.ObjectProto.isPrototypeOf, TP.INST_TRACK,
                    false, 'Object.Inst.isPrototypeOf', Object);
TP.defineMethodSlot(TP.ObjectProto, 'propertyIsEnumerable',
                    TP.ObjectProto.propertyIsEnumerable, TP.INST_TRACK,
                    false, 'Object.Inst.propertIsEnumerable', Object);
TP.defineMethodSlot(TP.ObjectProto, 'toLocaleString',
                    TP.ObjectProto.toLocaleString, TP.INST_TRACK,
                    false, 'Object.Inst.toLocaleString', Object);
TP.defineMethodSlot(TP.ObjectProto, 'toString',
                    TP.ObjectProto.toString, TP.INST_TRACK,
                    false, 'Object.Inst.toString', Object);
TP.defineMethodSlot(TP.ObjectProto, 'valueOf',
                    TP.ObjectProto.valueOf, TP.INST_TRACK,
                    false, 'Object.Inst.valueOf', Object);

RegExp.Inst.defineMethod('exec', TP.RegExpProto.exec);
RegExp.Inst.defineMethod('test', TP.RegExpProto.test);
RegExp.Inst.defineMethod('toString', TP.RegExpProto.toString);

String.Type.defineMethod('fromCharCode', String.fromCharCode);

String.Inst.defineMethod('anchor', TP.StringProto.anchor);
String.Inst.defineMethod('big', TP.StringProto.big);
String.Inst.defineMethod('blink', TP.StringProto.blink);
String.Inst.defineMethod('bold', TP.StringProto.bold);
String.Inst.defineMethod('fixed', TP.StringProto.fixed);
String.Inst.defineMethod('fontcolor', TP.StringProto.fontcolor);
String.Inst.defineMethod('fontsize', TP.StringProto.fontsize);
String.Inst.defineMethod('italics', TP.StringProto.italics);
String.Inst.defineMethod('link', TP.StringProto.link);
String.Inst.defineMethod('small', TP.StringProto.small);
String.Inst.defineMethod('strike', TP.StringProto.strike);
String.Inst.defineMethod('sub', TP.StringProto.sub);
String.Inst.defineMethod('sup', TP.StringProto.sup);

String.Inst.defineMethod('charAt', TP.StringProto.charAt);
String.Inst.defineMethod('charCodeAt', TP.StringProto.charCodeAt);
String.Inst.defineMethod('concat', TP.StringProto.concat);
String.Inst.defineMethod('indexOf', TP.StringProto.indexOf);
String.Inst.defineMethod('lastIndexOf', TP.StringProto.lastIndexOf);
String.Inst.defineMethod('localeCompare', TP.StringProto.localeCompare);
String.Inst.defineMethod('match', TP.StringProto.match);
String.Inst.defineMethod('replace', TP.StringProto.replace);
String.Inst.defineMethod('search', TP.StringProto.search);
String.Inst.defineMethod('slice', TP.StringProto.slice);
String.Inst.defineMethod('split', TP.StringProto.split);
String.Inst.defineMethod('substring', TP.StringProto.substring);
String.Inst.defineMethod('substr', TP.StringProto.substr);
String.Inst.defineMethod('toLocaleLowerCase',
                        TP.StringProto.toLocaleLowerCase);
String.Inst.defineMethod('toLocaleUpperCase',
                        TP.StringProto.toLocaleUpperCase);
String.Inst.defineMethod('toLowerCase', TP.StringProto.toLowerCase);
String.Inst.defineMethod('toString', TP.StringProto.toString);
String.Inst.defineMethod('toUpperCase', TP.StringProto.toUpperCase);
String.Inst.defineMethod('trim', TP.StringProto.trim);
String.Inst.defineMethod('valueOf', TP.StringProto.valueOf);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
