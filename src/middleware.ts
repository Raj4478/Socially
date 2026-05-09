import { clerkMiddleware } from '@clerk/nextjs/server';

// Use simple clerkMiddleware - it propagates auth context to all routes
// including server actions. Protection is handled at the page/action level.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes and server actions
    '/(api|trpc)(.*)',
  ],
};
