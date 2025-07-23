// seed-kk-yuen-expenses.js

// This script is for development purposes to seed the database with fictional expenses
// for a specific group ("KK Yuen") for a specific date range (Jan-May 2025).

// IMPORTANT:
// 1. Make sure your Firebase Admin SDK configuration is set up correctly.
//    You might need to set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
//    e.g., export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
// 2. This script performs write operations on your Firestore database.
//    Review the code carefully before running.

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { faker } = require('@faker-js/faker');

// --- Configuration ---
const GROUP_NAME_TO_SEED = "KK Yuen";
const START_DATE = new Date('2025-01-01T00:00:00Z');
const END_DATE = new Date('2025-05-31T23:59:59Z');
const EXPENSES_PER_MONTH_MIN = 15;
const EXPENSES_PER_MONTH_MAX = 30;

// --- Firebase Initialization ---
// The SDK will automatically find and use the credentials from the
// GOOGLE_APPLICATION_CREDENTIALS environment variable.
initializeApp();

const db = getFirestore();

// --- Data Definitions ---
const CATEGORIES = [
    { id: 'food', name: 'Food' },
    { id: 'transport', name: 'Transport' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'utilities', name: 'Utilities' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'housing', name: 'Housing' },
    { id: 'health', name: 'Health' },
    { id: 'groceries', name: 'Groceries' },
];

// --- Helper Functions ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateExpense = (group, members, date) => {
    const category = getRandomElement(CATEGORIES);
    const paidByMember = getRandomElement(members);
    const amount = parseFloat(getRandomNumber(5, 150).toFixed(2));

    // Simple even split for this seed script
    const participants = members.map(m => ({
        memberId: m.id,
        share: parseFloat((amount / members.length).toFixed(2))
    }));

    // Adjust for rounding errors in the last participant
    const totalShare = participants.reduce((sum, p) => sum + p.share, 0);
    const remainder = amount - totalShare;
    if (remainder !== 0 && participants.length > 0) {
        participants[participants.length - 1].share += remainder;
        participants[participants.length - 1].share = parseFloat(participants[participants.length - 1].share.toFixed(2));
    }

    return {
        groupId: group.id,
        title: faker.commerce.productName(),
        amount: amount,
        amountInBaseCurrency: amount, // Assuming base currency for simplicity
        currency: group.baseCurrency,
        paidBy: paidByMember.id,
        date: Timestamp.fromDate(date),
        participants: participants,
        category: category.id,
        note: faker.lorem.sentence(),
        isRecurring: false,
    };
};


// --- Main Seeding Logic ---
const seedExpenses = async () => {
    console.log("Starting to seed expenses...");

    // 1. Find the group
    console.log(`Searching for group: "${GROUP_NAME_TO_SEED}"...`);
    const groupsRef = db.collection('groups');
    const groupSnapshot = await groupsRef.where('name', '==', GROUP_NAME_TO_SEED).limit(1).get();

    if (groupSnapshot.empty) {
        console.error(`Error: Group "${GROUP_NAME_TO_SEED}" not found.`);
        return;
    }

    const groupDoc = groupSnapshot.docs[0];
    const group = { id: groupDoc.id, ...groupDoc.data() };
    console.log(`Found group "${group.name}" (ID: ${group.id})`);

    // 2. Get the members of the group
    const membersRef = db.collection(`groups/${group.id}/members`);
    const membersSnapshot = await membersRef.get();
    const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (members.length === 0) {
        console.error(`Error: No members found for group "${group.name}". Cannot assign expenses.`);
        return;
    }
    console.log(`Found ${members.length} members.`);

    // 3. Generate and add expenses for each month
    const batch = db.batch();
    let totalExpensesGenerated = 0;

    // Corrected Loop Logic: Iterate through dates, not month numbers.
    let currentDate = new Date(START_DATE);
    while (currentDate <= END_DATE) {
        const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const numExpenses = Math.floor(getRandomNumber(EXPENSES_PER_MONTH_MIN, EXPENSES_PER_MONTH_MAX));

        console.log(`Generating ${numExpenses} expenses for ${monthStartDate.toLocaleString('default', { month: 'long' })} ${monthStartDate.getFullYear()}...`);

        for (let i = 0; i < numExpenses; i++) {
            const randomDate = getRandomDate(monthStartDate, monthEndDate);
            const newExpense = generateExpense(group, members, randomDate);
            const expenseRef = db.collection(`groups/${group.id}/expenses`).doc();
            batch.set(expenseRef, newExpense);
            totalExpensesGenerated++;
        }
        
        // Move to the next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }


    // 4. Commit the batch
    if (totalExpensesGenerated > 0) {
        console.log(`\nCommitting ${totalExpensesGenerated} new expenses to the database...`);
        await batch.commit();
        console.log("\n✅ Seeding complete!");
        console.log(`Successfully added ${totalExpensesGenerated} fictional expenses to the "${group.name}" group.`);
    } else {
        console.log("\nNo expenses were generated. Seeding complete.");
    }
};

seedExpenses().catch(console.error);