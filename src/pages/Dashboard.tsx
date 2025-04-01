import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getBills } from '../lib/api';
import { SearchIcon, FilterIcon, CalendarIcon, TagIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import BillStatistics from '../components/BillStatistics';
import TrackBillButton from '../components/TrackBillButton';
import LoadingIcon from '../components/LoadingIcon';
import { auth } from '../lib/firebase';

const BILL_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'introduced', label: 'Introduced' },
  { value: 'referred', label: 'Referred' },
  { value: 'reported', label: 'Reported' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'enacted', label: 'Enacted' },
];

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

const Dashboard = () => {
  const [formParams, setFormParams] = React.useState({
    searchTerm: '',
    year: '',
    status: '',
    chamber: ''
  });

  const [searchParams, setSearchParams] = React.useState({
    searchTerm: '',
    year: '',
    status: '',
    chamber: ''
  });

  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
  const [user] = React.useState(auth.currentUser);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bills', searchParams],
    queryFn: async () => {
      const params: Record<string, string> = {
        limit: '100',
        offset: '0'
      };

      if (searchParams.searchTerm.trim()) {
        params.query = searchParams.searchTerm.trim();
      }

      if (searchParams.status) {
        params.status = searchParams.status;
      }

      if (searchParams.chamber) {
        params.chamber = searchParams.chamber;
      }

      if (searchParams.year) {
        const year = parseInt(searchParams.year);
        const congress = Math.floor((year - 1789) / 2) + 1;
        params.congress = congress.toString();
      }

      return getBills(params);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(formParams);
    setSelectedStatus(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormParams(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusClick = (status: string | null) => {
    setSelectedStatus(status);
    if (status) {
      setFormParams(prev => ({ ...prev, searchTerm: '', status: '', year: '', chamber: '' }));
      setSearchParams(prev => ({ ...prev, searchTerm: '', status: '', year: '', chamber: '' }));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return 'Date not available';
    }
  };

  const filteredBills = React.useMemo(() => {
    if (!data?.bills) return [];
    
    return data.bills.filter(bill => {
      if (!selectedStatus) return true;
      
      const rawStatus = bill.status || '';
      const latestAction = bill.latestAction?.text || '';
      const statusText = (rawStatus + ' ' + latestAction).toLowerCase();

      switch (selectedStatus) {
        case 'Enacted':
          return statusText.match(/enacted|became.*law|signed.*president/);
        case 'Failed':
          return statusText.match(/failed|rejected|defeated/);
        case 'Passed':
          return statusText.match(/passed|agreed to|cleared for|resolution agreed/);
        case 'Reported':
          return statusText.match(/reported|ordered to be reported|committee report|discharged from committee/);
        case 'Referred':
          return statusText.match(/referred|committee/);
        case 'Introduced':
          return statusText.match(/introduced|read twice|read first time|read the first time/);
        case 'In Progress':
          return !statusText.match(/enacted|failed|rejected|defeated|passed|agreed to|cleared for|resolution agreed|reported|ordered to be reported|committee report|discharged from committee|referred|committee|introduced|read twice|read first time|read the first time/);
        default:
          return true;
      }
    });
  }, [data?.bills, selectedStatus]);

  if (isLoading) {
    return <LoadingIcon size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <p>Error loading bills. Please try again later.</p>
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Legislative Dashboard</h2>
        
        {data?.bills && (
          <BillStatistics 
            bills={data.bills} 
            onStatusClick={handleStatusClick}
            selectedStatus={selectedStatus}
          />
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Bills
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="searchTerm"
                  placeholder="Search by keyword..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formParams.searchTerm}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  name="year"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formParams.year}
                  onChange={handleInputChange}
                >
                  <option value="">All Years</option>
                  {YEARS.map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Status
              </label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  name="status"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formParams.status}
                  onChange={handleInputChange}
                >
                  {BILL_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chamber
              </label>
              <div className="relative">
                <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  name="chamber"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formParams.chamber}
                  onChange={handleInputChange}
                >
                  <option value="">All Chambers</option>
                  <option value="house">House</option>
                  <option value="senate">Senate</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-4">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search Bills
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredBills.map((bill: any) => (
          <div key={bill.billId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex-1 mr-4">
                <Link to={`/bill/${bill.congress}/${bill.type}/${bill.number}`}>
                  {bill.title || 'Title not available'}
                </Link>
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm whitespace-nowrap">
                  {bill.type} {bill.number}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm whitespace-nowrap">
                  {bill.congress}th Congress
                </span>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm inline-block
                ${bill.status === 'enacted' ? 'bg-green-100 text-green-800' :
                  bill.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'}`}
              >
                {bill.status || 'Status not available'}
              </span>
              {user && (
                <TrackBillButton 
                  billId={bill.billId} 
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

            <p className="text-gray-600 mb-4 line-clamp-3">
              {bill.summary || 'No summary available.'}
            </p>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">
                Introduced: {formatDate(bill.introducedDate)}
              </span>
              <Link 
                to={`/bill/${bill.congress}/${bill.type}/${bill.number}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}

        {filteredBills.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No bills found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;