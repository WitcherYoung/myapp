var mssql = require('mssql');
var db = {};
// 数据库配置连接字符串
var config = {
    user: 'sa',
    password: 'WEIzhe',
    server: '10.108.214.92',
    port: 1433,
    driver: 'msnodesql',
    database: 'recommendedsystem',
    connectionString: "Driver={SQL Server Native Client 11.0};Server=#{server}\\sql;Database=#{database};Uid=#{user};Pwd=#{password};",
    /*    options: { 
            encrypt: true // Use this if you're on Windows Azure 
        },*/
    pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 3000
    }
};

db.sql = function (sql, callBack) {
    var connection = new mssql.ConnectionPool(config, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        var ps = new mssql.PreparedStatement(connection);
        ps.prepare(sql, function (err) {
            if (err) {
                console.error(err);
                return;
            }
            ps.execute('', function (err, result) {
                if (err) {
                    console.error(err);
                    return;
                }

                ps.unprepare(function (err) {
                    if (err) {
                        console.error(err);
                        callback(err, null);
                        return;
                    }
                    callBack(err, result);
                });
            });
        });
    });
};

module.exports = db;
// ---------------------
// 作者：zx575645128 
// 来源：CSDN 
// 原文：https://blog.csdn.net/zx575645128/article/details/79107158 
// 版权声明：本文为博主原创文章，转载请附上博文链接！