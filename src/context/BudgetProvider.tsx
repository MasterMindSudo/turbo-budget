'use client'

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, writeBatch, serverTimestamp, arrayUnion, arrayRemove, Timestamp, FieldValue } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'

// Types
export interface ExpenseParticipant {
  memberId: string;
  share: number;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: 'USD';
  paidBy: string | null;
  date: Timestamp | FieldValue;
  receiptUrl?: string;
  participants: ExpenseParticipant[];
  category?: string;
  note?: string;
  isRecurring?: boolean;
}

export interface Member {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  userId?: string; // Firebase Auth UID
  status?: 'pending' | 'accepted';
  joinedAt?: Timestamp | FieldValue;
  isOffline?: boolean;
}

export interface Group {
  id: string
  name: string
  members: Member[];
  expenses: Expense[];
  recurring: any[]; // TODO: Define recurring type
  createdAt?: Timestamp | FieldValue;
  createdBy?: string;
  coverPhotoUrl?: string;
  memberUserIds: string[]; // New field for querying
}

interface State {
  groups: Group[]
  activeGroup: string | null
  loading: boolean;
  error: string | null;
}

// Actions
export enum ActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_GROUPS = 'SET_GROUPS',
  SET_ACTIVE_GROUP = 'SET_ACTIVE_GROUP',
  UPDATE_MONTHLY_SPEND = 'UPDATE_MONTHLY_SPEND',
  UPDATE_GROUP = 'UPDATE_GROUP',
}

type Action =
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_ERROR; payload: string | null }
  | { type: ActionType.SET_GROUPS; payload: Group[] }
  | { type: ActionType.SET_ACTIVE_GROUP; payload: string | null }
  | { type: ActionType.UPDATE_GROUP; payload: { groupId: string; members?: Member[]; expenses?: Expense[] } }
  | {
      type: ActionType.UPDATE_MONTHLY_SPEND
      payload: { monthId: string; total: number; categoryId: string; amount: number }
    }


// Reducer
const initialState: State = {
  groups: [],
  activeGroup: null,
  loading: true, // Set to true initially as we'll fetch data
  error: null,
}

const budgetReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionType.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionType.SET_GROUPS:
      return { ...state, groups: action.payload, loading: false };
    case ActionType.SET_ACTIVE_GROUP:
      return { ...state, activeGroup: action.payload };
    case ActionType.UPDATE_GROUP:
      return {
        ...state,
        groups: state.groups.map(group => {
          if (group.id === action.payload.groupId) {
            return {
              ...group,
              members: action.payload.members ?? group.members,
              expenses: action.payload.expenses ?? group.expenses,
            };
          }
          return group;
        }),
      };
    case ActionType.UPDATE_MONTHLY_SPEND:
      // This is a placeholder for optimistic UI updates.
      console.log('Dispatching UPDATE_MONTHLY_SPEND', action.payload)
      return state
    default:
      return state
  }
}

// Context
const BudgetContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
  getGroupById: (groupId: string) => Group | undefined;
  getMembersByGroupId: (groupId: string) => Member[];
  getExpensesByGroupId: (groupId: string) => Expense[];
  getExpenseById: (expenseId: string) => Expense | undefined;
  addExpense: (expense: Omit<Expense, 'id' | 'groupId'>, groupId: string) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  addMember: (groupId: string, email: string) => Promise<void>;
  addOfflineMember: (groupId: string, name: string) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  addGroup: (groupName: string) => Promise<string>;
  confirmSettlement: (settlementId: string) => Promise<void>;
  updateUserDisplayName: (userId: string, displayName: string) => Promise<void>;
  setActiveGroup: (groupId: string | null) => void;
} | null>(null)

// Provider
export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState)
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      dispatch({ type: ActionType.SET_GROUPS, payload: [] });
      return;
    }

    dispatch({ type: ActionType.SET_LOADING, payload: true });
    const groupsRef = collection(db, 'groups');
    // Query groups where the current user is a member using the new memberUserIds field
    const q = query(groupsRef, where('memberUserIds', 'array-contains', user.uid));

    const unsubscribe = onSnapshot(q, (groupSnapshot) => {
      const groupPromises = groupSnapshot.docs.map(async (groupDoc) => {
        const groupData = groupDoc.data() as Omit<Group, 'id' | 'members' | 'expenses' | 'createdAt'>;
        const groupId = groupDoc.id;

        // Initial fetch of members and expenses
        const membersRef = collection(db, `groups/${groupId}/members`);
        const membersSnapshot = await getDocs(membersRef);
        const members: Member[] = membersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          joinedAt: doc.data().joinedAt as Timestamp,
        } as Member));

        const expensesRef = collection(db, `groups/${groupId}/expenses`);
        const expensesSnapshot = await getDocs(expensesRef);
        const expenses: Expense[] = expensesSnapshot.docs.map(doc => ({
          id: doc.id,
          groupId: groupId,
          ...doc.data(),
          date: doc.data().date as Timestamp,
        } as Expense));

        return {
          id: groupId,
          ...groupData,
          createdAt: groupDoc.data().createdAt as Timestamp,
          members,
          expenses,
        };
      });

      Promise.all(groupPromises).then(fetchedGroups => {
        dispatch({ type: ActionType.SET_GROUPS, payload: fetchedGroups });

        // Now, set up listeners for subcollections
        fetchedGroups.forEach(group => {
          const membersRef = collection(db, `groups/${group.id}/members`);
          onSnapshot(membersRef, (snapshot) => {
            const updatedMembers: Member[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              joinedAt: doc.data().joinedAt as Timestamp,
            } as Member));
            dispatch({ type: ActionType.UPDATE_GROUP, payload: { groupId: group.id, members: updatedMembers } });
          });

          const expensesRef = collection(db, `groups/${group.id}/expenses`);
          onSnapshot(expensesRef, (snapshot) => {
            const updatedExpenses: Expense[] = snapshot.docs.map(doc => ({
              id: doc.id,
              groupId: group.id,
              ...doc.data(),
              date: doc.data().date as Timestamp,
            } as Expense));
            dispatch({ type: ActionType.UPDATE_GROUP, payload: { groupId: group.id, expenses: updatedExpenses } });
          });
        });
      });
    }, (error) => {
      console.error("Error fetching groups:", error);
      dispatch({ type: ActionType.SET_ERROR, payload: "Failed to load groups." });
    });

    return () => unsubscribe();
  }, [user]); // Re-run when user changes

  const getGroupById = (groupId: string) => {
    return state.groups.find(g => g.id === groupId);
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'groupId'>, groupId: string) => {
    try {
      const expensesRef = collection(db, `groups/${groupId}/expenses`);
      await addDoc(expensesRef, {
        ...expense,
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      dispatch({ type: ActionType.SET_ERROR, payload: "Failed to add expense." });
      throw error;
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      const expenseRef = doc(db, `groups/${expense.groupId}/expenses`, expense.id);
      await updateDoc(expenseRef, {
        ...expense,
      });
    } catch (error) {
      console.error("Error updating expense:", error);
      dispatch({ type: ActionType.SET_ERROR, payload: "Failed to update expense." });
      throw error;
    }
  };

  const getMembersByGroupId = (groupId: string) => {
    const group = state.groups.find(g => g.id === groupId);
    return group ? group.members : [];
  };

  const getExpensesByGroupId = (groupId: string) => {
    const group = state.groups.find(g => g.id === groupId);
    return group ? group.expenses : [];
  };

  const getExpenseById = (expenseId: string) => {
    for (const group of state.groups) {
      const expense = group.expenses.find(e => e.id === expenseId);
      if (expense) {
        return expense;
      }
    }
    return undefined;
  };

  const addMember = async (groupId: string, email: string) => {
    try {
      const membersRef = collection(db, `groups/${groupId}/members`);
      // In a real app, you'd query the 'users' collection to find the user by email
      // and then add their UID and displayName. For now, we'll just add the email.
      const newMemberDocRef = await addDoc(membersRef, {
        email,
        displayName: email, // Placeholder
        status: 'pending',
        joinedAt: serverTimestamp(),
      });

      // Update the parent group's memberUserIds array
      const groupRef = doc(db, 'groups', groupId);
      // Assuming the new member's userId is the same as the memberDoc.id for now
      // In a real app, you'd get the actual userId from the user lookup.
      await updateDoc(groupRef, {
        memberUserIds: arrayUnion(newMemberDocRef.id), 
      });

    } catch (error) {
      console.error("Error adding member:", error);
      dispatch({ type: ActionType.SET_ERROR, payload: "Failed to add member." });
      throw error;
    }
  };

  const addOfflineMember = async (groupId: string, name: string) => {
    try {
      const membersRef = collection(db, `groups/${groupId}/members`);
      await addDoc(membersRef, {
        displayName: name,
        isOffline: true,
        status: 'accepted', // Offline members are immediately accepted
        joinedAt: serverTimestamp(),
      });

      // Offline members don't have a userId, so we don't add them to memberUserIds

    } catch (error) {
      console.error("Error adding offline member:", error);
      dispatch({ type: ActionType.SET_ERROR, payload: "Failed to add offline member." });
      throw error;
    }
  };

  const removeMember = async (groupId: string, memberId: string) => {
    try {
      const memberRef = doc(db, `groups/${groupId}/members`, memberId);
      await deleteDoc(memberRef);

      // Remove the member's userId from the parent group's memberUserIds array
      const groupRef = doc(db, 'groups', groupId);
      // To get the userId, we need to read the member document first
      const memberDocSnapshot = await getDocs(query(collection(db, `groups/${groupId}/members`), where('__name__', '==', memberId)));
      if (!memberDocSnapshot.empty && memberDocSnapshot.docs[0].data().userId) {
        await updateDoc(groupRef, {
          memberUserIds: arrayRemove(memberDocSnapshot.docs[0].data().userId),
        });
      }

    } catch (error) {
      console.error("Error removing member:", error);
      dispatch({ type: ActionType.SET_ERROR, payload: "Failed to remove member." });
      throw error;
    }
  };

  const addGroup = async (groupName: string) => {
    try {
      if (!user) throw new Error("User not authenticated.");

      const groupsRef = collection(db, 'groups');
      const newGroupRef = await addDoc(groupsRef, {
        name: groupName,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        memberUserIds: [user.uid], // Initialize with creator's UID
      });

      // Add the creator as a member to the subcollection
      const membersRef = collection(db, `groups/${newGroupRef.id}/members`);
      await addDoc(membersRef, {
        displayName: user.displayName || user.email,
        email: user.email,
        status: 'accepted',
        joinedAt: serverTimestamp(),
        userId: user.uid,
      });

      return newGroupRef.id;
    } catch (error) {
      console.error("Error adding group:", error);
      dispatch({ type: ActionType.SET_ERROR, payload: "Failed to add group." });
      throw error;
    }
  };

  const confirmSettlement = async (settlementId: string) => {
    try {
      const settlementRef = doc(db, 'settlements', settlementId);
      await updateDoc(settlementRef, {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error confirming settlement:", error);
      dispatch({ type: ActionType.SET_ERROR, payload: "Failed to confirm settlement." });
      throw error;
    }
  };

  const updateUserDisplayName = async (userId: string, displayName: string) => {
    const batch = writeBatch(db);
    state.groups.forEach(group => {
      group.members.forEach(member => {
        if (member.userId === userId) {
          const memberRef = doc(db, `groups/${group.id}/members`, member.id);
          batch.update(memberRef, { displayName });
        }
      });
    });
    await batch.commit();
  };

  const setActiveGroup = (groupId: string | null) => {
    dispatch({ type: ActionType.SET_ACTIVE_GROUP, payload: groupId });
  };


  return (
    <BudgetContext.Provider value={{ state, dispatch, getGroupById, getMembersByGroupId, getExpensesByGroupId, getExpenseById, addExpense, updateExpense, addMember, addOfflineMember, removeMember, addGroup, confirmSettlement, updateUserDisplayName, setActiveGroup }}>
      {children}
    </BudgetContext.Provider>
  )
}

// Hook
export const useBudget = () => {
  const context = useContext(BudgetContext)
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider')
  }
  return context
}