import { redirect } from 'next/navigation';

export default function RootPage() {
  // In a real app, you would check authentication status here.
  // For this scaffold, we always redirect to login.
  redirect('/login');
  //This return is necessary for the component to be valid, though redirect will prevent it from rendering.
  return null; 
}
