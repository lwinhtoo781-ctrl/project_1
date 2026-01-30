import { useMemo, useState } from "react";
import { Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { loadTransactions } from "../utils/storage";

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

function groupBy(arr, keyFn) {
  const m = new Map();
  for (const x of arr) {
    const k = keyFn(x);
    m.set(k, (m.get(k) || []).concat(x));
  }
  return m;
}

export default function Dashboard() {
  const [mode, setMode] = useState("Daily"); // Daily | Weekly | Monthly
  const [refDate, setRefDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Load once; refresh page after adding transactions
  const transactions = useMemo(() => loadTransactions(), []);

  const allTimeSales = useMemo(
    () => sum(transactions.map((t) => t.totalPrice)),
    [transactions]
  );

  // Period filter (Weekly = Mon-Sun)
  const filtered = useMemo(() => {
    const d = new Date(refDate);

    if (mode === "Daily") return transactions.filter((t) => t.date === refDate);

    if (mode === "Monthly") {
      const ym = refDate.slice(0, 7);
      return transactions.filter((t) => t.date.slice(0, 7) === ym);
    }

    const day = d.getDay(); // 0 Sun..6 Sat
    const diffToMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(d);
    mon.setDate(d.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const monStr = mon.toISOString().slice(0, 10);
    const sunStr = sun.toISOString().slice(0, 10);

    return transactions.filter((t) => t.date >= monStr && t.date <= sunStr);
  }, [transactions, mode, refDate]);

  const periodRevenue = useMemo(
    () => sum(filtered.map((t) => t.totalPrice)),
    [filtered]
  );

  // Sales by product (revenue)
  const salesByProduct = useMemo(() => {
    const m = new Map();
    for (const t of transactions) {
      const cur = m.get(t.itemName) || { name: t.itemName, revenue: 0, qty: 0 };
      cur.revenue += t.totalPrice;
      cur.qty += t.quantity;
      m.set(t.itemName, cur);
    }
    return Array.from(m.values()).sort((a, b) => b.revenue - a.revenue);
  }, [transactions]);

  // Top 5 selling items by quantity
  const top5 = useMemo(() => {
    return [...salesByProduct].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [salesByProduct]);

  // Line chart (daily trend)
  const lineData = useMemo(() => {
    const byDate = groupBy(transactions, (t) => t.date);
    return Array.from(byDate.entries())
      .map(([date, rows]) => ({ date, sales: sum(rows.map((r) => r.totalPrice)) }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [transactions]);

  // Pie chart (revenue by category)
  const pieData = useMemo(() => {
    const byCat = groupBy(transactions, (t) => t.category);
    return Array.from(byCat.entries()).map(([cat, rows]) => ({
      name: cat,
      value: sum(rows.map((r) => r.totalPrice)),
    }));
  }, [transactions]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>

      <div style={{ marginBottom: 12 }}>
        <b>Total Sales (All Time):</b> {allTimeSales}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          Period:
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ marginLeft: 8 }}>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </label>

        <label>
          Reference Date:
          <input type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} style={{ marginLeft: 8 }} />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <b>Sales Summary ({mode}):</b> {periodRevenue} (transactions: {filtered.length})
      </div>

      <h3 style={{ marginTop: 20 }}>Sales by Product (Revenue)</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: 620 }}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {salesByProduct.length === 0 ? (
            <tr><td colSpan="3">No data yet.</td></tr>
          ) : (
            salesByProduct.map((x) => (
              <tr key={x.name}>
                <td>{x.name}</td>
                <td>{x.qty}</td>
                <td>{x.revenue}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3 style={{ marginTop: 20 }}>Line Chart (Daily Sales Trend)</h3>
      <LineChart width={820} height={300} data={lineData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="sales" />
      </LineChart>

      <h3 style={{ marginTop: 20 }}>Pie Chart (Sales by Category)</h3>
      <PieChart width={820} height={300}>
        <Pie data={pieData} dataKey="value" nameKey="name" label />
        <Tooltip />
        <Legend />
      </PieChart>

      <h3 style={{ marginTop: 20 }}>Top 5 Selling Items (by quantity)</h3>
      <ol>
        {top5.length === 0 ? <li>No data yet.</li> : top5.map((x) => (
          <li key={x.name}>{x.name} — Qty: {x.qty} — Revenue: {x.revenue}</li>
        ))}
      </ol>

      <div style={{ marginTop: 12, fontSize: 14, color: "#555" }}>
        Tip: after adding sales in Sales Journal, refresh this page to reload localStorage.
      </div>
    </div>
  );
}
