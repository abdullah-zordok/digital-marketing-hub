export interface LeadDetails {
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  serviceInterest?: string;
  budgetRange?: string;
  message?: string;
}

export interface LeadIntentResult {
  hasBuyingIntent: boolean;
  missingFields: string[];
  leadDetails: LeadDetails;
}
