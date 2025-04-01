import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { BellIcon, StarIcon, SettingsIcon, AlertTriangleIcon } from 'lucide-react';
import LoadingIcon from '../components/LoadingIcon';
import type { TrackedBill, UserPreferences } from '../lib/firebaseTypes';

const UserDashboard = () => {
  const [trackedBills, setTrackedBills] = React.useState<TrackedBill[]>([]);
  const [preferences, setPreferences] = React.useState<UserPreferences>({
    emailNotifications: true,
    theme: 'light'
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const trackedBillsRef = collection(db, `users/${userId}/trackedBills`);
    const preferencesRef = collection(db, `users/${userId}/preferences`);

    // Subscribe to tracked bills
    const unsubscribeBills = onSnapshot(trackedBillsRef, 
      (snapshot) => {
        const bills: TrackedBill[] = [];
        snapshot.forEach(doc => {
          bills.push({ id: doc.id, ...doc.data() } as TrackedBill);
        });
        setTrackedBills(bills);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tracked bills:', error);
        setError('Failed to load tracked bills');
        setLoading(false);
      }
    );

    // Subscribe to user preferences
    const unsubscribePrefs = onSnapshot(
      query(preferencesRef, where('userId', '==', userId)),
      (snapshot) => {
        if (!snapshot.empty) {
          setPreferences(snapshot.docs[0].data() as UserPreferences);
        }
      }
    );

    return () => {
      unsubscribeBills();
      unsubscribePrefs();
    };
  }, []);

  if (!auth.currentUser) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">
          Sign In Required
        </h2>
        <p className="text-yellow-700 mb-6">
          Please sign in to view your dashboard and tracked bills.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-yellow-100 text-yellow-800 px-6 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (loading) {
    return <LoadingIcon size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg flex items-start">
        <AlertTriangleIcon className="h-5 w-5 mr-3 mt-0.5" />
        <div>
          <h3 className="font-semibold">Error Loading Dashboard</h3>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {auth.currentUser.email}
          </h2>
          <Link
            to="/settings"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <SettingsIcon className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <StarIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Tracked Bills
              </h3>
            </div>
            <p className="text-blue-700">
              You are currently tracking {trackedBills.length} bills
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <BellIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">
                Notifications
              </h3>
            </div>
            <p className="text-purple-700">
              {preferences.emailNotifications
                ? 'Email notifications are enabled'
                : 'Email notifications are disabled'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Your Tracked Bills
        </h3>

        {trackedBills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't tracked any bills yet.</p>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Browse bills to start tracking
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trackedBills.map((bill) => (
              <Link
                key={bill.id}
                to={`/bill/${bill.congress}/${bill.type}/${bill.number}`}
                className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {bill.title || `${bill.type} ${bill.number}`}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Tracked since: {format(bill.trackedAt.toDate(), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {bill.status && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${bill.status === 'enacted' ? 'bg-green-100 text-green-800' :
                        bill.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {bill.status}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;