const LEDGER_KEY = "lavVisualStudioCreditLedgerV2";

export class BrowserStorageProvider {
  constructor({ initialBalance = 42 } = {}) {
    this.initialBalance = initialBalance;
  }

  getLedger() {
    try {
      return JSON.parse(localStorage.getItem(LEDGER_KEY)) || [];
    } catch {
      return [];
    }
  }

  getBalance() {
    return this.getLedger().reduce((balance, transaction) => balance + transaction.amount, this.initialBalance);
  }

  addCreditTransaction({ type, amount, generationId = null, note = "" }) {
    const transaction = {
      id: globalThis.crypto?.randomUUID?.() || `tx-${Date.now()}`,
      type,
      amount,
      generationId,
      note,
      createdAt: new Date().toISOString()
    };
    const ledger = [...this.getLedger(), transaction];
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
    return transaction;
  }
}

// Balance is derived from transactions. It is never the only stored credit value.
