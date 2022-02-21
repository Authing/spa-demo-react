# 安装依赖

运行以下命令安装项目依赖：

```bash
$ npm install
```

# 填写你的应用配置

在 src/App.js 第 11 行，修改配置为你的应用配置：

```js
const authing = new AuthenticationClient({
	appId: 'APP_ID',
	appHost: 'https://{你的域名}.authing.cn',
	redirectUri: 'http://localhost:4000/callback'
});
```

## Authing 控制台配置

在自建应用控制台中，修改一下设置：

- 登录回调 URL： `http://localhost:4000/callback` （修改为这个值）
- 换取 token 身份验证方式： `none` （选择这个选项）

保存。

# 运行

运行本示例程序：

```bash
$ npm start
```

# 参考文档

[React 快速开始](https://docs.authing.cn/v2/quickstarts/spa/react.html)

# License

spa-demo-react is [MIT licensed](https://github.com/Authing/spa-demo-react//blob/master/LICENSE)
