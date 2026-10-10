import { ZodError } from "zod";

/** Every mutating server action returns this shape, so the UI never has to guess. */
export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; error: string };

/** An error whose message is safe to show to the user. */
export class ActionError extends Error {}

/**
 * Runs an action body and converts failures into a friendly ActionResult.
 * Unexpected errors are logged on the server and replaced with a generic message.
 */
export async function runAction<T>(name: string, fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    if (error instanceof ActionError) return { success: false, error: error.message };
    if (error instanceof ZodError) return { success: false, error: error.issues[0]?.message ?? "Invalid input" };
    console.error(`[action:${name}]`, error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/** Same as runAction but for reads: returns `fallback` instead of an error object. */
export async function safeQuery<T>(name: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[query:${name}]`, error);
    return fallback;
  }
}
