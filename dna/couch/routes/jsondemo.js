var fs = require('fs');
var path = require('path');
var router = require('express').Router();

router.get('/jsondemo', function(req, res) {

    var str;

    str = fs.readFileSync(path.join(__dirname, './jsondemo.json'), 'utf8');

    res.json(str);
});

module.exports = router;
