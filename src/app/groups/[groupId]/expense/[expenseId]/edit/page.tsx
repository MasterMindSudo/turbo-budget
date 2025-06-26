// src/app/groups/[groupId]/expense/[expenseId]/edit/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import NewExpenseFull from '../../../../../../pages/NewExpenseFull'; // Corrected path

const EditExpensePage: React.FC = () => {
  const params = useParams();
  const groupId = params.groupId as string;
  const expenseId = params.expenseId as string;

  return (
    <NewExpenseFull groupId={groupId} expenseId={expenseId} />
  );
};

export default EditExpensePage;
