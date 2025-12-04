export interface PersonalData {
  fullName: string;
  inn: string;
  snils: string;
  birthDate: string;
  birthPlace: string;
  passport: {
    series: string;
    number: string;
    issueDate: string;
    issuedBy: string;
    code: string;
  };
  registration: {
    address: string;
    date: string;
  };
  maritalStatus: {
    status: string;
    spouseName?: string;
    marriageDate?: string;
    divorceDate?: string;
  };
  children: Array<{
    name: string;
    birthDate: string;
    isMinor: boolean;
  }>;
}

export interface CreditData {
  creditors: Array<{
    name: string;
    inn: string;
    credits: Array<{
      contractNumber: string;
      amount: number;
      debt: number;
      date: string;
    }>;
  }>;
  totalDebt: number;
  executiveDocuments: Array<{
    number: string;
    date: string;
    amount: number;
    creditor: string;
  }>;
}

export interface IncomeData {
  monthlyIncome: number;
  source: string;
  lastYear: number;
  noIncome?: boolean;
}

export interface PropertyData {
  realEstate: Array<{
    type: string;
    address: string;
    cadastralNumber: string;
    value: number;
  }>;
  vehicles: Array<{
    type: string;
    model: string;
    year: number;
    registrationNumber: string;
  }>;
}

export interface AdditionalFields {
  courtName: string;
  courtAddress: string;
  phone: string;
  email: string;
}

export interface BenefitsData {
  certificateNumber?: string;
  certificateDate?: string;
  isLowIncome: boolean;
  specialStatus?: string;
}

export interface ChildrenData {
  noChildren: boolean;
  children: Array<{
    fullName: string;
    birthDate: string;
    livesWithDebtor: boolean;
  }>;
  alimonyInfo?: {
    isPayingAlimony: boolean;
    documentType?: 'notarial' | 'court' | 'other';
    documentDetails?: string;
    notaryDate?: string;
    childFullName?: string;
    monthlyAmount?: number;
    otherDetails?: string;
  };
}