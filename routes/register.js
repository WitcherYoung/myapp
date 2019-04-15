var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "",
    params = {
        username: null,
        pwd: null,
        name: null,
        mail: null,
        age: null,
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
        ret_msg: "用户名已存在"
    }

function sqlStrFn(username, pwd) {
    // console.log(username, pwd);
    return "select Uname name, Usex sex, Uimage_url image_url from Users where Uusername = '" + username + "' and Upassword = '" + pwd + "'";
}

function registerRouter(req, res, next) {
    console.log(req.body);		// post请求参数
    try {
        params.username = req.body.username;
        params.pwd = req.body.pwd;
        sql = sqlStrFn(params.username, params.pwd);
        db.sql(sql, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            if(result.recordset.length == 1) {
                data.data.userInfo = result.recordset[0];
                data.data.userInfo.image_url = 'http://localhost:3000/public/' + data.data.userInfo.image_url;
                res.json(data);
            }else {
                res.json(errData);
            }
            
        });
    } catch (error) {

    }
};

module.exports = registerRouter;