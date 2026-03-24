import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";

export default function ImportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Imports" description="Import job foundation for legacy SQL, CSV/XLSX catalog files, blocked stock, and user onboarding." />
      <SectionCard title="Current scope" description="This first pass establishes the route and the migration architecture. SQL migration is script-based; UI-driven imports are next.">
        <ul className="space-y-3 text-sm text-foreground/65">
          <li>Legacy SQL migration will populate brands, users, products, blocked stock, and order snapshots.</li>
          <li>CSV/XLSX upload flows are the next UI layer after the migration script is stabilized.</li>
          <li>Exports are handled separately through API routes so files can be downloaded without blocking admin pages.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
