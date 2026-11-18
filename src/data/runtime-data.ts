import type { CustomerData } from '../utils/data-factory';
import type { Credentials } from './users';

export type ProductRef = {
  /** Stable business key — resolve id/name in the live env at runtime */
  name: string;
};

/**
 * Mutable bag populated by setup / earlier flows and consumed by later flows.
 * Scoped per worker so serial dependent tests share the same created data.
 */
export type RuntimeData = {
  user?: Credentials;
  customer?: CustomerData;
  products?: ProductRef[];
  cartItemCount?: number;
  orderRef?: string;
  /** Set after a successful checkout confirmation */
  confirmationHeader?: string;
};

export function createEmptyRuntimeData(): RuntimeData {
  return {};
}
