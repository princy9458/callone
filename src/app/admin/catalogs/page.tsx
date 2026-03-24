import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";

export default function CatalogsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Catalogs" description="Future download center for PDF catalogs, PPT exports, and generated brand decks." />
      <SectionCard title="Planned outputs" description="Generation jobs land after media stabilization and template mapping.">
        <ul className="space-y-3 text-sm text-foreground/65">
          <li>Brand-specific PDF price books and order summaries</li>
          <li>PPT-driven seasonal catalog exports with reusable layout templates</li>
          <li>Batch download center for generated files and audit history</li>
        </ul>
      </SectionCard>
    </div>
  );
}
