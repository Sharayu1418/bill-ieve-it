import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { UserIcon, LogOutIcon } from 'lucide-react';
import AuthModal from './AuthModal';

const UserMenu = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div>
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="text-white">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
          >
            <LogOutIcon className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
        >
          <UserIcon className="h-5 w-5" />
          <span>Sign In</span>
        </button>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default UserMenu;