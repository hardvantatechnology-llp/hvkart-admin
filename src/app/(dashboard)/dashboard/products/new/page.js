import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Add Product</h1>
      <ProductForm />
    </div>
  );
}
