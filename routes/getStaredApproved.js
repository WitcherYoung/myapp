var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var i, sqlCollected = "", 
    params = {},
	collectSqlArr = [
        {
            sqlStr: "News.Nid id, Nimage_url img,Ntitle title,Ntype tag,Ntime time,Ncontent summary,Ngoods liked",
            targetTable: "U_N",
            targetCol: "Nid",
            sourceTable: "News",
        }, 
        {   
            sqlStr: "Duanzi.Did id, Dimage_url img,Dtitle title,Dtype tag,Dtime time,Dcontent summary,Dgoods liked",
            targetTable: "U_D",
            targetCol: "Did",
            sourceTable: "Duanzi",
        }, 
        {   
            sqlStr: "Food.Fid id, Fimage_url img,Fname title,Ftype tag,Ftime time,Ffeature summary,Fgoods liked,Fphone phone,Faddress address",
            targetTable: "U_F",
            targetCol: "Fid",
            sourceTable: "Food",
        }, 
        {   
            sqlStr: "Amuse.Aid id, Aimage_url img,Aname title,Atype tag,Atime time,Afeature summary,Agoods liked,Aphone phone,Aaddress address",
            targetTable: "U_A",
            targetCol: "Aid",
            sourceTable: "Amuse",
        }
    ];

var data = {
        ret_code: 200,
        data: {
            articleList: []
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

function SqlStatementFn() {
    if(!i || i>3) {
        i = 0;
    }
    sqlCollected = SqlCollectedFn(collectSqlArr[i], params.name, params.conditionCol)
    // console.log(sqlCollected);
    i++;
}

function SqlCollectedFn(paramObj, username, conditionCol) {
    // select [News.Nid id,Nimage_url img,Ntitle title,Ntype tag,Ntime time,Ncontent summary,Ngoods liked] from [News],[U_N] where [News].[Nid] 
    // = [U_N].[Nid] and [U_N].Uid =  (select Uid from Users where Uusername = '[yemu]
    // ') and [U_N].[iscollect]/[isgood] = 'true';
    return "select " + paramObj.sqlStr + " from " + paramObj.sourceTable + "," + paramObj.targetTable + " where " + paramObj.sourceTable + "." + paramObj.targetCol + 
    " = " + paramObj.targetTable + "." + paramObj.targetCol + " and " + paramObj.targetTable + ".Uid = (select Uid from Users where Uusername = '" + username + 
    "') and " + paramObj.targetTable + "." + conditionCol + " = 'true';";
}

router.get('/', function (req, res, next) {
    console.log(req.query);		// get请求参数
    try {
        let articleList1_4 = [], articleList2_3 =[];
        params.name = req.query.name;
        // 0: iscollect 1: isgood
        params.conditionCol = req.query.conditionCol == 1?"isgood":"iscollect";
        SqlStatementFn();
        // console.log(sqlCollected);
        // U_N News
        db.sql(sqlCollected, function (err, result) {
            if (err) {
                console.error(err);
                throw {
					errCode: 400,
					errMsg: err
                } ;
            }
            result.recordset.forEach((item, index, array) => {
                array[index].articleType = 1;
            });
            articleList1_4 = result.recordset;
            SqlStatementFn(sqlCollected);
            // console.log(sqlCollected);
            // U_D Duanzi
            db.sql(sqlCollected, function (err, result) {
                if (err) {
                    console.error(err);
                    throw {
                        errCode: 400,
                        errMsg: err
                    };
                }
                result.recordset.forEach((item, index, array) => {
                    array[index].articleType = 4;
                });
                articleList1_4 = articleList1_4.concat(result.recordset);
                articleList1_4.forEach((item, index, array) => {
                    array[index].summary = array[index].summary.replace(/(<br[^>]*>|\s*)/g, "");
                    array[index].summary.trim();
                    array[index].img = 'http://localhost:3000/public/' + array[index].img;
                });
                SqlStatementFn(sqlCollected);
                // console.log(sqlCollected);
                // U_F Food
                db.sql(sqlCollected, function (err, result) {
                    if (err) {
                        console.error(err);
                        throw {
                            errCode: 400,
                            errMsg: err
                        };
                    }
                    result.recordset.forEach((item, index, array) => {
                        array[index].articleType = 2;
                    });
                    articleList2_3 = result.recordset;
                    SqlStatementFn(sqlCollected);
                    // console.log(sqlCollected);
                    // U_A Amuse
                    db.sql(sqlCollected, function (err, result) {
                        if (err) {
                            console.error(err);
                            throw {
                                errCode: 400,
                                errMsg: err
                            };
                        }
                        result.recordset.forEach((item, index, array) => {
                            array[index].articleType = 3;
                        });
                        articleList2_3 = articleList2_3.concat(result.recordset);
                        data.data.articleList.forEach((item, index, array) => {
                            array[index].img = 'http://localhost:3000/public/' + array[index].img;
                        });
                        data.data.articleList = articleList1_4.concat(articleList2_3);
                        // console.log('articleList 记录总数为 :', data.data.articleList.length);
                        res.json(data);
                    });
                });
            });
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