import BulkEnquiryListPage from "@/components/admin/BulkEnquiryListPage";

// Adapted from hardvanta/src/app/admin/enquiries/b2b/page.js —
// basePath remapped /admin/enquiries/b2b -> /dashboard/enquiries/b2b.
export const dynamic = "force-dynamic";
export const metadata = { title: "B2B / Bulk Orders — Admin" };

export default function AdminB2BBulkOrdersPage({ searchParams }) {
  return (
    <BulkEnquiryListPage
      searchParams={searchParams}
      title="B2B / Bulk Orders"
      description="Submissions from the Hardvanta B2B page and its Bulk Orders form"
      basePath="/dashboard/enquiries/b2b"
      enquiryTypeFilter={{ enquiryType: "B2B / Bulk" }}
      exportType="b2b"
    />
  );
}
