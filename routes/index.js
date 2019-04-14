var express = require('express');
var router = express.Router();

// req.params post请求全部参数
// req.query  get请求全部参数

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
});

module.exports = router;
