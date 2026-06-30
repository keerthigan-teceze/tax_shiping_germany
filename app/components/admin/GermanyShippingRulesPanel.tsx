import React, { useState } from "react";
import { Form } from "react-router";

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
  const [editingId, setEditingId] = useState<number | null>(null);

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

        <Form method="post">
          <input
            type="hidden"
            name="action"
            value="create-rule"
          />

          <button
            type="submit"
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
        </Form>
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
      {editingId === rule.id ? (
        <>
          <td style={cell}>
            <Form method="post">
              <input
                type="hidden"
                name="action"
                value="update-rule"
              />

              <input
                type="hidden"
                name="id"
                value={rule.id}
              />

              <input
                type="number"
                step="0.01"
                name="minWeight"
                defaultValue={Number(rule.Min_Weight)}
                style={inputStyle}
                required
              />

              <input
                type="hidden"
                name="maxWeight"
                value={Number(rule.Max_Weight)}
              />

              <input
                type="hidden"
                name="price"
                value={Number(rule.Price)}
              />

              <button
                type="submit"
                style={saveButton}
              >
                Save
              </button>

              <button
                type="button"
                style={cancelButton}
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </Form>
          </td>

          <td style={cell}>
            <input
              form={`rule-${rule.id}`}
              type="number"
              step="0.01"
              name="maxWeight"
              defaultValue={Number(rule.Max_Weight)}
              style={inputStyle}
            />
          </td>

          <td style={cell}>
            <input
              form={`rule-${rule.id}`}
              type="number"
              step="0.01"
              name="price"
              defaultValue={Number(rule.Price)}
              style={inputStyle}
            />
          </td>

          <td style={cell}></td>
        </>
      ) : (
        <>
          <td style={cell}>
            {Number(rule.Min_Weight)}
          </td>

          <td style={cell}>
            {Number(rule.Max_Weight)}
          </td>

          <td style={cell}>
            €{Number(rule.Price).toFixed(2)}
          </td>

          <td style={cell}>
            <button
              type="button"
              style={editButton}
              onClick={() => setEditingId(rule.id)}
            >
              Edit
            </button>

            <Form
              method="post"
              style={{ display: "inline" }}
            >
              <input
                type="hidden"
                name="action"
                value="delete-rule"
              />

              <input
                type="hidden"
                name="id"
                value={rule.id}
              />

              <button
                type="submit"
                style={deleteButton}
                onClick={(e) => {
                  if (
                    !window.confirm(
                      "Delete this shipping rule?"
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                Delete
              </button>
            </Form>
          </td>
        </>
      )}
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
        <h3 style={{ marginTop: 0 }}>
          Packing Logic Example
        </h3>

        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
{`45kg Server
→ Heavy Item Rate

20kg Server + 20kg Server
→ Parcel 1 = 20kg
→ Parcel 2 = 20kg

10kg + 8kg + 5kg
→ Packed into 1 parcel (23kg)

Single items above 31.5kg
→ Freight/Heavy Item Pricing
→ Never split physically

Items below 31.5kg
→ Packed efficiently up to 31.5kg per parcel`}
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  fontSize: 14,
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

const saveButton: React.CSSProperties = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 12px",
  marginRight: 8,
  cursor: "pointer",
};

const cancelButton: React.CSSProperties = {
  background: "#64748b",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
};