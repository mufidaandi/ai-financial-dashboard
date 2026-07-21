// Unique-per-call values so parallel workers and repeat runs never collide
// on the app's (name+user)/(email) uniqueness constraints.
function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// `tag` distinguishes where an account came from when eyeballing the DB
// later (e.g. 'smoke' for prod smoke-test accounts vs. 'e2e' for local runs).
export function makeUser(
  tag: string = 'e2e',
  overrides: Partial<{ name: string; email: string; password: string }> = {}
) {
  const suffix = uniqueSuffix();
  return {
    name: `Test User ${suffix}`,
    email: `${tag}.${suffix}@example.test`,
    password: 'Password123!',
    ...overrides,
  };
}

export function uniqueName(prefix: string) {
  return `${prefix} ${uniqueSuffix()}`;
}
