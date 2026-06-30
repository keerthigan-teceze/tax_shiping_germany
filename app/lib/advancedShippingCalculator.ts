import prisma from "../db.server";

interface ShippingItem {
  weight?: number | null;
  source_type?: string | null;
  product_type?: string | null;
}

function parseSourceType(sourceType?: string | null): string {
  const raw = (sourceType ?? "unknown").toString().trim();

  let parsedSource = raw;

  if (raw.includes("(")) {
    const match = raw.match(/\(([^)]+)\)/);
    parsedSource = match?.[1] ?? raw;
  }

  parsedSource = parsedSource.toLowerCase();

  console.log("Source Type Raw:", raw);
  console.log("Parsed Source:", parsedSource);

  return parsedSource || "unknown";
}

export class AdvancedShippingEngineDE {
  private readonly MAX_PARCEL_WEIGHT = 31.5;

  async calculate(
    items: ShippingItem[],
    postcode?: string,
  ): Promise<number> {
    const shipments = this.groupBySource(items);

    let totalShipping = 0;
    let totalWeight = 0;

    for (const shipment of shipments) {
      const weight = this.calculateWeight(shipment);

      totalWeight += weight;

      const shipmentPrice = await this.calculateShipment(weight);

      console.log("📦 [SHIPMENT]", {
        supplier: parseSourceType(shipment?.[0]?.source_type),
        weight,
        price: shipmentPrice,
      });

      totalShipping += shipmentPrice;
    }

    const finalShipping = Math.ceil(totalShipping);

    console.log("✅ [FINAL RESULT]", {
      postcode,
      totalWeight,
      finalShipping,
    });

    return finalShipping;
  }

  groupBySource(items: ShippingItem[]): ShippingItem[][] {
    const groups: Record<string, ShippingItem[]> = {};

    items.forEach((item) => {
      const key = parseSourceType(item.source_type);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
    });

    return Object.values(groups);
  }

  calculateWeight(items: ShippingItem[]): number {
    return items.reduce((sum, item) => {
      const weightVal = Number(item.weight);

      const finalWeight =
        item.weight != null &&
        !isNaN(weightVal) &&
        weightVal > 0
          ? weightVal
          : this.getDefaultWeight(item);

      console.log("⚖️ [WEIGHT]", {
        originalWeight: item.weight,
        productType: item.product_type,
        finalWeight,
      });

      return sum + finalWeight;
    }, 0);
  }

  getDefaultWeight(item: ShippingItem): number {
    switch (item.product_type) {
      case "Servers":
        return 20;

      default:
        return 2;
    }
  }

  async calculateShipment(totalWeight: number): Promise<number> {
    let remainingWeight = totalWeight;
    let totalPrice = 0;

    while (remainingWeight > 0) {
      const parcelWeight = Math.min(
        remainingWeight,
        this.MAX_PARCEL_WEIGHT,
      );

      const parcelPrice = await this.getRate(parcelWeight);

      console.log("📦 [PARCEL]", {
        parcelWeight,
        parcelPrice,
      });

      totalPrice += parcelPrice;

      remainingWeight -= parcelWeight;
    }

    return totalPrice;
  }

  async getRate(weight: number): Promise<number> {
    const weightNum = Number(weight);

    console.log("📍 [GERMANY RATE LOOKUP]", weightNum);

    try {
      const rules = await prisma.shipping_rules_DE.findMany({
        orderBy: [{ min_weight: "asc" }],
      });

      const match = rules.find((rule) => {
        const min = Number(rule.min_weight ?? 0);
        const max = Number(rule.max_weight ?? 0);

        return (
          weightNum >= min &&
          weightNum < max
        );
      });

      if (match) {
        const price = Number(match.price ?? 0);

        console.log("✅ [MATCH]", {
          weight: weightNum,
          price,
        });

        return price;
      }

      const lastRule = rules[rules.length - 1];

      const fallbackPrice = Number(lastRule?.price ?? 0);

      console.log("⚠️ [FALLBACK]", {
        weight: weightNum,
        fallbackPrice,
      });

      return fallbackPrice;
    } catch (error) {
      console.log("❌ [RATE ERROR]", error);

      return 0;
    }
  }
}