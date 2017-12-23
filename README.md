# 环境

node ~6.10.0

mongodb ~3.4

# 部署步骤

1.安装和配置mongodb 下载地址：https://www.mongodb.com/download-center#atlas

  ## 配置

    启动数据库 mongod --dbpath=c:\mongodb\data\db --logpath=c:\mongodb\data\log\mongodb.log

    配置文件启动 mongod --config d:\mongodb\server\3.4\mongodb.config

    linux
    后台服务启动数据库
    
        mongod --dbpath="/var/mongodb/data" --logpath="/var/mongodb/log/mongodb.log" --fork 

    后台服务关闭 

        mongo // 从linux命令行进入mongod命令行
        > use admin // 切换到管理员模式
        > db.shutdownServer() // 关闭mongodb服务


2.安装和配置nodejs

    下载地址：https://nodejs.org/en/download/

3.克隆代码，运行
    
    git clone https://github.com/gibsonxiong/express-uuchat-api.git

    cd express-uuchat-api

    npm install 或者 yarn install

    npm start 或者 yarn start







