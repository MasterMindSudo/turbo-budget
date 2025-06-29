// src/lib/settle.ts

import { Expense, Member } from '../context/BudgetProvider';

interface Balance {
  memberId: string;
  balance: number;
}

interface Transaction {
  from: string; // Member ID
  to: string; // Member ID
  amount: number;
}

export const settleDebts = (expenses: Expense[], members: Member[]): Transaction[] => {
  const balances: { [key: string]: number } = {};

  // Initialize balances for all members
  members.forEach(member => {
    balances[member.id] = 0;
  });

  // Calculate the net balance for each member
  expenses.forEach(expense => {
    const { paidBy, amount, participants } = expense;
    const totalShares = participants.reduce((sum, p) => sum + p.share, 0);

    // The person who paid is owed money
    balances[paidBy] += amount;

    // The participants owe money
    participants.forEach(participant => {
      balances[participant.memberId] -= participant.share;
    });
  });

  const debtors: Balance[] = [];
  const creditors: Balance[] = [];

  Object.keys(balances).forEach(memberId => {
    const balance = balances[memberId];
    if (balance > 0) {
      creditors.push({ memberId, balance });
    } else if (balance < 0) {
      debtors.push({ memberId, balance: -balance });
    }
  });

  const transactions: Transaction[] = [];

  // Sort debtors and creditors to optimize transactions
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.balance, creditor.balance);

    transactions.push({
      from: debtor.memberId,
      to: creditor.memberId,
      amount,
    });

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) {
      i++;
    }

    if (creditor.balance === 0) {
      j++;
    }
  }

  return transactions;
};
