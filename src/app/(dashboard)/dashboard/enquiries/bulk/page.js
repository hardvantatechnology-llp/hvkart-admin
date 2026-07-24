import BulkEnquiryListPage from "@/components/admin/BulkEnquiryListPage";

// Adapted from hardvanta/src/app/admin/enquiries/bulk/page.js —
// basePath remapped /admin/enquiries/bulk -> /dashboard/enquiries/bulk.
// searchParams is a Promise in Next.js 16, so it must be awaited here before
// being passed to BulkEnquiryListPage, which reads its properties synchronously.
export const dynamic = "force-dynamic";
export const metadata = { title: "Bulk Enquiries — Admin" };

export default async function AdminBulkEnquiriesPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  return (
    <BulkEnquiryListPage
      searchParams={searchParams}
      title="Bulk Enquiries"
      description="Submissions from the standalone Bulk Enquiry page"
      basePath="/dashboard/enquiries/bulk"
      enquiryTypeFilter={{ NOT: { enquiryType: "B2B / Bulk" } }}
      exportType="bulk"
    />
  );
}
