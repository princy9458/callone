import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/db/connection";
import { Product } from "@/lib/db/models/Product";
import mongoose from "mongoose";
import { slugify } from "@/lib/utils/slugify";

type ImportIssue = {
    rowIndex: number;
    sku: string;
    reason: string;
};

function toText(value: unknown) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}

function toNumber(value: unknown) {
    const text = toText(value);
    if (!text) {
        return undefined;
    }

    const numeric = Number(text.replace(/,/g, ""));
    return Number.isNaN(numeric) ? undefined : numeric;
}

function buildMetadata(item: any) {
    return Object.fromEntries(
        Object.entries({
            sku: toText(item.sku),
            season: toText(item.season),
            style_code: toText(item.style_code),
            color: toText(item.color),
            color_code: toText(item.color_code),
            size: toText(item.size),
            size_type: toText(item.size_type),
            length: toText(item.length),
            gender: toText(item.gender),
            line: toText(item.line),
            family: toText(item.family),
            variation_sku: toText(item.variation_sku),
            stock_90: toText(item.stock_90),
            stock_88: toText(item.stock_88),
        }).filter(([, value]) => value)
    );
}

function normalizeImportProduct(item: any) {

    const brandId = toText(item.brandId || item.brand);
    const attributeSetId = toText(item.attributeSetId);


    if (!brandId || !mongoose.isValidObjectId(brandId)) {
        return { error: "Invalid brandId" };
    }

    if (!attributeSetId || !mongoose.isValidObjectId(attributeSetId)) {
        return { error: "Invalid or missing attributeSetId" };
    }

    return {
        product: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ...(({ brandId: _b, attributeSetId: _a, ...rest }) => rest)(item),
            brandId: new mongoose.Types.ObjectId(brandId),
            attributeSetId: new mongoose.Types.ObjectId(attributeSetId),
            updatedAt: new Date(),
            createdAt: new Date(),
        },
    };
}


export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const query: any = {};

        // Example: allow filtering by status or other fields
        if (searchParams.has("status")) {
            query.status = searchParams.get("status");
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ data: products, success: true });
    } catch (error: any) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch products", success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Handling bulk creation if body is an array of ProductExcelData
        if (Array.isArray(body)) {
            const issues: ImportIssue[] = [];
            const validProducts: any[] = [];

            // Normalize all rows first, collect validation errors
            for (let index = 0; index < body.length; index += 1) {
                const item = body[index];
                const normalized = normalizeImportProduct(item);
                if ("error" in normalized) {
                    issues.push({
                        rowIndex: index,
                        sku: item.sku,
                        reason: normalized.error || "Invalid import row",
                    });
                } else {
                    validProducts.push(normalized.product);
                }
            }

            let insertedCount = 0;
            let updatedCount = 0;
            const upsertedProducts: any[] = [];

            if (validProducts.length > 0) {
                // Use the native MongoDB collection for upsert operations
                const collection = mongoose.connection.db!.collection("products");

                for (let i = 0; i < validProducts.length; i++) {
                    const product = validProducts[i];
                    const baseSku = product.sku || "";

                    if (!baseSku) {
                        issues.push({
                            rowIndex: i,
                            sku: product.sku ?? "",
                            reason: "Missing baseSku — cannot upsert without a unique key",
                        });
                        continue;
                    }

                    try {
                        const result = await collection.updateOne(
                            { baseSku },
                            { $set: { ...product, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
                            { upsert: true }
                        );

                        if (result.upsertedCount > 0) {
                            insertedCount += 1;
                            upsertedProducts.push({ _id: result.upsertedId, ...product });
                        } else if (result.modifiedCount > 0) {
                            updatedCount += 1;
                            upsertedProducts.push({ ...product });
                        } else {
                            // Document existed but nothing changed (same data)
                            updatedCount += 1;
                            upsertedProducts.push({ ...product });
                        }
                    } catch (error: any) {
                        issues.push({
                            rowIndex: i,
                            sku: product.sku ?? "",
                            reason: error?.message || "Failed to upsert product",
                        });
                    }
                }
            }

            const savedCount = insertedCount + updatedCount;
            return NextResponse.json(
                {
                    data: upsertedProducts,
                    count: upsertedProducts.length,
                    success: savedCount > 0,
                    summary: {
                        totalRows: body.length,
                        insertedCount,
                        updatedCount,
                        failedCount: issues.length,
                        savedCount,
                        rowErrors: issues,
                    },
                },
                { status: savedCount > 0 ? 201 : 200 }
            );
        }

        // Single document fallback — insert directly into collection
        const collection = mongoose.connection.db!.collection("products");
        const result = await collection.insertOne({ ...body, createdAt: new Date(), updatedAt: new Date() });
        return NextResponse.json({ data: { _id: result.insertedId, ...body }, success: true }, { status: 201 });


    } catch (error: any) {
        console.error("Error creating products:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "A product with this baseSku or slug already exists", details: error.writeErrors, success: false },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: error.message || "Failed to create product(s)", success: false },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Handling bulk update from ProductExcelData arrays
        if (Array.isArray(body)) {
            let updatedCount = 0;
            const issues: ImportIssue[] = [];

            for (let index = 0; index < body.length; index += 1) {
                const item = body[index];
                const normalized = normalizeImportProduct(item);
                if ("error" in normalized) {
                    issues.push({
                        rowIndex: index,
                        sku: item.sku,
                        reason: normalized.error || "Invalid import row",
                    });
                    continue;
                }

                try {
                    const result = await Product.updateOne(
                        { baseSku: normalized.product.baseSku },
                        {
                            $set: {
                                name: normalized.product.name,
                                brandId: normalized.product.brandId,
                                category: normalized.product.category,
                                subcategory: normalized.product.subcategory,
                                description: normalized.product.description,
                                status: normalized.product.status,
                                taxRate: normalized.product.taxRate,
                                listPrice: normalized.product.listPrice,
                                media: normalized.product.media,
                                attributeSetId: normalized.product.attributeSetId,
                                metadata: normalized.product.metadata,
                                legacySource: normalized.product.legacySource,
                                updatedAt: new Date(),
                            },
                        }
                    );

                    if (result.matchedCount === 0) {
                        issues.push({
                            rowIndex: index,
                            sku: item.sku,
                            reason: "No existing product found for this baseSku",
                        });
                        continue;
                    }

                    updatedCount += 1;
                } catch (error: any) {
                    issues.push({
                        rowIndex: index,
                        sku: item.sku,
                        reason: error?.message || "Failed to update product",
                    });
                }
            }

            return NextResponse.json({
                data: {
                    matched: updatedCount,
                },
                success: updatedCount > 0,
                summary: {
                    totalRows: body.length,
                    insertedCount: 0,
                    updatedCount,
                    failedCount: issues.length,
                    savedCount: updatedCount,
                    rowErrors: issues,
                },
            });
        }

        // Handling single update
        if (body.baseSku || body._id) {
            const filter = body._id ? { _id: body._id } : { baseSku: body.baseSku };
            const updatedProduct = await Product.findOneAndUpdate(filter, body, { returnDocument: "after" });
            return NextResponse.json({ data: updatedProduct, success: true });
        }

        return NextResponse.json(
            { error: "Invalid payload for update, missing properties.", success: false },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("Error updating products:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update product(s)", success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Handling bulk delete
        if (Array.isArray(body)) {
            // Allow accepting array of baseSkus directly or array of ProductExcelData-like objects
            const baseSkus = body.map((b: any) => (typeof b === "string" ? b : b.baseSku));
            const result = await Product.deleteMany({ baseSku: { $in: baseSkus } });
            return NextResponse.json({ data: result, success: true });
        } else if (body.baseSku || body._id) {
            // Single delete
            const filter = body._id ? { _id: body._id } : { baseSku: body.baseSku };
            const result = await Product.deleteOne(filter);
            return NextResponse.json({ data: result, success: true });
        }

        return NextResponse.json(
            { error: "Invalid payload for delete.", success: false },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("Error deleting products:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete product(s)", success: false },
            { status: 500 }
        );
    }
}
