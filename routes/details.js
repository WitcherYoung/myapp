var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var	sql = "", 
	newsSqlStr = "Nid id, Nimage_url img,Ntitle title,Ntype tag,Ntime time,Ncontent summary,Ngoods liked", 
	foodSqlStr = "Fid id, Fimage_url img,Fname title,Ftype tag,Ftime time,Ffeature summary,Fgoods liked,Fphone phone,Faddress address", 
	playSqlStr = "Aid id, Aimage_url img,Aname title,Atype tag,Atime time,Afeature summary,Agoods liked,Aphone phone,Aaddress address", 
	funSqlStr = "Did id, Dimage_url img,Dtitle title,Dtype tag,Dtime time,Dcontent summary,Dgoods liked";
var params = {
	newsType: null,
	filterType: null,
	pageNum: null,
}
var data = {
		ret_code: 200,
		data: {},
		isSuccess: true,
		ret_msg: "请求成功"
	},
	errData = {
		ret_code: null,
		err_msg: null,
		isSuccess: true,
		ret_msg: "请求失败"
	}

function sqlStrFn(sqlStr, tableName, colName, newsId) {
	return "select " + sqlStr + " from " + tableName + " where " + colName + " = '" + newsId + "';"
}

// newsType; 1资讯 2没美食 3游玩 4趣事
router.get('/', function (req, res, next) {
	try {
		params.newsType = parseInt(req.query.newsType);
		// params.filterType = parseInt(req.query.filterType);
		params.newsId = parseInt(req.query.newsId);
		switch (params.newsType) {
			case 1:
				sql = sqlStrFn(newsSqlStr, "News", "Nid", params.newsId);
				break;
			case 2:
				sql = sqlStrFn(foodSqlStr, "Food", "Fid", params.newsId);
				break;
			case 3:
				sql = sqlStrFn(playSqlStr, "Amuse", "Aid", params.newsId);
				break;
			case 4:
				sql = sqlStrFn(funSqlStr, "Duanzi", "Did", params.newsId);
				break;
			default:
				throw {
					errCode: 400,
					errMsg: "params.newsType is required"
				}
		}
		db.sql(sql, function (err, result) {
			if (err) {
				console.error(err);
				return;
            }
            if(result.recordset[0]) {
                data.data.article = result.recordset[0];
                // 去除换行符和多余空格
                if(params.newsType ==1 || params.newsType ==4) {
                    let summaryArr = null;
                    data.data.article.summary.trim();
                    summaryArr = data.data.article.summary.split("<br/>");
                    summaryArr.forEach((item, index, array) => {
                        array[index] = "<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + item + "</span>"
                    });
                    data.data.article.summary = summaryArr.join("<br/>")
                }
                data.data.article.img = 'http://localhost:3000/public/' + data.data.article.img;
                res.json(data);
                console.log('查询到记录总数为 :', result.recordset.length);
            }else {
                errData.ret_code = 500;
                errData.err_msg = "获取资讯详情出错",
                res.json(errData);
            }
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