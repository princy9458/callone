import mongoose from "mongoose";
import type {ProductCatalogRecord} from "@/components/products/ProductType";
import dbConnect from "@/lib/db/connection";

type RawCatalogConfig = {
  sectionSlug: string;
  collectionName: string;
  brand: {
    id: string;
    code: string;
    name: string;
  };
  defaultProductType: string;
  buildGroupKey: (row: Record<string, unknown>) => string;
  buildBaseSku: (rows: Record<string, unknown>[]) => string;
  buildName: (rows: Record<string, unknown>[]) => string;
  buildCategory: (rows: Record<string, unknown>[]) => string;
  buildSubcategory: (rows: Record<string, unknown>[]) => string;
  variantGroups: Array<{key: string; label: string; field: string}>;
  extraAttributeGroups: Array<{key: string; label: string; field: string}>;
  stockFields: string[];
};

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const numeric = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(numeric) ? numeric : 0;
  }

  return 0;
}

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalValue(value: unknown) {
  return cleanText(value).toUpperCase();
}

function isMeaningfulValue(value: unknown) {
  const canonical = canonicalValue(value);
  return Boolean(canonical && canonical !== "NA" && canonical !== "N/A" && canonical !== "NULL" && canonical !== "0");
}

function labelCase(value: string) {
  if (!value) {
    return "";
  }

  return value
    .split(" ")
    .map((part) => {
      if (!part) {
        return part;
      }

      if (/\d/.test(part) || part === part.toUpperCase()) {
        return part;
      }

      return `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function selectDisplayValue(rows: Record<string, unknown>[], field: string) {
  const candidates = new Map<string, {display: string; count: number}>();

  for (const row of rows) {
    const raw = row[field];
    if (!isMeaningfulValue(raw)) {
      continue;
    }

    const canonical = canonicalValue(raw);
    const current = candidates.get(canonical) ?? {
      display: labelCase(cleanText(raw)),
      count: 0,
    };

    current.count += 1;
    candidates.set(canonical, current);
  }

  return Array.from(candidates.values())
    .sort((left, right) => right.count - left.count || left.display.localeCompare(right.display))
    .at(0)?.display ?? "";
}

function collectDisplayValues(rows: Record<string, unknown>[], field: string) {
  const values = new Map<string, string>();

  for (const row of rows) {
    const raw = row[field];
    if (!isMeaningfulValue(raw)) {
      continue;
    }

    const canonical = canonicalValue(raw);
    if (!values.has(canonical)) {
      values.set(canonical, labelCase(cleanText(raw)));
    }
  }

  return Array.from(values.values()).sort((left, right) => left.localeCompare(right));
}

function selectUpdatedAt(rows: Record<string, unknown>[]) {
  const timestamps = rows
    .map((row) => row.updatedAt ?? row.createdAt)
    .map((value) => new Date(String(value)).getTime())
    .filter((value) => Number.isFinite(value) && value > 0);

  return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : new Date(0).toISOString();
}

function buildVariantTitle(
  row: Record<string, unknown>,
  groups: Array<{key: string; label: string; field: string}>
) {
  const parts = groups
    .map((group) => {
      const value = row[group.field];
      return isMeaningfulValue(value) ? labelCase(cleanText(value)) : "";
    })
    .filter(Boolean);

  return parts.join(" / ") || cleanText(row.sku) || "Variant";
}

function sumAvailableStock(rows: Record<string, unknown>[], stockFields: string[]) {
  return rows.reduce(
    (total, row) =>
      total +
      stockFields.reduce((rowTotal, field) => rowTotal + Math.max(0, toNumber(row[field])), 0),
    0
  );
}

const RAW_CATALOG_CONFIGS: RawCatalogConfig[] = [
  {
    sectionSlug: "callaway-softgoods",
    collectionName: "product_softgoods",
    brand: {id: "brand:CG-APP", code: "CG-APP", name: "Callaway Softgoods"},
    defaultProductType: "softgoods",
    buildGroupKey: (row) => {
      const styleId = cleanText(row.style_id);
      const gender = labelCase(cleanText(row.gender)) || "General";
      return styleId ? `${styleId}__${gender}` : `SKU:${cleanText(row.sku)}`;
    },
    buildBaseSku: (rows) => cleanText(rows[0]?.style_id) || cleanText(rows[0]?.sku),
    buildName: (rows) => {
      const baseSku = cleanText(rows[0]?.style_id) || cleanText(rows[0]?.sku);
      const category = selectDisplayValue(rows, "category");
      return category ? `${baseSku} · ${category}` : baseSku || "Softgoods style";
    },
    buildCategory: (rows) => selectDisplayValue(rows, "category") || "Uncategorized",
    buildSubcategory: (rows) => selectDisplayValue(rows, "gender"),
    variantGroups: [
      {key: "color", label: "Color", field: "color"},
      {key: "size", label: "Size", field: "size"},
    ],
    extraAttributeGroups: [{key: "gender", label: "Gender", field: "gender"}],
    stockFields: ["stock_88", "stock_90"],
  },
  {
    sectionSlug: "callaway-hardgoods",
    collectionName: "product_hardgoods",
    brand: {id: "brand:CG-HW", code: "CG-HW", name: "Callaway Hardgoods"},
    defaultProductType: "hardgoods",
    buildGroupKey: (row) => `${cleanText(row.product_model)}__${labelCase(cleanText(row.product_type)) || "General"}`,
    buildBaseSku: (rows) => cleanText(rows[0]?.product_model) || cleanText(rows[0]?.sku),
    buildName: (rows) => cleanText(rows[0]?.product_model) || cleanText(rows[0]?.description) || "Hardgoods model",
    buildCategory: (rows) => selectDisplayValue(rows, "category") || "Equipment",
    buildSubcategory: (rows) => selectDisplayValue(rows, "product_type"),
    variantGroups: [{key: "orientation", label: "Orientation", field: "orientation"}],
    extraAttributeGroups: [{key: "product_type", label: "Product Type", field: "product_type"}],
    stockFields: ["stock_88"],
  },
  {
    sectionSlug: "ogio",
    collectionName: "product_ogio",
    brand: {id: "brand:OG", code: "OG", name: "Ogio"},
    defaultProductType: "accessory",
    buildGroupKey: (row) => cleanText(row.product_model) || `SKU:${cleanText(row.sku)}`,
    buildBaseSku: (rows) => cleanText(rows[0]?.product_model) || cleanText(rows[0]?.sku),
    buildName: (rows) => cleanText(rows[0]?.product_model) || cleanText(rows[0]?.description) || "Ogio style",
    buildCategory: (rows) => selectDisplayValue(rows, "category") || "Lifestyle",
    buildSubcategory: (rows) => selectDisplayValue(rows, "product_type"),
    variantGroups: [],
    extraAttributeGroups: [{key: "product_type", label: "Product Type", field: "product_type"}],
    stockFields: ["stock_90"],
  },
  {
    sectionSlug: "travis-mathew",
    collectionName: "product_travis",
    brand: {id: "brand:TM", code: "TM", name: "Travis Mathew"},
    defaultProductType: "softgoods",
    buildGroupKey: (row) => cleanText(row.style_code) || `SKU:${cleanText(row.sku)}`,
    buildBaseSku: (rows) => cleanText(rows[0]?.style_code) || cleanText(rows[0]?.sku),
    buildName: (rows) => {
      const baseSku = cleanText(rows[0]?.style_code) || cleanText(rows[0]?.sku);
      const category = selectDisplayValue(rows, "category");
      return category ? `${baseSku} · ${category}` : baseSku || "Travis style";
    },
    buildCategory: (rows) => selectDisplayValue(rows, "category") || "Uncategorized",
    buildSubcategory: (rows) => selectDisplayValue(rows, "gender"),
    variantGroups: [
      {key: "color", label: "Color", field: "color"},
      {key: "size", label: "Size", field: "size"},
    ],
    extraAttributeGroups: [
      {key: "gender", label: "Gender", field: "gender"},
      {key: "season", label: "Season", field: "season"},
      {key: "line", label: "Line", field: "line"},
    ],
    stockFields: ["stock_88", "stock_90"],
  },
];

async function loadCollectionRecords(config: RawCatalogConfig): Promise<ProductCatalogRecord[]> {
  const database = mongoose.connection.db;
  if (!database) {
    return [];
  }

  const rows = (await database.collection(config.collectionName).find({}).toArray()) as Array<Record<string, unknown>>;
   
  const groupedRows = new Map<string, Record<string, unknown>[]>();

  for (const row of rows) {
    const key = config.buildGroupKey(row);
    const existing = groupedRows.get(key) ?? [];
    existing.push(row);
    groupedRows.set(key, existing);
  }

  return Array.from(groupedRows.values()).map<ProductCatalogRecord>((group) => {
    const baseSku = config.buildBaseSku(group) || cleanText(group[0]?.sku) || "UNKNOWN";
    const variantGroups = config.variantGroups
      .map((groupConfig) => ({
        key: groupConfig.key,
        label: groupConfig.label,
        values: collectDisplayValues(group, groupConfig.field),
      }))
      .filter((groupConfig) => groupConfig.values.length > 0);
    const extraGroups = config.extraAttributeGroups
      .map((groupConfig) => ({
        key: groupConfig.key,
        label: groupConfig.label,
        values: collectDisplayValues(group, groupConfig.field),
      }))
      .filter((groupConfig) => groupConfig.values.length > 0);

    return {
      id: `${config.collectionName}:${baseSku}:${config.buildSubcategory(group) || "general"}`,
      name: config.buildName(group),
      slug: "",
      baseSku,
      brand: config.brand,
      category: config.buildCategory(group),
      subcategory: config.buildSubcategory(group),
      productType: config.defaultProductType,
      status: "active",
      availableStock: sumAvailableStock(group, config.stockFields),
      variantCount: group.length,
      variantSkus: group.map((row: Record<string, unknown>) => cleanText(row.sku)).filter(Boolean),
      variantTitles: group.map((row: Record<string, unknown>) => buildVariantTitle(row, config.variantGroups)),
      variants: group.map((row: Record<string, unknown>) => ({
        id: `${config.collectionName}:variant:${cleanText(row.sku)}`,
        sku: cleanText(row.sku),
        title: buildVariantTitle(row, config.variantGroups),
        optionValues: Object.fromEntries(
          config.variantGroups
            .map((groupConfig) => {
              const value = row[groupConfig.field];
              return isMeaningfulValue(value)
                ? [groupConfig.key, labelCase(cleanText(value))]
                : null;
            })
            .filter((entry): entry is [string, string] => Array.isArray(entry))
        ),
        availableStock: config.stockFields.reduce(
          (total, field) => total + Math.max(0, toNumber(row[field])),
          0
        ),
      })),
      attributeGroups: [...variantGroups, ...extraGroups],
      updatedAt: selectUpdatedAt(group),
      primary_url: (group[0]?.primary_url || group[0]?.primary_image_url) as string,
      sku: (group[0]?.sku) as string,
    };
  }).sort((a, b) => {
    const aHasImage = a.primary_url && a.primary_url.length > 0;
    const bHasImage = b.primary_url && b.primary_url.length > 0;
    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;
    return 0;
  });
}

export async function loadRawBrandCatalogRecords(sectionSlug: string) {
  const config = RAW_CATALOG_CONFIGS.find((item) => item.sectionSlug === sectionSlug);
  if (!config) {
    return null;
  }

  await dbConnect();

  const database = mongoose.connection.db;
  if (!database) {
    return null;
  }

  const collections = await database.listCollections({}, {nameOnly: true}).toArray();
  const exists = collections.some((collection) => collection.name === config.collectionName);

  if (!exists) {
    return null;
  }
  const products = await loadCollectionRecords(config);
  return {
    products,
    collectionName: config.collectionName,
    brandLabel: config.brand.name,
  };
}
