import BlogForm from "@/components/admin/BlogForm";
import PageHeader from "@/components/admin/ui/PageHeader";

// Copied verbatim from hardvanta/src/app/admin/blogs/new/page.js.
export default function NewBlogPage() {
  return (
    <div>
      <PageHeader title="Add Blog" />
      <BlogForm />
    </div>
  );
}
