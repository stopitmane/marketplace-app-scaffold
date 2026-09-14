/**
 * A self-rolled event logger hitting the backend, per the original plan:
 * "even a self-rolled event logger hitting your own /events endpoint
 * teaches you more than dropping in Amplitude."
 *
 * NOTE: marketplace-backend does not have an /events endpoint yet - this
 * is the client-side half of that decision, ready to wire up once you add
 * one (a single `POST /events { name, properties, occurredAt }` endpoint
 * that writes to an `Event` table is enough; no need for a real analytics
 * pipeline for a portfolio project).
 */
export interface Analytics {
  track(eventName: string, properties?: Record<string, unknown>): void;
}

export class ApiAnalytics implements Analytics {
  constructor(private readonly send: (eventName: string, properties?: Record<string, unknown>) => void) {}

  track(eventName: string, properties?: Record<string, unknown>): void {
    this.send(eventName, properties);
  }
}

/** Drop-in no-op for tests or before the /events endpoint exists. */
export class NoopAnalytics implements Analytics {
  track(): void {}
}
