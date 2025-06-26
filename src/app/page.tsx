// src/app/page.tsx
import { redirect } from 'next/navigation';

// This is the root page, it will redirect to the default group homepage
export default function HomePage() {
  redirect('/groups/group1');
}