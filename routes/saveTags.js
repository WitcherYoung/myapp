var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "",
    sqlUpdate = "",
    sqlInsert = "",
    params = {
        name: null,
        chosenStr: null
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

function sqlFn(username) {
    return "select * from U_Tags where Uid = (select Uid from Users where Uusername = '" + username + "');";
}

function sqlUpdateFn(username, chosenStr) {
    return "update U_Tags set Tid_str = '" + chosenStr + "' where Uid = (select Uid from Users where Uusername = '" + username + "');";
}

function sqlInsertFn() {
    return "INSERT INTO U_Tags (Uid, Tid_str) VALUES ((select Uid from Users where Uusername = '" + username + "'), '" + chosenStr + "');";
}

function saveTagsRouter(req, res, next) {
    // console.log(req.body);		// post请求参数
    try {
        params.name = req.body.name;
        params.chosenStr = req.body.chosenStr;
        sql = sqlFn(params.name);
        db.sql(sql, function (err, result) {
            if (err) {
                console.error(err);
                throw {
                    errCode: 400,
                    errMsg: err
                };
            }
            console.log('selected 记录总数为 :', result.recordset.length);
            if(result.recordset.length) {
                // 用户操作过管理标签
                sqlUpdate = sqlUpdateFn(params.name, params.chosenStr);
                db.sql(sqlUpdate, function (err, result) {
                    if (err) {
                        console.error(err);
                        throw {
                            errCode: 400,
                            errMsg: err
                        };
                    }
                    res.json(data);
                });
            }else {
                // 用户还未操作过标签
                sqlInsert = sqlInsertFn(params.name, params.chosenStr);
                db.sql(sqlInsert, function (err, result) {
                    if (err) {
                        console.error(err);
                        throw {
                            errCode: 400,
                            errMsg: err
                        };
                    }
                    res.json(data);
                });
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
};

module.exports = saveTagsRouter;