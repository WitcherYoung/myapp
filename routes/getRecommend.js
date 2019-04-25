var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "",
    param = {
        username: ""
    };

var data = {
	ret_code: 200,
	data: {},
	isSuccess: true,
	ret_msg: "请求成功"
}

function sqlFn(username) {
    return "select top 15 * from V_recommend_" + username +" order by NEWID() ";
}

router.get('/', function (req, res, next) {
    // console.log(req.query)
    param.username = req.query.username;
    sql = sqlFn(param.username);
    // console.log(sqlGetTags)
	db.sql(sql, function (err, result) {
		if (err) {
			console.error(err);
			return;
        }
        data.data.articleList = result.recordset;
        data.data.articleList.forEach((item, index, array) => {
            if(item.type == 1 || item.type == 4) {
                array[index].summary = array[index].summary.replace(/(<br[^>]*>|\s*)/g, "");
                array[index].summary.trim();
            }
            array[index].img = 'http://localhost:3000/public/' + array[index].img;
        });
        res.json(data);
		console.log('记录总数为 :', result.recordset.length);
	});
});

module.exports = router;