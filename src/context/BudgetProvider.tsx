
// /Users/kevinlam/Projects/turbo-budget/src/context/BudgetProvider.tsx
'use client'

import React, { createContext, useReducer, useContext, ReactNode } from 'react'

// Types
interface Member {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

interface Group {
  id: string
  name: string
  members: Member[];
}

interface State {
  groups: Group[]
  activeGroup: string | null
}

// Actions
export enum ActionType {
  SET_GROUPS = 'SET_GROUPS',
  ADD_GROUP = 'ADD_GROUP',
  SET_ACTIVE_GROUP = 'SET_ACTIVE_GROUP',
  // Future-proofing for budget adjustments
  UPDATE_MONTHLY_SPEND = 'UPDATE_MONTHLY_SPEND',
}

type Action = 
  | { type: ActionType.SET_GROUPS; payload: Group[] }
  | { type: ActionType.ADD_GROUP; payload: Group }
  | { type: ActionType.SET_ACTIVE_GROUP; payload: string }
  | { 
      type: ActionType.UPDATE_MONTHLY_SPEND
      payload: { monthId: string; total: number; categoryId: string; amount: number }
    }

// Reducer
const initialState: State = {
  groups: [],
  activeGroup: null,
}

const budgetReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.SET_GROUPS:
      return { ...state, groups: action.payload };
    case ActionType.ADD_GROUP:
      return { ...state, groups: [...state.groups, action.payload] };
    case ActionType.SET_ACTIVE_GROUP:
      return { ...state, activeGroup: action.payload }
    case ActionType.UPDATE_MONTHLY_SPEND:
      // This is a placeholder for optimistic UI updates.
      // The actual logic would be more complex, involving finding the right
      // monthly spend doc and updating it.
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
} | null>(null)

// Provider
export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState)

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
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

export const addGroup = (dispatch: React.Dispatch<Action>, group: Group) => {
  dispatch({ type: ActionType.ADD_GROUP, payload: group });
};
