// src/app/page.tsx
'use client';

import { redirect } from 'next/navigation';
import withAuth from '../components/withAuth';

function HomePage() {
  redirect('/dashboard');
}

export default withAuth(HomePage);