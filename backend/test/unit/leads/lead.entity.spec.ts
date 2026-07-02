import { Lead } from '../../../src/modules/leads/domain/lead.entity';
import { LeadStatus } from '../../../src/modules/leads/domain/lead-status.enum';

describe('Lead (domain aggregate)', () => {
  const baseProps = {
    tenantId: 'tenant-1',
    ownerId: 'user-1',
    businessName: 'Acme Bakery',
    contactName: 'Jane Doe',
    email: 'jane@acme.com',
    phone: '555-0100',
  };

  it('creates a lead in NEW status and raises a LeadCreatedEvent', () => {
    const result = Lead.create(baseProps, 'lead-1');

    expect(result.isSuccess).toBe(true);
    const lead = result.value;
    expect(lead.status).toBe(LeadStatus.NEW);
    expect(lead.domainEvents).toHaveLength(1);
    expect(lead.domainEvents[0].eventName).toBe('lead.created');
  });

  it('rejects creation with an invalid email', () => {
    const result = Lead.create({ ...baseProps, email: 'not-an-email' }, 'lead-2');
    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/email/i);
  });

  it('allows NEW -> CONTACTED -> QUALIFIED -> CONVERTED', () => {
    const lead = Lead.create(baseProps, 'lead-3').value;

    expect(lead.transitionTo(LeadStatus.CONTACTED, 'user-1').isSuccess).toBe(true);
    expect(lead.transitionTo(LeadStatus.QUALIFIED, 'user-1').isSuccess).toBe(true);
    expect(lead.transitionTo(LeadStatus.CONVERTED, 'user-1').isSuccess).toBe(true);
    expect(lead.status).toBe(LeadStatus.CONVERTED);
  });

  it('rejects illegal transitions (NEW -> CONVERTED directly)', () => {
    const lead = Lead.create(baseProps, 'lead-4').value;
    const result = lead.transitionTo(LeadStatus.CONVERTED, 'user-1');
    expect(result.isSuccess).toBe(false);
    expect(result.error).toMatch(/Cannot transition/);
  });

  it('raises a LeadConvertedEvent only when transitioning into CONVERTED', () => {
    const lead = Lead.create(baseProps, 'lead-5').value;
    lead.clearEvents();

    lead.transitionTo(LeadStatus.CONTACTED, 'user-1');
    expect(lead.domainEvents.some((e) => e.eventName === 'lead.converted')).toBe(false);

    lead.transitionTo(LeadStatus.QUALIFIED, 'user-1');
    lead.transitionTo(LeadStatus.CONVERTED, 'user-1');
    expect(lead.domainEvents.some((e) => e.eventName === 'lead.converted')).toBe(true);
  });

  it('rejects any transition from a terminal state', () => {
    const lead = Lead.create(baseProps, 'lead-6').value;
    lead.transitionTo(LeadStatus.DISQUALIFIED, 'user-1');
    const result = lead.transitionTo(LeadStatus.CONTACTED, 'user-1');
    expect(result.isSuccess).toBe(false);
  });
});
