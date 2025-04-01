import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBillDetails } from '../lib/api';
import { format, parseISO } from 'date-fns';
import { UserIcon, CalendarIcon, FileTextIcon, AlertTriangleIcon } from 'lucide-react';
import LoadingIcon from '../components/LoadingIcon';
import TrackBillButton from '../components/TrackBillButton';
import { auth } from '../lib/firebase';
import type { Bill, Action, Cosponsor, Summary } from '../lib/apiTypes';

const BillDetails = () => {
  const { congress, type, number } = useParams();
  const [user] = React.useState(auth.currentUser);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bill', congress, type, number],
    queryFn: () => {
      if (!congress || !type || !number) {
        throw new Error('Missing required parameters.');
      }
      return getBillDetails(congress, type, number);
    },
    onSuccess: (data) => {
      console.log('Bill details fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Error fetching bill details:', error);
    },
    enabled: Boolean(congress && type && number),
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Date not available';
    }
  };

  if (isLoading) {
    return <LoadingIcon size="lg" />;
  }

  if (error || !data?.bill) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg flex items-start">
        <AlertTriangleIcon className="h-5 w-5 mr-3 mt-0.5" />
        <div>
          <h3 className="font-semibold">Error Loading Bill Details</h3>
          <p className="mt-1">
            {error instanceof Error ? error.message : 'Failed to load bill details. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  const { bill } = data;
  const actions = Array.isArray(bill.actions) ? bill.actions : [];
  const cosponsors = Array.isArray(bill.cosponsors) ? bill.cosponsors : [];
  const summaries = Array.isArray(bill.summaries) ? bill.summaries : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-3xl font-bold text-gray-900">{bill.title || 'Title not available'}</h2>
        {user && (
          <TrackBillButton 
            billId={`${bill.congress}-${bill.type}-${bill.number}`}
            bill={{
              congress: bill.congress,
              type: bill.type,
              number: bill.number,
              title: bill.title,
              status: bill.status,
              introducedDate: bill.introducedDate,
              latestAction: bill.latestAction
            }}
          />
        )}
      </div>
      
      <div className="grid gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Bill Information</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              {bill.type} {bill.number}
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full">
              {bill.congress}th Congress
            </span>
            {bill.status && (
              <span className={`px-4 py-2 rounded-full ${
                bill.status === 'enacted' ? 'bg-green-100 text-green-800' :
                bill.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {bill.status}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Introduced: {formatDate(bill.introducedDate || '')}</span>
            </div>
            {bill.updateDate && (
              <div className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                <span>Last Updated: {formatDate(bill.updateDate)}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Latest Summary</h3>
          {summaries.length > 0 ? (
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap">
                {summaries[0].text}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {formatDate(summaries[0].updateDate)}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">No summary available for this bill.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Cosponsors ({cosponsors.length})
          </h3>
          {cosponsors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cosponsors.map((cosponsor, index) => (
                <Link
                  key={`${cosponsor.bioguideId}-${index}`}
                  to={`/member/${cosponsor.bioguideId}`}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <UserIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {cosponsor.firstName} {cosponsor.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {cosponsor.party} - {cosponsor.state}
                      {cosponsor.district && ` District ${cosponsor.district}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sponsored on {formatDate(cosponsor.sponsorshipDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No cosponsors available for this bill.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Actions ({actions.length})
          </h3>
          {actions.length > 0 ? (
            <div className="space-y-4">
              {actions.map((action, index) => (
                <div
                  key={`${action.actionDate}-${index}`}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <p className="font-medium text-gray-900">{action.text}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(action.actionDate)}
                  </p>
                  {action.type && (
                    <p className="text-xs text-gray-500 mt-1">
                      Type: {action.type}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No actions available for this bill.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDetails;