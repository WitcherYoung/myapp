var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "", param = {
    username: null,
    colType: null,
    colValue: null
}

var data = {
    ret_code: 200,
    data: {},
    isSuccess: true,
    ret_msg: "请求成功"
}

function sqlFn(param) {
    let colName = null, colValue = null;
    switch(parseInt(param.colType)) {
        case 1: 
        // 用户名
            colName = "Uname";
            colValue = param.colValue;
            break
        case 2: 
        // 密码
            colName = "Upassword";
            colValue = param.colValue;
            break
        case 3: 
        // 年龄
            colName = "Uage";
            colValue = param.colValue;
            break
        case 4: 
        // 性别
            colName = "Usex";
            colValue = param.colValue?param.colValue:"男";
            break
        case 5: 
        // 邮箱
            colName = "Umail";
            colValue = param.colValue;
            break
        default:
            throw {
                errCode: 500,
                errMsg: "type query error"
            }
    }
    return "update Users set " + colName + " = '" + colValue + "' where Uusername = '" + param.username + "';"
}

function postTestRouter(req, res, next) {
    // console.log(req.params);
    // console.log(req.query);
    console.log(req.body);		// post请求参数
    try{
        param.username = req.body.username;
        param.colType = req.body.type;
        param.colValue = req.body.value;
        sql = sqlFn(param);
        console.log(sql);
        db.sql(sql, function (err, result) {
        	if (err) {
        		console.error(err);
        		return;
        	}
        	res.json(data);
        	console.log("修改成功");
        });
    }catch(error) {
        console.error(error)
        if (error.errCode) {
            errData.ret_code = error.errCode;
            errData.err_msg = error.errMsg;
            res.json(errData);
        }
    }
}

module.exports = postTestRouter;