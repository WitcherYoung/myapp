var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 处理函数引入
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loadNewsRouter = require('./routes/loadNews');
// ---

var getTestRouter = require('./routes/getTest');
var postTestRouter = require('./routes/postTest');

var app = express();

// 使用静态资源文件
app.use(express.static('public'));
app.get('/public/img/*', function (req, res) {
  res.sendFile( __dirname + "/" + req.url );
  // console.log("Request for " + req.url + " received.");
})
app.get('/public/data:image/*', function (req, res) {
  res.sendFile( "./img/logo.png" );
})

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 接口响应路径
app.use('/', indexRouter);
app.use('/users', usersRouter);
 
app.use('/getTest', getTestRouter);
app.use('/postTest', postTestRouter);
app.use('/loadNews', loadNewsRouter);
// ---

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
