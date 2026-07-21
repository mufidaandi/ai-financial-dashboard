import { APIRequestContext } from '@playwright/test';
import { API_URL } from './config';

export type RegisteredUser = {
  accessToken: string;
  refreshToken: string;
  user: { _id: string; name: string; email: string };
};

async function unwrap(res: Awaited<ReturnType<APIRequestContext['post']>>, action: string) {
  if (!res.ok()) {
    throw new Error(`${action} failed: ${res.status()} ${await res.text()}`);
  }
  return res.json();
}

// Registers a brand-new user directly against the API so UI specs can start
// from a known, isolated account without spending a UI login/register step.
export async function registerUser(
  request: APIRequestContext,
  user: { name: string; email: string; password: string }
): Promise<RegisteredUser> {
  const res = await request.post(`${API_URL}/auth/register`, { data: user });
  return unwrap(res, 'register');
}

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function createAccount(
  request: APIRequestContext,
  accessToken: string,
  account: { name: string; type: 'Savings' | 'Checking' | 'Credit Card' | 'Cash' | 'Investment'; balance?: number; creditLimit?: number; statementDate?: number; dueDate?: number }
) {
  const res = await request.post(`${API_URL}/accounts`, { headers: authHeaders(accessToken), data: account });
  return unwrap(res, 'createAccount');
}

export async function createCategory(request: APIRequestContext, accessToken: string, category: { name: string }) {
  const res = await request.post(`${API_URL}/categories`, { headers: authHeaders(accessToken), data: category });
  return unwrap(res, 'createCategory');
}

export async function createTransaction(
  request: APIRequestContext,
  accessToken: string,
  transaction: {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description: string;
    date: string;
    account?: string;
    category?: string;
    fromAccount?: string;
    toAccount?: string;
  }
) {
  const res = await request.post(`${API_URL}/transactions`, { headers: authHeaders(accessToken), data: transaction });
  return unwrap(res, 'createTransaction');
}
