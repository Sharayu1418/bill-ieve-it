export interface Action {
  actionDate: string;
  text: string;
  type?: string;
  actionCode?: string;
}

export interface Cosponsor {
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  district?: string;
  sponsorshipDate: string;
  bioguideId: string;
}

export interface Summary {
  text: string;
  updateDate: string;
  versionCode: string;
}

export interface Bill {
  billId: string;
  congress: string;
  type: string;
  number: string;
  title: string;
  status: string;
  introducedDate?: string;
  updateDate?: string;
  actions?: Action[];
  cosponsors?: Cosponsor[];
  summaries?: Summary[];
}

export interface BillResponse {
  bill: Bill;
}

export interface Member {
  bioguideId: string;
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  district?: string;
  chamber: string;
  terms?: Term[];
  sponsoredBills?: Bill[];
}

export interface Term {
  congress: number;
  chamber: string;
  state: string;
  district?: string;
  party: string;
  start: string;
  end: string;
}

export interface MemberResponse {
  member: Member;
}