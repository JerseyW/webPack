/**
 @author: Jersey
 @create: 2021-11-22 18:40
 @version: V1.0
 @slogan: 业精于勤,荒于嬉;行成于思,毁于随。
 @description: 生产环境下webpack 配置文件 ：指示webpack 加载哪些配置

 所有的构建工具都是基于nodejs 平台的 模块化默认采用commonjs
 */
//resolve 用来拼接绝对路径
/*
* loader:1.下载2.使用(配置 loader)
    plugins:1.下载2.引入3.使用
   webpack 支持es6 语法，但最新的es7 及以上等语法可能不支持所以需要安装babel 进行辅助编译
* path.resolve是nodeJs里面方法，可以连接两个相对路径并生成绝对路径；
* */

/*
* webpack 配置拓展解析
*
*  A entry 入口起点
*   支持
*    1 string ：指定js 文件作为入口 -->"./src/index.js" 打包形成一个trunk 默认名称为main,输出一个入口文件
*    2 array :数组形式的多入口，所有入口文件最终只会形成一个chunk,输出一个文件
*              ---在HMR 功能中让html热更新生效 一般为开发环境使用
*    3  object:
*          对象形式的多入口，存在几个文件就形成几个thunk,输出对应几个入口文件；此时chunk的名称是对象的key
*    4
*        entry:{
*           多入口下将某个入口的几个文件打包成一个则可以使用(一般后面的会合并到第一个文件中)
*            index:["./src/index.js","./src/test.js"],
*           单独打包成一个trunk,一个输出入口文件
*            add:"./src/add.js"
*        }
*   B outPut 出口
*      filename: "js/[name].[contenthash:10].js",
    //__dirname nodejs的变量，代表当前文件的目录的绝对路径
    path: resolve(__dirname, 'dist'),
    publicPath: "./",//从当前服务器根路径获取资源表示资源(dist)被引用的根路径，在生产环境下生效；可以是相对路径，也可以是绝对路径；无论是相对路径还是绝对路径，必须 以/结尾
    //一般生产环境下配置设置CDN目录路径即可
    //静态资源引用相对于index.html页面,./解决IE下 publicPath无法识别问题
     chunkFilename: "js/[name].[chunkhash].js",// 非单入口，多入口的chunk额外的chunk进行命名整改 ChunkFilename决定了项目运行时异步加载的文件（非入口文件）名称,适合懒加载
     //optimization 里chunk 分离的chunk 遵循此名称
     //  library: "[name]", //整个库对外暴露变量 var 定义
     //  libraryTarget: window //对外暴露变量添加到browser 的 window 下
     // libraryTarget:'commonjs'
     // libraryTarget:'global'
*  C resolve
*    //解析模块的规则
*  resolve: {
        //配置解析模块路径的别名
        alias: {
            $css: resolve(__dirname, "src/css")
        },
       //配置省略文件名路径的后缀
       extensions: [".js",".json",".jsx"],
       //告诉webpack 解析模块默认从哪个目录找,若找不到从上层目录继续找
       modules: [resolve("../node_modules"),"node_modules"]
   }
   *
   D:optimization 优化策略
      optimization: {//优化策略
    minimizer: [
      new CssMinimizerWebpackPlugin(),//生产模式下css 压缩插件
      new TerserWebpackPlugin({//生产模式下 更好的 压缩js插件
            test: /\.js(\?.*)?$/i,
            parallel: 4,
            exclude: /node_modules/,
            extractComments: true,
            terserOptions: {
                compress: {
                    warnings: false,
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log'], //移除console
                },
            }
        })
    ],
    usedExports: true,//开启树摇标记,帮助树摇优化
    minimize:true,//启动压缩，若没有压缩则使用terserPlugin 启动
    //分割代码：将node_modules单独打包成一个chunk
    //多入口可以提取共用代码为一个
    splitChunks: {
      //这表明将选择哪些 chunk 进行优化。当提供一个字符串，有效值为 all，async 和 initial。设置为 all 可能特别强大，因为这意味着 chunk 可以在异步和非异步 chunk 之间共享
       chunks: "all",
       //下面为默认值，可以不写
       minSize: 30*1024, // 分割chunk 模块的最小体积
       maxSize: 0,//最大无限制
       minChunks: 1, // 要提取的chunks最少被引用次数1次
       maxAsyncRequests: 5, // 按需加载的最大并行请求数
       maxInitialRequests: 3, //入口js最大并行请求数
       automaticNameDelimiter: '~', // 文件名的连接符,
       name:true,//可以使用命名规则
       cacheGroups: {//分割的chunk的组
          //node_modules 文件会被打包到vendors 组合chunk中--->vendors~xxx.js
          //需要满足上面定义的规则
           vendors:{
                test:/[\\/]node_modules[\\/]/,
                priority: -10, //优先级
           },
           //先搞定node_modules，其他模块的优先级低点
           default:{
               minChunks: 2, //要提取的chunk 最少被引用次数
               priority: -20, //优先级
               //如果当前组中要打包的模块与之前已经提取的模块是同一个则复用，而不是重新打包
               reuseExistingChunk: true
           }
        },
      runtimeChunk:{
        //将当前模块的记录其他模块的hash 单独打包为一个文件 runtime,
        // 解决a 文件变化导致b文件的contenthash变化 避免缓存失效
        name: entrypoint=> `runtime-${entrypoint.name}`
     }
}


* */

/** 存在问题
 *      修改任意一个文件，会全部进行打包，即使其他文件没有被修改过
 *
 生产环境优化：
 *
 *
 *  A source-map : 一种提供源代码到构建代码映射技术： 构建后代码出错定位到源代码的技术，利于调试
 *
 *     1 开发环境一般在webpack  中添加参数 devtool:"eval-source-map" /eval-cheap-module-source-map
 *     2 生产环境一般在webpack  中添加参数 devtool:"source-map" /cheap-module-source-map
 *
 * B 缓存
 *   babel 缓存
 *    cacheDirectory:true
 *   文件资源缓存
 *      hash:每次webpack 构建时会生成唯一一个的hash值
 *      问题：因为js 和css 同时使用一个hash 值
 *           如果重新打包会导致所有缓存失效(可能只改动一个文件而已)
 *       chunkhash:更据chunk 生成的hash值，如果打包来源于同一个chunk则hash值相同
 *        css是在ks中被引入的,所以同属于一个chunk
 *      contenthash:根据文件内容生成hash值，内容不同hash值肯定不同
 *       ---让代码上线运行缓存更好使用
 区分hash，contenthash，chunkhash
 webpack内置的hash有三种：

 hash：每次构建会生成一个hash。和整个项目有关，只要有项目文件更改，就会改变hash
 contenthash：和单个文件的内容相关。指定文件的内容发生改变，就会改变hash。
 chunkhash：和webpack打包生成的chunk相关。每一个entry，都会有不同的hash。针对于输出文件最终每个entry文件及其依赖会生成单独的一个js文件。
 此时使用chunkhash，能够保证整个打包内容的更新准确性

 C tree shaking 树摇

 解决项目中的无用代码

 在 Webpack 中，启动 Tree Shaking 功能必须同时满足三个条件：

 使用 ESM 规范编写模块代码
 配置 optimization.usedExports 为 true，启动标记功能
 启动代码优化功能，可以通过如下方式实现：
 配置 mode = production
 配置 optimization.minimize = true
 提供 optimization.minimizer 数组

 1 在package.json 配置 sideEffects:false 所有代码都没有副作用
 配置 "sideEffects": ["*css","*less"] 不会树摇css less

 2 在optimization 下添加配置
 usedExports: true,//开启树摇标记,帮助树摇优化
 minimize:true,//启动压缩，若没有压缩则使用terserPlugin 启动

 3 webpack5 对树摇进行了优化可以处理了Common.js 支持

 D 代码分割
 方式一
 entry: {
      //多入口：适合多页面配置
      main:"./src/index.js",
      test:"./src/test.js"
  },
 方式二
 optimization 中配置
 splitChunks: { //分割代码
      chunks: "all"
    }
 在默认情况下，SplitChunks仅仅影响按需加载的代码块，因为更改初始块会影响HTML文件应包含的脚本标记以运行项目。

 webpack将根据以下条件自动拆分代码块：

 会被共享的代码块或者 node_modules 文件夹中的代码块
 体积大于20KB的代码块（在gz压缩前）
 按需加载代码块时的并行请求数量不超过5个
 加载初始页面时的并行请求数量不超过3个

 方式三 动态打包
 如果某个文件想单独打包成一个chunk 则使用import("文件路径")
 E:懒加载
   需要时在加载，适合延迟事件
   import("./js/axios").then(({Axios})=>{})


 F:PWA: 渐进式网络访问技术(离线访问):workbox-webpack-plugin
        1  下载 并引入const  workboxWebpackPlugin = require("workbox-webpack-plugin");
           //离线访问插件
           new workboxWebpackPlugin.GenerateSW({
                //1帮助webpack快速启动 2删除旧的serviceWorker,
                // 入口文件生成一个serverWorker配置文件
                clientsClaim:true,
                skipWaiting:true
              }),
        2  注册serviceWorker,需处理兼容性问题
            eslint 代码风格插件不认识window  navigator 全部变量，需要在package.json设置 "env":{
             "browser": true
          }
         serviceworker 代码必须运行在服务器上
         --- nodejs
         ---
         npm i serve -g
         serve -s dist 启动服务器将dist下代码作为静态资源暴露出去，
        代码监听：
        if ('serviceWorker' in  navigator){
          window.addEventListener('load',()=>{
            navigator.serviceWorker.register("/service-worker.js").then(()=>{
              console.log("serviceworker注册成功")
            }).catch(()=>{
              console.log("注册失败")
            })
          })
        }

 G: 多线程打包技术 thread-loader 经常使用在babel 上
      开启多进程打包，进程启动600ms ，通讯也有开销
     只有工作消耗时间比较长是在使用
     {
        loader:  'thread-loader',
        options: {
          worker:2
        }
     }

 H :externals来提取这些依赖包，其实应该说用externals来防止这些依赖包被打包。需要使用则需要动态引入或者cdn 引入

 I : dll 预先编译资源模块技术，对某些第三方库(jquery,react.vue)单独打包只需打包一次即可 以后使用直接引用即可，无需再次打包了,以后源代码更改直接运行webpack.dll.js即可
 1 配置webpack.dll.js
 2 运行 webpack --config webpack.dll.js   ： 会根目录生成dll 文件夹包含jquery.js 和manifest.json 映射文件
 3 webpack.config.js 中引入const  webpack = require("webpack");插件 告诉webpack jquery 无需再打包了
 new webpack.DllReferencePlugin({
       manifest: resolve(__dirname,'dll/manifest.json')
     })；
 4 下载并引入 add-asset-html-webpack-plugin 插件
 注入插件
 new  AddAssetHtmlWebpackPlugin({
          filepath:resolve(__dirname,'dll/jquery.js')
      })

 5 DLL 缓存技术 可以使用自带的auto-dll-webpack-plugin 优化让繁琐的步骤更加简洁，不够最终推荐使用HardSourceWebpackPlugin


 K webpack 预加载

 preload 与prefetch 的区别
 preload 是一个声明式 fetch，可以强制浏览器在不阻塞 document 的 onload 事件的情况下请求资源。
 preload 顾名思义就是一种预加载的方式，它通过声明向浏览器声明一个需要提交加载的资源，当资源真正被使用的时候立即执行，就无需等待网络的消耗。
 prefetch 告诉浏览器这个资源将来可能需要，但是什么时间加载这个资源是由浏览器来决定的。
 若能预测到用户的行为，比如懒加载，点击到其它页面等则相当于提前预加载了需要的资源。

 Link 的链接类型
 <link> 标签的 rel 属性可以定义链接类型，prefetch 是其中的一种，与 href 配合使用可以预取或预加载对应资源

 <link rel="prefetch" href="URL">
 preload 是另外一种类型，同样用 href 定义资源地址，但其处理预取外，还会对资源进行解析，所以还要增加属性 as，说明资源的类型

 <link rel="preload" href="URL" as="MIME_TYPE">

 L  DLL 技术的替代方案 HardSourceWebpackPlugin
 使用 cache-loader 或者 hard-source-webpack-plugin
 HardSourceWebpackPlugin 和 SpeedMeasureWebpackPlugin 不能一起使用。
 这个插件其实就是用于给模块提供一个中间的缓存。

 M TerserWebpackPlugin
 减少js体积(其中删除js的console.log和注释)
 * */
const {resolve} = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
//生产模式下用来将css 从js 中提取分离
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//生产环境下css 压缩
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
process.env.NODE_ENV = "production";
// 导入terser-webpack-plugin-->减少js体积(其中删除js的console.log和注释)
const TerserWebpackPlugin = require('terser-webpack-plugin');
const  workboxWebpackPlugin = require("workbox-webpack-plugin");
//给模块提供一个中间的缓存。DLL 技术的替代方案：简单
//const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
//dll 技术对某些第三方库(jquery,react.vue)单独打包 以后使用直接引用即可，无需再次打包了
const  webpack = require("webpack");
//dll 技术所支撑插件：会将某个文件打包出去并在html 中自动引入该打包文件
const  AddAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");


//复用
const commonCssLoader = [

    //生产模式下取代style-loader,提取js 文件中的css为单独文件
    MiniCssExtractPlugin.loader,
    //css 文件整合到了js文件中
    "css-loader",
    /*
     生产模式下css兼容性处理: posters-> postcss-loader postcss-preset-env
      posters找到 package.json中 browserslist里面的配置,通过配置加载指定的css兼容性样式
     "browserslist": {
        设置环境变量使用node开发环境配置:process.env.NODE_ENV=development

        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version",
          "last 1 edge version"
        ],
        默认使用生产环境
        "production": [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ]
      }

       下面写法已废弃  loader: "postcss-loader",
         options: {
           ident: "postcss",
           plugins: () => [
             require("postcss-preset-env")()
           ]
          }
        }
      */
    {
        loader: "postcss-loader",
        options: {
            postcssOptions: {
                plugins: [
                    [
                        'postcss-preset-env',
                        {
                            ident: "postcss"
                        }
                    ]
                ]
            }
        }
    }
];

module.exports = {
  //entry:"./src/index.js", //单入口适合单页面配置
  //入口
  entry: {
      //多入口：适合多页面配置
      main:"./src/index.js",
      test:"./src/test.js"
  },
  //输出
  output: {

    filename: "js/[name].[contenthash:10].js",
    //__dirname nodejs的变量，代表当前文件的目录的绝对路径
    path: resolve(__dirname, 'dist'),
    publicPath: "./",//从当前服务器根路径获取资源表示资源(dist)被引用的根路径，在生产环境下生效；可以是相对路径，也可以是绝对路径；无论是相对路径还是绝对路径，必须 以/结尾
    //一般生产环境下配置设置CDN目录路径即可
    //静态资源引用相对于index.html页面,./解决IE下 publicPath无法识别问题
     chunkFilename: "js/[name].[contenthash:10].chunk.js",// 非单入口，多入口的chunk额外的chunk进行命名整改 ChunkFilename决定了项目运行时异步加载的文件（非入口文件）名称,适合懒加载
     //optimization 里chunk 分离的chunk 遵循此名称
     //  library: "[name]", //整个库对外暴露变量 var 定义
     //  libraryTarget: window //对外暴露变量添加到browser 的 window 下
     // libraryTarget:'commonjs'
     // libraryTarget:'global'
      clean: true  // 在生成文件之前清空 output 目录
  },
  module: {
    //详细的loader 编译配置，用来处理img,less 等webpack 无法处理的js 文件
    //不同的文件必须配置不同的loader 处理
    rules: [
      {
        //匹配哪些文件
        test: /\.css$/,
        //使用哪些loader，use 执行顺序，从右到左，从下到上依次执行
        use: [...commonCssLoader]

      },
     /* {
        //语法检查 eslint-loader 依赖eslint 设置检查规则 package.json 中eslintConfig 设置airbnb规则
        //airbnb==>eslint-config-airbnb eslint eslint-plugin-import
        //跳过该行检查eslint-disable-next-line
        test: /\.js$/,
        enforce: "pre",//优先执行
        //enforce: "post",//延后执行
        loader: "eslint-loader",
        exclude: /node_modules/,
        include:/src/,
        options: {
          fix: true
        }
      },*/
      {
        oneOf:
        [
            {
              //打包其他资源比如字体文件(除了html/js/css 资源以外的资源)
             //排除css js  html less sass 等资源
              exclude: /\.(css|js|html|less|sass|jpg|png|gif|svg)$/,
              type: 'asset/resource',//webpack 5 最新loader 代替file-loader,file-loader 写法参考images 处理方法
             //不能使用option,使用生成器代替option
              generator: {
                 filename: "font/[name].[contenthash:10].[ext]"
              }
           },
          {
            test: /\.less$/,
            use: [
              ...commonCssLoader,
              //需要下载less-loader和less
              "less-loader",
            ]
          }, {
            //默认无法处理html img标签的图片
            test: /\.(jpg|png|gif|svg)$/,
            //多个需要使用use [],单个则直接使用loader
            //下载url-loader 和 file-loader
            loader: "url-loader",
            options: {
              //图片大小小于8kb 会被base64编码处理
              //减少请求数量减轻服务器压力，缺点图片体积更大，导致文件请求速度更慢
              //一般对小图片进行处理
              //url-loader 默认使用es6 模块进行解析，html-loader使用commonjs 进行解析，所以需要加入esModule:false 属性
              //关闭url-loader 的es6 的模块化，使用默认commonjs 解析
              limit: 8 * 1024,
              //name:"[contenthash:10].[ext]", ext 取原来的扩展名，hash 取图片hash值的前10位
              //outputPath:"./images", 和下面不加images的写法等价
              name: "images/[name].[ext]",//保持图片名不变，而且也能够添加到指定目录下
              esModule: false,//url-loader 默认使用es6解析，html-loader 引入的图片是commonjs 解析会出现【object Module】问题，所以需要关闭url-loader的es6 米快化使用commonjs 解析

            },
            type: "javascript/auto"//在最新的webpack5 中为了兼容旧的url-loader 模式，可使用asset/inline代替
          }, {
            test: /\.html$/,
            //处理html 文件中的img图片，负责引入img 从而被url-loader进行处理
            loader: "html-loader"
          }, {
            test: /\.js$/,
            use: [
            //开启多进程打包，进程启动600ms ，通讯也有开销
            //只有工作消耗时间比较长是在使用
            {
              loader:  'thread-loader',
              options: {
                worker:2
              }
            },
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',//判断当前代码的运行环境，将代码转换成当前运行环境所支持的代码
                    {
                      //"@babel/polyfill"; 全部兼容性一次解决
                      //按需加载需要做兼容性处理的就做:按需加载->core-js
                      useBuiltIns: "usage",
                      //指定哪些兼容性处理
                      corejs: {
                        version: 3
                      },
                      targets: {
                        chrome: '60',
                        firefox: '60',
                        ie: '9',
                        safari: '10',
                        edge: '17'
                      }
                    }
                  ],
                ],
                //babel依赖的插件:使用按需加载时这些插件可以不用
                //
                // plugins: [
                //          ['@babel/plugin-proposal-object-rest-spread'],
                //          //当使用 legacy: true 启用兼容模式时，必须在 loose 模式下使用 @babel/plugin-proposal-class-properties 来支持 @babel/plugin-proposal-decorators。
                //          ['@babel/plugin-proposal-class-properties',{loose: true}],
                //          ['@babel/plugin-proposal-decorators',{legacy: true}]
                // ]
                cacheDirectory:true //开启babel 缓存，第二次构建会读取之前的缓存
              }
            }
          ],
            exclude: /node_module/,
            include: /src/
          }
        ]
      }
    ]
  },
  plugins: [
    //详细的插件配置用来打包优化压缩代码
    //html-webpack-plugin 自动构建html
    //默认会创建一个空的html文件自动打包的所有资源。css/js
    //需要有结构的html文件则使用webpack 指令自动在build下生成index.html
    new HtmlWebpackPlugin({
      //复制html文件
      template: "./src/index.html",
      filename: "index.html",       // 打包出来的html文件名称
      //生产环境压缩html代码
      minify: {
        //一行显示移除空格
        collapseWhitespace: true,
        //移除注释
        removeComments: true
      },
      hash:  true
    }),
    //生产模式下将css 从webpack的js中提取
    new MiniCssExtractPlugin({
      filename: "main.css"
    }),
      //离线访问插件
    new workboxWebpackPlugin.GenerateSW({
      //1帮助webpack快速启动 2删除旧的serviceWorker,
      // 入口文件生成一个serverWorker配置文件
      clientsClaim:true,
      skipWaiting:true
    }),
     //告诉webpack 哪些库不参与打包，同时使用时的名称也需要改
     new webpack.DllReferencePlugin({
       manifest: resolve(__dirname,'./dist/dll/manifest.json')
     }),
      new  AddAssetHtmlWebpackPlugin({
         filepath:resolve(__dirname,'./dist/dll/jquery.js')
      }),
      //new HardSourceWebpackPlugin()
  ],
  optimization: {//优化策略
    minimizer: [
      new CssMinimizerWebpackPlugin(),//生产模式下css 压缩插件
      new TerserWebpackPlugin({//生产模式下 更好的 压缩js插件
            test: /\.js(\?.*)?$/i,
            parallel: 4,
            exclude: /node_modules/,
            extractComments: true,
            terserOptions: {
                compress: {
                    warnings: false,
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log'], //移除console
                },
            }
        })
    ],
    usedExports: true,//开启树摇标记,帮助树摇优化
    minimize:true,//启动压缩，若没有压缩则使用terserPlugin 启动
    //分割代码：将node_modules单独打包成一个chunk
    //多入口可以提取共用代码为一个
    splitChunks: {
      //这表明将选择哪些 chunk 进行优化。当提供一个字符串，有效值为 all，async 和 initial。设置为 all 可能特别强大，因为这意味着 chunk 可以在异步和非异步 chunk 之间共享
        chunks: "all",
        minSize: {
           javascript:30*1024,
           style:50*1024
        }
        //下面为默认值，可以不写
      /* minSize: 30*1024, // 分割chunk 模块的最小体积
       maxSize: 0,//最大无限制
       minChunks: 1, // 要提取的chunks最少被引用次数1次
       maxAsyncRequests: 5, // 按需加载的最大并行请求数
       maxInitialRequests: 3, //入口js最大并行请求数
       automaticNameDelimiter: '~', // 文件名的连接符,
       name:true,//可以使用命名规则
       cacheGroups: {//分割的chunk的组
          //node_modules 文件会被打包到vendors 组合chunk中--->vendors~xxx.js
          //需要满足上面定义的规则
           vendors:{
                test:/[\\/]node_modules[\\/]/,
                priority: -10, //优先级
           },
           //先搞定node_modules，其他模块的优先级低点
           default:{
               minChunks: 2, //要提取的chunk 最少被引用次数
               priority: -20, //优先级
               //如果当前组中要打包的模块与之前已经提取的模块是同一个则复用，而不是重新打包
               reuseExistingChunk: true
           }
        }*/
    },
     runtimeChunk:{
     //将当前模块的记录其他模块的hash 单独打包为一个文件 runtime,
      // 解决a 文件变化导致b文件的contenthash变化 避免缓存失效
      name: entrypoint=> `runtime-${entrypoint.name}`
    }
  },
  //模式 development 开发环境，production 生产环境 自动压缩js 代码
   mode: "production",
   devtool: "cheap-module-source-map",//更据打包代码出错可定位源代码的位置
    //devtool: "source-map", //更据打包代码出错可定位源代码的位置
   resolve: {
        //配置解析模块路径的别名
        alias: {
            $css: resolve(__dirname, "src/css")
        },
       //配置省略文件名路径的后缀
       extensions: [".js",".json",".jsx"],
       //告诉webpack 解析模块默认从哪个目录找,若找不到从上层目录继续找
       modules: [resolve("../node_modules"),"node_modules"]
   }

  // externals: {
  //    //忽略库名 npm 包名 被打包，可通过cdn引入继续使用
  //    jquery:'jquery'
  // }
}