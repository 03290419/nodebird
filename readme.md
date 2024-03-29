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

# 컨트롤러와 서비스 분리

`서비스는 익스프레스의 req, res, next에 관해 알지 못한다.` 반대로 `컨트롤러는 User와 같은 모델에 대해 알지 못한다.`
이와 같은 원칙으로 분리하면 된다.

# 통합 테스트

라우터 하나에는 여러 개의 미들웨어가 붙어 있고 다양한 라이브러리가 사용된다. 이런 것들이 모두 유기적으로 잘 작동하는지 테스트하는 것이 통합 테스트(integration test)이다.

통합 테스트에서는 데이터베이스 코드를 모킹하지 않으므로 데이터베이스에 실제로 테스트용 데이터가 저장된다. 때문에 테스트용 데이터베이스를 설정한다.

```js
// config/config.js
...
  test: {
    username: "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: "nodebird_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
...
```

```bash
npx sequelize db:create --env test
```

통합 테스트 예제

```js
describe("POST /login", () => {
  test("로그인 수행", (done) => {
    request(app)
      .post("/auth/login")
      .send({
        email: "batkeng@gmail.com",
        password: "nodejsbook",
      })
      .expect("Location", "/")
      .expect(302, done);
  });
});
```

supertest 패키지로부터 `request` 함수를 불러와서 app 객체를 인수로 넣는다. 여기에 get, post, put, patch, delete 등의 메서드로 원하는 라우터에 요청을 보낼 수 있다. 데이터는 send 메서드에 담아서 보낸다. `request` 함수는 비동기 함수이므로 jest가 테스트가 언제 종료되는지 스스로 판단하기 어렵기 때문에 test 함수의 콜백 함수의 매개변수인 done을 expect 메서드의 두 번째 인수로 넣어서 테스트가 마무리 되었음을 알려야한다.

`agent` 객체로 로그인을 먼저 수행할 수 있고, 하나 이상의 요청에서 재사용 할 수 있다.

# 부하 테스트

부하 테스트(load test)는 서버가 얼만큼의 요청을 견딜 수 있는지 테스트하는 방법이다.
내 코드가 실제로 배포되었을 때 어떤 문법적, 논리적 문제가 있을지는 유닛 테스트와 통합 테스트로 어느정도 확인할 수 있지만 내 서버가 몇 명의 동시 접속자나 일ㅇ리 사용자를 수용할 수 있는지를 예측하는 일은 매우 어렵다.

코드의 문법적, 논리적 문제가 없더라도 서버의 하드웨어 제약 때문에 서비스가 중단될 수 있다. 대표적인 것이 OOM(Out Of Memory) 문제이다. 서버는 접속자들의 정보를 저장하기 위해 각각의 접속자마자 일정한 메모리를 할당한다. 이렇게 사용하는 메모리의 양이 증가하다가 서버의 메모리 용량을 초과하게 되면 문제가 발생한다. 부하테스트를 통해 이를 어느 정도 미리 예측할 수 있다.

```bash
npm i -D artillery
```

부하 테스트를 실행해보는 명령어

```bash
npx artillery quick --count 100 -n 50 http://localhost:8001
```

`--count` 옵션은 가상의 사용자 수를 의미하고, `-n` 옵션은 요청 횟수를 의미한다. 100명의 가상 사용자가 50번씩 요청을 보내므로 총 5,000 번의 요청이 서버로 전달된다.

로그에서 `http.response_time(응답 지연 속도)` 의 `median` 과 `p95`값의 크기 차이가 크지 않을수록 대부분의 요청이 비슷한 속도로 처리되었다는 의미가 된다.

보통 요청-응답 시 데이터베이스에 접근할 때 시간이 가장 많이 소요된다. 서버는 여러대로 늘리기 쉽지만, 데이터베이스는 늘리기 어려우므로 데이터베이스에 많은 요청이 몰리곤 한다. 따라서 최대한 데이터베이스에 접근하는 요청을 줄이면 좋다. 반복적으로 가져오는 데이터는 캐싱을 하는 것이 바람직하다.

`artillery`만으로는 네트워크가 느린 것인지, 서버가 느린 것인지, DB가 느린 것인지까지는 파악할 수 없으므로 좀 더 정교한 모니터링과 성능 측정을 위해서는 `Datadog` 이나 `newrelic` 같은 서비스를 적용해 보면 좋다.

### TODO✅

- 인수 테스트
- 시스템 테스트
