var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "", 
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

var params = {
        articleId: null,
        newsType: null,
        replyName: null,
        originName: null,
    }

var data = {
        ret_code: 200,
        data: {
            messageInfo: []
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

function sqlStrFn(params) {
    if(params.articleId != "" && params.newsType != "") {
        // 资讯详情页面进入查询全部评论
        // select * from Comments where articleId = '[1]' and newsType = '[1]'
        return "select * from Comments where articleId = '" + params.articleId + "' and newsType = '" + params.newsType + "';";
    }
    if(params.replyName != "") {
        // 我的评论
        // select * from Comments where replyUid = (select Uid from Users where Uusername = '[yemu]');
        return "select * from Comments where replyUid = (select Uid from Users where Uusername = '" + params.replyName + "');";
    }
    if(params.originName != "") {
        // 我的消息
        // select * from Comments where originUid = (select Uid from Users where Uusername = '[yemu]');
        return "select * from Comments where originUid = (select Uid from Users where Uusername = '" + params.originName + "');";
    }
}

router.get('/', function (req, res, next) {
    console.log("getComments");
    console.log(req.query);		// get请求参数
    try {
        params.articleId = req.query.newsId;
        params.newsType = req.query.newsType;
        params.replyName = req.query.replyName;
        params.originName = req.query.originName;
        sql = sqlStrFn(params);
        // console.log(sql);
        db.sql(sql, function (err, result) {
            if (err) {
                console.error(err);
                throw {
                    errCode: 400,
                    errMsg: err
                };
            }
            console.log('getComments记录总数为 :', result.recordset.length);
            data.data.messageInfo = result.recordset;
            data.data.messageInfo.forEach((item, index, arr) => {
                arr[index].originUserInfo = JSON.parse(arr[index].originUserInfo);
                arr[index].replyUserInfo = JSON.parse(arr[index].replyUserInfo);
                if(!arr[index].originUserInfo) {
                    arr[index].originUserInfo = {
                        userName: null
                    }
                }
                arr[index].replyUserInfo.image_url = 'http://localhost:3000/public/' + arr[index].replyUserInfo.image_url;
            });
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
});

module.exports = router;

