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
        sex: null,
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

function selectSqlStrFn(username, pwd) {
    // console.log(username, pwd);
    return "select * from Users where Uusername = '" + username + "'";
}

function selectUidFn() {
    // console.log(username, pwd);
    return "select * from Users ";
}

function insertSqlStrFn(uid, params) {
    // console.log(uid, params);
    let image_url = params.sex?"img/User/female.jpg":"img/User/male.jpg"
    let age = params.age?params.age:null;
    // "INSERT INTO Users (列1, 列2,...) VALUES (值1, 值2,....)"
    return "INSERT INTO Users (Uid, Uusername, Upassword, Uname, Umail, Uage, Usex, Uimage_url, Ustandard) VALUES (" 
    + uid + ", '" + params.username + "', '" + params.pwd + "', '" + params.name + "', '" 
    + params.mail + "', " + age + ", '" + params.sex + "', '"
    + image_url +"', " + null + ")";
}

function registerRouter(req, res, next) {
    // console.log(req.body);		// post请求参数
    try {
        params.username = req.body.username;
        params.pwd = req.body.pwd;
        if(req.body.name) {
            params.name = req.body.name;
        }else {
            params.name = req.body.username;
        }
        params.age = req.body.age;
        params.sex = req.body.sex;
        params.mail = req.body.mail;
        sql = selectSqlStrFn(params.username, params.pwd);
        db.sql(sql, function (err, result) {
            if (err) {
                console.log(err);
                return res.json(errData);
            }
            if(result.recordset.length == 1) {
                // 已注册
                res.json(errData);
            }else {
                // 未注册, 将注册数据插入到数据库
                sql = selectUidFn();
                db.sql(sql, function (err, result) {
                    if (err) {
                        console.log(err);
                        return res.json(errData);
                    }
                    let uid = result.recordset.length;  // 计算Uid值
                    // console.log("uid ", uid);
                    sql = insertSqlStrFn(uid, params);  // insert语句
                    // console.log("insertSqlStrFn ", sql);
                    db.sql(sql, function (err, result) {
                        if (err) {
                            console.log(err);
                            return res.json(errData);
                        }
                        // console.log(result.rowsAffected);
                        if(result.rowsAffected) {
                            data.data.rowsAffected = result.rowsAffected.length;
                            data.ret_msg = "注册成功";
                            res.json(data);
                        }else {
                            data.data.rowsAffected = null;
                            data.ret_msg = "注册失败";
                            res.json(data);
                        }
                    });
                });
            }
        });
    } catch (error) {

    }
};

module.exports = registerRouter;