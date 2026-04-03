import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/db/connection";
import { SheetDataset } from "@/lib/db/models/SheetDataset";
import { SheetRow } from "@/lib/db/models/SheetRow";
import { slugify } from "@/lib/utils/slugify";

type SheetPayload = {
  name?: string;
  description?: string;
  sourceFileName?: string;
  columns?: string[];
  rows?: Record<string, unknown>[];
};

async function ensureUniqueSlug(baseSlug: string) {
  const slug = baseSlug || "call-check-sheet";
  const existing = await SheetDataset.find({ slug: new RegExp(`^${slug}(-\\d+)?$`, "i") })
    .select("slug")
    .lean();

  if (!existing.length) {
    return slug;
  }

  const reserved = new Set(existing.map((item) => item.slug));
  let counter = 2;
  while (reserved.has(`${slug}-${counter}`)) {
    counter += 1;
  }
  return `${slug}-${counter}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const datasets = await SheetDataset.find({ type: "generic" }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    datasets: datasets.map((dataset) => ({
      id: dataset._id.toString(),
      name: dataset.name,
      slug: dataset.slug,
      type: "generic" as const,
      sourceFileName: dataset.sourceFileName,
      description: dataset.description,
      columns: dataset.columns,
      rowCount: dataset.rowCount,
      uniqueValues: dataset.uniqueValues,
      createdAt: dataset.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = (await request.json()) as SheetPayload;
  const rows = Array.isArray(body.rows) ? body.rows : [];

  if (!rows.length) {
    return NextResponse.json({ error: "At least one row is required." }, { status: 400 });
  }

  const datasetName =
    body.name?.trim() ||
    body.sourceFileName?.replace(/\.[^.]+$/, "").trim() ||
    `Call Check ${new Date().toISOString().slice(0, 10)}`;

  const columns =
    Array.isArray(body.columns) && body.columns.length
      ? body.columns
      : Array.from(
        rows.reduce((set, row) => {
          Object.keys(row).forEach((key) => set.add(key));
          return set;
        }, new Set<string>())
      );

  const slug = await ensureUniqueSlug(slugify(datasetName));

  const uniqueValues: Record<string, string[]> = {};
  columns.forEach((col) => {
    const values = new Set<string>();
    rows.forEach((row) => {
      const val = row[col];
      if (val !== null && val !== undefined && val !== "") {
        values.add(String(val).trim());
      }
    });
    if (values.size > 0) {
      uniqueValues[col] = Array.from(values).sort();
    }
  });

  const dataset = await SheetDataset.create({
    name: datasetName,
    slug,
    type: "generic",
    sourceFileName: body.sourceFileName?.trim() ?? "",
    description: body.description?.trim() ?? "",
    columns,
    rowCount: rows.length,
    uniqueValues,
    summary: {
      matched: 0,
      partial: 0,
      unmatched: rows.length,
      issueCount: 0,
    },
  });

  const insertedRows = await SheetRow.insertMany(
    rows.map((row, index) => ({
      datasetId: dataset._id,
      rowIndex: index + 1,
      data: row,
      relation: {
        status: "unmatched",
        brandId: null,
        brandLabel: "",
        productId: null,
        productLabel: "",
        variantId: null,
        variantLabel: "",
        warehouseId: null,
        warehouseLabel: "",
        issues: [],
      },
    }))
  );

  return NextResponse.json({
    dataset: {
      id: dataset._id.toString(),
      name: dataset.name,
      slug: dataset.slug,
      type: "generic" as const,
      sourceFileName: dataset.sourceFileName,
      description: dataset.description,
      columns: dataset.columns,
      rowCount: dataset.rowCount,
      uniqueValues: dataset.uniqueValues,
      createdAt: dataset.createdAt,
    },
    rows: insertedRows.map((row) => ({
      _id: row._id.toString(),
      ...row.data,
    })),
  });
}
