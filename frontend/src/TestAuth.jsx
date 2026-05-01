import React from 'react';
import { useAuth } from './context/AuthContext';

function TestAuth() {
  const auth = useAuth();
  
  console.log('TestAuth - auth object:', auth);
  console.log('TestAuth - user:', auth?.user);
  console.log('TestAuth - initialized:', auth?.initialized);
  
  return (
    <div style={{ padding: '20px', color: 'white', background: '#1a1a1a', minHeight: '100vh' }}>
      <h1>Auth Test Page</h1>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
}

export default TestAuth;
