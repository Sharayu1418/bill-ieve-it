import {
  getBills,
  getMembers,
  getBillDetails,
  getMemberDetails,
  getBillActions,
  getBillCosponsors,
  type BillParams,
  type MemberParams
} from './api';

// Test environment variable
console.log('Checking API key...');
const apiKey = import.meta.env.VITE_CONGRESS_API_KEY;
if (!apiKey) {
  console.error('❌ API key not found in environment variables');
} else {
  console.log('✅ API key found in environment variables');
}

// Test all API endpoints
export const testApiEndpoints = async () => {
  console.log('Testing API endpoints...\n');

  try {
    // Test getBills
    console.log('Testing getBills...');
    const billParams: BillParams = {
      limit: 1,
      offset: 0
    };
    const billsResponse = await getBills(billParams);
    console.log('✅ getBills successful');
    console.log('Sample bill:', billsResponse.bills[0]);

    // Test getMembers
    console.log('\nTesting getMembers...');
    const memberParams: MemberParams = {
      limit: 1,
      offset: 0
    };
    const membersResponse = await getMembers(memberParams);
    console.log('✅ getMembers successful');
    console.log('Sample member:', membersResponse.members[0]);

    // Get a sample bill for detailed testing
    const sampleBill = billsResponse.bills[0];
    if (sampleBill) {
      const { congress, type, number } = sampleBill;

      // Test getBillDetails
      console.log('\nTesting getBillDetails...');
      const billDetails = await getBillDetails(congress, type, number);
      console.log('✅ getBillDetails successful');

      // Test getBillActions
      console.log('\nTesting getBillActions...');
      const billActions = await getBillActions(congress, type, number);
      console.log('✅ getBillActions successful');

      // Test getBillCosponsors
      console.log('\nTesting getBillCosponsors...');
      const billCosponsors = await getBillCosponsors(congress, type, number);
      console.log('✅ getBillCosponsors successful');
    }

    // Test getMemberDetails with a sample member
    const sampleMember = membersResponse.members[0];
    if (sampleMember) {
      console.log('\nTesting getMemberDetails...');
      const memberDetails = await getMemberDetails(sampleMember.bioguideId);
      console.log('✅ getMemberDetails successful');
    }

    console.log('\n✅ All API endpoints tested successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

// Run tests if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  testApiEndpoints();
}