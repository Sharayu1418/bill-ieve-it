import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import {
  XIcon,
  MailIcon,
  LockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordValidation {
  hasLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  matches: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [validation, setValidation] = useState<PasswordValidation>({
    hasLength: false,
    hasNumber: false,
    hasSpecial: false,
    matches: false
  });

  useEffect(() => {
    if (isSignUp) {
      setValidation({
        hasLength: password.length >= 6,
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        matches: password === confirmPassword && password !== ''
      });
    }
  }, [password, confirmPassword, isSignUp]);

  const isPasswordValid = () => {
    return Object.values(validation).every(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && !isPasswordValid()) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await signOut(auth); // Sign out until email is verified
        setVerificationSent(true);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          setError('Please verify your email before signing in. Check your inbox for the verification link.');
          return;
        }
        
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    isValid ? (
      <CheckCircleIcon className="h-4 w-4 text-green-500" />
    ) : (
      <XCircleIcon className="h-4 w-4 text-gray-300" />
    )
  );

  if (!isOpen) return null;

  if (verificationSent) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <MailIcon className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{email}</strong>. Please check your inbox and verify your email address to continue.
            </p>
            <button
              onClick={() => {
                setVerificationSent(false);
                setIsSignUp(false);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 pb-8">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-blue-100 mt-2">
            {isSignUp
              ? 'Join us to track and monitor congressional legislation'
              : 'Sign in to access your tracked bills and preferences'}
          </p>
        </div>

        <div className="p-6 pt-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <div className="flex items-start">
                <AlertTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow
                    placeholder:text-gray-400"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow
                    placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow
                        placeholder:text-gray-400"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Password Requirements
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <ValidationIcon isValid={validation.hasLength} />
                      <span className={validation.hasLength ? 'text-green-700' : 'text-gray-600'}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ValidationIcon isValid={validation.hasNumber} />
                      <span className={validation.hasNumber ? 'text-green-700' : 'text-gray-600'}>
                        Contains a number
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ValidationIcon isValid={validation.hasSpecial} />
                      <span className={validation.hasSpecial ? 'text-green-700' : 'text-gray-600'}>
                        Contains a special character
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ValidationIcon isValid={validation.matches} />
                      <span className={validation.matches ? 'text-green-700' : 'text-gray-600'}>
                        Passwords match
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading || (isSignUp && !isPasswordValid())}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg
                hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                font-medium text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoaderIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Processing...
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {isSignUp ? 'Sign in instead' : 'Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;