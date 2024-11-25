import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify'; // Correct way to import Amplify in recent versions


Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '3apts80kiph7bafapf28ltu3vl',
      userPoolId: 'eu-west-1_hgUDdjyRr',
	      mandatorySignIn: true, // Forces sign-in
        hostedUI: true,
      loginWith: { // Optional
        oauth: {
          domain: 'eventmgmt.auth.eu-west-1.amazoncognito.com',
          scopes:  ['email', 'openid', 'profile'],
          redirectSignIn: ['http://localhost:3000/landing'], 
          redirectSignOut:  ['http://localhost:3000/'],
          responseType: 'code'
        },
        username: 'true'
      }
    }
  }
});




const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
