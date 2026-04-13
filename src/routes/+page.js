
import { redirect } from '@sveltejs/kit';

export function load() {
    // Redirect root '/' to '/dashboard'
    throw redirect(307, '/dashboard');
}