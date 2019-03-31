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
 * @type {TP.test.DescribedSuite}
 * @summary A type that allows test suites to be defined using a simple JSON
 *     format.
 */

TP.test.Suite.defineSubtype('test.DescribedSuite');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.test.DescribedSuite.Type.defineMethod('build',
function(aDescriptionJSONStr, aURI) {

    /**
     * @method build
     * @summary Builds a set of test suites and their test cases, from the
     *     supplied JSON description string.
     * @param {String} aDescriptionJSONStr The String that describes the test
     *     suites and their constituent test cases.
     * @param {TP.uri.URI} aURI The URI that is the source of the test
     *     description.
     * @returns {TP.test.DescribedSuite} The receiver.
     */

    var description,

        allSuites,
        suiteLoc,

        newSuites;

    //  Convert the JSON string into TIBET-ized JavaScript objects.
    description = TP.json2js(aDescriptionJSONStr);
    if (TP.isEmpty(description)) {
        this.raise('InvalidObject',
            'Unable to build test suite data from entry: ' + aDescriptionJSONStr);
        return this;
    }

    //  Grab all of the defined suites from the TP.test.Suite type object.
    allSuites = TP.test.Suite.$get('suites');

    //  The location of the test is the URL that is our source (in virtual
    //  form).
    suiteLoc = aURI.getVirtualLocation();

    //  Build test suites and their individual test cases from the JS object
    //  description.
    newSuites = this.buildFromDescription(description);

    //  Iterate over each new test suite and set its load and source
    //  information.
    newSuites.forEach(
        function(aSuite) {
            aSuite[TP.LOAD_PATH] = suiteLoc;
            aSuite[TP.LOAD_PACKAGE] = '';
            aSuite[TP.LOAD_CONFIG] = '';
            aSuite[TP.LOAD_STAGE] = '';

            aSuite[TP.SOURCE_PATH] = suiteLoc;
            aSuite[TP.SOURCE_PACKAGE] = '';
            aSuite[TP.SOURCE_CONFIG] = '';

            allSuites.push(aSuite);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.test.DescribedSuite.Type.defineMethod('buildFromDescription',
function(aDescription) {

    /**
     * @method buildFromDescription
     * @summary
     * @param {TP.core.Hash} aDescription A description, in hash form, of the
     *     list of suites to define.
     * @returns {TP.test.DescribedSuite[]|null} The receiver.
     */

    var newSuites,

        suites,

        len,
        i,

        suiteDescription,

        targetName,

        target,

        suiteName,

        suite;

    newSuites = TP.ac();

    //  Grab the hash with the array of the defined suites.
    suites = aDescription.at('suites');

    //  Iterate over that, compute
    len = suites.getSize();
    for (i = 0; i < len; i++) {
        suiteDescription = suites.at(i);

        //  The target name should be a type name with a '.Type' or '.Inst'
        //  pointing to one of its prototypes or the global ID of an object that
        //  these tests will be placed on locally.
        targetName = suiteDescription.at('target');

        //  Grab the target object.
        target = TP.bySystemId(targetName);

        if (TP.notValid(target)) {
            this.raise('InvalidObject', 'Invalid test target.');
            return null;
        }

        //  Grab the individual suite at this place in the list.
        suiteName = suiteDescription.at('suite');

        //  Construct a TP.test.Suite and constituent TP.test.Case objects from
        //  it.
        suite = this.construct(target, suiteName, suiteDescription);

        newSuites.push(suite);
    }

    return newSuites;
});

//  ------------------------------------------------------------------------

TP.test.DescribedSuite.Type.defineMethod('loadFrom',
function(aURL) {

    /**
     * @method loadFrom
     * @summary Loads a test description from the supplied URL.
     * @param {String} aURL URL of the test JSON description
     * @returns {TP.test.DescribedSuite} The receiver.
     */

    var url,
        loadRequest;

    url = TP.uc(aURL);
    if (!TP.isURI(url)) {
        this.raise('TP.sig.InvalidURI');

        return this;
    }

    //  Adjust the path per any rewrite rules in place for the URI. Note that we
    //  only do this if the url is absolute
    if (TP.uriIsAbsolute(url.getLocation())) {
        url = url.rewrite();
    }

    //  Construct the request
    loadRequest = url.constructRequest(
                    TP.hc('async', true,
                            'refresh', true,
                            'resultType', TP.TEXT,
                            'signalChange', false));

    loadRequest.defineHandler(
        'RequestSucceeded',
        function(aResponse) {
            this.build(aResponse.get('result'), url);
        }.bind(this));

    loadRequest.defineHandler(
        'RequestFailed',
        function(aResponse) {
            this.raise('InvalidValue', aResponse.get('result'));
        }.bind(this));

    url.load(loadRequest);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * The description of the test suite, in JSON format.
 * @type {String}
 */
TP.test.DescribedSuite.Inst.defineAttribute('description');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.DescribedSuite.Inst.defineMethod('init',
function(target, suiteName, suiteDescription) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {Object} target The object that owns the test suite.
     * @param {String} suiteName The name of the suite. Should be unique for the
     *     particular target.
     * @param {TP.core.Hash} suiteDescription The description of the test suite
     *     in JSON format.
     * @returns {TP.test.Suite} The new test suite instance.
     */

    this.set('description', suiteDescription);

    return this.callNextMethod(
                    target, suiteName, this.generateSuite.bind(this));
});

//  ------------------------------------------------------------------------

TP.test.DescribedSuite.Inst.defineMethod('buildStepProcessor',
function(stepArray, isTestLevel) {

    /**
     * @method buildStepProcessor
     * @summary Builds a Function that will process each step in the supplied
     *     step array. This function will recursively call itself through each
     *     step in the array, thereby managing completely asynchronous behavior.
     * @param {Array[]} stepArray The array of steps to iterate over.
     * @param {Boolean} isTestLevel Whether or not the set of steps is at the
     *     'suite' (i.e. 'before' and 'after' functions) level or at the 'test'
     *     level (i.e. 'beforeEach', 'afterEach' and test case functions).
     * @returns {Function} The function that will process the supplied steps.
     */

    var suiteref,
        stepProcessorFunc;

    suiteref = this;

    stepProcessorFunc = function(test, options) {
        var suite,

            chainref,

            driver,
            windowContext,

            nextStepFunc,
            getSignalTarget,
            getApplyArgs,

            steps,

            args,
            action,

            func,

            loadURI,
            timeout,
            origin,
            signal,

            targetPath,
            target,

            evtName,
            evtSequence;

        suite = suiteref;

        //  If we're operating at the 'test level', then we build chains on the
        //  test - otherwise we build chains on the suite.
        if (isTestLevel) {
            chainref = test;
        } else {
            chainref = suiteref;
        }

        //  Grab the GUI driver and the current window context.
        driver = suite.getDriver();
        windowContext = driver.get('windowContext');

        //  Define a function that will look at the current step index slot on
        //  the step processor function itself and, if we haven't exhausted all
        //  of the steps, will recursively call the step processor function
        //  after incrementing the step count..
        nextStepFunc = function() {
            stepProcessorFunc.__currentStepIndex__++;

            //  If the currentStep count is equal to the number of steps, then
            //  we're at the end of the list of steps.
            if (stepProcessorFunc.__currentStepIndex__ === steps.getSize()) {
                //  Reset the current step counter in case the suite is run
                //  again.
                stepProcessorFunc.__currentStepIndex__ = 0;
                return;
            } else {
                stepProcessorFunc(test, options);
            }
        };

        //  Define a function that will obtain a signal target based on the
        //  path.
        getSignalTarget = function(sigTargetPath) {

            var sigTarget;

            if (sigTargetPath === 'uidoc') {
                return TP.sys.uidoc();
            }

            if (sigTargetPath === 'uiwin') {
                return TP.sys.uiwin();
            }

            sigTarget = TP.byPath(sigTargetPath,
                                windowContext.getNativeDocument(),
                                true);

            if (TP.isArray(sigTarget)) {
                //  Bad news
                return null;
            }

            return sigTarget;
        };

        //  Define a function that will obtain the arguments used for an
        //  'apply'. This is especially useful for assertions and refutations.
        getApplyArgs = function(stepArgs) {

            var applyArgs,
                applyTarget;

            applyArgs = stepArgs.slice(2);

            if (stepArgs.at(1) === 'didSignal') {

                applyTarget = getSignalTarget(applyArgs.at(0));

                if (TP.isArray(applyTarget)) {
                    //  Bad news
                    return null;
                }

                applyArgs.atPut(0, applyTarget);
            }

            return applyArgs;
        };

        steps = stepArray;

        //  Grab the step at the current step index. This will be an Array of
        //  step 'arguments'.
        args = steps.at(stepProcessorFunc.__currentStepIndex__);

        //  The action will always be the first item in the array.
        action = args.at(0);

        //  Process based on action.
        switch (action) {
            case 'assert':
                func = test.assert[args.at(1)];
                func.apply(test.assert, getApplyArgs(args));

                nextStepFunc();

                break;

            case 'loadURL':
                loadURI = TP.uc(args.at(1));

                driver.setLocation(loadURI);

                //  Note the 'chain' here - waiting until the setLocation comes
                //  back.
                chainref.chain(
                    function() {
                        nextStepFunc();
                    });

                break;

            case 'refute':
                func = test.refute[args.at(1)];
                func.apply(test.refute, getApplyArgs(args));

                nextStepFunc();

                break;

            case 'resetSignalTracking':
                suite.resetSignalTracking();

                nextStepFunc();

                break;

            case 'startTrackingSignals':
                suite.startTrackingSignals();

                nextStepFunc();

                break;

            case 'stopTrackingSignals':
                suite.stopTrackingSignals();

                nextStepFunc();

                break;

            case 'timeout':

                timeout = args.at(1);
                chainref.timeout(timeout);

                break;

            case 'wait':

                timeout = args.at(1);
                chainref.andWait(timeout);

                //  Note the 'chain' here - waiting until the andWait comes
                //  back.
                chainref.chain(
                    function() {
                        nextStepFunc();
                    });

                break;

            case 'waitFor':

                origin = args.at(1);
                signal = args.at(2);
                chainref.andWaitFor(origin, signal);

                //  Note the 'chain' here - waiting until the andWaitFor comes
                //  back.
                chainref.chain(
                    function() {
                        nextStepFunc();
                    });

                break;

            case 'click':
            case 'dblclick':
            case 'rightclick':
            case 'key':
            case 'keys':
            case 'mousedown':
            case 'mouseup':
            case 'keydown':
            case 'keyup':

                evtSequence = driver.constructSequence();

                targetPath = args.at(1);
                target = getSignalTarget(targetPath);

                if (TP.isValid(target)) {
                    evtSequence[action](target).run();
                }

                //  Note the 'chain' here - waiting until the event sequence has
                //  been processed.
                chainref.chain(
                    function() {
                        nextStepFunc();
                    });
            break;

            case 'sendEvent':

                evtSequence = driver.constructSequence();

                evtName = args.at(1);

                targetPath = args.at(2);
                target = getSignalTarget(targetPath);

                if (TP.isValid(target)) {
                    evtSequence.
                        sendEvent(TP.hc('type', evtName), target).
                        run();
                }

                //  Note the 'chain' here - waiting until the event sequence has
                //  been processed.
                chainref.chain(
                    function() {
                        nextStepFunc();
                    });
            break;

            default:
                //  TODO: Log that we couldn't find an action and that we're
                //  moving on.
                TP.ifError() ?
                    TP.error('Couldn\'t find step action: ' + action) : 0;

                nextStepFunc();
                break;
        }

        return;
    };

    //  Start the counter at 0  This will be incremented as each step is
    //  processed by calling the processor function recursively and will be
    //  reset to 0 when that list is exhausted before ending the process.
    stepProcessorFunc.__currentStepIndex__ = 0;

    return stepProcessorFunc;
});

//  ------------------------------------------------------------------------

TP.test.DescribedSuite.Inst.defineMethod('generateSuite',
function() {

    /**
     * @method generateSuite
     * @summary Generates the actual test suite / test case code based on the
     *     receiver's description (which is a TP.core.Hash that was created from
     *     a JSON description).
     * @returns {TP.test.DescribedSuite} The receiver.
     */

    var thisref,

        description,

        steps,

        testEntries,

        len,
        i,

        entry;

    thisref = this;

    description = this.get('description');

    //  Iterate over all of the before steps and add each one.
    steps = description.at('before');
    this.before(this.buildStepProcessor(steps, false));

    //  Iterate over all of the before each steps and add each one.
    steps = description.at('beforeEach');
    this.beforeEach(this.buildStepProcessor(steps, true));

    //  Iterate over all of the test steps and add each one.

    testEntries = description.at('tests');

    len = testEntries.getSize();
    for (i = 0; i < len; i++) {
        entry = testEntries.at(i);

        (function(aTest) {
            thisref.it(aTest.at('name'),
                        thisref.buildStepProcessor(aTest.at('steps'), true));
        }(entry));
    }

    //  Iterate over all of the after each steps and add each one.
    steps = description.at('afterEach');
    this.afterEach(this.buildStepProcessor(steps, true));

    //  Iterate over all of the after steps and add each one.
    steps = description.at('after');
    this.after(this.buildStepProcessor(steps, false));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
