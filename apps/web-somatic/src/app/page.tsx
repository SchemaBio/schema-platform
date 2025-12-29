import { redirect } from 'next/navigation';

/**
 * Root page redirects to the samples page.
 */
export default function HomePage() {
  redirect('/samples');
}
