var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var searchStr = "", sql = "";

var data = {
	ret_code: 200,
	data: {},
	isSuccess: true,
	ret_msg: "请求成功"
}

function sqlFn(str) {
    // select Nid id, Nimage_url img,Ntitle title,Ntype tag, cast(Ntime as varchar) time,Ncontent summary,Ngoods liked, type, phone, address from News where Ntitle LIKE '%花开%'
    // union all
    // select Fid id, Fimage_url img,Fname title, Ftype tag, cast(Ftime as varchar) time,Ffeature summary,Fgoods liked, type,Fphone phone,Faddress address from Food
    // union all
    // select Aid id, Aimage_url img,Aname title, Atype tag, cast(Atime as varchar) time,Afeature summary,Agoods liked, type, phone, address from Amuse
    // union all
    // select Did id, Dimage_url img,Dtitle title,Dtype tag, cast(Dtime as varchar) time,Dcontent summary,Dgoods liked, type, phone, address from Duanzi
    return "select Nid id, Nimage_url img,Ntitle title,Ntype tag, cast(Ntime as varchar) time,Ncontent summary,Ngoods liked, type articleType, phone, address from News where Ntitle LIKE '%" + str + "%'"+
    "union all "+
    "select Fid id, Fimage_url img,Fname title, Ftype tag, cast(Ftime as varchar) time,Ffeature summary,Fgoods liked, type articleType,Fphone phone,Faddress address from Food where Fname LIKE '%" + str + "%'"+
    "union all "+
    "select Aid id, Aimage_url img,Aname title, Atype tag, cast(Atime as varchar) time,Afeature summary,Agoods liked, type articleType, phone, address from Amuse where Aname LIKE '%" + str + "%'"+
    "union all "+
    "select Did id, Dimage_url img,Dtitle title,Dtype tag, cast(Dtime as varchar) time,Dcontent summary,Dgoods liked, type articleType, phone, address from Duanzi where Dtitle LIKE '%" + str + "%'"
}

router.get('/', function (req, res, next) {
    // console.log(req.query)
    searchStr = req.query.searchStr;
    sql = sqlFn(searchStr);
    // console.log(sql);
	db.sql(sql, function (err, result) {
		if (err) {
			console.error(err);
			return;
        }
        data.data.articleList = result.recordset;
        data.data.articleList.forEach((item, index, array) => {
            if(item.type == 1 || item.type == 4) {
                array[index].summary = array[index].summary.replace(/(<br[^>]*>|\s*)/g, "");
                array[index].summary.trim();
            }
            array[index].img = 'http://localhost:3000/public/' + array[index].img;
        });
		res.json(data);
		console.log('记录总数为 :', result.recordset.length);
	});
});

module.exports = router;