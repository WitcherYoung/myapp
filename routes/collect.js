var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "",
    sqlInsert = "",
    sqlUpdate = "",
    params = {
        name: null,
        isCollected: null,
        newsType: null,
        articleId: null,
    },
    table = {
        name: null,
        colName: null
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
    return "select iscollect isCollected from " + tableName + " where " + colName + " = '" + articleId + "' and Uid = (select Uid from Users where Uusername = '" + userName + "');";
}

function sqlStrUpdateFn(tableName, userName, isCollected, articleId) {
    // update U_N set iscollect = 1 where Uid = (select Uid from Users where Uusername = 'yemu') and Nid = '1'
    return "update " + tableName + " set iscollect = " + isCollected + 
    " where Uid = (select Uid from Users where Uusername = '" + userName + 
    "') and Nid = '" + articleId +"'"; 
}

function sqlStrInsertFn(tableName, colName, userName, articleId, isCollected) {
    // INSERT INTO U_N (Uid, Nid, time, iscollect, isgood) VALUES ((select Uid from Users where Uusername = 'yemu'), 2, '15:42:14', 1, null);
    let date = new Date(), time = null;
    time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return "INSERT INTO " + tableName + " (Uid, " + colName + ", time, iscollect, isgood) VALUES ((select Uid from Users where Uusername = '" + 
    userName + "'), " + articleId + ", '" + time + "', " + isCollected + ", " + null + ")";
}

function collectRouter(req, res, next) {
    // console.log(req.body);		// post请求参数
    try {
        params.name = req.body.name;
        params.isCollected = req.body.isCollected == "" ? params.isCollected : req.body.isCollected;
        params.newsType = parseInt(req.body.newsType);
        params.articleId = parseInt(req.body.articleId);
        switch (params.newsType) {
            case 1:
                table.name = "U_N";
                table.colName = "Nid";
                break;
            case 2:
                table.name = "U_F";
                table.colName = "Fid";
                break;
            case 3:
                table.name = "U_A";
                table.colName = "Aid";
                break;
            case 4:
                table.name = "U_D";
                table.colName = "Did";
                break;
            default:
                throw {
                    errCode: 400,
                    errMsg: "params.newsType is required"
                }
        }
        console.log(params);
        sql = sqlStrFn(table.name, table.colName, params.name, params.articleId);
        db.sql(sql, function (err, result) {
            if (err) {
                console.error(err);
                res.json(errData);
                return;
            }
            if (result.recordset.length) {
                // 用户进行过收藏操作 根据 params.isCollected 来判断页面加载和更新数据
                if (params.isCollected) {
                    // 更新数据
                    sqlUpdate = sqlStrUpdateFn(table.name, params.name, params.isCollected, params.articleId)
                    // console.log(sqlUpdate);
                    // 更新数据, 回调函数中再次查询返回结果
                    db.sql(sqlUpdate, function (err, result) {
                        if (err) {
                            console.error(err);
                            res.json(errData);
                            return;
                        }
                        // 查询结果返回
                        db.sql(sql, function (err, result) {
                            if(result.recordset.length) {
                                data.data.collectedLiked = result.recordset[0].isCollected;
                            }else {
                                throw {
                                    errCode: 500,
                                    errMsg: "Target data query error"
                                }
                            }
                            res.json(data);
                        })
                    })
                }
            } else {
                // 用户未进行过收藏操作 sqlStrInsertFn(tableName, colName, userName, articleId, isCollected)
                sqlInsert = sqlStrInsertFn(table.name, table.colName, params.name, params.articleId, params.isCollected);
                console.log(sqlInsert);
                // 插入数据, 回调函数中再次查询返回结果
                db.sql(sqlInsert, function (err, result) {
                    if (err) {
                        console.error(err);
                        res.json(errData);
                        return;
                    }
                    // 查询结果返回
                    db.sql(sql, function (err, result) {
                        if(result.recordset.length) {
                            data.data.collectedLiked = result.recordset[0].isCollected;
                        }else {
                            throw {
                                errCode: 500,
                                errMsg: "Target data query error"
                            }
                        }
                        res.json(data);
                    })
                })
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

module.exports = collectRouter;