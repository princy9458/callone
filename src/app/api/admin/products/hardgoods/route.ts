import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/db/connection";
import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ImportIssue = {
    rowIndex: number;
    sku: string;
    reason: string;
};

function toText(value: unknown): string {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function toNumber(value: unknown): number | undefined {
    const text = toText(value);
    if (!text) return undefined;
    const numeric = Number(text.replace(/,/g, ""));
    return Number.isNaN(numeric) ? undefined : numeric;
}

function normalizeItem(item: any) {
    const brandId = toText(item.brandId || item.brand);
    const attributeSetId = toText(item.attributeSetId);
    const sku = toText(item.sku);

    if (!brandId || !mongoose.isValidObjectId(brandId)) {
        return { error: "Invalid or missing brandId" };
    }
    if (!attributeSetId || !mongoose.isValidObjectId(attributeSetId)) {
        return { error: "Invalid or missing attributeSetId" };
    }
    if (!sku) {
        return { error: "Missing sku" };
    }

    const rest = { ...item };
    delete rest.brandId;
    delete rest.brand;
    delete rest.attributeSetId;
    delete rest.createdAt;
    delete rest.updatedAt;

    return {
        product: {
            ...rest,
            brandId: new mongoose.Types.ObjectId(brandId),
            attributeSetId,
            // numeric coercions
            stock_88: toNumber(item.stock_88) ?? item.stock_88,
            gst: toNumber(item.gst) ?? item.gst,
            mrp: toNumber(item.mrp) ?? item.mrp,
            updatedAt: new Date(),
        },
    };
}

// ---------------------------------------------------------------------------
// GET  /api/admin/products/hardgoods
// Query params: sku, brandId, page, limit
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
    try {
        await dbConnect();
        const collection = mongoose.connection.db!.collection("product_hardgoods");

        const { searchParams } = new URL(request.url);
        const query: Record<string, unknown> = {};

        if (searchParams.has("sku")) {
            query.sku = searchParams.get("sku");
        }
        if (searchParams.has("brandId") && mongoose.isValidObjectId(searchParams.get("brandId")!)) {
            query.brandId = new mongoose.Types.ObjectId(searchParams.get("brandId")!);
        }

        const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
        const limit = Math.min(5000, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)));
        const skip  = (page - 1) * limit;

        const [products, total] = await Promise.all([
            collection.find(query).sort({ primary_image_url: -1, createdAt: -1 }).skip(skip).limit(limit).toArray(),
            collection.countDocuments(query),
        ]);

        return NextResponse.json({
            data: products,
            total,
            page,
            limit,
            success: true,
        });
    } catch (error: any) {
        console.error("[hardgoods] GET error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch HardGood products", success: false },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// POST  /api/admin/products/hardgoods
// Body: HardGoodType[]  — bulk upsert by sku
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const collection = mongoose.connection.db!.collection("product_hardgoods");
        const body = await request.json();

        const rows: any[] = Array.isArray(body) ? body : [body];
        const issues: ImportIssue[] = [];
        const validProducts: any[] = [];

        // Validate / normalize
        for (let i = 0; i < rows.length; i++) {
            const normalized = normalizeItem(rows[i]);
            if ("error" in normalized) {
                issues.push({ rowIndex: i, sku: toText(rows[i].sku), reason: normalized.error! });
            } else {
                validProducts.push({ rowIndex: i, product: normalized.product });
            }
        }

        let insertedCount = 0;
        let updatedCount  = 0;
        const upsertedProducts: any[] = [];

        for (const { rowIndex, product } of validProducts) {
            const sku = toText(product.sku);
            if (!sku) {
                issues.push({ rowIndex, sku: "", reason: "Missing sku — cannot upsert without a unique key" });
                continue;
            }

            try {
                const result = await collection.updateOne(
                    { sku },
                    {
                        $set: { ...product, updatedAt: new Date() },
                        $setOnInsert: { createdAt: new Date() },
                    },
                    { upsert: true }
                );

                if (result.upsertedCount > 0) {
                    insertedCount += 1;
                    upsertedProducts.push({ _id: result.upsertedId, ...product });
                } else {
                    updatedCount += 1;
                    upsertedProducts.push({ ...product });
                }
            } catch (err: any) {
                issues.push({ rowIndex, sku, reason: err?.message || "Upsert failed" });
            }
        }

        const savedCount = insertedCount + updatedCount;
        return NextResponse.json(
            {
                data: upsertedProducts,
                count: upsertedProducts.length,
                success: savedCount > 0,
                summary: {
                    totalRows: rows.length,
                    insertedCount,
                    updatedCount,
                    failedCount: issues.length,
                    savedCount,
                    rowErrors: issues,
                },
            },
            { status: savedCount > 0 ? 201 : 200 }
        );
    } catch (error: any) {
        console.error("[hardgoods] POST error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to upsert HardGood products", success: false },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// PUT  /api/admin/products/hardgoods
// Body: Partial<HardGoodType>[]  or a single object (must include sku)
// ---------------------------------------------------------------------------
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const collection = mongoose.connection.db!.collection("product_hardgoods");
        const body = await request.json();
        const rows: any[] = Array.isArray(body) ? body : [body];

        const issues: ImportIssue[] = [];
        let updatedCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const normalized = normalizeItem(rows[i]);
            if ("error" in normalized) {
                issues.push({ rowIndex: i, sku: toText(rows[i].sku), reason: normalized.error! });
                continue;
            }

            const sku = toText(normalized.product.sku);
            try {
                const result = await collection.updateOne(
                    { sku },
                    { $set: { ...normalized.product, updatedAt: new Date() } }
                );
                if (result.matchedCount === 0) {
                    issues.push({ rowIndex: i, sku, reason: "No product found with this sku" });
                } else {
                    updatedCount += 1;
                }
            } catch (err: any) {
                issues.push({ rowIndex: i, sku, reason: err?.message || "Update failed" });
            }
        }

        return NextResponse.json({
            success: updatedCount > 0,
            summary: {
                totalRows: rows.length,
                updatedCount,
                failedCount: issues.length,
                rowErrors: issues,
            },
        });
    } catch (error: any) {
        console.error("[hardgoods] PUT error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update HardGood products", success: false },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// DELETE  /api/admin/products/hardgoods
// Body: string[]  (array of skus)  or  { sku: string }
// ---------------------------------------------------------------------------
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const collection = mongoose.connection.db!.collection("product_hardgoods");
        const body = await request.json();

        let skus: string[] = [];
        if (Array.isArray(body)) {
            skus = body.map((b: any) => (typeof b === "string" ? b : toText(b.sku))).filter(Boolean);
        } else if (body?.sku) {
            skus = [toText(body.sku)];
        }

        if (!skus.length) {
            return NextResponse.json(
                { error: "No valid sku(s) provided for deletion", success: false },
                { status: 400 }
            );
        }

        const result = await collection.deleteMany({ sku: { $in: skus } });

        return NextResponse.json({
            data: { deletedCount: result.deletedCount },
            success: result.deletedCount > 0,
        });
    } catch (error: any) {
        console.error("[hardgoods] DELETE error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete HardGood products", success: false },
            { status: 500 }
        );
    }
}
