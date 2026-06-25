import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { calculateShippingForSku } from "../lib/shippingCalculator";
export const action = async ({ request }: ActionFunctionArgs) => {
  const authResult = await authenticate.admin(request);

  // ✅ FIX: DO NOT return redirect Response
  if (authResult instanceof Response) {
    return Response.json(
      { success: false, error: "Session expired. Please refresh the app." },
      { status: 401 }
    );
  }

  const { session } = authResult ?? {};
  if (!session || !session.shop) {
    return Response.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const sku = formData.get("sku");

  if (!sku || typeof sku !== "string") {
    return Response.json(
      { success: false, error: "SKU is required" },
      { status: 400 }
    );
  }

  const result = await calculateShippingForSku(sku.trim(), session.shop);

  try {
    await prisma.shippingCalculationLog_de.create({
      data: {
        shop: session.shop,
        sku: result.sku || sku.trim(),
        basePrice: result.basePrice || 0,
        taxAmount: result.taxAmount || 0,
        carrierCharge: result.carrierCharge || 0,
        total: result.total || 0,
        status: result.success ? "Success" : "Failed",
        error: result.success ? null : (result.error || "Calculation failed"),
      },
    });
  } catch (logError) {
    console.error("Log error:", logError);
  }

  return Response.json(result);
};