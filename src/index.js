
/**
 @author: Jersey
 @create: 2021-11-22 16:43
 @version: V1.0
 @slogan: 业精于勤,荒于嬉;行成于思,毁于随。
 @description: 入口文件
 */

/*   1 运行指令：
*      开发环境 ： webpack ./src/js/index.js -o ./build/built.js --mode=development
*      生产环境 ： webpack ./src/js/index.js -o ./build/built.js --mode=production
*    2 结论
*       1 webpack 可以处理js/json 文件
*       2 不能处理非js 文件 比如css/images 需要使用Loader 加载器进行处理
*       3 生产环境比开发环境多了一个压缩js代码
*       4 生产环境和开发环境将ES6 模块化编译成浏览器识别的模块化
*       5 webpack中，默认只能处理一部分es6的语法更高级的es6和es7语法webpack不能处理，这时就需要第三方的loader即babel来帮助webpack来处理这些高级的语法
*    3 打包样式
*        webpack 无法自己处理非js文件需要loader，loader则需要webpack的配置文件支持
*    4 配置了webpack.config后可以使用npx webpack 快速打包
* */
//动态打包：将某个文件单独打包
// import(/* webpackChunkName:'test' */'./test').then((result)=>{
//
// }).catch(()=>{
//
// });
import  $ from "jquery";


// eslint-disable-next-line
import * as m1 from './js/M1.js';
// eslint-disable-next-line
import { school, find } from './js/M2.js';
// eslint-disable-next-line
import * as m from './js/M3.js';
import './css/index.css';
import './css/index.less';
// import "@babel/polyfill"; 全部兼容性一次解决
// 引入样式文件
import './font/iconfont.css';

//引入ts 文件
/*
* 对于 import 导入默认导出的模块，TS 在读这个模块的时候会去读取上面的 default 属性
对于 import 导入非默认导出的变量，TS 会去读这个模块上面对应的属性
对于 import *，TS 会直接读该模块
* */

console.log(m1 );
m1.teach();
console.log(school);
m.default.teach();


find();

// 是否开启HRM
if (module.hot) {
    module.hot.accept('./js/axios.js', () => {
        console.log("监听axios.js 变化，一但变化其他默认不会打包;")
    });
}

/*注册serviceWorker,需处理兼容性问题
eslint 代码风格插件不认识window  navigator 全部变量，需要在package.json设置 "env":{
      "browser": true
    }
serviceworker 代码必须运行在服务器上
  --- nodejs
  ---
  npm i serve -g
  serve -s dist 启动服务器将dist下代码作为静态资源暴露出去，
*/
if ('serviceWorker' in  navigator){
    window.addEventListener('load',()=>{
        navigator.serviceWorker.register("/lib/service-worker.js").then(()=>{
            console.log("serviceworker注册成功")
        }).catch(()=>{
            console.log("注册失败")
        })
    })
}
