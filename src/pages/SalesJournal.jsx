import { useMemo, useState } from "react";
import items from "../data/pos_item.json";
import { loadTransactions, saveTransactions } from "../utils/storage";

export default function SalesJournal() {
  const products = useMemo(() => items, []);
  const [transactions, setTransactions] = useState(() => loadTransactions());

  // Use itemName as "id"
  const [itemName, setItemName] = useState(products?.[0]?.itemName || "");
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const selected = products.find((p) => p.itemName === itemName);
  const totalPrice = selected ? Number(quantity) * Number(selected.unitPrice) : 0;

  function addSale(e) {
    e.preventDefault();
    if (!selected) return;

    const tx = {
      id: "t_" + Date.now(),
      itemName: selected.itemName,
      category: selected.category,
      unitPrice: Number(selected.unitPrice),
      quantity: Number(quantity),
      date, // YYYY-MM-DD
      totalPrice: Number(quantity) * Number(selected.unitPrice),
    };

    const next = [tx, ...transactions];
    setTransactions(next);
    saveTransactions(next);
  }

  function clearAll() {
    setTransactions([]);
    saveTransactions([]);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Sales Journal</h2>

      <form onSubmit={addSale} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <label>
          Product
          <select value={itemName} onChange={(e) => setItemName(e.target.value)} style={{ width: "100%" }}>
            {products.map((p) => (
              <option key={p.itemName} value={p.itemName}>
                {p.itemName} — {p.unitPrice} THB
              </option>
            ))}
          </select>
        </label>

        <label>
          Quantity
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%" }} />
        </label>

        <div>
          <b>Total Price:</b> {totalPrice}
        </div>

        <button type="submit">Add Sale</button>
        <button type="button" onClick={clearAll}>Clear All</button>
      </form>

      <h3 style={{ marginTop: 20 }}>Transactions</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr><td colSpan="6">No transactions yet.</td></tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.itemName}</td>
                <td>{t.category}</td>
                <td>{t.quantity}</td>
                <td>{t.unitPrice}</td>
                <td>{t.totalPrice}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
