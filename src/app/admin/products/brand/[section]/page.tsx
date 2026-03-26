import {notFound} from "next/navigation";
import {ProductCatalogWorkspace} from "@/components/admin/ProductCatalogWorkspace";
import {getCatalogSection} from "@/lib/admin/catalog-sections";
import {loadCatalogRecords} from "@/lib/admin/load-catalog-records";

export const dynamic = "force-dynamic";

export default async function ProductSectionPage({
  params,
}: {
  params: {section: string};
}) {
  const section = getCatalogSection(params.section);

  if (!section) {
    notFound();
  }

  const {catalog} = await loadCatalogRecords();


  const products = catalog.filter((product) => section.brandCodes.includes(product.brand.code));

  return (
    <ProductCatalogWorkspace
      products={products}
      title={section.label}
      description={section.description}
      badgeLabel="Products"
    />
  );
}
