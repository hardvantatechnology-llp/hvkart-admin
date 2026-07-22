import { Store, Package, IndianRupee, Boxes } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminStatCard from "@/components/admin/AdminStatCard";

// Adapted from hardvanta/src/app/admin/sellers/page.js — searchParams is
// a Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/sellers -> /dashboard/sellers.
export const dynamic = "force-dynamic";
export const metadata = { title: "Sellers — Admin" };

const PAGE_SIZE = 20;

export default async function SellersPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);

  // Sellers = brands with their product counts and revenue.
  // Paginate the brand list, and compute revenue/units-sold with DB-side
  // aggregation scoped only to the brands shown on this page, instead of
  // loading every brand's full product + order-item history into memory.
  const [brands, totalBrands, totalProductCount] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.brand.count(),
    prisma.product.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalBrands / PAGE_SIZE));

  const brandIds = brands.map((b) => b.id);
  const productLinks = brandIds.length
    ? await prisma.product.findMany({
        where: { brandId: { in: brandIds } },
        select: { id: true, brandId: true },
      })
    : [];
  const productToBrand = new Map(productLinks.map((p) => [p.id, p.brandId]));
  const productIds = productLinks.map((p) => p.id);

  // Only the order items for products belonging to the brands on this page —
  // bounded by pagination rather than the whole store's order history.
  const orderItems = productIds.length
    ? await prisma.orderItem.findMany({
        where: { productId: { in: productIds } },
        select: { productId: true, price: true, quantity: true },
      })
    : [];

  const totalsByBrand = new Map();
  for (const oi of orderItems) {
    const brandId = productToBrand.get(oi.productId);
    if (!brandId) continue;
    const cur = totalsByBrand.get(brandId) || { totalSold: 0, totalRevenue: 0 };
    cur.totalSold += oi.quantity;
    cur.totalRevenue += oi.price * oi.quantity;
    totalsByBrand.set(brandId, cur);
  }

  const sellersData = brands.map((brand) => {
    const totals = totalsByBrand.get(brand.id) || { totalSold: 0, totalRevenue: 0 };
    return {
      ...brand,
      totalProducts: brand._count.products,
      totalSold: totals.totalSold,
      totalRevenue: totals.totalRevenue,
    };
  });

  const pageRevenue = sellersData.reduce((sum, s) => sum + s.totalRevenue, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Sellers</h1>
        <p className="text-sm text-white/40 mt-0.5">{totalBrands} total sellers/brands</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <AdminStatCard label="Total Sellers" value={totalBrands} icon={<Store size={17} />} glow="electric" />
        <AdminStatCard label="Total Products" value={totalProductCount} icon={<Boxes size={17} />} glow="purple" delay={0.05} />
        <AdminStatCard label="Revenue (this page)" value={formatPrice(pageRevenue)} icon={<IndianRupee size={17} />} glow="cyan" delay={0.1} />
      </div>

      {/* Sellers Table */}
      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Brand / Seller</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Units Sold</th>
                <th className="px-5 py-3">Revenue</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sellersData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-white/50">
                    <Store size={32} className="mx-auto mb-2 text-white/20" />
                    No sellers found
                  </td>
                </tr>
              ) : (
                sellersData.map((seller) => (
                  <tr key={seller.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5">
                          <Store size={16} className="text-electric-light" />
                        </div>
                        <div>
                          <p className="font-semibold text-white/90">{seller.name}</p>
                          <p className="text-xs text-white/40">{seller.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-white/50">
                        <Package size={13} /> {seller.totalProducts}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/50">{seller.totalSold} units</td>
                    <td className="px-5 py-3 font-bold text-white">{formatPrice(seller.totalRevenue)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        seller.active
                          ? "bg-cyan/10 text-cyan"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {seller.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/sellers" />
    </div>
  );
}
