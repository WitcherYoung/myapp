var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "", param = {
    name: null
}

var data = {
	ret_code: 200,
	data: {},
	isSuccess: true,
	ret_msg: "请求成功"
}

function sqlFn(name) {
    return "select Uname name, Upassword pwd, Uage age, Usex sex, Umail mail from Users where Uname = '" + name + "';"
}

router.get('/', function (req, res, next) {
    // console.log(req.query)
    param.name = req.query.name;
    sql = sqlFn(param.name);
	db.sql(sql, function (err, result) {
		if (err) {
			console.error(err);
			return;
		}
		data.data.userInfo = result.recordset[0];
		res.json(data);
		console.log('记录总数为 :', result.recordset.length);
	});
});

module.exports = router;