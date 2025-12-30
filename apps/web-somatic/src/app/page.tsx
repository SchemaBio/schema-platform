import { redirect } from 'next/navigation';

/**
 * Root page redirects to the dashboard page.
 */
export default function HomePage() {
  redirect('/dashboard');
}
