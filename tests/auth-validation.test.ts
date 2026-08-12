import { describe, it, expect } from "vitest";
import { validateCredentials, MAX_PASSWORD_LENGTH } from "@/lib/credentials";
import { normalizeQuery } from "@/lib/normalize-query";

describe("validateCredentials", () => {
  it("normalizes email case and surrounding whitespace", () => {
    expect(validateCredentials("  User@Example.COM ", "hunter2!")).toEqual({
      email: "user@example.com",
      password: "hunter2!",
    });
  });

  it("rejects short passwords", () => {
    expect(validateCredentials("a@b.co", "12345")).toBeNull();
    expect(validateCredentials("a@b.co", "123456")).not.toBeNull();
  });

  /**
   * bcrypt ignores bytes past 72, so two different long passwords could
   * otherwise authenticate against the same hash.
   */
  it("rejects passwords longer than bcrypt actually hashes", () => {
    expect(validateCredentials("a@b.co", "x".repeat(MAX_PASSWORD_LENGTH))).not.toBeNull();
    expect(validateCredentials("a@b.co", "x".repeat(MAX_PASSWORD_LENGTH + 1))).toBeNull();
  });

  it("measures the password limit in bytes, not characters", () => {
    // Each of these is 3 bytes in UTF-8, so 24 chars is 72 bytes.
    expect(validateCredentials("a@b.co", "☃".repeat(24))).not.toBeNull();
    expect(validateCredentials("a@b.co", "☃".repeat(25))).toBeNull();
  });

  it("rejects malformed or missing emails", () => {
    for (const bad of ["", "   ", "not-an-email", "no@tld", "@example.com", "a b@c.co"]) {
      expect(validateCredentials(bad, "goodpassword")).toBeNull();
    }
  });

  it("rejects absurdly long emails", () => {
    expect(validateCredentials(`${"a".repeat(300)}@example.com`, "goodpassword")).toBeNull();
  });

  it("handles non-string input without throwing", () => {
    expect(validateCredentials(null, undefined)).toBeNull();
    expect(validateCredentials({}, [])).toBeNull();
  });
});

describe("normalizeQuery", () => {
  it("lowercases and trims so cached markets are reused", () => {
    expect(normalizeQuery("  Home Coffee Equipment ")).toBe("home coffee equipment");
  });

  it("collapses internal whitespace so spacing variants share a cache entry", () => {
    expect(normalizeQuery("home   coffee\tequipment")).toBe("home coffee equipment");
  });

  it("falls back to a default for empty input", () => {
    expect(normalizeQuery("   ")).toBe("home coffee equipment");
  });

  it("caps length so one request can't store an unbounded key", () => {
    expect(normalizeQuery("x".repeat(5000)).length).toBe(200);
  });
});
