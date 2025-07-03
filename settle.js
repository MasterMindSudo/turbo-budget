/**
 * Settles a collection of bills by calculating the minimum number of transactions required.
 *
 * @param {Array<Object>} bills - A list of bill objects.
 * @param {number} bills[].amount - The total amount of the bill.
 * @param {string} bills[].paidBy - The identifier of the person who paid the bill.
 * @param {Array<string>} bills[].participants - A list of identifiers for the people sharing the bill.
 * @returns {Array<Object>} A list of transaction objects.
 * @property {string} from - The identifier of the person who owes money.
 * @property {string} to - The identifier of the person who is owed money.
 * @property {number} amount - The amount of the transaction.
 */
const settleBills = (bills) => {
  if (!bills || bills.length === 0) {
    return [];
  }

  const balances = {};

  // 1. Compute shares and 2. Calculate net balances
  bills.forEach(bill => {
    const { amount, paidBy, participants } = bill;
    if (participants.length === 0) return;

    const share = amount / participants.length;

    // The person who paid gets credit
    balances[paidBy] = (balances[paidBy] || 0) + amount;

    // Participants owe their share
    participants.forEach(participant => {
      balances[participant] = (balances[participant] || 0) - share;
    });
  });

  // 3. Separate creditors and debtors
  const creditors = [];
  const debtors = [];

  for (const person in balances) {
    const balance = balances[person];
    if (balance > 0) {
      creditors.push({ person, amount: balance });
    } else if (balance < 0) {
      debtors.push({ person, amount: -balance });
    }
  }

  // Sort both lists descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  // 4. Match debts to credits
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const payment = Math.min(debtor.amount, creditor.amount);

    // 5. Rounding
    const roundedPayment = Math.round(payment * 100) / 100;

    if (roundedPayment > 0) {
        transactions.push({
            from: debtor.person,
            to: creditor.person,
            amount: roundedPayment,
        });
    }

    debtor.amount -= payment;
    creditor.amount -= payment;

    if (debtor.amount < 0.001) {
      debtorIndex++;
    }

    if (creditor.amount < 0.001) {
      creditorIndex++;
    }
  }

  // 6. Return
  return transactions;
};

// --- Example Usage ---

const bills = [
  {
    amount: 60.00,
    paidBy: 'A',
    participants: ['A', 'B', 'C'],
  },
  {
    amount: 30.00,
    paidBy: 'B',
    participants: ['A', 'B'],
  },
];

const transactions = settleBills(bills);
console.log('Transactions:', transactions);

/*
Expected Output:
Transactions: [
  {
    "from": "C",
    "to": "A",
    "amount": 20
  },
  {
    "from": "B",
    "to": "A",
    "amount": 5
  }
]
*/
