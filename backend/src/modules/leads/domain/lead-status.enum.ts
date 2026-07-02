export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  CONVERTED = 'CONVERTED',
  DISQUALIFIED = 'DISQUALIFIED',
}

/** Allowed forward transitions — enforced inside the Lead aggregate, not the controller. */
export const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  [LeadStatus.NEW]: [LeadStatus.CONTACTED, LeadStatus.DISQUALIFIED],
  [LeadStatus.CONTACTED]: [LeadStatus.QUALIFIED, LeadStatus.DISQUALIFIED],
  [LeadStatus.QUALIFIED]: [LeadStatus.CONVERTED, LeadStatus.DISQUALIFIED],
  [LeadStatus.CONVERTED]: [],
  [LeadStatus.DISQUALIFIED]: [],
};
