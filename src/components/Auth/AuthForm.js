import { useState, useRef, useContext } from "react";
import { useHistory } from "react-router-dom"; // 사용자 리다이렉션

import AuthContext from "../../store/auth-context";
import classes from "./AuthForm.module.css";

const AuthForm = () => {
  const history = useHistory();
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const authCtx = useContext(AuthContext); // auth: token이 생성되는 곳인 AuthForm.js에 AuthContext 내려주기

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = (event) => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    // + validation 로직 추가 가능!
    setIsLoading(true);
    let url;
    if (isLogin) {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAL_sFLjUbNmnkOCMW020d3_c3AKfY-msI";
    } else {
      // signup request 보내기!
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAL_sFLjUbNmnkOCMW020d3_c3AKfY-msI";
      // fetch(
      //   "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAL_sFLjUbNmnkOCMW020d3_c3AKfY-msI", // sign-up
      //   {
      //     method: "POST",
      //     body: JSON.stringify({
      //       email: enteredEmail,
      //       password: enteredPassword,
      //       returnSecureToken: true,
      //       //firebase doc에서 요청한 내용=> returnSecureToken	boolean	Whether or not to return an ID and refresh token. Should always be true.
      //     }),
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // ).then((res) => {
      //   setIsLoading(false);
      //   if (res.ok) {
      //   } else {
      //     // res.ok 가 아니더라도 틀린 데이터가 무엇인지 보기위해 res.json()으로 가져오기
      //     return res.json().then((data) => {
      //       // show an error modal
      //       console.log(data);
      //       let errorMessage = "Authentication failed !";
      //       // firebase 내장 에러메세지를 쓸 경우 ↓
      //       // if (data && data.error && data.error.message) {
      //       //   // data가 있는데 그 data에 error가 있고 error.message까지 있을 경우
      //       //   errorMessage = data.error.message;
      //       // }
      //       alert(errorMessage);
      //     });
      //   }
      // });
    }
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setIsLoading(false);
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then((data) => {
            // show an error modal
            console.log(data);
            let errorMessage = "Authentication failed !";
            throw new Error(errorMessage);
          });
        }
      })
      .then((data) => {
        // console.log(data);
        const expirationTime = new Date(
          new Date().getTime() + +data.expiresIn * 1000
        );
        authCtx.login(data.idToken, expirationTime.toISOString()); // idToken은 console에서 볼 수 있는 정해진 프로퍼티명
        // auth: 여기까지 마친 후 MainNavigation.js로 가서 로그인 상태 Nav에 반영하기
        history.replace("/"); // 로그인 후에는 뒤로가기를 못하게 하기
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? "Login" : "Create Account"}</button>
          )}
          {isLoading && <p>Sending request...</p>}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
