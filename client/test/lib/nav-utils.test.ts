import { getAvatarFallback } from "@/components/navigation/nav-utils";

describe("getAvatarFallback", () => {
  it("#1 returns fallback for blank input", () => {
    expect(getAvatarFallback("   ")).toBe("USR");
  });

  it("#2 returns initials from first two words", () => {
    expect(getAvatarFallback("  jane   doe  ")).toBe("JD");
  });
});