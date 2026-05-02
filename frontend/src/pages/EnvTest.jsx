import React from 'react';

const EnvTest = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const allEnvVars = import.meta.env;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Environment Variables Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">VITE_API_URL</h2>
          <div className="bg-gray-700 p-4 rounded">
            <code className="text-green-400">
              {apiUrl || '❌ NOT SET (will use default: http://localhost:5001)'}
            </code>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Expected Value</h2>
          <div className="bg-gray-700 p-4 rounded">
            <code className="text-blue-400">
              https://biztrack-production-134f.up.railway.app
            </code>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">All Environment Variables</h2>
          <div className="bg-gray-700 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(allEnvVars, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test API Connection</h2>
          <button
            onClick={async () => {
              const url = apiUrl || 'http://localhost:5001';
              try {
                const response = await fetch(`${url}/api/health`);
                const data = await response.json();
                alert(`✅ Success!\n\n${JSON.stringify(data, null, 2)}`);
              } catch (error) {
                alert(`❌ Error!\n\n${error.message}`);
              }
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Test Backend Connection
          </button>
        </div>

        <div className="mt-6 bg-yellow-900 border border-yellow-600 rounded-lg p-4">
          <h3 className="font-semibold mb-2">⚠️ If VITE_API_URL is not set:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to Vercel Dashboard → Settings → Environment Variables</li>
            <li>Add: <code className="bg-gray-700 px-2 py-1 rounded">VITE_API_URL</code></li>
            <li>Value: <code className="bg-gray-700 px-2 py-1 rounded">https://biztrack-production-134f.up.railway.app</code></li>
            <li>Check all environments (Production, Preview, Development)</li>
            <li>Save and Redeploy</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EnvTest;
