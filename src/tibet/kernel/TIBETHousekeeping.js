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

//  This is for Karma - it will overwrite the 'alert', 'prompt' and 'confirm'
//  slots but this registration will check for 'asMethod' on these and we really
//  don't need to do them for Karma ('notify' is a TIBET method, but is
//  sometimes aliased to 'alert').
if (!TP.sys.hasFeature('karma')) {
    TP.boot.defineMethod('$alert', TP.boot.$alert);
    TP.boot.defineMethod('$prompt', TP.boot.$prompt);
    TP.boot.defineMethod('$confirm', TP.boot.$confirm);

    TP.boot.defineMethod('$notify', TP.boot.$notify);
}

TP.boot.defineMethod('$stderr', TP.boot.$stderr);
TP.boot.defineMethod('$stdin', TP.boot.$stdin);
TP.boot.defineMethod('$stdout', TP.boot.$stdout);

TP.boot.defineMethod('$raise', TP.boot.$raise);

TP.sys.defineMethod('isHTTPBased', TP.sys.isHTTPBased);
TP.sys.defineMethod('isMac', TP.sys.isMac);
TP.sys.defineMethod('isNix', TP.sys.isNix);
TP.sys.defineMethod('isWin', TP.sys.isWin);

TP.sys.defineMethod('isUA', TP.sys.isUA);

TP.sys.defineMethod('isObsolete', TP.sys.isObsolete);
TP.sys.defineMethod('isSupported', TP.sys.isSupported);

TP.sys.defineMethod('getLaunchRoot', TP.sys.getLaunchRoot);
TP.sys.defineMethod('getLaunchURL', TP.sys.getLaunchURL);
TP.sys.defineMethod('getLaunchHost', TP.sys.getLaunchHost);
TP.sys.defineMethod('getLaunchPathname', TP.sys.getLaunchPathname);
TP.sys.defineMethod('getLaunchPort', TP.sys.getLaunchPort);
TP.sys.defineMethod('getLaunchScheme', TP.sys.getLaunchScheme);

TP.boot.defineMethod('$httpConstruct', TP.boot.$httpConstruct);
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

TP.boot.defineMethod('$uriLoad', TP.boot.$uriLoad);
TP.boot.defineMethod('$uriLoadCommonFile', TP.boot.$uriLoadCommonFile);
TP.boot.defineMethod('$uriLoadIEFile', TP.boot.$uriLoadIEFile);
TP.boot.defineMethod('$uriLoadMozFile', TP.boot.$uriLoadMozFile);
TP.boot.defineMethod('$uriLoadCommonHttp', TP.boot.$uriLoadCommonHttp);

TP.boot.defineMethod('$sourceImport', TP.boot.$sourceImport);

TP.boot.defineMethod('$documentConstruct', TP.boot.$documentConstruct);
TP.boot.defineMethod('$activeXDocumentConstructIE',
                                        TP.boot.$activeXDocumentConstructIE);

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

TP.boot.defineMethod('$stringify', TP.boot.$stringify);

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

TP.sys.defineMethod('writeBootLog', TP.sys.writeBootLog);

TP.boot.defineMethod('boot', TP.boot.boot);
TP.boot.defineMethod('$config', TP.boot.$config);

TP.boot.defineMethod('launch', TP.boot.launch);

TP.boot.defineMethod('main', TP.boot.main);

//  ---
//  tibet_hook.js
//  ---

//  whether or not we can move on to phase two processing
TP.sys.defineGlobal('$$phase_two', null);

TP.boot.defineMethod('$isElement', TP.boot.$isElement);
TP.boot.defineMethod('$isEmpty', TP.boot.$isEmpty);
TP.boot.defineMethod('$isValid', TP.boot.$isValid);
TP.boot.defineMethod('$isWindow', TP.boot.$isWindow);
TP.boot.defineMethod('$notValid', TP.boot.$notValid);

TP.boot.defineMethod('$byId', TP.boot.$byId);

TP.boot.defineMethod('hideContent', TP.boot.hideContent);
TP.boot.defineMethod('hideUIRoot', TP.boot.hideUIRoot);

TP.boot.defineMethod('showUICanvas', TP.boot.showUICanvas);
TP.boot.defineMethod('showUIRoot', TP.boot.showUIRoot);

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

TP.definePrimitive('RETURN_EMPTY_ARRAY', TP.RETURN_EMPTY_ARRAY);
TP.definePrimitive('RETURN_EMPTY_STRING', TP.RETURN_EMPTY_STRING);
TP.definePrimitive('RETURN_SPACE', TP.RETURN_SPACE);

TP.definePrimitive('RETURN_ORIG', TP.RETURN_ORIG);
TP.definePrimitive('RETURN_NEW', TP.RETURN_NEW);

TP.definePrimitive('RETURN_TOSTRING', TP.RETURN_TOSTRING);

//  ---
//  TIBETVersion.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETVersion.js';

//  ---
//  TIBETPrimitivesPre.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesPre.js';

TP.sys.defineGlobal(TP.ID, null);

//  ---
//  TIBETPrimitivesBase.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesBase.js';

//  ---
//  TIBETPrimitivesPost.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesPost.js';

//  unusual, but this keeps environment config centralized on TP.boot
TP.boot.defineMethod('$configurePluginEnvironment',
                                    TP.boot.$configurePluginEnvironment);

//  Enhanced methods for slot lookup
TP.boot.defineAttribute('$simplePropertyRetriever',
                                    TP.boot.$simplePropertyRetriever);

//  ---
//  TIBETDOMPrimitivesPre.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDOMPrimitivesPre.js';

//  ---
//  TIBETDOMPrimitivesBase.js
//  ---

TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETDOMPrimitivesBase.js';

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

//  Faking out a load info here for the builtins

//  NB: We do this inside of a closure to try to hide the local variables from
//  the global scope
(function() {

    var currentLoadPath,
        currentLoadPackage,
        currentLoadConfig,
        currentLoadStage,

        currentSourcePath,
        currentSourcePackage,
        currentSourceConfig;

    currentLoadPath = TP.boot[TP.LOAD_PATH];
    currentLoadPackage = TP.boot[TP.LOAD_PACKAGE];
    currentLoadConfig = TP.boot[TP.LOAD_CONFIG];
    currentLoadStage = TP.boot[TP.LOAD_STAGE];

    currentSourcePath = TP.boot[TP.SOURCE_PATH];
    currentSourcePackage = TP.boot[TP.SOURCE_PACKAGE];
    currentSourceConfig = TP.boot[TP.SOURCE_CONFIG];

    TP.boot[TP.LOAD_PATH] = '';
    TP.boot[TP.LOAD_PACKAGE] = '';
    TP.boot[TP.LOAD_CONFIG] = '';
    TP.boot[TP.LOAD_STAGE] = '';

    TP.boot[TP.SOURCE_PATH] = '';
    TP.boot[TP.SOURCE_PACKAGE] = '';
    TP.boot[TP.SOURCE_CONFIG] = '';

    //  Go ahead and instrument the builtins by 'defining' them, according to
    //  TIBET

    //  Array.Type.defineMethod('from', Array.from); // E6
    Array.Type.defineMethod('isArray', Array.isArray);
    //  Array.Type.defineMethod('of', Array.of); // E6

    //  Array.Inst.defineMethod('copyWithin', TP.ArrayProto.copyWithin); // E6
    Array.Inst.defineMethod('concat', TP.ArrayProto.concat);
    Array.Inst.defineMethod('every', TP.ArrayProto.every);
    Array.Inst.defineMethod('filter', TP.ArrayProto.filter);
    //  Array.Inst.defineMethod('fill', TP.ArrayProto.fill); // E6
    //  Array.Inst.defineMethod('find', TP.ArrayProto.find); // E6
    //  Array.Inst.defineMethod('findIndex', TP.ArrayProto.findIndex); // E6
    Array.Inst.defineMethod('forEach', TP.ArrayProto.forEach);
    Array.Inst.defineMethod('indexOf', TP.ArrayProto.indexOf);
    Array.Inst.defineMethod('join', TP.ArrayProto.join);
    //  Array.Inst.defineMethod('keys', TP.ArrayProto.keys); // E6
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
    //  Array.Inst.defineMethod('values', TP.ArrayProto.values); // E6

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
    //  Function.Inst.defineMethod('bind', TP.FunctionProto.bind);
    Function.Inst.defineMethod('call', TP.FunctionProto.call);
    Function.Inst.defineMethod('toString', TP.FunctionProto.toString);

    //  Math Object: don't expose publicly. See Number extensions.

    //  Number.Inst.defineMethod('isFinite', TP.NumberProto.isFinite); // E6
    //  Number.Inst.defineMethod('isInteger', TP.NumberProto.isInteger); // E6
    //  Number.Inst.defineMethod('isNaN', TP.NumberProto.isNaN); // E6
    //  Number.Inst.defineMethod('isSafeInteger', TP.NumberProto.isSafeInteger); // E6
    Number.Inst.defineMethod('toExponential', TP.NumberProto.toExponential);
    Number.Inst.defineMethod('toFixed', TP.NumberProto.toFixed);
    Number.Inst.defineMethod('toLocaleString', TP.NumberProto.toLocaleString);
    Number.Inst.defineMethod('toPrecision', TP.NumberProto.toPrecision);
    Number.Inst.defineMethod('toString', TP.NumberProto.toString);
    Number.Inst.defineMethod('valueOf', TP.NumberProto.valueOf);

    //  Object.Type.defineMethod('assign', Object.assign); // E6
    Object.Type.defineMethod('create', Object.create);
    Object.Type.defineMethod('defineProperty', Object.defineProperty);
    Object.Type.defineMethod('defineProperties', Object.defineProperties);
    Object.Type.defineMethod('freeze', Object.freeze);
    Object.Type.defineMethod('getOwnPropertyDescriptor', Object.getOwnPropertyDescriptor);
    Object.Type.defineMethod('getOwnPropertyNames', Object.getOwnPropertyNames);
    //  Object.Type.defineMethod('getOwnPropertySymbols', Object.getOwnPropertySymbols); // E6
    Object.Type.defineMethod('getPrototypeOf', Object.getPrototypeOf);
    //  Object.Type.defineMethod('is', Object.is); // E6
    Object.Type.defineMethod('isExtensible', Object.isExtensible);
    Object.Type.defineMethod('isFrozen', Object.isFrozen);
    Object.Type.defineMethod('isSealed', Object.isSealed);
    Object.Type.defineMethod('keys', Object.keys);
    Object.Type.defineMethod('preventExtensions', Object.preventExtensions);
    Object.Type.defineMethod('seal', Object.seal);
    //  Object.Type.defineMethod('setPrototypeOf', Object.setPrototypeOf); // E6

    //  We don't expose an 'Object.Inst', but we need to register these methods.
    //  We have to be very careful here, though, so that we avoid creating slots
    //  on Object.prototype, which would cause problems when iterating through
    //  native objects being used as Hashes. So we register them with the
    //  metadata system using a 'light touch' (i.e. without calling
    //  TP.defineMethodSlot()).

    TP.ObjectProto.hasOwnProperty.asMethod(
            TP.ObjectProto,
            'hasOwnProperty',
            TP.INST_TRACK,
            'Object.Inst.hasOwnProperty');
    TP.sys.addMetadata(
            Object,
            TP.ObjectProto.hasOwnProperty,
            TP.METHOD,
            TP.INST_TRACK);

    TP.ObjectProto.isPrototypeOf.asMethod(
            TP.ObjectProto,
            'isPrototypeOf',
            TP.INST_TRACK,
            'Object.Inst.isPrototypeOf');
    TP.sys.addMetadata(
            Object,
            TP.ObjectProto.isPrototypeOf,
            TP.METHOD,
            TP.INST_TRACK);

    TP.ObjectProto.propertyIsEnumerable.asMethod(
            TP.ObjectProto,
            'propertyIsEnumerable',
            TP.INST_TRACK,
            'Object.Inst.propertyIsEnumerable');
    TP.sys.addMetadata(
            Object,
            TP.ObjectProto.propertyIsEnumerable,
            TP.METHOD,
            TP.INST_TRACK);

    TP.ObjectProto.toLocaleString.asMethod(
            TP.ObjectProto,
            'toLocaleString',
            TP.INST_TRACK,
            'Object.Inst.toLocaleString');
    TP.sys.addMetadata(
            Object,
            TP.ObjectProto.toLocaleString,
            TP.METHOD,
            TP.INST_TRACK);

    TP.ObjectProto.toString.asMethod(
            TP.ObjectProto,
            'toString',
            TP.INST_TRACK,
            'Object.Inst.toString');
    TP.sys.addMetadata(
            Object,
            TP.ObjectProto.toString,
            TP.METHOD,
            TP.INST_TRACK);

    TP.ObjectProto.valueOf.asMethod(
            TP.ObjectProto,
            'valueOf',
            TP.INST_TRACK,
            'Object.Inst.valueOf');
    TP.sys.addMetadata(
            Object,
            TP.ObjectProto.valueOf,
            TP.METHOD,
            TP.INST_TRACK);

    //  Now we track those slot names because they're not obtainable by
    //  reflection
    TP.OBJECT_PROTO_SLOTS = [
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'toLocaleString',
        'toString',
        'valueOf'
    ];

    RegExp.Inst.defineMethod('exec', TP.RegExpProto.exec);
    RegExp.Inst.defineMethod('test', TP.RegExpProto.test);
    RegExp.Inst.defineMethod('toString', TP.RegExpProto.toString);

    String.Type.defineMethod('fromCharCode', String.fromCharCode);
    //  String.Type.defineMethod('fromCodePoint', String.fromCodePoint); // E6
    //  String.Type.defineMethod('raw', String.raw); // E6

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
    //  String.Inst.defineMethod('codePointAt', TP.StringProto.codePointAt); // E6
    String.Inst.defineMethod('concat', TP.StringProto.concat);
    //  String.Inst.defineMethod('includes', TP.StringProto.includes); // E6
    String.Inst.defineMethod('indexOf', TP.StringProto.indexOf);
    String.Inst.defineMethod('lastIndexOf', TP.StringProto.lastIndexOf);
    String.Inst.defineMethod('localeCompare', TP.StringProto.localeCompare);
    String.Inst.defineMethod('match', TP.StringProto.match);
    //  String.Inst.defineMethod('normalize', TP.StringProto.normalize); // E6
    //  String.Inst.defineMethod('repeat', TP.StringProto.repeat); // E6
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

    //  Restore the real load information
    TP.boot[TP.LOAD_PATH] = currentLoadPath;
    TP.boot[TP.LOAD_PACKAGE] = currentLoadPackage;
    TP.boot[TP.LOAD_CONFIG] = currentLoadConfig;
    TP.boot[TP.LOAD_STAGE] = currentLoadStage;

    TP.boot[TP.SOURCE_PATH] = currentSourcePath;
    TP.boot[TP.SOURCE_PACKAGE] = currentSourcePackage;
    TP.boot[TP.SOURCE_CONFIG] = currentSourceConfig;

}());

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
