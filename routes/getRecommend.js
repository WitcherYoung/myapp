var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var index,
    sql = "",
    sqlGetTags = "",
    tagArr = [], 
    param = {
        username: ""
    };

var data = {
	ret_code: 200,
	data: {},
	isSuccess: true,
	ret_msg: "请求成功"
}

function sqlGetTagsFn(username) {
    return "select Tname_str from U_Tags where Uid = (select Uid from Users where Uusername = '" + username + "');";
}

function sqlFn(tagVal) {
    return "select Nid id, Nimage_url img,Ntitle title,Ntype tag, cast(Ntime as varchar) time,Ncontent summary,Ngoods liked, type articleType, phone, address from News where Ntype = '" + tagVal + "'" + 
    "union all " + 
    "select Fid id, Fimage_url img,Fname title, Ftype tag, cast(Ftime as varchar) time,Ffeature summary,Fgoods liked, type articleType,Fphone phone,Faddress address from Food where Ftype = '" + tagVal + "'" + 
    "union all " + 
    "select Aid id, Aimage_url img,Aname title, Atype tag, cast(Atime as varchar) time,Afeature summary,Agoods liked, type articleType, phone, address from Amuse where Atype = '" + tagVal + "'" + 
    "union all " + 
    "select Did id, Dimage_url img,Dtitle title,Dtype tag, cast(Dtime as varchar) time,Dcontent summary,Dgoods liked, type articleType, phone, address from Duanzi where Dtype = '" + tagVal + "'";
}

function selectFn(tags, res) {
    try{
        if(index == tags.length) {
            // console.log(index)
            index = 0;
            data.data.articleList.forEach((item, index, array) => {
                if(item.type == 1 || item.type == 4) {
                    array[index].summary = array[index].summary.replace(/(<br[^>]*>|\s*)/g, "");
                    array[index].summary.trim();
                }
                array[index].img = 'http://localhost:3000/public/' + array[index].img;
            });
            res.json(data);
        }else {
            sql = sqlFn(tags[index]);
            // console.log(sql)
            db.sql(sql, function (err, result) {
                if (err) {
                    console.error(err);
                    return;
                }
                if(index == 0) {
                    data.data.articleList = result.recordset;
                }else {
                    data.data.articleList = data.data.articleList.concat(result.recordset);
                }
                index++;
                selectFn(tags, res);
            });
        }
    }catch(err) {
        
    }
}

router.get('/', function (req, res, next) {
    // console.log(req.query)
    index = 0;
    param.username = req.query.username;
    sqlGetTags = sqlGetTagsFn(param.username);
    // console.log(sqlGetTags)
	db.sql(sqlGetTags, function (err, result) {
		if (err) {
			console.error(err);
			return;
        }
        tagArr = result.recordset[0].Tname_str.split("-");
        selectFn(tagArr, res);
		console.log('记录总数为 :', result.recordset.length);
	});
});

module.exports = router;