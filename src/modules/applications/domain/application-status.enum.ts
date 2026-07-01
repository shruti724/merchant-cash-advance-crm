export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
}

export const APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.DRAFT]: [ApplicationStatus.DOCUMENTS_PENDING, ApplicationStatus.CANCELLED],
  [ApplicationStatus.DOCUMENTS_PENDING]: [
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.UNDER_REVIEW]: [
    ApplicationStatus.APPROVED,
    ApplicationStatus.DECLINED,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.APPROVED]: [],
  [ApplicationStatus.DECLINED]: [],
  [ApplicationStatus.CANCELLED]: [],
};
