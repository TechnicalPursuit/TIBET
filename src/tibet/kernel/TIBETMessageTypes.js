//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/*
 */

//  ========================================================================
//  TP.core.Worker
//  ========================================================================

/**
 * @type {TP.core.Worker}
 * @summary This type provides an interface to the browser's 'worker thread'
 *     capability.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Worker');

//  This type is used as a common supertype, but is not instantiable.
TP.core.Worker.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  a pool of worker objects, keyed by the worker type name. Note that this is a
//  LOCAL attribute
TP.core.Worker.defineAttribute('$workerPoolDict');

//  the maximum number of workers allowed in the pool for this type
TP.core.Worker.Type.defineAttribute('$maxWorkerCount');

//  the total number of workers currently allocated for this type
TP.core.Worker.Type.defineAttribute('$currentWorkerCount');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Worker.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Initializes the type.
     */

    this.set('$workerPoolDict', TP.hc());

    return;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Type.defineMethod('getWorker',
function() {

    /**
     * @method getWorker
     * @summary Returns a worker either from a pool of workers that exist for
     *     the type being messaged or a new worker, if no workers are available
     *     in the pool for the receiving type.
     * @returns TP.core.Worker A worker of the type being messaged.
     */

    var poolDict,
        pool,

        worker;

    //  The dictionary of pools is on the TP.core.Worker type itself as a type
    //  local.
    poolDict = TP.core.Worker.get('$workerPoolDict');

    //  See if there is a pool for this receiving type, keyed by its name (the
    //  type name). If not, create one and register it.
    if (TP.notValid(pool = poolDict.at(this.getName()))) {
        pool = TP.ac();
        poolDict.atPut(this.getName(), pool);
        this.set('$currentWorkerCount', 0);
    }

    //  If there are workers available for this receiving type, use one of them.
    if (TP.notEmpty(pool)) {
        worker = pool.shift();
    } else if (this.get('$currentWorkerCount') < this.get('$maxWorkerCount')) {
        //  Otherwise, if the current worker count is less than the max worker
        //  count for this type, then go ahead and construct one and bump the
        //  current count.
        worker = this.construct();
        this.set('$currentWorkerCount', this.get('$currentWorkerCount') + 1);
    } else {
        //  Otherwise, the pool was empty and if we allocated another worker
        //  we'd be over our max limit, so we warn.
        TP.ifWarn() ?
            TP.warn('Maximum number of workers reached for: ' +
                    this.getName() +
                    '.') : 0;
    }

    return worker;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Type.defineMethod('repoolWorker',
function(worker) {

    /**
     * @method repoolWorker
     * @summary Puts the supplied Worker into the pool for the receiving type.
     * @param {TP.core.Worker} worker The worker to put into the pool.
     * @returns TP.meta.core.Worker The receiver.
     */

    var poolDict,
        pool;

    //  The dictionary of pools is on the TP.core.Worker type itself as a type
    //  local.
    poolDict = TP.core.Worker.get('$workerPoolDict');

    //  See if there is a pool for this receiving type, keyed by its name (the
    //  type name). If not, create one and register it.
    if (TP.notValid(pool = poolDict.at(this.getName()))) {
        pool = TP.ac();
        poolDict.atPut(this.getName(), pool);
    }

    //  Put the worker into the pool, ready to be used again.
    pool.push(worker);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  a worker thread object used by this object to interface with the worker
//  thread.
TP.core.Worker.Inst.defineAttribute('$workerThreadObj');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @returns {TP.core.Worker} A new instance.
     */

    var workerHelperURI,
        workerThread;

    //  construct the instance from the root down
    this.callNextMethod();

    //  Initialize the worker thread with the worker helper stub.
    workerHelperURI = TP.uc('~lib_etc/helpers/tibet_worker_helper.js');
    workerThread = new Worker(workerHelperURI.getLocation());

    this.set('$workerThreadObj', workerThread);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('eval',
function(jsSrc) {

    /**
     * @method eval
     * @summary Evaluates the supplied JavaScript source code inside of the
     *     worker thread that this object represents.
     * @param {String} jsSrc The source code to evaluate inside of the worker.
     * @returns Promise A promise that will resolve when the evaluation is
     *     complete.
     */

    var workerThread,
        newPromise;

    if (TP.isEmpty(jsSrc)) {
        return this.raise('InvalidParameter', 'No source code provided.');
    }

    workerThread = this.get('$workerThreadObj');

    //  Construct a Promise around sending the supplied source code to the
    //  worker for evaluation.
    newPromise = TP.extern.Promise.construct(
        function(resolver, rejector) {

            workerThread.onmessage = function(e) {

                //  Run the Promise resolver with the data returned in the
                //  message event.
                return resolver(e.data);
            };

            workerThread.onerror = function(e) {

                var err;

                //  Convert from an ErrorEvent into a real Error object
                err = new Error(e.message, e.filename, e.lineno);

                //  Run the Promise rejector with the Error object constructed
                //  from the data returned in the error event.
                return rejector(err);
            };

            //  Post a message telling the worker helper stub code loaded into
            //  the thread to evaluate the supplied source code.
            workerThread.postMessage({
                funcRef: 'evalJS',      //  func ref in worker
                thisRef: 'self',        //  this ref in worker
                params: TP.ac(jsSrc)    //  params ref - JSONified structure
            });
        });

    return newPromise;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('import',
function(aCodeURL) {

    /**
     * @method import
     * @summary Imports the JavaScript source code referred to by the supplied
     *     URL into the worker thread that this object represents.
     * @param {TP.core.URL|String} aCodeURL The URL referring to the resource
     *     containing the source code to import inside of the worker.
     * @returns Promise A promise that will resolve when the importation is
     *     complete.
     */

    var url,

        workerThread,
        newPromise;

    if (!TP.isURIString(aCodeURL) && !TP.isURI(aCodeURL)) {
        return this.raise('InvalidURL',
                            'Not a valid URL to JavaScript source code.');
    }

    url = TP.uc(aCodeURL).getLocation();

    workerThread = this.get('$workerThreadObj');

    newPromise = TP.extern.Promise.construct(
        function(resolver, rejector) {

            workerThread.onmessage = function(e) {

                //  Run the Promise resolver with the data returned in the
                //  message event.
                return resolver(e.data);
            };

            workerThread.onerror = function(e) {

                var err;

                //  Convert from an ErrorEvent into a real Error object
                err = new Error(e.message, e.filename, e.lineno);

                //  Run the Promise rejector with the Error object constructed
                //  from the data returned in the error event.
                return rejector(err);
            };

            //  Post a message telling the worker helper stub code loaded into
            //  the thread to import source code from the supplied URL.
            workerThread.postMessage({
                funcRef: 'importJS',    //  func ref in worker
                thisRef: 'self',        //  'this' ref in worker
                params: TP.ac(url)      //  params ref - JSONified structure
            });
        });

    return newPromise;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('defineWorkerMethod',
function(name, body, async) {

    /**
     * @method defineWorkerMethod
     * @summary Defines a method inside of the worker represented by the
     *     receiver and a peer method on the receiver that calls it, thereby
     *     presenting a seamless interface to it. The peer method will return a
     *     Promise that will resolve when the worker has posted results back for
     *     that call.
     * @param {String} name The name of the method.
     * @param {Function} body The body of the method.
     * @param {Boolean} async Whether or not the method is itself asynchronous.
     *     If so, it is important that it be written in such a way to take a
     *     callback as it's last formal parameter. In that way, it can inform
     *     the worker it is done and the worker can post the results back to
     *     this object. The default is false.
     * @returns Promise A promise that will resolve when the definition is
     *     complete.
     */

    var methodSrc,
        isAsync,

        promise;

    if (TP.isEmpty(name)) {
        return this.raise('InvalidString', 'Invalid method name');
    }

    if (!TP.isCallable(body)) {
        return this.raise('InvalidFunction', 'Invalid method body');
    }

    //  Get the source of the method body handed in and prepend
    //  'self.<methodName>' onto the front.
    methodSrc = 'self.' + name + ' = ' + body.toString();

    isAsync = TP.ifInvalid(async, false);

    //  Use our 'eval' method to evaluate the code. This is *not* the regular JS
    //  'eval' global call - this method evaluates the code over in worker
    //  thread and returns a Promise that will resolve when that is done.
    /* eslint-disable no-eval */
    promise = this.eval(methodSrc);
    /* eslint-enable no-eval */

    //  Attach to the Promise that was returned from evaluating the code.
    promise.then(
        function() {

            var peerMethod;

            //  Now, define that method on *this* object to call over into the
            //  worker thread to invoke what we just eval'ed over there.
            peerMethod = function() {
                var args,
                    workerThread,
                    newPromise;

                args = Array.prototype.slice.call(arguments);

                workerThread = this.get('$workerThreadObj');

                newPromise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        workerThread.onmessage = function(e) {

                            var data;

                            //  Run the Promise resolver with the result data
                            //  returned in the message event (if there is
                            //  result data).
                            data = JSON.parse(e.data);
                            if (TP.isValid(data)) {
                                return resolver(data.result);
                            }

                            //  No result data - so just call the resolver.
                            return resolver();
                        };

                        workerThread.onerror = function(e) {

                            var err;

                            //  Convert from an ErrorEvent into a real Error
                            //  object
                            err = new Error(e.message, e.filename, e.lineno);

                            //  Run the Promise rejector with the Error object
                            //  constructed from the data returned in the error
                            //  event.
                            return rejector(err);
                        };

                        workerThread.postMessage({
                            funcRef: name,      //  func ref in worker
                            thisRef: 'self',    //  this ref in worker
                            params: args,       //  params ref - JSONified
                                                //  structure
                            async: isAsync
                        });
                    });

                return newPromise;
            };

            //  Install that method on ourself.
            this.defineMethod(name, peerMethod);
        }.bind(this)).catch(
        function(err) {
            TP.ifError() ?
                TP.error('Error creating TP.core.Worker Promise: ' +
                            TP.str(err)) : 0;
        });

    return promise;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('repool',
function() {

    /**
     * @method repool
     * @summary Puts the receiver into the pool for its type.
     * @returns TP.core.Worker The receiver.
     */

    this.getType().repoolWorker(this);

    return this;
});

//  ========================================================================
//  TP.core.LESSWorker
//  ========================================================================

/**
 * @type {TP.core.LESSWorker}
 * @summary A subtype of TP.core.Worker that manages a LESSCSS engine.
 */

//  ------------------------------------------------------------------------

TP.core.Worker.defineSubtype('core.LESSWorker');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  used to 'initialize' the worker since LESSCSS makes some assumptions on
//  startup which are not valid for our environment (i.e. trying to process
//  LESS stylesheets found on the document - a web worker has no DOM environment
//  of any kind).
TP.core.LESSWorker.Type.defineConstant('SETUP_STRING',
'window = self; window.document = { getElementsByTagName: function(tagName) { if (tagName === "script") { return [{dataset: {async:true}}]; } else if (tagName === "style") { return []; } else if (tagName === "link") { return []; } } };');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.LESSWorker.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Initializes the type.
     */

    //  We allocate a maximum of 2 workers in our pool to compile LESS.
    this.set('$maxWorkerCount', 2);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  a worker thread object used by this object to interface with the worker
//  thread.
TP.core.LESSWorker.Inst.defineAttribute('$workerIsSettingUp');

//  the Promise kept by this worker that will be used for chaining chunks of
//  asynchronous work together.
TP.core.LESSWorker.Inst.defineAttribute('$workerPromise');

//  ------------------------------------------------------------------------

TP.core.LESSWorker.Inst.defineMethod('compile',
function(srcText, options) {

    /**
     * @method compile
     * @summary Compiles the supplied LESS source text into regular CSS.
     * @param {String} srcText The LESS source text to compile.
     * @param {TP.core.Hash} options Options to the LESS engine. This is
     *     optional.
     * @returns Promise A promise that will resolve when the compilation is
     *     complete.
     */

    var opts,
        resultFunc,

        workerPromise;

    if (TP.isEmpty(srcText)) {
        return this.raise('InvalidString', 'Invalid LESSCSS source text');
    }

    if (TP.notEmpty(options)) {
        opts = options.asObject();
    } else {
        opts = {};
    }

    //  Define a Function that will process the result.
    resultFunc =
        function(results) {
            var error,
                output,
                resultOpts;

            error = results[0];
            output = results[1];
            resultOpts = results[2];

            if (TP.notEmpty(error)) {
                TP.ifError() ?
                    TP.error('Error processing LESSCSS: ' +
                        TP.str(error)) : 0;
                return;
            }

            return TP.hc('css', output.css,
                            'imports', output.imports,
                            'compilationOptions', TP.hc(resultOpts));
        };

    workerPromise = this.get('$workerPromise');

    //  If our worker isn't set up, do so and then call our 'compileLESS' method
    //  that will dispatch over into the worker.
    if (TP.notValid(workerPromise) &&
        TP.notTrue(this.get('$workerIsSettingUp'))) {

        //  Flip our flag so that we don't do this again. We only flip this to
        //  true once and don't flip it back so that the test above only
        //  succeeds once.
        this.set('$workerIsSettingUp', true);

        //  Evaluate the setup String, then import the copy of LESSCSS in the
        //  dependencies directory, then define a worker method that will
        //  'render' the LESSCSS code we hand to it (automagically sent over to
        //  the worker by this type).
        /* eslint-disable no-eval */
        workerPromise = this.eval(this.getType().SETUP_STRING).then(
        /* eslint-enable no-eval */
            function() {

                //  Import the LESS library
                return this.import(TP.uc('~lib_deps/less-tpi.min.js'));
            }.bind(this)).then(
            function() {

                //  Define the compilation 'worker method'. Note that worker
                //  methods actually get shipped over to the worker thread, so
                //  they can't contain TIBETisms. Also worker methods return a
                //  Promise, which we leverage below.

                /* eslint-disable no-undef,no-shadow */
                return this.defineWorkerMethod(
                        'compileLESS',
                        function(lessSrc, options, callback) {
                            var cb;

                            //  Define a callback that will return any error,
                            //  any result and the original options we hand it.
                            cb = function(err, res) {
                                callback(err, res, options);
                            };

                            window.less.render(lessSrc, options, cb);
                        },
                        true);
                /* eslint-enable no-undef,no-shadow */
            }.bind(this)).then(
            function() {
                //  Then run the compilation 'worker method'.
                return this.compileLESS(srcText, opts).
                                    then(function(results) {

                                        //  After this is executed, the worker
                                        //  is no longer setting up.
                                        this.set('$workerIsSettingUp', false);

                                        //  Return the worker to the pool when
                                        //  we're done, and make sure to pass
                                        //  along the results to the result
                                        //  function.
                                        this.repool();

                                        return results;
                                    }.bind(this)).then(resultFunc);
            }.bind(this)).catch(
            function(err) {
                TP.ifError() ?
                    TP.error('Error creating TP.core.Worker Promise: ' +
                                TP.str(err)) : 0;
            });

    } else {

        //  Otherwise, the worker is set up - just run the compilation 'worker
        //  method'.
        workerPromise = workerPromise.then(
                function() {

                    return this.compileLESS(srcText, opts).
                                    then(function(results) {

                                        //  Return the worker to the pool when
                                        //  we're done, and make sure to pass
                                        //  along the results to the result
                                        //  function.
                                        this.repool();

                                        return results;
                                    }.bind(this)).then(resultFunc);
                }.bind(this)).catch(
                function(err) {
                    TP.ifError() ?
                        TP.error('Error creating TP.core.Worker Promise: ' +
                                    TP.str(err)) : 0;
                });
    }

    //  Capture the worker Promise so that we can continue to chain onto it.
    this.set('$workerPromise', workerPromise);

    //  If the current worker count is equal to our max worker count, we repool
    //  ourselves as we're the last worker available, but we do have the
    //  capability to continue chaining onto the worker Promise.
    if (this.getType().get('$currentWorkerCount') ===
        this.getType().get('$maxWorkerCount')) {
        this.repool();
    }

    //  Return the worker Promise so that more things can be chained onto it.
    return workerPromise;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
