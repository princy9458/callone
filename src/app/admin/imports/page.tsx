import dbConnect from "@/lib/db/connection";
import {SheetDataset} from "@/lib/db/models/SheetDataset";
import {toPlainObject} from "@/lib/utils/serialization";
import {CallCheckWorkspace} from "@/components/call-check";
import {SectionCard} from "@/components/admin/SectionCard";
import {loadRawBrandCatalogSourceSummaries} from "@/lib/admin/raw-brand-catalog";
import Link from "next/link";
import GetAllProducts from "@/components/products/GetAllProducts";

export const dynamic = "force-dynamic";

type CallCheckPageProps = {
  searchParams?: {
    sheet?: string;
  };
};

export default async function CallCheckPage({searchParams}: CallCheckPageProps) {
  await dbConnect();

  const [datasetsRaw, rawSources] = await Promise.all([
    SheetDataset.find({type: "generic"}).sort({createdAt: -1}).lean(),
    loadRawBrandCatalogSourceSummaries(),
  ]);
  const datasets = toPlainObject(datasetsRaw).map((dataset) => ({
    id: dataset._id.toString(),
    name: dataset.name,
    slug: dataset.slug,
    type: "generic" as const,
    sourceFileName: dataset.sourceFileName,
    description: dataset.description,
    columns: dataset.columns,
    rowCount: dataset.rowCount,
    createdAt: dataset.createdAt ? new Date(dataset.createdAt).toISOString() : new Date(0).toISOString(),
  }));


  return (
    <>
    <GetAllProducts/>
    <div className="space-y-8">
      <SectionCard
        title="Brand catalog intake blueprint"
        description="Use one shared catalog contract in code while keeping the four brand source collections separate until write imports are introduced."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {rawSources.map((source) => (
            <article
              key={source.collectionName}
              className="rounded-[24px] border border-border/70 bg-background/70 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{source.brandLabel}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-foreground/45">
                    {source.collectionName}
                  </p>
                </div>
                <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-semibold text-foreground/70">
                  {source.hasCollection ? `${source.rowCount} rows` : "Collection missing"}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm text-foreground/68">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                    Grouping rule
                  </dt>
                  <dd className="mt-1">{source.groupingRule}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                    Variant axes
                  </dt>
                  <dd className="mt-1">{source.variantAxes.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                    Product attributes
                  </dt>
                  <dd className="mt-1">{source.productAttributes.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                    Warehouse columns
                  </dt>
                  <dd className="mt-1">{source.warehouseColumns.join(" / ")}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                    Import cadence
                  </dt>
                  <dd className="mt-1">{source.importCadence}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                    Media mode
                  </dt>
                  <dd className="mt-1">{source.mediaMode}</dd>
                </div>
              </dl>

              <div className="mt-4 rounded-[20px] border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-100/80">
                {source.caution}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/products/brand/${source.sectionSlug}`}
                  className="rounded-2xl border border-border/70 bg-background px-3 py-2 text-xs font-semibold text-foreground/72"
                >
                  Open catalog view
                </Link>
                <Link
                  href="/admin/imports"
                  className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
                >
                  Stay in imports
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-primary/20 bg-primary/8 px-5 py-4 text-sm text-foreground/72">
          Warehouse-brand policy changes are not writable yet by design. The next safe step is to add an admin
          settings layer with warnings, because changing allowed warehouses or default stock routing will affect
          import validation, catalog availability, and order assignment behavior.
        </div>
      </SectionCard>

      <CallCheckWorkspace initialDatasets={datasets} initialDatasetSlug={searchParams?.sheet ?? null} />
    </div>
    </>
  );
}
