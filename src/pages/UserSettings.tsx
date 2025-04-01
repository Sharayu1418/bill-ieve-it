import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { BellIcon, MoonIcon, SunIcon } from 'lucide-react';
import LoadingIcon from '../components/LoadingIcon';
import type { UserPreferences } from '../lib/firebaseTypes';

const UserSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [preferences, setPreferences] = React.useState<UserPreferences>({
    emailNotifications: true,
    theme: 'light'
  });

  React.useEffect(() => {
    const loadPreferences = async () => {
      if (!auth.currentUser) {
        navigate('/');
        return;
      }

      try {
        const prefsDoc = await getDoc(
          doc(db, `users/${auth.currentUser.uid}/preferences/default`)
        );
        
        if (prefsDoc.exists()) {
          setPreferences(prefsDoc.data() as UserPreferences);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [navigate]);

  const handleSavePreferences = async () => {
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      await setDoc(
        doc(db, `users/${auth.currentUser.uid}/preferences/default`),
        preferences
      );
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingIcon size="lg" />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Notification Preferences
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-gray-500" />
              <div>
                <h3 className="font-medium text-gray-900">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-500">
                  Receive updates about your tracked bills
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  emailNotifications: e.target.checked
                }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preferences.theme === 'dark' ? (
                <MoonIcon className="h-6 w-6 text-gray-500" />
              ) : (
                <SunIcon className="h-6 w-6 text-gray-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  Theme Preference
                </h3>
                <p className="text-sm text-gray-500">
                  Choose your preferred theme
                </p>
              </div>
            </div>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                theme: e.target.value as 'light' | 'dark'
              }))}
              className="block w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;