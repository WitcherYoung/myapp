var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sql = "",
    params = {
        newsType: null,
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
        ret_msg: "用户名密码错误"
    }

function sqlStrFn(username, pwd) {
    // console.log(username, pwd);
    return "select Uusername username, Uname name, Usex sex, Uimage_url image_url from Users where Uusername = '" + username + "' and Upassword = '" + pwd + "'";
}

function createRecommendView(username) {
    let viewSql = "", 
        viewSqlFrag = "", 
        viewSqlFinal = "", 
        tagSql = "", 
        tagArr=[], index = 0;
    function getTags() {
        return "select Tname_str from U_Tags where Uid = (select Uid from Users where Uusername = '" + username + "');";
    }
    function createViewData(tagVal) {
        return "select Nid id, Nimage_url img,Ntitle title,Ntype tag, cast(Ntime as varchar) time,Ncontent summary,Ngoods liked, type articleType, phone, address from News where Ntype = '" + tagVal + "'" + 
        " union all " + 
        "select Fid id, Fimage_url img,Fname title, Ftype tag, cast(Ftime as varchar) time,Ffeature summary,Fgoods liked, type articleType,Fphone phone,Faddress address from Food where Ftype = '" + tagVal + "'" + 
        " union all " + 
        "select Aid id, Aimage_url img,Aname title, Atype tag, cast(Atime as varchar) time,Afeature summary,Agoods liked, type articleType, phone, address from Amuse where Atype = '" + tagVal + "'" + 
        " union all " + 
        "select Did id, Dimage_url img,Dtitle title,Dtype tag, cast(Dtime as varchar) time,Dcontent summary,Dgoods liked, type articleType, phone, address from Duanzi where Dtype = '" + tagVal + "'";
    }
    function createView(viewData) {
        return "create view V_recommend_" + username +" as (" + viewData + ");"
    }
    function createViewAll() {
        // return create view V_recommend_yemu as 
        return "create view V_recommend_" + username +" as (" + "select Nid id, Nimage_url img,Ntitle title,Ntype tag, cast(Ntime as varchar) time,Ncontent summary,Ngoods liked, type articleType, phone, address from News" +
        " union all " +
        "select Fid id, Fimage_url img,Fname title, Ftype tag, cast(Ftime as varchar) time,Ffeature summary,Fgoods liked, type articleType,Fphone phone,Faddress address from Food" +
        " union all " +
        "select Aid id, Aimage_url img,Aname title, Atype tag, cast(Atime as varchar) time,Afeature summary,Agoods liked, type articleType, phone, address from Amuse" +
        " union all " +
        "select Did id, Dimage_url img,Dtitle title,Dtype tag, cast(Dtime as varchar) time,Dcontent summary,Dgoods liked, type articleType, phone, address from Duanzi);";
    }
    function createFn(tags) {
        // 创建用户推荐视图 逻辑 循环查询所有匹配的数据条目
        try {
            if(tags.length) {
                while(index<tags.length) {
                    viewSqlFrag = createViewData(tags[index]);
                    // console.log(sql)
                    if(index == 0) {
                        viewSql = viewSqlFrag; 
                    }else {
                        viewSql = viewSql + " union all " + viewSqlFrag;
                    }
                    // 数组索引++, 再次执行 createFn(tags), 循环拼接 viewSql 直至数组全部元素遍历
                    index++;
                }
                viewSqlFinal = createView(viewSql);
                // console.log(viewSqlFinal);
            }else {
                viewSqlFinal = createViewAll();
                console.log(viewSqlFinal);
            }
            db.sql(viewSqlFinal, function (err, result) {
                if (err) {
                    throw err;
                }
                console.log("用户推荐表生成成功")
            });
            index = 0;
        } catch (error) {
            console.log("创建用户推荐视图失败: ", error)
        }
    }

    // createRecommendView函数主体逻辑
    tagSql = getTags(username);
    // console.log(sqlGetTags)
	db.sql(tagSql, function (err, result) {
		if (err) {
			console.error(err);
			return;
        }
        console.log(result.recordset[0]);
        if(result.recordset[0]) {
            // 将用户关注标签字符串分割成数组
            tagArr = result.recordset[0].Tname_str.split("-");
        }else {
            tagArr = [];
        }
        // 传入标签数组 执行创建函数
        createFn(tagArr);
	});
}

function loginRouter(req, res, next) {
    // console.log(req.body);		// post请求参数
    try {
        params.username = req.body.username;
        params.pwd = req.body.pwd;
        sql = sqlStrFn(params.username, params.pwd);
        db.sql(sql, function (err, result) {
            if (err) {
                console.error(err);
                return;
            }
            if(result.recordset.length == 1) {
                data.data.userInfo = result.recordset[0];
                data.data.userInfo.source_url = data.data.userInfo.image_url;
                data.data.userInfo.image_url = 'http://localhost:3000/public/' + data.data.userInfo.image_url;
                res.json(data);
                createRecommendView(data.data.userInfo.username);
            }else {
                res.json(errData);
            }
            
        });
    } catch (error) {

    }
};

module.exports = loginRouter;