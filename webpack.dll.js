/**
 @author: Jersey
 @create: 2021-11-25 9:49
 @version: V1.0
 @slogan: 业精于勤,荒于嬉;行成于思,毁于随。
 @description: dll 技术 拆分打包，对某些第三方库(jquery,react.vue)单独打包 以后使用直接引用即可，无需再次打包了
  运行webpack 时默认查找webpack,config.js
  需要运行 webpack --config webpack.dll.js
 */
const  path = require("path");
const  webpack = require("webpack");
module.exports = {

    entry:{
        //最终打包生成的name :jquery
        //要打包的库为jquery
        jquery:['jquery']
    },
    output: {
        filename: "[name].js",
        path:path.resolve(__dirname,'dist/dll'),
        library: '[name]_[hash]',//对外暴露出去的内容
    },
    plugins: [
       //打包生成一个manifest.json 在webpack 配置文件插件注入时使用 :提供和jquery 映射，表示jquery无需打包且包名为name_hash
        new webpack.DllPlugin({
            name: "[name]_[hash]",//映射library 库暴露的内容名称
            path: path.join(__dirname,'dist/dll', "manifest.json"),
        })
    ],
    mode: "production"
}