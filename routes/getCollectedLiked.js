var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "",
    params = {
        name: null,
        newsType: null,
        articleId: null
    };

var data = {
        ret_code: 200,
        data: {},
        isSuccess: true,
        ret_msg: "请求成功"
    },
    errData = {
        ret_code: 400,
        data: null,
        isSuccess: true,
        ret_msg: "请求失败"
    }

function sqlStrFn(tableName, colName, userName, articleId) {
    // select iscollect isCollected from U_N where Nid = '1' and Uid = (select Uid from Users where Uusername = 'yemu');
    return "select iscollect isCollected, isgood isLiked from " + tableName + " where " + colName + " = '" + articleId + "' and Uid = (select Uid from Users where Uusername = '" + userName + "');";
}

function collectedLikedRouter(req, res, next) {
    // console.log(req.query);		// post请求参数
    try {
        params.name = req.query.name;
        params.newsType = parseInt(req.query.newsType);
        params.articleId = parseInt(req.query.articleId);
        // console.log(params);
        switch (params.newsType) {
			case 1:
				sql = sqlStrFn("U_N", "Nid", params.name, params.articleId);
				break;
			case 2:
				sql = sqlStrFn("U_F", "Fid", params.name, params.articleId);
				break;
			case 3:
				sql = sqlStrFn("U_A", "Aid", params.name, params.articleId);
				break;
			case 4:
				sql = sqlStrFn("U_D", "Did", params.name, params.articleId);
				break;
			default:
				throw {
					errCode: 400,
					errMsg: "params.newsType is required"
				}
        }
        // console.log(sql);
        db.sql(sql, function (err, result) {
            if (err) {
                console.error(err);
                res.json(errData);
                return;
            }
            // console.log(result);
            if(result.recordset.length) {
                data.data.collectedLiked = result.recordset[0];
            }else {
                data.data.collectedLiked = null;
            }
            res.json(data);
        });
    } catch (error) {
        console.error(error)
		if (error.errCode) {
			errData.ret_code = error.errCode;
			errData.err_msg = error.errMsg;
			res.json(errData);
		}
    }
};

module.exports = collectedLikedRouter;