import React, { createContext, useReducer, useContext, ReactNode } from 'react';

// --- Types ---
interface Member {
  id: string;
  displayName: string;
  avatarUrl?: string;
  userId?: string; // Firebase UID
  invitedBy?: string | null;
  status: 'pending' | 'accepted' | 'declined';
  joinedAt: Date;
}

interface ExpenseParticipant {
  memberId: string;
  share: number;
}

interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string; // Member ID
  date: Date;
  receiptUrl?: string;
  participants: ExpenseParticipant[];
  category?: string;
  note?: string;
  isRecurring?: boolean;
}

interface RecurringExpense {
  id: string;
  groupId: string;
  template: Omit<Expense, 'id' | 'groupId' | 'date' | 'isRecurring'>;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., 1 for every month, 2 for every two months
  dayOfWeek?: number; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  nextRun: Date;
  endDate?: Date;
}

interface Group {
  id: string;
  name: string;
  coverPhotoUrl?: string;
  members: Member[]; // Stored in subcollection, but simplified for context
  expenses: Expense[]; // Stored in subcollection, but simplified for context
  recurring: RecurringExpense[]; // Stored in subcollection, but simplified for context
}

interface User {
  id: string; // Firebase UID
  displayName: string;
  email: string;
  photoURL?: string;
}

interface BudgetState {
  currentUser: User | null;
  groups: Group[];
  currentGroupId: string | null;
  loading: boolean;
  error: string | null;
}

type BudgetAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'SET_CURRENT_GROUP'; payload: string | null }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// --- Initial State ---
const initialState: BudgetState = {
  currentUser: null,
  groups: [],
  currentGroupId: null,
  loading: false,
  error: null,
};

// --- Reducer ---
const budgetReducer = (state: BudgetState, action: BudgetAction): BudgetState => {
  switch (action.type) {
    case 'SET_USER':
      // TODO: Hook up to Firebase Authentication
      return { ...state, currentUser: action.payload };
    case 'SET_GROUPS':
      // TODO: Hook up to Firestore 'groups' collection
      return { ...state, groups: action.payload };
    case 'SET_CURRENT_GROUP':
      return { ...state, currentGroupId: action.payload };
    case 'ADD_EXPENSE':
      // TODO: Add expense to Firestore 'expenses' subcollection
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, expenses: [...group.expenses, action.payload] }
            : group
        ),
      };
    case 'ADD_GROUP':
      // TODO: Add group to Firestore 'groups' collection
      return { ...state, groups: [...state.groups, action.payload] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// --- Context ---
interface BudgetContextProps {
  state: BudgetState;
  dispatch: React.Dispatch<BudgetAction>;
  currentGroup: Group | undefined;
  // Methods for interacting with data (will eventually call Firestore)
  addExpense: (expense: Omit<Expense, 'id' | 'groupId'>, groupId: string) => void;
  addGroup: (groupName: string) => void;
  // TODO: Add methods for fetching data from Firestore
}

const BudgetContext = createContext<BudgetContextProps | undefined>(undefined);

// --- Provider Component ---
interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Derived state
  const currentGroup = state.groups.find(group => group.id === state.currentGroupId);

  // Placeholder for Firestore interactions
  const addExpense = (expense: Omit<Expense, 'id' | 'groupId'>, groupId: string) => {
    // TODO: Implement actual Firestore add doc here
    console.log('Adding expense to Firestore:', { expense, groupId });
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}`, // Dummy ID
      groupId,
      date: expense.date || new Date(), // Ensure date is set
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const addGroup = (groupName: string) => {
    // TODO: Implement actual Firestore add doc here
    console.log('Adding group to Firestore:', { groupName });
    const newGroup: Group = {
      id: `grp_${Date.now()}`, // Dummy ID
      name: groupName,
      members: [], // Initially empty, add current user as member later
      expenses: [],
      recurring: [],
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_GROUP', payload: newGroup });
    // Simulate adding current user as a member
    if (state.currentUser) {
        // TODO: This should be handled via a Firestore transaction or cloud function
        const newMember: Member = {
            id: state.currentUser.id,
            displayName: state.currentUser.displayName,
            userId: state.currentUser.id,
            invitedBy: null,
            status: 'accepted',
            joinedAt: new Date(),
        };
        // This is a simplified direct mutation for mock data, not how Firestore subcollections work
        const updatedGroups = state.groups.map(group =>
            group.id === newGroup.id ? { ...group, members: [...group.members, newMember] } : group
        );
        dispatch({ type: 'SET_GROUPS', payload: updatedGroups });
    }
  };


  // Load initial mock data (for demonstration purposes)
  React.useEffect(() => {
    // Simulate fetching user and groups from Firebase
    dispatch({
      type: 'SET_USER',
      payload: { id: 'demoUserId', displayName: 'Demo User', email: 'demo@example.com' },
    });

    const mockGroups: Group[] = [
      {
        id: 'group1',
        name: 'Family Budget',
        coverPhotoUrl: 'https://images.unsplash.com/photo-1590494492723-579c8d30e54b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        members: [
          { id: 'member1', displayName: 'Kevin', status: 'accepted', joinedAt: new Date(), userId: 'user1' },
          { id: 'member2', displayName: 'Andy', status: 'accepted', joinedAt: new Date(), userId: 'user2' },
          { id: 'member3', displayName: 'Hayley', status: 'accepted', joinedAt: new Date(), userId: 'user3' },
          { id: 'member4', displayName: 'SamSam', status: 'accepted', joinedAt: new Date(), userId: 'user4' },
        ],
        expenses: [
          { id: 'exp1', groupId: 'group1', title: 'Groceries', amount: 150.75, currency: 'USD', paidBy: 'member1', date: new Date(2025, 5, 23), participants: [{ memberId: 'member1', share: 150.75 }] },
          { id: 'exp2', groupId: 'group1', title: 'Dinner', amount: 80.00, currency: 'USD', paidBy: 'member2', date: new Date(2025, 5, 20), participants: [{ memberId: 'member2', share: 40 }, { memberId: 'member1', share: 40 }] },
          { id: 'exp3', groupId: 'group1', title: 'Electricity Bill', amount: 200.00, currency: 'USD', paidBy: 'member1', date: new Date(2025, 4, 25), participants: [{ memberId: 'member1', share: 50 }, { memberId: 'member2', share: 50 }, { memberId: 'member3', share: 50 }, { memberId: 'member4', share: 50 }] },
          { id: 'exp4', groupId: 'group1', title: 'Internet', amount: 60.00, currency: 'USD', paidBy: 'member3', date: new Date(2025, 5, 10), participants: [{ memberId: 'member1', share: 15 }, { memberId: 'member2', share: 15 }, { memberId: 'member3', share: 15 }, { memberId: 'member4', share: 15 }] },
          { id: 'exp5', groupId: 'group1', title: 'Shopping', amount: 300.00, currency: 'USD', paidBy: 'member4', date: new Date(2025, 5, 15), participants: [{ memberId: 'member4', share: 300 }] },
          { id: 'exp6', groupId: 'group1', title: 'Utilities', amount: 120.00, currency: 'USD', paidBy: 'member1', date: new Date(2025, 5, 28), participants: [{ memberId: 'member1', share: 60 }, { memberId: 'member2', share: 60 }] },
        ],
        recurring: [],
      },
      {
        id: 'group2',
        name: 'Roommates',
        members: [
          { id: 'member1', displayName: 'Kevin', status: 'accepted', joinedAt: new Date(), userId: 'user1' },
          { id: 'member5', displayName: 'Emily', status: 'accepted', joinedAt: new Date(), userId: 'user5' },
        ],
        expenses: [],
        recurring: [],
      },
    ];
    dispatch({ type: 'SET_GROUPS', payload: mockGroups });
    dispatch({ type: 'SET_CURRENT_GROUP', payload: 'group1' }); // Set a default group for display
  }, []); // Run once on mount

  return (
    <BudgetContext.Provider value={{ state, dispatch, currentGroup, addExpense, addGroup }}>
      {children}
    </BudgetContext.Provider>
  );
};

// --- Custom Hook for Context ---
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};