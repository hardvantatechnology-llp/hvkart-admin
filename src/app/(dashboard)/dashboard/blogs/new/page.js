import BlogForm from "@/components/admin/BlogForm";

// Copied verbatim from hardvanta/src/app/admin/blogs/new/page.js.
export default function NewBlogPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Add Blog</h1>
      <BlogForm />
    </div>
  );
}
