import type { ActionFunctionArgs } from "react-router";
import { json } from "react-router";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const authResult =
    await authenticate.admin(request);

  if (authResult instanceof Response) {
    return authResult;
  }

  const body = await request.json();

  const rules = body.rules ?? [];

  try {
    await prisma.$transaction(async (tx) => {
      const existingRules =
        await tx.shipping_rules_DE.findMany({
          select: {
            id: true,
          },
        });

      const existingIds = new Set(
        existingRules.map((r) => r.id.toString()),
      );

      const incomingIds = new Set(
        rules
          .filter((r: any) => r.id)
          .map((r: any) => r.id.toString()),
      );

      // Delete removed rows
      for (const existingRule of existingRules) {
        if (
          !incomingIds.has(
            existingRule.id.toString(),
          )
        ) {
          await tx.shipping_rules_DE.delete({
            where: {
              id: existingRule.id,
            },
          });
        }
      }

      // Create / Update
      for (const rule of rules) {
        const minWeight = Number(
          rule.Min_Weight ?? 0,
        );

        const maxWeight = Number(
          rule.Max_Weight ?? 0,
        );

        const price = Number(rule.Price ?? 0);

        if (
          rule.id &&
          existingIds.has(rule.id.toString())
        ) {
          await tx.shipping_rules_DE.update({
            where: {
              id: BigInt(rule.id),
            },
            data: {
              Min_Weight: minWeight,
              Max_Weight: maxWeight,
              Price: price,
            },
          });
        } else {
          await tx.shipping_rules_DE.create({
            data: {
              Min_Weight: minWeight,
              Max_Weight: maxWeight,
              Price: price,
            },
          });
        }
      }
    });

    return json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to save Germany shipping rules:",
      error,
    );

    return json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
};