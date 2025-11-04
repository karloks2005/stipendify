import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function CallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(true);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    // Parse query params (e.g., ?code=...&state=...) and any fragment/hash params
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const err = params.get('error');

    // Some providers return additional values in the URL fragment (after #).
    // The fragment is not sent to the server by the browser, so capture any
    // fragment params and merge them into the query params to forward them.
    const hash = window.location.hash || '';
    if (hash && hash.length > 1) {
      try {
        const fragParams = new URLSearchParams(hash.slice(1));
        for (const [k, v] of fragParams.entries()) {
          // Do not overwrite existing query params; append duplicates if needed
          params.append(k, v);
        }
      } catch (e) {
        // If parsing fails, forward the raw fragment under `fragment` key
        params.append('fragment', hash.slice(1));
      }
    }

    if (err) {
      setError(err);
      setBusy(false);
      return;
    }

    if (!code) {
      setError('Missing authorization code in callback URL');
      setBusy(false);
      return;
    }

    // Call backend exchange endpoint. fastapi-users typically exposes
    // /auth/google/callback which accepts the code and performs the exchange.
    // Forward the full set of params (query + fragment) to the backend.
    const exchangeBase = 'http://localhost:8888/auth/google/callback';
    const exchangeQs = params.toString();
    const exchangeUrl = exchangeQs ? `${exchangeBase}?${exchangeQs}` : exchangeBase;

    fetch(exchangeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }).then(async (res) => {
      // If backend returns JSON with access token, use it to populate auth context.
      if (res.ok) {
        try {
          const data = await res.json().catch(() => null);
            // If backend provided an access token shape, call login helper.
            if (data?.access_token) {
              login(data);
              console.log("yayyy");
              navigate('/', { replace: true });
              return;
            }
          
          navigate('/', { replace: true });
        } catch (err) {
          console.error('Callback handling error', err);
          setError('Failed to process callback response');
        }
      } else {
        try {
          const errJson = await res.json().catch(() => null);
          setError(errJson?.detail || errJson?.error || `Exchange failed (${res.status})`);
        } catch (e) {
          setError(`Exchange failed (${res.status})`);
        }
      }
    }).catch(err => {
      console.error('Network error exchanging code', err);
      setError('Network error while exchanging authorization code');
    }).finally(() => setBusy(false));
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow w-full max-w-lg text-center">
        {busy && <p className="text-gray-600">Processing authentication…</p>}
        {!busy && error && (
          <div>
            <h3 className="text-lg font-semibold text-red-600">Authentication error</h3>
            <p className="text-sm text-gray-700 mt-2">{error}</p>
            <div className="mt-4">
              <a href="/login" className="text-blue-500">Return to login</a>
            </div>
          </div>
        )}
        {!busy && !error && (
          <div>
            <h3 className="text-lg font-semibold">Done</h3>
            <p className="text-sm text-gray-600 mt-2">You will be redirected shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
