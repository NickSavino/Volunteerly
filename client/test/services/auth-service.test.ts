jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

import { AuthService } from "@/services/AuthService";
import { supabase } from "@/lib/supabase";
import { AuthTokenResponsePassword } from "@supabase/supabase-js";

const signInWithPassword = supabase.auth
  .signInWithPassword as jest.MockedFunction<typeof supabase.auth.signInWithPassword>;
const signUp = supabase.auth.signUp as jest.MockedFunction<typeof supabase.auth.signUp>;
const updateUser = supabase.auth.updateUser as jest.MockedFunction<typeof supabase.auth.updateUser>;

describe("AuthService", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    signUp.mockReset();
    updateUser.mockReset();
  });

  it("forwards credentials to signInWithPassword", async () => {
    signInWithPassword.mockResolvedValueOnce({ data: { user: null, session: null }, error: null } as unknown as AuthTokenResponsePassword);

    await AuthService.loginUserWithEmailPass("person@example.com", "secret");

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "secret",
    });
  });

  it("forwards credentials to signUp", async () => {
    signUp.mockResolvedValueOnce({ data: { user: null, session: null }, error: null });

    await AuthService.SignUpUserWithEmailPass("person@example.com", "secret");

    expect(signUp).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "secret",
    });
  });

  it("throws when changePassword receives an auth error", async () => {
    const error = new Error("bad password") as any;
    updateUser.mockResolvedValueOnce({ error });

    await expect(AuthService.changePassword("pw")).rejects.toThrow("bad password");
  });
});
