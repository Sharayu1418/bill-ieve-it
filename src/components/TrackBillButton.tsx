import React from 'react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { StarIcon } from 'lucide-react';

interface TrackBillButtonProps {
  billId: string;
  bill?: {
    congress: string;
    type: string;
    number: string;
    title?: string;
    status?: string;
    introducedDate?: string;
    latestAction?: {
      text: string;
      date: string;
    };
  };
}

const TrackBillButton: React.FC<TrackBillButtonProps> = ({ billId, bill }) => {
  const [isTracked, setIsTracked] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    const checkIfTracked = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, `users/${auth.currentUser.uid}/trackedBills`, billId);
        const docSnap = await getDoc(docRef);
        setIsTracked(docSnap.exists());
      } catch (error) {
        console.error('Error checking bill tracking status:', error);
      }
    };

    checkIfTracked();
  }, [billId]);

  const handleTrackBill = async () => {
    if (!auth.currentUser) {
      alert('Please sign in to track bills');
      return;
    }

    if (!bill) {
      console.error('Bill data is required to track a bill');
      return;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/trackedBills`, billId);
      
      if (isTracked) {
        await deleteDoc(docRef);
        setIsTracked(false);
      } else {
        await setDoc(docRef, {
          congress: bill.congress,
          type: bill.type,
          number: bill.number,
          title: bill.title || '',
          status: bill.status || 'Unknown',
          introducedDate: bill.introducedDate || null,
          latestAction: bill.latestAction || null,
          trackedAt: new Date().toISOString(),
          notifications: true,
          notes: ''
        });
        setIsTracked(true);
      }
    } catch (error) {
      console.error('Error tracking bill:', error);
      alert('Error tracking bill. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleTrackBill}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading || !bill}
      className={`
        flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 transform
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${!bill ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' :
          isTracked
            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }
        ${isHovered && !isLoading && bill ? 'scale-105' : 'scale-100'}
      `}
    >
      <StarIcon 
        className={`h-4 w-4 transition-all duration-200 ${
          isTracked ? 'fill-yellow-500' : isHovered ? 'fill-gray-400' : ''
        }`}
      />
      <span className="relative">
        {isTracked ? (
          <>
            <span className={`transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
              Tracked
            </span>
            <span className={`absolute inset-0 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              Untrack
            </span>
          </>
        ) : (
          'Track Bill'
        )}
      </span>
    </button>
  );
};

export default TrackBillButton;