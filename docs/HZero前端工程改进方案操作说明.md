HZero前端工程改进方案操作说明
===

## 环境变量

* node.js: v8.x(>= v8.10.x) or v10.x
* npm: v6.x
* yarn: 全局安装`yarn`,安装命令如下

  ```bash
  $ npm install -g yarn
  ```

  > 关于`yarn`,请参考: [https://yarnpkg.com](https://yarnpkg.com)

* lerna: 全局安装`lerna`,安装命令如下:

  ```bash
  $ npm install -g lerna
  ```

  或者

  ```bash
  $ yarn global add lerna
  ```

  > 关于`lerna`,请参考: [https://lernajs.io/](https://lernajs.io/)

* 开发工具: 推荐使用`Visual Studio Code`

  > 关于`Visual Studio Code`,请参考[https://code.visualstudio.com/](https://code.visualstudio.com/)

  * `Visual Studio Code`常用插件

    * 格式化代码风格:   EditorConfig for VS Code 
    * 校验代码:              Eslint
    * git流程:                 GitLens — Git supercharged
    * yaml文件支持:      YAML, Bracket Pair 
    * 括号高亮:              Braclet Pair Colorizer2
    * 单词拼写检查:       Code Spell Checker
    * React代码片段:     ES7 React/Redux/GraphQL/React-Native snippets
    * 高亮 TODO: 等:    TODO Highlight
    * 文件图标:             Vscode-icons

## HZero Front Cli工具的使用

HZero Front Cli工具是用于创建/更新基于HZero Front的前端工程的命令行工具,项目地址: [https://code.choerodon.com.cn/hzero-hzero/hzero-front-cli](https://code.choerodon.com.cn/hzero-hzero/hzero-front-cli)

### 安装

执行如下命令安装cli(HZero Front Cli以下简称Cli)

使用`npm`

```bash
$ npm install -g git+https:code.choerodon.com.cn/hzero-hzero/hzero-front-cli.git
# npm install -g git+ssh://git@code.choerodon.com.cn:hzero-hzero/hzero-platform-fe.git
$ hfcli -v
```

推荐使用yarn

```bash
$ yarn global add https://code.choerodon.com.cn/hzero-hzero/hzero-front-cli.git
# yarn global add ssh:git@code.choerodon.com.cn:hzero-hzero/hzero-front-cli.git
$ hfcli -v
```

### 主要命令

安装好`HZero Front Cli`工具后执行如下命令即可查看`hfcli`的所有命令

```bash
$ hfcli -h
```

| 命令           | 描述         | 用法 |
| ----------------| ------------ | -------------- |
| `[dir]`         | 创建新项目  | `$ hfcli [项目路径/名称dir]` example: `$ hfcli hzero-front-app` |
| `-v, --version` | 查看`Cli`版本号 | `$ hfcli -v` 或者 `$ hfcli --version` |
| `-i, ignore [files]` | 忽略需要被更新的框架(hzero-front-runtime)文件 | `$ hfcli hzero-front-app -i 'config/routers.js .eslintrc.js'` |
| `-c, --config [restPath]` | 自定义默认`package`仓库配置文件(.gitrepopackages文件,包含`hzero-front`),用于指定`package`仓库地址/分支,且仅支持git | `$ hfcli hzero-front-app -c hzero-front-app/.gitrepopackages` |
| `-h, --help`  | 查看`Cli`帮助命令 | `$ hfcli -h` 或者 `$ hfcli --help` |

## 创建基于HZero Front的新项目

关于`HZero Front`请参考[https://code.choerodon.com.cn/hzero-hzero/hzero-front](https://code.choerodon.com.cn/hzero-hzero/hzero-front)

安装好`HZero Front Cli`工具后执行如下命令,创建一个名为`hzero-front-app`的前端工程项目

```bash 
$ hfcli hzero-front-app
```

等待所有的操作执行完成后,执行如下命令

```bash
$ cd hzero-front-app
$ yarn start
```


**请注意`dll`文件是默认必须的,所以若第一次启动项目`dll`文件不存在或者有全新的node modules依赖,请先执行如下命令**

```
$ yarn dll
```


即可启动项目,启动成功后,请访问如下地址即可

```url
http://localhost:8000
```

项目目录结构如下

```shell
.
├── CHANGELOG.md                                          // 项目变更日志
├── README.md                                             // 项目说明
├── charts                                                // gitlab配置文件
├── config                                                // 项目基本配置,包含webpakc相关/路由相关/测试相关/样式相关
│   ├── env.js                                            // node.js环境变量配置
│   ├── jest                                              // jest单元测试工具配置文件
│   │   ├── cssTransform.js
│   │   └── fileTransform.js
│   ├── paths.js                                          // 静态文件路径配置文件
│   ├── routers.js                                        // 项目菜单路由配置文件
│   ├── theme.js                                          // 默认样式配置文件
│   ├── webpack.config.js                                 // webpack默认配置文件
│   ├── webpack.dll.config.js                             // webpack dll插件配置文件
│   └── webpackDevServer.config.js                        // webpack dev server开发者模式配置文件
├── dist                                                  // 可用于生产环境的静态文件目录
├── dll                                                   // build dll生成的dll文件
├── docker                                                // docker镜像配置相关
│   └── enterpoint.sh
├── jsconfig.json                                         // 开发工具(Visual Studio Code)代码兼容性配置文件
├── lerna.json                                            // lerna多package JavaScript项目管理配置文件
├── lib                                                   // babel用于开发者模块化编译生成目录
├── mock                                                  // mock静态数据服务配置相关
│   ├── ...
│   └── index.js
├── package.json                                          // 本项目配置node.js 配置文件
├── packages                                              // 子项目package相关
│   ├── hzero-front                                       // HZero Front package
│   └── ...
├── public                                                // 公共静态资源目录
│   ├── error.html
│   ├── favicon.ico
│   ├── favicon.png
│   ├── hzero-logo.svg
│   ├── images
│   │   ├── ...
│   ├── index.html
│   ├── lib
│   │   ├── es6-sham.min.js
│   │   ├── es6-shim.min.js
│   │   └── tinymce
│   ├── manifest.json
│   ├── suggestBrowser.html
│   └── tinymce
│       ├── langs
│       └── skins
├── scripts                                                // 本项目脚本文件包括webpack/模块化编译等 
│   ├── build.js                                           // 生产环境编译脚本文件
│   ├── build.lib.js                                       // babel模块化编译脚本文件 
│   ├── start.js                                           // 项目开发者模式dev server启动脚本文件 
│   └── test.js                                            // 单元测试脚本文件
├── src                                                    // 工作目录,包含项目业务逻辑代码等
│   ├── index.js                                           // 项目入口文件
│   ├── index.less                                         // 项目全局样式
│   ├── models                                             // 项目数据模型
│   │   └── global.js                                      // 全局数据模型
│   ├── router.js                                          // 项目核心业务逻辑/页面 
│   ├── routes
│   │   └── index.js                                       // 入口文件 
│   ├── serviceWorker.js                                   // 静态缓存service worker 
│   ├── setupProxy.js                                      // mock静态数据代理服务器配置文件
│   └── utils                                              // 项目业业务逻辑通用方法 
│       └── router.js                                      // 路由工具 
└── yarn.lock                                              // 项目yarn node.js模块配置文件 
```

## 开发流程

默认支持当前(原有)`hzero-platform-fe`开发模式,但目前对`hzero-front`代码做了一些改进

* 路由: `src/common/router.js` => `config/routers.js`

具体配置做了简化处理

```js
// 原有配置

'/spfm/supplier-kpi-indicator': {
  component: dynamicWrapper(app, ['spfm/supplierKpiIndicator'], () =>
    import('../routes/spfm/SupplierKpiIndicator')
  ),
  authorized: true,
},
```

改进后

```js
// 新的配置方式

{
  path: '/sslm/supplier-kpi-indicator',
  component: 'sslm/SupplierKpiIndicator',
  models: ['sslm/supplierKpiIndicatorOrg'],
},
```

* 国际化: 调整`@prompt` => `@formatterCollections`

### 代码迁移

与`hzero-platform-fe`代码结构相同

* models: 处理业务/组件功能数据逻辑
* services: 处理业务功能数据接口
* routes: 业务逻辑功能页面代码
* components: 基本组件
* utils: 公共通用方法

请注意路由的注册

### 更新项目代码(框架结构,hzero-front-runtime)

HZero Front Cli支持更新项目代码,执行如下命令

```bash
# 切换到项目目录下
$ cd hzero-front-app
$ hfcli
```

执行如下命令可以忽略不需要更新的文件

```base
# 切换到项目目录下
$ cd hzero-front-app
$ hfcli -i 'config/routers.js package.json'
```

### 子项目管理,packages

`HZero Front`子项目管理采用`lerna`管理

执行如下命令创建子项目`package`

```
$ lerna create <package name> packages 
```

执行如下命令安装项目依赖`node modules`,无需切换到各子项目下安装依赖

```
$ lerna bootstrap
```

执行如下命令来`build packages`

```
$ lerna run transpile
```

#### 子项目git管理

请注意,子项目多`package`代码仓库管理,默认使用`git`管理,请注意`git`子项目的配置和管理

