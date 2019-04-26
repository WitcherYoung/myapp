# myapp

> A Express project

## Build Setup

``` bash

# utils文件夹下的db.js为连接数据配置和执行sql文件
# 连接 SQL Server 2008 可将 SQL Server 配置管理器设置如下
# | SQL Server 网络配置
# |---- MSSQLSERVER的协议 
# |----- TCP/IP协议属性 
# |---------- IP地址选项卡
# |------------- IP2的IP地址 修改为 本机当前的IP地址
# 在db.js config中
# user, password 属性替换成本机连接数据库的 用户名密码
# server属性 替换成 当前IP地址
# 打开 SQL Server 服务器名称输入当前IP地址即可

# 安装依赖
# install dependencies
npm install

# serve with hot reload at localhost:3000 - 使用node开启本地服务
npm start 

# routes文件夹包含访问路由响应的函数

# app.js为Express项目的入口, 前端访问路由可被app.js捕获

```


For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
