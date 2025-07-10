import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: process.env.REACT_APP_POOL_CLIENT_ID,
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      mandatorySignIn: true, // Forces sign-in
      //  hostedUI: true,
      loginWith: {
        // Optional
        oauth: {
          domain: process.env.REACT_APP_COGNITO_OAUTH_DOMAIN,
          scopes: ["email", "openid", "profile"],
          redirectSignIn: [process.env.REACT_APP_COGNITO_REDIRECT_SIGN_IN],
          redirectSignOut: [process.env.REACT_APP_COGNITO_REDIRECT_SIGN_OUT],
          responseType: "code",
        },
        //  username: "true",
      },
    },
  },
});

// Amplify.configure({
//   Auth: {
//     Cognito: {
//       userPoolClientId: process.env.REACT_APP_POOL_CLIENT_ID,
//       userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
//       mandatorySignIn: true, // Forces sign-in
//       loginWith: {
//         // Optional
//         oauth: {
//           domain: process.env.REACT_APP_COGNITO_OAUTH_DOMAIN,
//           scopes: ["email", "openid", "profile"],
//           redirectSignIn: process.env.REACT_APP_COGNITO_REDIRECT_SIGN_IN,
//           redirectSignOut: process.env.REACT_APP_COGNITO_REDIRECT_SIGN_OUT,
//           responseType: "code",
//         },
//       },
//     },
//   },
// });

//console.log("Amplify Config:", Amplify.configure());

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
