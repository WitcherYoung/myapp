var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var pageSize = 10, 
	sql = "", 
	newsSqlStr = "Nimage_url img,Ntitle title,Ntype tag,Ntime time,Ncontent summary,Ngoods liked", 
	foodSqlStr = "Nimage_url img,Ntitle title,Ntype tag,Ntime time,Ncontent summary,Ngoods liked", 
	playSqlStr = "Nimage_url img,Ntitle title,Ntype tag,Ntime time,Ncontent summary,Ngoods liked", 
	funSqlStr = "Nimage_url img,Ntitle title,Ntype tag,Ntime time,Ncontent summary,Ngoods liked";
var params = {
	newsType: null,
}
var data = {
	ret_code: 200,
	data: {},
	isSuccess: true,
	ret_msg: "请求成功"
}
var errData = {
	ret_code: null,
	err_msg: null,
	isSuccess: true,
	ret_msg: "请求失败"
}

// 分页查询
// select top 10 * from News where Nid not in
// (
//  --40是这么计算出来的：10*(5-1)
//  select top 40 Nid from News order by cast(Nid as int)
// )
// order by cast(Nid as int); 


function sqlStrFn(pageNum, tableName, colName) {
	return "select top " + pageSize + " " + newsSqlStr + " from " + tableName + " where " + colName + 
		   " not in( select top " + pageSize * pageNum + " " + colName + " from " + tableName + " order by cast(" + colName + 
		   " as int) ) order by cast(" + colName + " as int); "
}

// newsType; 1资讯
router.get('/', function (req, res, next) {
	try {
		params.newsType = parseInt(req.query.newsType);
		params.pageNum = parseInt(req.query.pageNum);
		switch (params.newsType) {
			case 1:
				sql = sqlStrFn(params.pageNum, "News", "Nid");
				break;
			default:
				throw {
					errCode: 400,
					errMsg: "params.newsType is required"
				}
		}
		db.sql(sql, function (err, result) {
			if (err) {
				console.log(err);
				return;
			}
			data.data.news = result.recordset;
			// 去除换行符和多余空格
			data.data.news.forEach((item, index, array) => {
				array[index].summary = array[index].summary.replace(/(<br[^>]*>|\s*)/g, "");
				array[index].summary.trim();
				array[index].img = 'http://localhost:3000/public/' + array[index].img;
			});
			res.json(data);
			console.log('查询到记录总数为 :', result.recordset.length);
		});
	} catch (error) {
		console.error(error)
		if (error.errCode) {
			errData.ret_code = error.errCode;
			errData.err_msg = error.errMsg;
			res.json(errData);
		}
	}
});

module.exports = router;