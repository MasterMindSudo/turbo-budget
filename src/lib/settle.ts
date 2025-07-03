/* -------------------------------------------------------------------
   Settle debts so that:
     1.  EVERY debtor pays the single largest creditor (primaryCreditor)
     2.  When that over-collects, the primaryCreditor reimburses
         the remaining creditor(s) (just Andy in your sample).
   Always uses integer cents internally, so no FP drift.
------------------------------------------------------------------- */

import { Expense, Member } from '../context/BudgetProvider';

/** Internal helper: positive = should receive ; negative = owes */
interface CentBalance {
  memberId: string;
  cents: number;
}

export interface Transaction {
  from: string;   // debtor UID
  to:   string;   // creditor UID
  amount: number; // dollars, two-decimal places
}

export const settleDebts = (
  expenses: Expense[],
  members:  Member[]
): Transaction[] => {
  /* -------------------------------------------------------------
     1.  Build net balances for every member in integer cents
  ------------------------------------------------------------- */
  const cents: Record<string, number> = {};
  members.forEach(m => { cents[m.id] = 0; });

  expenses.forEach(exp => {
    if (!exp.paidBy) return;
    const paidBy = exp.paidBy;
    const amountCents = Math.round(exp.amount * 100);

    cents[paidBy] += amountCents;

    if (exp.participants.length > 0) {
      const shareCents = Math.floor(amountCents / exp.participants.length);
      let remainderCents = amountCents % exp.participants.length;

      exp.participants.forEach(p => {
        let individualShare = shareCents;
        if (remainderCents > 0) {
          individualShare++;
          remainderCents--;
        }
        cents[p.memberId] -= individualShare;
      });
    }
  });

  /* -------------------------------------------------------------
     2.  Separate creditors (positive) and debtors (negative)
  ------------------------------------------------------------- */
  const creditors: CentBalance[] = [];
  const debtors:   CentBalance[] = [];

  Object.entries(cents).forEach(([id, c]) => {
    if (c > 0)  creditors.push({ memberId: id, cents:  c });
    if (c < 0)  debtors  .push({ memberId: id, cents: -c }); // store as +ve
  });

  if (creditors.length === 0 || debtors.length === 0) return [];

  /* -------------------------------------------------------------
     3.  Identify primary creditor: the one owed the MOST cents
         Every debtor will pay their full debt to this member.
  ------------------------------------------------------------- */
  creditors.sort((a, b) => b.cents - a.cents);      // largest first
  const primary = creditors.shift()!;               // remove & keep

  const tx: Transaction[] = [];

  /* 3-A. Debtors → primaryCreditor */
  debtors.forEach(d => {
    tx.push({
      from:   d.memberId,
      to:     primary.memberId,
      amount: +(d.cents / 100).toFixed(2)
    });

    primary.cents -= d.cents;   // reduce what primary is still owed
    d.cents = 0;                // debtor settled
  });

  /* -------------------------------------------------------------
     4.  Primary reimburses any remaining creditor(s)
         (Only Andy in your sample)
  ------------------------------------------------------------- */
  creditors.forEach(c => {
    if (c.cents === 0) return;

    // if primary over-collected, primary.cents will be NEGATIVE
    const pay = c.cents;                // full amount owed to this creditor
    tx.push({
      from:   primary.memberId,
      to:     c.memberId,
      amount: +(pay / 100).toFixed(2)
    });

    primary.cents += pay;               // climb back toward zero
    c.cents = 0;                        // creditor settled
  });

  /* -------------------------------------------------------------
     5.  Sanity-check: after all moves, every balance must be 0.
  ------------------------------------------------------------- */
  if (primary.cents !== 0) {
    console.warn(
      '[settleDebts] – leftover cents after settlement:',
      primary.cents
    );
  }

  return tx;
};