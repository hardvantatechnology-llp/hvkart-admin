import BulkEnquiryListPage from "@/components/admin/BulkEnquiryListPage";

// Adapted from hardvanta/src/app/admin/enquiries/b2b/page.js —
// basePath remapped /admin/enquiries/b2b -> /dashboard/enquiries/b2b.
// searchParams is a Promise in Next.js 16, so it must be awaited here before
// being passed to BulkEnquiryListPage, which reads its properties synchronously.
export const dynamic = "force-dynamic";
export const metadata = { title: "B2B / Bulk Orders — Admin" };

export default async function AdminB2BBulkOrdersPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
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
