import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  useHistory
} from "react-router-dom";
import { useEffect, useState } from 'react';

const { AuthenticationClient } = require('authing-js-sdk');
const authing = new AuthenticationClient({
  appId: 'APP_ID',
  appHost: 'https://{应用域名}.authing.cn',
  redirectUri: 'http://localhost:4000/callback',
  tokenEndPointAuthMethod: 'none'
});

function HandleCallback() {
  let location = useLocation();
  let query = new URLSearchParams(location.search);
  let code = query.get('code')
  let codeChallenge = localStorage.getItem('codeChallenge')
  let history = useHistory()
  useEffect(() => {
    (async () => {
      let tokenSet = await authing.getAccessTokenByCode(code, { codeVerifier: codeChallenge });
      const { access_token, id_token } = tokenSet;
      let userInfo = await authing.getUserInfoByAccessToken(tokenSet.access_token);
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('idToken', id_token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      history.push('/');
    })()
  })

  return <div>加载中...</div>
}

function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState()
  useEffect(() => {
    let userInfo = localStorage.getItem('userInfo');
    setIsAuthenticated(!!userInfo);
  }, []);
  return (
    <div className="App">
      {isAuthenticated ? (<><LogoutBtn /><ResourceBtn /></>) : <LoginBtn />}

      <div>
        <div>用户信息：</div>
        <Profile />
      </div>
    </div>
  )
}

function LoginBtn() {
  return <button onClick={() => {
    // PKCE 场景使用示例
    // 生成一个 code_verifier
    let codeChallenge = authing.generateCodeChallenge()
    localStorage.setItem('codeChallenge', codeChallenge)
    // 计算 code_verifier 的 SHA256 摘要
    let codeChallengeDigest = authing.getCodeChallengeDigest({ codeChallenge, method: 'S256' })
    // 构造 OIDC 授权码 + PKCE 模式登录 URL
    let url = authing.buildAuthorizeUrl({ scope: 'openid email profile address phone order:read', codeChallenge: codeChallengeDigest, codeChallengeMethod: 'S256' });
    window.location.href = url
  }}>登录</button>
}

function LogoutBtn() {
  return <button onClick={() => {
    let idToken = localStorage.getItem('idToken');
    localStorage.clear();
    let url = authing.buildLogoutUrl({ expert: true, redirectUri: 'http://localhost:4000', idToken })
    window.location.href = url;
  }}>登出</button>
}

function Profile() {
  let userInfo = localStorage.getItem('userInfo');
  return userInfo ?? '无';
}

function ResourceBtn() {
  return <button onClick={async () => {
    try {
      let accessToken = localStorage.getItem('accessToken');
      let res = await fetch('http://localhost:5000/api/protected', {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
        method: 'GET',
      });
      let data = await res.json();
      alert(JSON.stringify(data));
    } catch (err) {
      alert('无权访问接口')
    }
  }}>获取资源</button>
}

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact={true}>
          <HomePage />
        </Route>
        <Route path="/callback" exact={true}>
          <HandleCallback />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
