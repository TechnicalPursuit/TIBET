/**
 * @overview A sample development environment configuration file.
 */

//  When a raise is encountered we should launch the debugger by evaluating
//  a debugger keyword as our last step.
TP.sys.setcfg('debug.use_debugger', true);

TP.sys.setcfg('break.duplicate_attribute', true);
TP.sys.setcfg('break.duplicate_constant', true);
//TP.sys.setcfg('break.signal', true);
//TP.sys.setcfg('break.signal_notify', true);

//TP.sys.setcfg('break.awaken_content', true);
//TP.sys.setcfg('break.infer', true);
TP.sys.setcfg('break.dnu', true);
TP.sys.setcfg('break.unbound', true);
//TP.sys.setcfg('break.content_finalize',true);
//TP.sys.setcfg('break.content_process',true);
//TP.sys.setcfg('break.query_css', true);
//TP.sys.setcfg('break.tsh_cmd', true);
//TP.sys.setcfg('break.tsh_desugar', true);

//TP.sys.setcfg('break.page_init', true);
//TP.sys.setcfg('break.html_content', true);

TP.sys.setcfg('break.main', false);
//TP.sys.setcfg('break.document_loaded', true);
//TP.sys.setcfg('break.document_unloaded', true);

//TP.sys.setcfg('break.node_detachment', true);

TP.sys.setcfg('break.uri_content', false);
TP.sys.setcfg('break.uri_fragment', false);
TP.sys.setcfg('break.uri_load', false);
TP.sys.setcfg('break.uri_process', false);
TP.sys.setcfg('break.uri_resource', false);

// Preserve boot-time UI elements.
TP.sys.setcfg('boot.debugui', true);

//  set these so the boot log will include environment/configuration data
TP.sys.setcfg('boot.log_cfg', true);
TP.sys.setcfg('boot.log_env', true);

//  set to false to boot the application's code in one continuous sequence.
//  this can be useful to avoid dynamic loading issues with debuggers
TP.sys.setcfg('boot.twophase', true);

//  turn off content caching for now
TP.sys.setcfg('content.use_caches', false);

//  set logging to TRACE level so we see all potential messages being logged
TP.sys.setcfg('log.level', 0);

//  turn on logging for the CSS processor's various steps
TP.sys.setcfg('log.css_processing', true);

//  notify us about any inferencing that may be happening. particularly on
//  Firefox this can help find misnamed method calls etc since that browser
//  has a "universal backstop" in the form of __no_such_method__ hooks
TP.sys.setcfg('log.inferences', true);

//  during tag processing we want to log any null namespace data (typically
//  xforms instance content that's been inlined)
TP.sys.setcfg('log.null_namespaces', true);

//  logging signals is a key element of being able to observe what TIBET is
//  doing in response to keyboard and mouse activity by the user as well as
//  any events coming in from the IO layer. while we're at it log the stack.
TP.sys.setcfg('log.signals', false);
TP.sys.setcfg('log.signal_stack', true);

//  toggle this to log page processing/content transformation activity. very
//  useful when debugging a new tag type or a complex page that's not
//  working out as intended
TP.sys.setcfg('log.transforms', false);

//  log tsh operations
TP.sys.setcfg('log.tsh_tokenize', false);
TP.sys.setcfg('log.tsh_desugar', false);
TP.sys.setcfg('log.tsh_xmlify', false);
TP.sys.setcfg('log.tsh_execute', false);

TP.sys.setcfg('break.tsh_execute', false);
TP.sys.setcfg('break.tsh_pipe_adjust', false);
TP.sys.setcfg('break.tsh_pipe_connect', false);

TP.sys.setcfg('break.shell_execute', false);
TP.sys.setcfg('break.request_wrapup', false);

//  turn on/off retry of packaging
TP.sys.setcfg('pack.retry', false);

//  turn off content caches for now
TP.sys.setcfg('content.use_caches', false);

//  on mozilla in particular should we make explicit requests to acquire
//  privileges? normally false for production unless the application is
//  attempting file system or cross-domain access, but TIBET's tools often
//  make use of these features
TP.sys.setcfg('security.request_privileges', true);

TP.sys.setcfg('signal.dom_loaded', true);

//  set debugging and verbose reporting on so we get as much debugging data
//  as possible 
TP.sys.setcfg('tibet.$debug', true);
TP.sys.setcfg('tibet.$verbose', true);

//  temporarily check the version here
TP.sys.setcfg('path.lib_version_file', 'https://gist.github.com/raw/4651885');

//  check the version to make sure we're up to date
TP.sys.setcfg('tibet.check_version', true);

//  we enable the TDP environment by defining an activation key for it so
//  that using Alt-UpArrow (on key up) will bring up a TIBET Developer
//  Portal with TSH access.
TP.sys.setcfg('tibet.tdpkey', 'DOM_Alt_Up_Up');
//TP.sys.setcfg('tibet.tdpkey', 'DOM_Esc_Up');

//  css processor
TP.sys.setcfg('css.process_styles', false);
TP.sys.setcfg('break.css_processing', false);
