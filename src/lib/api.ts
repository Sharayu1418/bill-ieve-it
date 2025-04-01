import axios from 'axios';

const API_BASE_URL = 'https://api.congress.gov/v3';
const API_KEY = import.meta.env.VITE_CONGRESS_API_KEY;

if (!API_KEY) {
  throw new Error('Congress.gov API key is required. Please add VITE_CONGRESS_API_KEY to your .env file.');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  params: {
    api_key: API_KEY,
    format: 'json',
  },
});

api.interceptors.request.use(
  config => {
    const urlForLogging = config.url + '?' + 
      new URLSearchParams({
        ...config.params,
        api_key: '[REDACTED]'
      }).toString();
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${urlForLogging}`);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log(`✅ API Response: ${response.status} ${response.statusText}`);
    if (response.data) {
      const dataStructure = Object.keys(response.data).join(', ');
      console.log(`📊 Response data contains: ${dataStructure}`);
    }
    return response;
  },
  error => {
    if (error.response) {
      console.error('❌ API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Handle 404s for bill sub-resources by returning empty arrays
      if (error.response.status === 404) {
        const url = error.config.url;
        if (url?.includes('/actions') || url?.includes('/summaries') || url?.includes('/cosponsors')) {
          console.log(`Resource not found, returning empty array for: ${url}`);
          const resourceType = url.split('/').pop();
          return { data: { [resourceType]: [] } };
        }
      }

      switch (error.response.status) {
        case 400:
          error.message = 'Invalid request. Please check your parameters.';
          break;
        case 401:
          error.message = 'Invalid API key. Please check your configuration.';
          break;
        case 403:
          error.message = 'Access forbidden. Please check your API key permissions.';
          break;
        case 404:
          error.message = 'Resource not found.';
          break;
        case 429:
          error.message = 'Rate limit exceeded. Please try again later.';
          break;
        case 500:
          error.message = 'Congress.gov API server error. Please try again later.';
          break;
        default:
          error.message = 'An error occurred while fetching data.';
      }
    } else if (error.request) {
      console.error('❌ API No Response:', error.request);
      error.message = 'No response received from Congress.gov API.';
    } else {
      console.error('❌ API Request Setup Error:', error.message);
      error.message = 'Error setting up the request.';
    }
    return Promise.reject(error);
  }
);

export interface BillParams {
  offset?: number;
  limit?: number;
  fromDateTime?: string;
  toDateTime?: string;
  query?: string;
  status?: string;
  chamber?: string;
  congress?: string;
  billType?: string;
}

export interface MemberParams {
  offset?: number;
  limit?: number;
  congress?: number;
  chamber?: string;
  state?: string;
  district?: string;
  party?: string;
  query?: string;
}

export interface PaginatedResponse<T> {
  request: {
    offset: number;
    limit: number;
    count: number;
  };
  pagination?: {
    next?: string;
    previous?: string;
    count: number;
    totalCount: number;
  };
  [key: string]: any;
}

const BILL_TYPES = ['HR', 'S', 'HJRES', 'SJRES', 'HCONRES', 'SCONRES', 'HRES', 'SRES'];

export const getBills = async (params: BillParams = {}): Promise<PaginatedResponse<any>> => {
  try {
    const requests = [];
    const { congress, billType } = params;

    if (congress && billType) {
      requests.push(
        api.get(`/bill/${congress}/${billType.toUpperCase()}`, {
          params: {
            ...params,
            detail: 'summary',
            sort: 'updateDate+desc'
          }
        })
      );
    } else if (congress) {
      BILL_TYPES.forEach(type => {
        requests.push(
          api.get(`/bill/${congress}/${type}`, {
            params: {
              ...params,
              detail: 'summary',
              sort: 'updateDate+desc',
              limit: Math.floor(params.limit || 20 / BILL_TYPES.length)
            }
          })
        );
      });
    } else {
      requests.push(
        api.get('/bill', {
          params: {
            ...params,
            detail: 'summary',
            sort: 'updateDate+desc'
          }
        })
      );
    }

    const responses = await Promise.all(requests.map(p => p.catch(e => e)));
    const validResponses = responses.filter(r => !(r instanceof Error));

    let allBills = validResponses.flatMap(response => {
      const bills = response.data?.bills || [];
      return bills.map(bill => ({
        ...bill,
        type: bill.type?.toUpperCase(),
        status: bill.status || 'Unknown'
      }));
    });

    if (params.query) {
      const searchTerm = params.query.toLowerCase();
      allBills = allBills.filter(bill => 
        bill.title?.toLowerCase().includes(searchTerm) ||
        bill.summary?.toLowerCase().includes(searchTerm)
      );
    }

    if (params.status) {
      allBills = allBills.filter(bill => 
        bill.status.toLowerCase().includes(params.status!.toLowerCase())
      );
    }

    const uniqueBills = Array.from(
      new Map(allBills.map(bill => [
        `${bill.congress}-${bill.type}-${bill.number}`,
        bill
      ])).values()
    );

    uniqueBills.sort((a, b) => 
      new Date(b.updateDate || '').getTime() - new Date(a.updateDate || '').getTime()
    );

    const offset = params.offset || 0;
    const limit = params.limit || 20;
    const paginatedBills = uniqueBills.slice(offset, offset + limit);

    return {
      request: {
        offset,
        limit,
        count: paginatedBills.length
      },
      pagination: {
        count: paginatedBills.length,
        totalCount: uniqueBills.length
      },
      bills: paginatedBills
    };
  } catch (error) {
    console.error('Error fetching bills:', error);
    throw error;
  }
};

export const getMembers = async (params: MemberParams = {}): Promise<PaginatedResponse<any>> => {
  try {
    const response = await api.get('/member', {
      params: {
        ...params,
        limit: params.limit || 50,
        detail: 'full'
      }
    });

    const members = response.data.members?.map((member: any) => ({
      ...member,
      firstName: member.firstName || member.name?.split(' ')[0] || '',
      lastName: member.lastName || member.name?.split(' ').slice(1).join(' ') || '',
      fullName: member.name || `${member.firstName} ${member.lastName}`.trim(),
      state: member.state || '',
      party: member.party || 'Unknown',
      chamber: member.chamber || '',
      district: member.district || null
    }));

    let filteredMembers = members;
    if (params.query) {
      const searchTerm = params.query.toLowerCase();
      filteredMembers = members.filter((member: any) => 
        member.fullName.toLowerCase().includes(searchTerm) ||
        member.state.toLowerCase().includes(searchTerm) ||
        member.party.toLowerCase().includes(searchTerm)
      );
    }

    return {
      ...response.data,
      members: filteredMembers
    };
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

export const getMemberDetails = async (bioguideId: string) => {
  try {
    const [memberResponse, sponsoredBillsResponse] = await Promise.all([
      api.get(`/member/${bioguideId}`),
      api.get(`/member/${bioguideId}/sponsored-legislation`)
    ]);

    const member = memberResponse.data.member;
    const sponsoredBills = sponsoredBillsResponse.data.sponsoredLegislation || [];

    return {
      member: {
        ...member,
        sponsoredBills
      }
    };
  } catch (error) {
    console.error('Error fetching member details:', error);
    throw error;
  }
};

export const getBillDetails = async (congressNum: string, billType: string, billNumber: string) => {
  try {
    const [detailsResponse, actionsResponse, summariesResponse, cosponsorsResponse] = await Promise.allSettled([
      api.get(`/bill/${congressNum}/${billType.toUpperCase()}/${billNumber}`, {
        params: {
          detail: 'all'
        }
      }),
      api.get(`/bill/${congressNum}/${billType.toUpperCase()}/${billNumber}/actions`),
      api.get(`/bill/${congressNum}/${billType.toUpperCase()}/${billNumber}/summaries`),
      api.get(`/bill/${congressNum}/${billType.toUpperCase()}/${billNumber}/cosponsors`)
    ]);

    const getSettledData = (result: PromiseSettledResult<any>, resourceType: string) => {
      if (result.status === 'fulfilled') {
        return result.value.data;
      }
      if (result.status === 'rejected' && result.reason?.response?.status === 404) {
        return { [resourceType]: [] };
      }
      console.warn('Failed to fetch resource:', result.status === 'rejected' ? result.reason : 'unknown error');
      return { [resourceType]: [] };
    };

    const billData = getSettledData(detailsResponse, 'bill');
    if (!billData || !billData.bill) {
      throw new Error('Failed to fetch bill details');
    }

    const bill = billData.bill;
    const actionsData = getSettledData(actionsResponse, 'actions');
    const summariesData = getSettledData(summariesResponse, 'summaries');
    const cosponsorsData = getSettledData(cosponsorsResponse, 'cosponsors');

    const actions = Array.isArray(actionsData?.actions) ? actionsData.actions : [];
    const summaries = Array.isArray(summariesData?.summaries) ? summariesData.summaries : [];
    const cosponsors = Array.isArray(cosponsorsData?.cosponsors) ? cosponsorsData.cosponsors : [];

    const sortedActions = actions.length > 0
      ? [...actions].sort((a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime())
      : [];

    const sortedSummaries = summaries.length > 0
      ? [...summaries].sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
      : [];

    const sortedCosponsors = cosponsors.length > 0
      ? [...cosponsors].sort((a, b) => new Date(b.sponsorshipDate).getTime() - new Date(a.sponsorshipDate).getTime())
      : [];

    console.log('📊 Bill Data Availability:', {
      details: !!bill,
      actions: actions.length,
      summaries: summaries.length,
      cosponsors: cosponsors.length
    });

    return {
      bill: {
        ...bill,
        type: bill.type?.toUpperCase(),
        actions: sortedActions,
        summaries: sortedSummaries,
        cosponsors: sortedCosponsors
      }
    };
  } catch (error) {
    console.error('Error fetching bill details:', error);
    throw error;
  }
};