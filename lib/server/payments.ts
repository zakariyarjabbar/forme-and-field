// Synchronous simulator decisions are intentionally performed inside the order transaction.
// A future asynchronous provider needs explicit reservations and a signed webhook lifecycle.
export type PaymentDecision = { status: 'succeeded' | 'declined'; provider: 'simulator' };
export interface SimulatedPaymentProvider {
  readonly mode: 'simulator';
  decide(scenario: 'success' | 'decline'): PaymentDecision;
}
export const simulator: SimulatedPaymentProvider = {
  mode: 'simulator',
  decide(scenario) {
    return { status: scenario === 'success' ? 'succeeded' : 'declined', provider: 'simulator' };
  },
};
