var fs,
    path,
    router;

fs = require('fs');
path = require('path');
router = require('express').Router();

router.get('/login', function(req, res) {
    var str;

    str = fs.readFileSync(path.join(__dirname, './login_success.xhtml'), 'utf8');

    res.type('.xhtml');
    res.send(str);
});

module.exports = router;
