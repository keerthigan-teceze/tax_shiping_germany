import { useEffect } from "react";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getSupabaseClient } from "../supabase.server";

const SOURCE_TABLE = "shopify_products_final_Germany";
const TARGET_TABLE = "productMapping_Germany";
const PAGE_SIZE = 1000;

const fetchAllRows = async (supabase) => {
  const rows = [];
  let from = 0;
  let hasMoreRows = true;

  while (hasMoreRows) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from(SOURCE_TABLE)
      .select("*")
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    rows.push(...(data ?? []));

    hasMoreRows = Boolean(data && data.length === PAGE_SIZE);

    from += PAGE_SIZE;
  }

  return rows;
};

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  const actionType = formData.get("action");

  if (actionType !== "manual-sync") {
    return { success: false, error: "Unknown action." };
  }

  try {
    const supabase = getSupabaseClient();

    const { error: deleteError } = await supabase
      .from(TARGET_TABLE)
      .delete()
      .not("id", "is", null);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    const sourceRows = await fetchAllRows(supabase);
    const rowsToInsert = sourceRows.map((row) => {
      const rowToInsert = { ...row };
      delete rowToInsert.id;
      return rowToInsert;
    });

    if (rowsToInsert.length === 0) {
      return { success: true, copiedRows: 0 };
    }

    const { error: insertError } = await supabase
      .from(TARGET_TABLE)
      .insert(rowsToInsert);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true, copiedRows: rowsToInsert.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sync failed.",
    };
  }
};

export default function Index() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isSyncing =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.success) {
      const copiedRows = fetcher.data.copiedRows ?? 0;
      shopify.toast.show(`Sync successful. ${copiedRows} rows copied.`);
    }

    if (fetcher.data?.error) {
      shopify.toast.show(`Sync failed: ${fetcher.data.error}`, {
        isError: true,
      });
    }
  }, [fetcher.data, shopify]);

  const handleManualSync = () => {
    if (isSyncing) {
      return;
    }

    fetcher.submit({ action: "manual-sync" }, { method: "POST" });
  };

  return (
    <s-page heading="Germany Product Sync">
      <s-section heading="Product Mapping">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Copy product rows from {SOURCE_TABLE} into {TARGET_TABLE}.
          </s-paragraph>

          <s-stack direction="inline" gap="base">
            <s-button
              onClick={handleManualSync}
              variant="primary"
              {...(isSyncing ? { loading: true, disabled: true } : {})}
            >
              {isSyncing ? "Syncing..." : "Manual Sync Germany"}
            </s-button>
          </s-stack>

          {isSyncing && (
            <s-banner tone="info">
              <s-paragraph>Sync in progress...</s-paragraph>
            </s-banner>
          )}

          {fetcher.data?.success && !isSyncing && (
            <s-banner tone="success">
              <s-paragraph>
                Sync completed successfully. {fetcher.data.copiedRows ?? 0}{" "}
                rows copied.
              </s-paragraph>
            </s-banner>
          )}

          {fetcher.data?.error && !isSyncing && (
            <s-banner tone="critical">
              <s-paragraph>Error: {fetcher.data.error}</s-paragraph>
            </s-banner>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
