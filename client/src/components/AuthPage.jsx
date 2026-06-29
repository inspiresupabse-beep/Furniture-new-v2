import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthPage({ mode = 'signin' }) {
  const isSignUp = mode === 'signup';
  const navigate = useNavigate();
  const { signin, signup } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(username, password);
      } else {
        await signin(username, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-stone-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100';

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white text-2xl shadow-lg">
            🧮
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Quotation Calculator</h1>
          <p className="text-sm text-stone-500 mt-1">
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">👤</span>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="e.g. admin"
                className={inputClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔒</span>
              <input
                type="password"
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔒</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
            {error === 'Invalid username or password' && !isSignUp && (
              <span className="block mt-1 text-xs text-red-500">
                No account yet? Use Sign up below to create one first.
              </span>
            )}
          </p>
        )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link
            to={isSignUp ? '/signin' : '/signup'}
            className="font-medium text-violet-600 hover:text-violet-700"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
