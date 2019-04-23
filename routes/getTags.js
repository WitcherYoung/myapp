var express = require('express');
var sql = require('mssql')
var router = express.Router();
/* GET home page. */
var myExpress = express();
var db = require('../utils/db.js');

var sqlNotSelected = "",
    sqlSelected = "";

var data = {
        ret_code: 200,
        data: {
            notSelected: [],
            selected: []
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

function SqlNotSelectedFn() {
    // select * from Tags where Tid not in (select Tid from U_Tags where Uid = '1')
    // return "select Tid 'key', Tname label from Tags where Tid not in (select Tid from U_Tags where Uid = (" + "select Uid from Users where Uusername = '" + username + "'));";
    return "select Tid 'key', Tname label from Tags"
}

function SqlSelectedFn(username) {
    // select * from Tags where Tid not in (select Tid from U_Tags where Uid = '1')
    // return "select Tid 'key', Tname label from Tags where Tid in (select Tid from U_Tags where Uid = (" + "select Uid from Users where Uusername = '" + username + "'));";
    return "select Tid_str from U_Tags where Uid = (select Uid from Users where Uusername = '" + username + "');"
}

router.get('/', function (req, res, next) {
    // console.log(req.query);		// get请求参数
    try {
        params.name = req.query.name;
        sqlNotSelected = SqlNotSelectedFn();
        // console.log(sqlNotSelected);
        db.sql(sqlNotSelected, function (err, result) {
            if (err) {
                console.error(err);
                throw {
					errCode: 400,
					errMsg: err
				} ;
            }
            data.data.notSelected = result.recordset;
            console.log('notSelected 记录总数为 :', result.recordset.length);
            sqlSelected = SqlSelectedFn(params.name);
            // console.log(sqlSelected);
            db.sql(sqlSelected, function (err, result) {
                if (err) {
                    console.error(err);
                    throw {
                        errCode: 400,
                        errMsg: err
                    };
                }
                // console.log(result.recordset[0].Tid_str.split("-"))  ["1", "3"]
                let selectedArr = result.recordset[0].Tid_str.split("-");
                data.data.selected = selectedArr.map(item => {
                    return parseInt(item);
                });
                res.json(data);
                console.log('selected 记录总数为 :', result.recordset.length);
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