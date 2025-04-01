import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMemberDetails } from '../lib/api';
import { UserIcon, CalendarIcon, MapPinIcon, BuildingIcon } from 'lucide-react';
import LoadingIcon from '../components/LoadingIcon';
import type { Member, Term } from '../lib/apiTypes';

const MemberDetails = () => {
  const { bioguideId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['member', bioguideId],
    queryFn: () => getMemberDetails(bioguideId!)
  });

  const formatTermDates = (term: Term) => {
    const startYear = term.start || 'Present';
    const endYear = term.end || 'Present';
    return `${startYear} - ${endYear}`;
  };

  if (isLoading) {
    return <LoadingIcon size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading member details. Please try again later.</p>
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  const member = data?.member;

  if (!member) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>No member data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {member.firstName} {member.lastName}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <BuildingIcon className="w-4 h-4 mr-1" />
              {member.chamber}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <UserIcon className="w-4 h-4 mr-1" />
              {member.party}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {member.state} {member.district ? `District ${member.district}` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Terms of Service</h3>
          <div className="space-y-4">
            {member.terms?.map((term: Term, index: number) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <BuildingIcon className="w-4 h-4 text-blue-500" />
                  <span>{term.chamber}</span>
                  {term.district && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>District {term.district}</span>
                    </>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatTermDates(term)}</span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {term.state} • {term.party}
                </div>
              </div>
            ))}
          </div>
        </div>

        {member.sponsoredBills && member.sponsoredBills.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Sponsored Bills
            </h3>
            <div className="space-y-4">
              {member.sponsoredBills.map((bill: any, index: number) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <h4 className="font-medium text-gray-900">{bill.title || 'Title not available'}</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {bill.type} {bill.number}
                    </span>
                    {bill.introducedDate && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Introduced: {new Date(bill.introducedDate).getFullYear()}
                      </span>
                    )}
                    {bill.status && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${bill.status === 'enacted' ? 'bg-green-100 text-green-800' :
                          bill.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {bill.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetails;