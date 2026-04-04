import {notFound} from "next/navigation";
import {getCatalogSection} from "@/lib/admin/catalog-sections";
import {loadCatalogRecords} from "@/lib/admin/load-catalog-records";
import {loadRawBrandCatalogRecords} from "@/lib/admin/load-raw-brand-catalog-records";
import {OgioCatalogWorkspace} from "@/components/products/Ogio/OgioCatalogWorkspace";
import {HardgoodCatalogWorkspace} from "@/components/products/callaway-hardgoods/HardgoodCatalogWorkspace";
import {SoftgoodCatalogWorkspace} from "@/components/products/callaway-softgoods/SoftgoodCatalogWorkspace";
import {TravisCatalogWorkspace} from "@/components/products/travismethew/TravisCatalogWorkspace";

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

  const rawCatalog = await loadRawBrandCatalogRecords(section.slug);
  if (rawCatalog?.products.length) {
    if (section.slug === "ogio") {
      return (
        <OgioCatalogWorkspace
          products={rawCatalog.products}
          mode="source_readonly"
          sourceCollectionName={rawCatalog.collectionName}
        />
      );
    }

    if (section.slug === "callaway-hardgoods") {
      return (
        <HardgoodCatalogWorkspace
          products={rawCatalog.products}
          mode="source_readonly"
          sourceCollectionName={rawCatalog.collectionName}
        />
      );
    }

    if (section.slug === "callaway-softgoods") {
      return (
        <SoftgoodCatalogWorkspace
          products={rawCatalog.products}
          mode="source_readonly"
          sourceCollectionName={rawCatalog.collectionName}
        />
      );
    }

    if (section.slug === "travis-mathew") {
      return (
        <TravisCatalogWorkspace
          products={rawCatalog.products}
          mode="source_readonly"
          sourceCollectionName={rawCatalog.collectionName}
        />
      );
    }
  }

  // const {catalog} = await loadCatalogRecords();
  // const products = catalog.filter((product) => section.brandCodes.includes(product?.brand?.code ?? ""));
  //  console.log("products", products.length);
  // if (section.slug === "ogio") {
  //   return <OgioCatalogWorkspace products={products}/>;
  // }

  // if (section.slug === "callaway-hardgoods") {
  //   return <HardgoodCatalogWorkspace products={products}/>;
  // }

  // if (section.slug === "callaway-softgoods") {
  //   return <SoftgoodCatalogWorkspace products={products}/>;
  // }

  // if (section.slug === "travis-mathew") {
  //   return <TravisCatalogWorkspace products={products}/>;
  // }

  // notFound();
}
