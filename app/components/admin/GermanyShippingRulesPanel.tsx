import React from "react";

interface GermanyShippingRule {
  id: number;
  Min_Weight: number;
  Max_Weight: number;
  Price: number;
}

interface Props {
  rules: GermanyShippingRule[];
}

export default function GermanyShippingRulesPanel({
  rules,
}: Props) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 20,
        marginTop: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
            }}
          >
            Germany Shipping Rules
          </h2>

          <p
            style={{
              marginTop: 8,
              color: "#64748b",
            }}
          >
            Configure weight-based shipping rates for Germany.
          </p>
        </div>

        <button
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Add Rule
        </button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#f8fafc",
            }}
          >
            <th style={cellHeader}>Min Weight</th>
            <th style={cellHeader}>Max Weight</th>
            <th style={cellHeader}>Price (€)</th>
            <th style={cellHeader}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td style={cell}>{Number(rule.Min_Weight ?? 0)}</td>
              <td style={cell}>{Number(rule.Max_Weight ?? 0)}</td>
              <td style={cell}>€{Number(rule.Price ?? 0).toFixed(2)}</td>
              <td style={cell}>
                <button style={editButton}>Edit</button>
                <button style={deleteButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "#f8fafc",
          borderRadius: 10,
          border: "1px solid #cbd5e1",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Parcel Splitting Example</h3>

        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {`65kg shipment

Parcel 1 = 31.5kg
Parcel 2 = 31.5kg
Parcel 3 = 2kg

Total Price =
31.5kg rate +
31.5kg rate +
2kg rate`}
        </pre>
      </div>
    </section>
  );
}

const cellHeader: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #cbd5e1",
};

const cell: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #e2e8f0",
};

const editButton: React.CSSProperties = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 12px",
  marginRight: 8,
  cursor: "pointer",
};

const deleteButton: React.CSSProperties = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
};