// src/context/BudgetProvider.tsx
'use client'; // This is a client component

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import moment from 'moment';

// --- Types ---
export interface Member {
  id: string;
  displayName: string;
  avatarUrl?: string; // URL for avatar image
  userId?: string; // Firebase UID if linked to an online user
  invitedBy?: string | null; // Member ID of inviter
  status: 'pending' | 'accepted' | 'declined';
  joinedAt: Date;
}

export interface ExpenseParticipant {
  memberId: string;
  share: number; // Amount or ratio share
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string; // Member ID who paid
  date: Date;
  receiptUrl?: string; // Optional URL to receipt image in Firebase Storage
  participants: ExpenseParticipant[]; // How the expense is split
  category?: string; // e.g., "Groceries", "Utilities"
  note?: string; // User-added notes
  isRecurring?: boolean; // Flag for recurring expenses
}

export interface RecurringExpense {
  id: string;
  groupId: string;
  template: Omit<Expense, 'id' | 'groupId' | 'date' | 'isRecurring'>;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., 1 for every month, 2 for every two months
  dayOfWeek?: number; // 0-6 (Sunday-Saturday) for weekly recurring
  dayOfMonth?: number; // 1-31 for monthly recurring
  nextRun: Date; // Next date the expense should be generated
  endDate?: Date; // Optional end date for recurring expense
}

export interface Group {
  id: string;
  name: string;
  coverPhotoUrl?: string; // URL for group cover photo
  members: Member[]; // Simplified for context; actual Firestore has subcollection
  expenses: Expense[]; // Simplified for context; actual Firestore has subcollection
  recurring: RecurringExpense[]; // Simplified for context; actual Firestore has subcollection
}

export interface User {
  id: string; // Firebase UID
  displayName: string;
  email: string;
  photoURL?: string; // User profile picture
}

export interface BudgetState {
  currentUser: User | null;
  groups: Group[];
  loading: boolean;
  error: string | null;
}

type BudgetAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense } // Added UPDATE_EXPENSE action
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// --- Initial State ---
const initialState: BudgetState = {
  currentUser: null,
  groups: [],
  loading: false,
  error: null,
};

// --- Reducer ---
const budgetReducer = (state: BudgetState, action: BudgetAction): BudgetState => {
  console.log('BudgetReducer: Action dispatched', action);
  switch (action.type) {
    case 'SET_USER':
      // TODO ⇢ Firebase: This action should be dispatched after successful Firebase Authentication
      return { ...state, currentUser: action.payload };
    case 'SET_GROUPS':
      // TODO ⇢ Firebase: This data should be fetched from Firestore 'groups' collection and its subcollections
      return { ...state, groups: action.payload };
    case 'ADD_EXPENSE':
      // TODO ⇢ Firebase: When adding a real expense, use Firebase Firestore to add to 'expenses' subcollection
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, expenses: [...group.expenses, action.payload] }
            : group
        ),
      };
    case 'UPDATE_EXPENSE': // Added case for UPDATE_EXPENSE
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? {
                ...group,
                expenses: group.expenses.map(expense =>
                  expense.id === action.payload.id ? action.payload : expense
                ),
              }
            : group
        ),
      };
    case 'ADD_GROUP':
      // TODO ⇢ Firebase: When adding a real group, use Firebase Firestore to create a new document in 'groups' collection
      return { ...state, groups: [...state.groups, action.payload] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// --- Context Interface ---
interface BudgetContextProps {
  state: BudgetState;
  dispatch: React.Dispatch<BudgetAction>;
  // Helper functions to retrieve data from the current state
  getGroupById: (groupId: string) => Group | undefined;
  getMembersByGroupId: (groupId: string) => Member[];
  getExpensesByGroupId: (groupId: string) => Expense[];
  // Functions to perform actions (will eventually interact with Firebase)
  addExpense: (expense: Omit<Expense, 'id' | 'groupId'>, groupId: string) => void;
  updateExpense: (expense: Expense, groupId: string) => void; // Added updateExpense function signature
  addGroup: (groupName: string) => void;
  // TODO ⇢ Firebase: Add functions for user login, signup, invite members, etc.
}

const BudgetContext = createContext<BudgetContextProps | undefined>(undefined);

// --- Provider Component ---
interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  console.log('BudgetProvider: Initializing with state', state);

  // Helper selectors
  const getGroupById = (groupId: string) => state.groups.find(group => group.id === groupId);
  const getMembersByGroupId = (groupId: string) => getGroupById(groupId)?.members || [];
  const getExpensesByGroupId = (groupId: string) => getGroupById(groupId)?.expenses || [];

  // Mock functions for data manipulation
  const addExpense = (expense: Omit<Expense, 'id' | 'groupId'>, groupId: string) => {
    // TODO ⇢ Firebase: Implement actual Firestore addDoc or setDoc for expenses
    console.log('Adding expense (mock):', { expense, groupId });
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}`, // Generate a dummy ID for mock data
      groupId,
      date: expense.date || new Date(), // Ensure date is set
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const updateExpense = (expense: Expense, groupId: string) => { // Implemented updateExpense function
    // TODO ⇢ Firebase: Implement actual Firestore updateDoc for expenses
    console.log('Updating expense (mock):', { expense, groupId });
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  };

  const addGroup = (groupName: string) => {
    // TODO ⇢ Firebase: Implement actual Firestore addDoc for groups
    console.log('Adding group (mock):', { groupName });
    const newGroup: Group = {
      id: `grp_${Date.now()}`, // Generate a dummy ID for mock data
      name: groupName,
      coverPhotoUrl: 'https://images.unsplash.com/photo-1590494492723-579c8d30e54b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Default cover
      members: [], // Members will be added separately, or current user added immediately
      expenses: [],
      recurring: [],
    };
    dispatch({ type: 'ADD_GROUP', payload: newGroup });

    // Simulate adding the current user as a member to the newly created group
    // TODO ⇢ Firebase: This would involve a separate Firestore write to the 'members' subcollection
    if (state.currentUser) {
        const newMember: Member = {
            id: state.currentUser.id, // Use current user's ID as member ID for simplicity in mock
            displayName: state.currentUser.displayName,
            userId: state.currentUser.id,
            invitedBy: null,
            status: 'accepted',
            joinedAt: new Date(),
        };
        // This is a simplified direct state mutation for mock data.
        // In a real app, after adding the group to Firestore, you would add the member to its subcollection.
        dispatch({
            type: 'SET_GROUPS',
            payload: state.groups.map(g => g.id === newGroup.id ? { ...g, members: [...g.members, newMember] } : g)
        });
    }
  };


  // Load initial mock data once when the provider mounts
  React.useEffect(() => {
    console.log('BudgetProvider: useEffect for mock data load triggered.');
    // Simulate fetching user data from Firebase Authentication
    dispatch({
      type: 'SET_USER',
      payload: { id: 'demoUserId123', displayName: 'Current User', email: 'current.user@example.com', photoURL: '/public/window.svg' },
    });
    console.log('BudgetProvider: SET_USER dispatched.');

    // Simulate fetching groups and their nested data from Firestore
    const mockGroups: Group[] = [
      {
        id: 'group1',
        name: 'Family Budget',
        coverPhotoUrl: 'https://images.unsplash.com/photo-1517487823377-f273577d6118?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        members: [
          { id: 'member1', displayName: 'Kevin', avatarUrl: '/public/globe.svg', status: 'accepted', joinedAt: moment('2024-01-15').toDate(), userId: 'user1' },
          { id: 'member2', displayName: 'Andy', avatarUrl: '/public/file.svg', status: 'accepted', joinedAt: moment('2024-01-15').toDate(), userId: 'user2' },
          { id: 'member3', displayName: 'Hayley', avatarUrl: '/public/next.svg', status: 'accepted', joinedAt: moment('2024-02-01').toDate(), userId: 'user3' },
          { id: 'member4', displayName: 'SamSam', avatarUrl: '/public/vercel.svg', status: 'accepted', joinedAt: moment('2024-03-10').toDate(), userId: 'user4' },
          { id: 'demoUserId123', displayName: 'Current User', avatarUrl: '/public/window.svg', status: 'accepted', joinedAt: moment('2024-01-01').toDate(), userId: 'demoUserId123' },
        ],
        expenses: [
          { id: 'exp1', groupId: 'group1', title: 'Groceries', amount: 150.75, currency: 'USD', paidBy: 'member1', date: moment('2025-06-23').toDate(), participants: [{ memberId: 'member1', share: 150.75 }] },
          { id: 'exp2', groupId: 'group1', title: 'Dinner', amount: 80.00, currency: 'USD', paidBy: 'member2', date: moment('2025-06-20').toDate(), participants: [{ memberId: 'member2', share: 40 }, { memberId: 'member1', share: 40 }] },
          { id: 'exp3', groupId: 'group1', title: 'Electricity Bill', amount: 200.00, currency: 'USD', paidBy: 'member1', date: moment('2025-05-25').toDate(), participants: [{ memberId: 'member1', share: 50 }, { memberId: 'member2', share: 50 }, { memberId: 'member3', share: 50 }, { memberId: 'member4', share: 50 }] },
          { id: 'exp4', groupId: 'group1', title: 'Internet', amount: 60.00, currency: 'USD', paidBy: 'member3', date: moment('2025-06-10').toDate(), participants: [{ memberId: 'member1', share: 15 }, { memberId: 'member2', share: 15 }, { memberId: 'member3', share: 15 }, { memberId: 'member4', share: 15 }] },
          { id: 'exp5', groupId: 'group1', title: 'Shopping', amount: 300.00, currency: 'USD', paidBy: 'member4', date: moment('2025-06-15').toDate(), participants: [{ memberId: 'member4', share: 300 }] },
          { id: 'exp6', groupId: 'group1', title: 'Utilities', amount: 120.00, currency: 'USD', paidBy: 'member1', date: moment('2025-06-28').toDate(), participants: [{ memberId: 'member1', share: 60 }, { memberId: 'member2', share: 60 }] },
        ],
        recurring: [],
      },
      {
        id: 'group2',
        name: 'Roommates (11 黃色小鳥)', // Example name from screenshot
        coverPhotoUrl: 'https://images.unsplash.com/photo-1556911220-bff2185c6c21?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        members: [
          { id: 'member1', displayName: 'Kevin', avatarUrl: '/public/globe.svg', status: 'accepted', joinedAt: moment('2024-04-01').toDate(), userId: 'user1' },
          { id: 'member5', displayName: 'Emily', avatarUrl: '/public/file.svg', status: 'accepted', joinedAt: moment('2024-04-05').toDate(), userId: 'user5' },
          { id: 'demoUserId123', displayName: 'Current User', avatarUrl: '/public/window.svg', status: 'accepted', joinedAt: moment('2024-04-01').toDate(), userId: 'demoUserId123' },
        ],
        expenses: [],
        recurring: [],
      },
    ];
    dispatch({ type: 'SET_GROUPS', payload: mockGroups });
    console.log('BudgetProvider: SET_GROUPS dispatched.');

  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <BudgetContext.Provider value={{ state, dispatch, getGroupById, getMembersByGroupId, getExpensesByGroupId, addExpense, updateExpense, addGroup }}>
      {children}
    </BudgetContext.Provider>
  );
};

// --- Custom Hook for consuming the BudgetContext ---
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};