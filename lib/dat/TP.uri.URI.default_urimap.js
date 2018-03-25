/**
 * Settings for default URI mappings.
 */

TP.sys.setcfg('uri.map.s3.pattern', 'http://s3.amazonaws.com.*');
TP.sys.setcfg('uri.map.s3.urihandler', 'TP.amazon.AmazonS3Handler');

TP.sys.setcfg('uri.map.sdb.pattern', 'https://sdb.amazonaws.com.*');
TP.sys.setcfg('uri.map.sdb.urihandler', 'TP.amazon.AmazonSimpleDBHandler');

TP.sys.setcfg('uri.map.sabredav.pattern', 'http://demo.sabredav.com');
TP.sys.setcfg('uri.map.sabredav.urihandler', 'TP.uri.WebDAVHandler');

TP.sys.setcfg('uri.map.ws.pattern', 'ws://.*:10081');
TP.sys.setcfg('uri.map.ws.urihandler', 'TP.test.WSEchoHandler');

TP.sys.setcfg('uri.map.googledocs.pattern', 'http://docs.google.com.*');
TP.sys.setcfg('uri.map.googledocs.urihandler', 'TP.google.GoogleDocsHandler');

TP.sys.setcfg('uri.map.googlesearch.pattern',
                'jsonp://ajax.googleapis.com/ajax/services/search/web');
TP.sys.setcfg('uri.map.googlesearch.contenttype', 'TP.google.GoogleSearchData');

TP.sys.setcfg('uri.map.couchdb.pattern', 'http://.*:5984[^\\?]*$');
TP.sys.setcfg('uri.map.couchdb.urihandler', 'TP.uri.CouchDBURLHandler');
TP.sys.setcfg('uri.map.couchdb.sherpa_inspector_handler', 'TP.sherpa.CouchTools');

TP.sys.setcfg('uri.map.couchnoext.pattern', 'http://.*:5984.*\\/[^.\\?]*$');
TP.sys.setcfg('uri.map.couchnoext.urihandler', 'TP.uri.CouchDBURLHandler');
TP.sys.setcfg('uri.map.couchnoext.contenttype', 'TP.core.JSONContent');

TP.sys.setcfg('uri.map.jsonp.pattern', 'jsonp://');
TP.sys.setcfg('uri.map.jsonp.contenttype', 'TP.core.JSONContent');

TP.sys.setcfg('uri.map.pouchdb.pattern', 'pouchdb://');
TP.sys.setcfg('uri.map.pouchdb.contenttype', 'TP.core.JSONContent');
