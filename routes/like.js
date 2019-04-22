var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "",
    sqlFinal = "",
    sqlInsert = "",
    sqlUpdate = "",
    sqlArticleGood = ""
    params = {
        name: null,
        isGood: null,
        newsType: null,
        articleId: null,
    },
    table = {
        name: null,         // 关联表名
        sourceName: null,   // 资讯表名
        colName: null,      // 关联表列名
        colSourceName: null // 资讯表列名
    };

var data = {
    ret_code: 200,
    data: {
        LikedInfo: {}
    },
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
    // select iscollect isGood from U_N where Nid = '1' and Uid = (select Uid from Users where Uusername = 'yemu');
    return "select iscollect isLiked from " + tableName + " where " + colName + " = '" + articleId + "' and Uid = (select Uid from Users where Uusername = '" + userName + "');";
}
// 查询文章点赞次数
function sqlStrFinalFn(tableName, tableSourceName, colName, colSourceName, userName, articleId) {
    // select isgood isLiked, [Ngoods] liked from [News], [U_N] where 
    // [News].[Nid] = [U_N].[Nid] and [U_N].[Nid] = '[1]
    // ' and [U_N].[Uid] = '1'
    return "select isgood isLiked, " + colSourceName + " liked from " + tableName + ", " + tableSourceName + " where " + 
    tableSourceName + "." + colName + " = " + tableName + "." + colName + " and " + tableName + "." + colName + " = '" + 
    articleId + "' and " + tableName + "." + "Uid = (select Uid from Users where Uusername = '" + userName + "');";
}
// 用户对文章是否点赞更新
function sqlStrUpdateFn(tableName, userName, isGood, articleId) {
    // update U_N set iscollect = 1 where Uid = (select Uid from Users where Uusername = 'yemu') and Nid = '1'
    return "update " + tableName + " set isgood = " + isGood + 
    " where Uid = (select Uid from Users where Uusername = '" + userName + 
    "') and Nid = '" + articleId +"'"; 
}

function sqlStrInsertFn(tableName, colName, userName, articleId, isGood) {
    // INSERT INTO U_N (Uid, Nid, time, iscollect, isgood) VALUES ((select Uid from Users where Uusername = 'yemu'), 2, '15:42:14', 1, null);
    let date = new Date(), time = null;
    time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return "INSERT INTO " + tableName + " (Uid, " + colName + ", time, iscollect, isgood) VALUES ((select Uid from Users where Uusername = '" + 
    userName + "'), " + articleId + ", '" + time + "', " + null + ", " + isGood + ")";
}
// 文章点赞次数更新
function sqlArticleGoodFn(tableName, tableSourceName, colName, colSourceName, articleId) {          
    // update News set Ngoods = (select COUNT(*) from U_N where Nid = '3' and iscollect = '1') where Nid = '3'                                                                                                                                                                                                        
    return "update " + tableSourceName + " set " + colSourceName + " = (select COUNT(*) from " + tableName + " where "
     + colName + " = '" + articleId + "' and isgood = '1') where " + colName + " = '" + articleId + "'"; 
}

function likeRouter(req, res, next) {
    // console.log(req.body);		// post请求参数
    try {
        params.name = req.body.name;
        params.isGood = req.body.isGood == "" ? params.isGood : req.body.isGood;
        params.newsType = parseInt(req.body.newsType);
        params.articleId = parseInt(req.body.articleId);
        switch (params.newsType) {
            case 1:
                table.name = "U_N";
                table.sourceName = "News";
                table.colName = "Nid";
                table.colSourceName = "Ngoods";
                break;
            case 2:
                table.name = "U_F";
                table.sourceName = "Food";
                table.colName = "Fid";
                table.colSourceName = "Fgoods";
                break;
            case 3:
                table.name = "U_A";
                table.sourceName = "Amuse";
                table.colName = "Aid";
                table.colSourceName = "Agoods";
                break;
            case 4:
                table.name = "U_D";
                table.sourceName = "Duanzi";
                table.colName = "Did";
                table.colSourceName = "Dgoods";
                break;
            default:
                throw {
                    errCode: 400,
                    errMsg: "params.newsType is required"
                }
        }
        sql = sqlStrFn(table.name, table.colName, params.name, params.articleId);
        // console.log(sql, " - sqlStrFn");
        db.sql(sql, function (err, result) {
            if (err) {
                console.error(err);
                res.json(errData);
                return;
            }
            if (result.recordset.length) {
                // 用户进行过收藏操作 根据 params.isGood 来判断页面加载和更新数据
                if (params.isGood) {
                    // 更新数据
                    sqlUpdate = sqlStrUpdateFn(table.name, params.name, params.isGood, params.articleId);
                    // console.log(sqlUpdate, " - sqlStrUpdateFn");
                    // 更新数据, 回调函数中再次查询返回结果
                    db.sql(sqlUpdate, function (err, result) {
                        if (err) {
                            console.error(err);
                            res.json(errData);
                            return;
                        }
                        // 资讯表中点赞数据更新
                        sqlArticleGood = sqlArticleGoodFn(table.name, table.sourceName, table.colName, table.colSourceName, params.articleId);
                        // console.log(sqlArticleGood, " - sqlArticleGoodFn");
                        db.sql(sqlArticleGood, function (err, result) {
                            if (err) {
                                console.error(err);
                                res.json(errData);
                                return;
                            }
                            sqlFinal = sqlStrFinalFn(table.name, table.sourceName, table.colName, table.colSourceName, params.name, params.articleId);
                            // console.log(sqlFinal, " - sqlStrFinalFn");
                            // 查询结果返回
                            db.sql(sqlFinal, function (err, result) {
                                if (err) {
                                    console.error(err);
                                    res.json(errData);
                                    return;
                                }
                                if(result.recordset.length) {
                                    data.data.LikedInfo.isLiked = result.recordset[0].isLiked;
                                    data.data.LikedInfo.likedCount = result.recordset[0].liked;
                                }else {
                                    throw {
                                        errCode: 500,
                                        errMsg: "Target data query error"
                                    }
                                }
                                res.json(data);
                            })
                        });
                    })
                }
            } else {
                // 用户未进行过收藏操作 insert  sqlStrInsertFn(tableName, colName, userName, articleId, isGood)
                sqlInsert = sqlStrInsertFn(table.name, table.colName, params.name, params.articleId, params.isGood);
                // console.log(sqlInsert, " - sqlStrInsertFn");
                // 插入数据, 回调函数中再次查询返回结果
                db.sql(sqlInsert, function (err, result) {
                    if (err) {
                        console.error(err);
                        res.json(errData);
                        return;
                    }
                    sqlFinal = sqlStrFinalFn(table.name, table.sourceName, table.colName, table.colSourceName, params.name, params.articleId);
                    // console.log(sqlFinal, " - sqlStrFinalFn");
                    // 查询结果返回
                    db.sql(sqlFinal, function (err, result) {
                        if(result.recordset.length) {
                            data.data.LikedInfo.isLiked = result.recordset[0].isLiked;
                            data.data.LikedInfo.likedCount = result.recordset[0].liked;
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

module.exports = likeRouter;