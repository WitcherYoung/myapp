var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var data = {
	ret_code: 200,
	data: {},
	isSuccess: true,
	ret_msg: "请求成功"
}

router.get('/', function (req, res, next) {
    console.log(req.params);
	db.sql('select * from Users', function (err, result) {
		if (err) {
			console.log(err);
			return;
		}
		data.data = result;
		res.json(data);
		console.log('记录总数为 :', result.length);
	});
});

module.exports = router;