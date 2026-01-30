const TX_KEY = "transactions_v1";

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(TX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(TX_KEY, JSON.stringify(transactions));
}
