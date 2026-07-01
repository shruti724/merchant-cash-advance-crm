import { Application } from '../../../src/modules/applications/domain/application.entity';
import { ApplicationStatus } from '../../../src/modules/applications/domain/application-status.enum';

describe('Application (domain aggregate)', () => {
  const baseProps = { tenantId: 'tenant-1', leadId: 'lead-1', requestedAmount: 25000 };
  const underwriter = { actorId: 'uw-1', actorRoles: ['UNDERWRITER'] };
  const agent = { actorId: 'agent-1', actorRoles: ['AGENT'] };

  it('creates an application in DRAFT status', () => {
    const app = Application.create(baseProps, 'app-1').value;
    expect(app.status).toBe(ApplicationStatus.DRAFT);
    expect(app.domainEvents[0].eventName).toBe('application.created');
  });

  it('rejects creation with a non-positive requested amount', () => {
    const result = Application.create({ ...baseProps, requestedAmount: 0 }, 'app-2');
    expect(result.isSuccess).toBe(false);
  });

  it('blocks entering UNDER_REVIEW with zero documents uploaded (Strategy precondition)', () => {
    const app = Application.create(baseProps, 'app-3').value;
    app.transitionTo(ApplicationStatus.DOCUMENTS_PENDING, agent);

    const result = app.transitionTo(ApplicationStatus.UNDER_REVIEW, agent);
    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/document/i);
  });

  it('allows entering UNDER_REVIEW once a document exists, and assigns the reviewer', () => {
    const app = Application.create(baseProps, 'app-4').value;
    app.transitionTo(ApplicationStatus.DOCUMENTS_PENDING, agent);
    app.registerDocumentUploaded();

    const result = app.transitionTo(ApplicationStatus.UNDER_REVIEW, underwriter);
    expect(result.isSuccess).toBe(true);
    expect(app.status).toBe(ApplicationStatus.UNDER_REVIEW);
    expect(app.reviewerId).toBe('uw-1');
  });

  it('blocks a non-underwriter from approving (Strategy role check)', () => {
    const app = Application.create(baseProps, 'app-5').value;
    app.transitionTo(ApplicationStatus.DOCUMENTS_PENDING, agent);
    app.registerDocumentUploaded();
    app.transitionTo(ApplicationStatus.UNDER_REVIEW, underwriter);

    const result = app.transitionTo(ApplicationStatus.APPROVED, agent);
    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/underwriter/i);
  });

  it('requires a reason to decline', () => {
    const app = Application.create(baseProps, 'app-6').value;
    app.transitionTo(ApplicationStatus.DOCUMENTS_PENDING, agent);
    app.registerDocumentUploaded();
    app.transitionTo(ApplicationStatus.UNDER_REVIEW, underwriter);

    const result = app.transitionTo(ApplicationStatus.DECLINED, underwriter);
    expect(result.isSuccess).toBe(false);

    const withReason = app.transitionTo(ApplicationStatus.DECLINED, {
      ...underwriter,
      reason: 'Insufficient monthly revenue',
    });
    expect(withReason.isSuccess).toBe(true);
    expect(app.status).toBe(ApplicationStatus.DECLINED);
  });

  it('rejects transitions out of a terminal state', () => {
    const app = Application.create(baseProps, 'app-7').value;
    app.transitionTo(ApplicationStatus.CANCELLED, agent);
    const result = app.transitionTo(ApplicationStatus.DOCUMENTS_PENDING, agent);
    expect(result.isSuccess).toBe(false);
  });
});
