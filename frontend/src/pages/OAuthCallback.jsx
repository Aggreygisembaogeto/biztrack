import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = () => {
      try {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          let errorMessage = 'Authentication failed. Please try again.';
          if (error === 'google_auth_failed') {
            errorMessage = 'Google authentication failed. Please try again.';
          } else if (error === 'github_auth_failed') {
            errorMessage = 'GitHub authentication failed. Please try again.';
          } else if (error === 'facebook_auth_failed') {
            errorMessage = 'Facebook authentication failed. Please try again.';
          }
          
          toast.error(errorMessage);
          navigate('/login');
          return;
        }

        if (token && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Save to localStorage
          localStorage.setItem('biztrack_token', token);
          localStorage.setItem('biztrack_user', JSON.stringify(user));
          
          toast.success(`Welcome back, ${user.business_name}!`);
          
          // Force page reload to trigger AuthContext initialization
          window.location.href = '/dashboard';
        } else {
          toast.error('Authentication failed. Missing credentials.');
          navigate('/login');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing authentication...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we log you in</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
