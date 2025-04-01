import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMembers } from '../lib/api';
import { SearchIcon, UserIcon, MapPinIcon, BuildingIcon } from 'lucide-react';
import LoadingIcon from '../components/LoadingIcon';
import type { Member } from '../lib/apiTypes';

const Members = () => {
  const [formSearchTerm, setFormSearchTerm] = React.useState('');
  const [activeSearchTerm, setActiveSearchTerm] = React.useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['members', activeSearchTerm],
    queryFn: () => getMembers({ 
      query: activeSearchTerm,
      limit: 100 
    })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchTerm(formSearchTerm.trim());
  };

  if (isLoading) {
    return <LoadingIcon size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading members. Please try again later.</p>
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Congress Members</h2>
        
        <form onSubmit={handleSubmit} className="max-w-xl mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, state, or party..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formSearchTerm}
                onChange={(e) => setFormSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.members?.map((member: Member) => (
          <Link
            key={member.bioguideId}
            to={`/member/${member.bioguideId}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {member.fullName || `${member.firstName} ${member.lastName}`.trim()}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <BuildingIcon className="w-4 h-4 mr-2" />
                <span>{member.chamber || 'Chamber not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <UserIcon className="w-4 h-4 mr-2" />
                <span>{member.party || 'Party not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-4 h-4 mr-2" />
                <span>
                  {member.state} 
                  {member.district && ` District ${member.district}`}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {data?.members?.length === 0 && (
          <div className="col-span-full bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No members found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;