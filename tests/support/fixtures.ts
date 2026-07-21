import { test as base, expect } from '@playwright/test';
import { registerUser, createAccount, createCategory, type RegisteredUser } from './api-client';
import { makeUser, uniqueName } from './test-data';

type Credentials = { name: string; email: string; password: string };
type Registered = { credentials: Credentials; data: RegisteredUser };
type SeededAccount = { id: string; name: string };
type SeededCategory = { id: string; name: string };

type Fixtures = {
  newUser: Credentials;
  registered: Registered;
  authedPage: import('@playwright/test').Page;
  seededAccount: SeededAccount;
  seededCategory: SeededCategory;
};

// Seeds the session into localStorage before any app script runs, so the
// SPA boots already authenticated. Call this, then `page.goto(path)`.
export async function primeSession(page: import('@playwright/test').Page, registered: Registered) {
  await page.addInitScript((session) => {
    window.localStorage.setItem('user', JSON.stringify(session));
  }, {
    accessToken: registered.data.accessToken,
    refreshToken: registered.data.refreshToken,
    user: registered.data.user,
  });
}

// Every first-time user gets a full-screen welcome/onboarding modal
// (App.jsx mounts <WelcomeModal /> globally, not per-route), which intercepts
// clicks on whatever page it lands on top of. Call this right after
// navigating a fresh session to any authenticated route, before clicking
// anything else on that page.
export async function dismissWelcomeModal(page: import('@playwright/test').Page) {
  try {
    await page.getByRole('button', { name: 'Explore on My Own' }).click({ timeout: 5000 });
  } catch {
    // Not shown for this session — nothing to dismiss.
  }
}

export const test = base.extend<Fixtures>({
  newUser: async ({}, use) => {
    await use(makeUser());
  },

  registered: async ({ request, newUser }, use) => {
    const data = await registerUser(request, newUser);
    await use({ credentials: newUser, data });
  },

  authedPage: async ({ page, registered }, use) => {
    await primeSession(page, registered);
    await page.goto('/dashboard');
    await dismissWelcomeModal(page);
    await use(page);
  },

  seededAccount: async ({ request, registered }, use) => {
    const account = await createAccount(request, registered.data.accessToken, {
      name: uniqueName('Checking'),
      type: 'Checking',
      balance: 1000,
    });
    await use({ id: account._id, name: account.name });
  },

  seededCategory: async ({ request, registered }, use) => {
    const category = await createCategory(request, registered.data.accessToken, {
      name: uniqueName('Groceries'),
    });
    await use({ id: category._id, name: category.name });
  },
});

export { expect };
