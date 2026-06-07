// __tests__/components/auth/login-form.test.tsx
// Owner: Tests
// Purpose: Smoke test for the login form. Confirms Testing Library + jsdom +
// alias resolution all work end-to-end. The Server Action is mocked since
// useActionState needs a callable function but the action itself isn't the
// subject under test here.
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/(auth)/actions", () => ({
  loginAction: async () => ({}),
}));

import { LoginForm } from "@/components/auth/login-form";

describe("LoginForm", () => {
  it("renders email + password inputs and a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });
});
