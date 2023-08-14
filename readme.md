# Sequelize로 DB 생성

config 수정

```js
// config/config.js
{
    "development":{
        "username":"root",
        "password": "[root] 비밀번호",
        "database" :"nodebird",
        "host" : "127.0.0.1",
        "dialect" : "mysql"
    }
}
```

```bash

npx sequelize db:create

```

# Follow 모델에 관해

팔로잉 기능은 대표적인 같은 모델 끼리의 N:M 관계이다.  
같은 테이블 간 N:M 관계에서는 모델 이름과 칼럼 이름을 따로 정해야 한다. through 옵션은 모델 이름을 설정해준다.
foreignKey로는 상반된 id로 구분하고(follower, following)
as 옵션으로 두 모델을 구분한다. as 는 foreignKey와 반대되는 모델을 가리킨다.

# passport flow

1.  `/auth/login` 라우터를 통해 로그인 요청이 들어옴
2.  라우터에서 `passport.authenticate` 메서드 호출
3.  로그인 전략(LocalStrategy) 수행
4.  로그인 성공 시 사용자 정보와 함께 `req.login` 호출
5.  `req.login` 메서드가 `passport.serializeUser` 호출
6.  `req.session`에 사용자 아이디만 저장해서 세션 생성
7.  express-session에 설정한 대로 브라우저에 `connect.sid` 세션 쿠키 전송
8.  로그인 완료

로그인 이후 플로우

1.  요청이 들어온다.
2.  라우터에 요청이 도달하기 전에 `passport.session` 미들웨어가 `passport.deserializeUser` 메서드 호출
3.  `connect.sid` 세션 쿠키를 읽고 세션 객체를 찾아서 `req.session`으로 만듦
4.  `req.session` 에 저장된 아이디로 데이터베이스에서 사용자 조회
5.  조회된 사용자 정보를 `req.user`에 저장
6.  라우터에서 `req.user` 객체 사용 가능

# passport method

`isAuthenticated`: 로그인 여부를 판가름 할 수 있는 메서드로 전략이 성공하거나 실패하면 authenticated 메서드의 콜백 함수가 실행된다. 첫 번째 매개변수 `authError` 값이 있다면 실패한 것이다.
두 번째 매개변수 자리는 `사용자 정보`이다. 이 자리에 값이 있다면 성공한 것이고, 이 값으로 `req.login`메서드를 호출한다. Passport 는 req 객체에 login과 logout 메서드를 추가한다. req.login은 `passport.serializeUser`를 호출하고, req.login에 제공하는 user 객체가 serializeUser로 넘어가게 된다. 또한 이 때 `connect.sid` 세션 쿠키가 브라우저에 전송된다.

`passport-local`: passport-local 모듈에서 Strategy 생성자를 불러와 그 안에 전략을 구현한다. **생성자의 첫 번째 인수로 주어진 객체**는 전략에 관한 설정을 하는 곳이다. `usernameField`와 `passwordField`에는 일치하는 로그인 라우터의 `req.body` 속성명을 적으면 된다.
**생성자의 두 번째 인수는** 실제 전략을 실행하는 `async함수`이다. 첫 번째 인수에서 넣어준 usernameField와 passwordField의 값은 각각 async 함수의 첫 번째와 두 번째 매개변수가된다. 세 번째 매개변수인 done 함수는 `passport.authenticate`의 콜백함수이다.