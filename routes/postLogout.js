var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql="",
	param = {
		username: null
	};

var data = {
	ret_code: 200,
	data: {},
	isSuccess: true,
	ret_msg: "请求成功"
}

function sqlFn(username) {
	return "drop view V_recommend_" + username + ";"
}

function postTestRouter(req, res, next) {
    // console.log(req.params);
    // console.log(req.query);
	console.log(req.body);		// post请求参数
	param.username = req.body.username;
	sql = sqlFn(param.username);
	db.sql(sql, function (err, result) {
		if (err) {
			console.error(err);
			return;
		}
		res.json(data);
		console.log("postTestRouter done");
	});
};

module.exports = postTestRouter;