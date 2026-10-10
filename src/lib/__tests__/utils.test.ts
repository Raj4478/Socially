import { afterEach, describe, expect, it } from "vitest";
import { compactNumber, displayName, shortTimeAgo } from "../utils";
import { rateLimit, resetRateLimits } from "../rate-limit";
import { ActionError, runAction } from "../action";
import { toHandle } from "../handle";
import { z } from "zod";

describe("shortTimeAgo", () => {
  const now = new Date("2026-10-10T12:00:00Z").getTime();
  it("formats recent times compactly", () => {
    expect(shortTimeAgo("2026-10-10T11:59:50Z", now)).toBe("now");
    expect(shortTimeAgo("2026-10-10T11:55:00Z", now)).toBe("5m");
    expect(shortTimeAgo("2026-10-10T09:00:00Z", now)).toBe("3h");
    expect(shortTimeAgo("2026-10-08T12:00:00Z", now)).toBe("2d");
  });
  it("shows a date for older posts", () => {
    expect(shortTimeAgo("2026-09-01T12:00:00Z", now)).toMatch(/Sep 1/);
    expect(shortTimeAgo("2025-09-01T12:00:00Z", now)).toMatch(/2025/);
  });
});

describe("formatting helpers", () => {
  it("compacts numbers", () => {
    expect(compactNumber(999)).toBe("999");
    expect(compactNumber(1234)).toBe("1.2K");
  });
  it("falls back to the username", () => {
    expect(displayName({ name: "  ", username: "raj" })).toBe("raj");
    expect(displayName({ name: "Raj Singh", username: "raj" })).toBe("Raj Singh");
  });
  it("builds valid handles", () => {
    expect(toHandle("Raj.Singh-99")).toBe("rajsingh99");
    expect(toHandle("ab")).toBe("userab");
    expect(toHandle("x".repeat(40))).toHaveLength(20);
  });
});

describe("rateLimit", () => {
  afterEach(() => resetRateLimits());
  it("blocks after the limit within the window and recovers after it", () => {
    rateLimit("k", 2, 1000, 0);
    rateLimit("k", 2, 1000, 10);
    expect(() => rateLimit("k", 2, 1000, 20)).toThrow(ActionError);
    expect(() => rateLimit("k", 2, 1000, 1500)).not.toThrow();
  });
});

describe("runAction", () => {
  it("wraps success", async () => {
    expect(await runAction("t", async () => 1)).toEqual({ success: true, data: 1 });
  });
  it("passes through user-safe errors and validation messages", async () => {
    expect(await runAction("t", async () => { throw new ActionError("Nope"); })).toEqual({ success: false, error: "Nope" });
    const res = await runAction("t", async () => z.string().min(3, "Too short").parse("a"));
    expect(res).toEqual({ success: false, error: "Too short" });
  });
  it("hides unexpected errors", async () => {
    const original = console.error;
    console.error = () => {};
    const res = await runAction("t", async () => { throw new Error("db password leaked"); });
    console.error = original;
    expect(res).toEqual({ success: false, error: "Something went wrong. Please try again." });
  });
});
