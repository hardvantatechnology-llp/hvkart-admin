import ProductForm from "@/components/admin/ProductForm";
import PageHeader from "@/components/admin/ui/PageHeader";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="Add Product" />
      <ProductForm />
    </div>
  );
}
