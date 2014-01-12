/**
 * @overview A common environment file. Entries you place here apply to
 *     all environments: production, test, and development. You should place
 *     environment-specific values in a file named for the desired enviroment
 *     (.e.g. development.js for development).
 */

// Ensure we use the tibetdir approach to computing root paths.
TP.sys.setcfg('boot.rootcomp', 'tibetdir');

//  ---
//  Sample data base parameters.
//  ---

TP.sys.setcfg('tibet.db_name', 'TIBET');
TP.sys.setcfg('tibet.db_version', '1.0');
TP.sys.setcfg('tibet.db_description', 'TIBET internal storage');
TP.sys.setcfg('tibet.db_size', 5000000);

