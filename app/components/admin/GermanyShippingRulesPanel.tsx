import React, { useState } from "react";

interface GermanyShippingRule {
  id: number | null;
  Min_Weight: number;
  Max_Weight: number;
  Price: number;
}

interface Props {
  rules: GermanyShippingRule[];
}

export default function GermanyShippingRulesPanel({
  rules: initialRules,
}: Props) {
  const [rules, setRules] =
    useState<GermanyShippingRule[]>(initialRules);

  const [saving, setSaving] = useState(false);

  const updateRule = (
    index: number,
    field: keyof GermanyShippingRule,
    value: number,
  ) => {
    const updated = [...rules];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setRules(updated);
  };

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: null,
        Min_Weight: 0,
        Max_Weight: 0,
        Price: 0,
      },
    ]);
  };

  const deleteRule = (index: number) => {
    setRules(
      rules.filter((_, i) => i !== index),
    );
  };

  const saveRules = async () => {
    try {
      setSaving(true);

      const response = await fetch(
        "/app/api/germany-shipping-rules",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            rules,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to save rules",
        );
      }

      alert("✅ Rules saved successfully");

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert(
        "❌ Failed to save shipping rules",
      );
    } finally {
      setSaving(false);
    }
  };

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
          justifyContent:
            "space-between",
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
            Configure weight-based
            shipping rates for Germany.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={addRule}
            style={{
              ...buttonStyle,
              background: "#e2e8f0",
              color: "#0f172a",
              marginRight: 10,
            }}
          >
            + Add Rule
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={saveRules}
            style={{
              ...buttonStyle,
              background: "#2563eb",
              color: "#fff",
            }}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
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
            <th style={cellHeader}>
              Min Weight
            </th>
            <th style={cellHeader}>
              Max Weight
            </th>
            <th style={cellHeader}>
              Price (€)
            </th>
            <th style={cellHeader}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {rules.map(
            (rule, index) => (
              <tr
                key={
                  rule.id ??
                  `new-${index}`
                }
              >
                <td style={cell}>
                  <input
                    type="number"
                    step="0.01"
                    value={
                      rule.Min_Weight
                    }
                    onChange={(e) =>
                      updateRule(
                        index,
                        "Min_Weight",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    style={inputStyle}
                  />
                </td>

                <td style={cell}>
                  <input
                    type="number"
                    step="0.01"
                    value={
                      rule.Max_Weight
                    }
                    onChange={(e) =>
                      updateRule(
                        index,
                        "Max_Weight",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    style={inputStyle}
                  />
                </td>

                <td style={cell}>
                  <input
                    type="number"
                    step="0.01"
                    value={rule.Price}
                    onChange={(e) =>
                      updateRule(
                        index,
                        "Price",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    style={inputStyle}
                  />
                </td>

                <td style={cell}>
                  <button
                    type="button"
                    onClick={() =>
                      deleteRule(index)
                    }
                    style={{
                      ...buttonStyle,
                      background:
                        "#dc2626",
                      color: "#fff",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ),
          )}
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
          Germany Packing Logic
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
→ Packed into one parcel (23kg)

Single item > 31.5kg
→ Heavy Item Pricing

Multiple items
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
  borderRadius: 6,
  border: "1px solid #cbd5e1",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};