import { CurrentUserSchema } from "../src/index.js";

describe("CurrentUserSchema", () => {
  const valid = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "person@example.com",
    role: "VOLUNTEER",
    status: "VERIFIED",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  it("accepts a valid payload", () => {
    expect(CurrentUserSchema.parse(valid)).toEqual(valid);
  });

  it("rejects an invalid email", () => {
    expect(CurrentUserSchema.safeParse({ ...valid, email: "bad-email" }).success).toBe(false);
  });
});