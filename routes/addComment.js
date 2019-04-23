var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql="", sqlArticleTitle="", params = { 
    articleId: null,
    articleTitle: null,
    newsType: null,
    replyName: null,
    originName: null,
    commentTime: null,
    commentOrigin: null,
    commentReply: null,
    replyUserInfo: null,
    originUserInfo: null
}

var data = {
	ret_code: 200,
	data: {},
	isSuccess: true,
	ret_msg: "请求成功"
}

function sqlTitleFn(params) {
    let str = "";
    switch(parseInt(params.newsType)) {
        case 1:
            str = "select Ntitle title from News where Nid = '" + params.articleId + "';"
			break;
		case 2:
            str = "select Ftitle title from Food where Fid = '" + params.articleId + "';"
			break;
		case 3:
            str = "select Atitle title from Amuse where Aid = '" + params.articleId + "';"
			break;
		case 4:
            str = "select Dtitle title from Duanzi where Did = '" + params.articleId + "';"
			break;
		default:
			throw {
				errCode: 400,
				errMsg: "params.newsType is required"
			}
    }
    return str
}

function sqlFn(params) {
    let originUidStr = null, commentOriginStr = null, originUserInfoStr = params.originUserInfo;
    if(params.originName) {
        originUidStr = "(select Uid from Users where Uusername = '" + params.originName + "')";
    }
    if(params.commentOrigin) {
        commentOriginStr = "'" + params.commentOrigin + "'";
    }
    if(params.originUserInfo) {
        originUserInfoStr = "'" + params.originUserInfo + "'";
    }
    // INSERT INTO Comments (articleId, newsType, commentTime, originUid, replyUid, commentOrigin, commentReply, originUserInfo, replyUserInfo) VALUES 
    // ([1], [1], [(select Uid from Users where Uusername = 'yemu')], 
    // [(select Uid from Users where Uusername = 'yemu1')], '[2019-4-23 10:10:16]', [null], '[测试commentReply]', '[replyUserInfo]', '[originUserInfo]');
    return "INSERT INTO Comments (articleId, articleTitle, newsType, commentTime, originUid, replyUid, commentOrigin, commentReply, originUserInfo, replyUserInfo) VALUES (" + 
    params.articleId + ", '"+
    params.articleTitle + "', " + 
    params.newsType + ", '" + 
    params.commentTime + "', " + 
    originUidStr + ", " + "(select Uid from Users where Uusername = '" + 
    params.replyName + "'), " + 
    commentOriginStr + ", '" + 
    params.commentReply + "', " + 
    originUserInfoStr + ", '" + 
    params.replyUserInfo + "');";
}

function postTestRouter(req, res, next) {
    // console.log(req.params);
    // console.log(req.query);
    // console.log(req.body);		// post请求参数
    params.articleId = req.body.articleId;
    params.newsType = req.body.newsType;
    params.replyName = req.body.replyName;
    params.originName = req.body.originName==""?null:req.body.originName;
    params.commentTime = req.body.commentTime;
    params.commentReply = req.body.commentReply;
    params.commentOrigin = req.body.commentOrigin==""?null:req.body.commentOrigin;
    params.replyUserInfo = req.body.replyUserInfo;
    params.originUserInfo = req.body.originUserInfo==""?null:req.body.originUserInfo;
    // 查询资讯标题
    sqlArticleTitle = sqlTitleFn(params);
    // console.log(sqlArticleTitle);
    db.sql(sqlArticleTitle, function (err, result) {
		if (err) {
			console.error(err);
			return;
        }
        // console.log(result.recordset[0].title);
        params.articleTitle = result.recordset[0].title;
        sql = sqlFn(params);
        console.log(sql);
        db.sql(sql, function (err, result) {
            if (err) {
                console.error(err);
                return;
            }
            // console.log(result);
            res.json(data);
        });
	});
};

module.exports = postTestRouter;

// articleId, articleTitle, newsType, commentTime, originUid, replyUid, commentOrigin, commentReply, originUserInfo, replyUserInfo
// id	            int	            Unchecked
// articleId	    varchar(20)	    Unchecked
// articleTitle	    varchar(200)	Unchecked
// newsType	        varchar(20) 	Unchecked
// commentTime	    datetime	    Unchecked
// originUid	    varchar(20)	    Checked
// replyUid	        varchar(20)	    Unchecked
// commentOrigin	varchar(200)	Checked
// commentReply	    varchar(200)	Unchecked
// originUserInfo	text	        Checked
// replyUserInfo	text	        Unchecked