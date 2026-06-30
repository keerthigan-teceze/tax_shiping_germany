import prisma from "../db.server";

interface ShippingItem {
  weight?: number | null;
  source_type?: string | null;
  product_type?: string | null;
}

const SHIPPING_EDGE_CASES = {
  MAX_PARCEL_WEIGHT: 31.5,

  HEAVY_ITEM_RATES: [
    {
      minWeight: 31.5,
      maxWeight: 50,
      price: 49.99,
    },
    {
      minWeight: 50,
      maxWeight: 100,
      price: 89.99,
    },
    {
      minWeight: 100,
      maxWeight: 9999,
      price: 149.99,
    },
  ],
};


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
    let shipmentPrice = 0;
    let shipmentWeight = 0;

    const normalItems: ShippingItem[] = [];

    for (const item of shipment) {
      const itemWeight =
        item.weight != null &&
        Number(item.weight) > 0
          ? Number(item.weight)
          : this.getDefaultWeight(item);

      shipmentWeight += itemWeight;

      if (this.isHeavySingleItem(item)) {
        const heavyPrice =
          this.getHeavyItemRate(itemWeight);

        console.log("🚚 [HEAVY ITEM]", {
          itemWeight,
          heavyPrice,
        });

        shipmentPrice += heavyPrice;
      } else {
        normalItems.push(item);
      }
    }

    if (normalItems.length > 0) {
      shipmentPrice += await this.calculatePackedShipment(
        normalItems,
      );
    }

    totalWeight += shipmentWeight;

    console.log("📦 [SHIPMENT]", {
      supplier: parseSourceType(
        shipment?.[0]?.source_type,
      ),
      weight: shipmentWeight,
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

  isHeavySingleItem(item: ShippingItem): boolean {
  const weight =
    item.weight != null
      ? Number(item.weight)
      : this.getDefaultWeight(item);

  return weight > SHIPPING_EDGE_CASES.MAX_PARCEL_WEIGHT;
}

getHeavyItemRate(weight: number): number {
  const match =
    SHIPPING_EDGE_CASES.HEAVY_ITEM_RATES.find(
      (rate) =>
        weight >= rate.minWeight &&
        weight < rate.maxWeight,
    );

  return match?.price ?? 149.99;
}

async calculatePackedShipment(
  items: ShippingItem[],
): Promise<number> {
  const parcels: number[] = [];

  for (const item of items) {
    const weight =
      item.weight != null &&
      Number(item.weight) > 0
        ? Number(item.weight)
        : this.getDefaultWeight(item);

    let packed = false;

    for (let i = 0; i < parcels.length; i++) {
      if (
        parcels[i] + weight <=
        SHIPPING_EDGE_CASES.MAX_PARCEL_WEIGHT
      ) {
        parcels[i] += weight;
        packed = true;
        break;
      }
    }

    if (!packed) {
      parcels.push(weight);
    }
  }

  let totalPrice = 0;

  for (const parcelWeight of parcels) {
    const parcelPrice =
      await this.getRate(parcelWeight);

    console.log("📦 [PACKED PARCEL]", {
      parcelWeight,
      parcelPrice,
    });

    totalPrice += parcelPrice;
  }

  return totalPrice;
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
        orderBy: [{ Min_Weight: "asc" }],
      });

      const match = rules.find((rule) => {
        const min = Number(rule.Min_Weight ?? 0);
        const max = Number(rule.Max_Weight ?? 0);

      return (
        weightNum >= min &&
        (
          weightNum < max ||
          (
            max === 31.5 &&
            weightNum === 31.5
          )
        )
      );
      });

      if (match) {
        const Price = Number(match.Price ?? 0);

        console.log("✅ [MATCH]", {
          weight: weightNum,
          Price,
        });

        return Price;
      }

      const lastRule = rules[rules.length - 1];

      const fallbackPrice = Number(lastRule?.Price ?? 0);

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