import React, { useEffect, useState } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { AuthenticatorKey, OktaAuth } from '@okta/okta-auth-js';
import { useHistory } from 'react-router-dom';
import '@okta/okta-signin-widget/css/okta-sign-in.min.css';
import { Form, Button, Message } from 'semantic-ui-react';
import Spinner from './Spinner';

const Login = () => {
  const { oktaAuth } = useOktaAuth();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [stateTran,setStateTran] = useState('default');
  const [error, setError] = useState('');
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const handleLogin = async() => {
    if (!username || !password) {
      setError('Please enter both username and password.');
    } else {
      setLoading(true);
      sessionStorage.clear()
      const {messages} = await oktaAuth.idx.register({
        email: username,
        password: password,
        authenticator: AuthenticatorKey.OKTA_EMAIL
      });
      if(messages){
        setError("Something was wrong");
      }else{
        setStateTran('code');
        setError("");
      }
      setLoading(false);
    }
  };

  const handleCode = async()=>{
    setLoading(true);
    const auth = await oktaAuth.idx.proceed({
      verificationCode: code
    });
    const webauthn = await oktaAuth.idx.proceed({authenticator: AuthenticatorKey.WEBAUTHN});
    const activationData = webauthn.nextStep.authenticator.contextualData.activationData;
    const authenticatorEnrollments = webauthn.nextStep.authenticatorEnrollments;
    const options = OktaAuth.webauthn.buildCredentialCreationOptions(activationData, authenticatorEnrollments);
    const credential = await navigator.credentials.create(options);
    const res = OktaAuth.webauthn.getAttestation(credential);
    const transaction = await oktaAuth.idx.proceed({
      clientData:res.clientData,
      attestation:res.attestation
    });
    const transaction2 = await oktaAuth.idx.proceed({skip:true});
    const { tokens, status } = transaction2 || {};
    if (status === "SUCCESS") {
      oktaAuth.tokenManager.setTokens(tokens);
      history.replace('/');
    }else{
      setError("Something was wrong");
    }
    setLoading(false);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    {stateTran === 'code' ?
      <Form>
        <h2>Email code</h2>
        <Form.Field>
          <label>Code:</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button onClick={handleCode}>Send</Button>
          {error && <Message negative>{error}</Message>}  
        </Form.Field>
      </Form>
    :
      <Form>
        <h2>Register User</h2>
        <Form.Field>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Field>
        <Button onClick={handleLogin}>Login</Button>
        {error && <Message negative>{error}</Message>}
      </Form>
    }
    </>
  );
};

export default Login;
