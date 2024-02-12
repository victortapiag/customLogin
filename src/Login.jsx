import React, { useEffect, useState } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { useHistory } from 'react-router-dom';
import '@okta/okta-signin-widget/css/okta-sign-in.min.css';
import { Form, Button, Message } from 'semantic-ui-react';
import Spinner from './Spinner';

const Login = () => {
  const { oktaAuth } = useOktaAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async() => {
    sessionStorage.clear();
    if (!username || !password) {
      setError('Please enter both username and password.');
    } else {
      setLoading(true);
      const auth = await oktaAuth.signInWithCredentials({
        username: username,
        password: password
      })
      const {sessionToken} = auth;
      if(!sessionToken){
        setLoading(false);
        setError("Invalid username or password.");
      }else{ 
        oktaAuth.signInWithRedirect({sessionToken});
      }
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <Form>
      <h2>Login</h2>
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
  );
};

export default Login;
