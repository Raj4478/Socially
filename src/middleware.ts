import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Pages that only make sense when signed in. Everything else (feed, profiles, posts,
// tags, explore) is public; server actions check auth themselves.
const isPrivateRoute = createRouteMatcher(["/notifications(.*)", "/bookmarks(.*)", "/profile"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPrivateRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
