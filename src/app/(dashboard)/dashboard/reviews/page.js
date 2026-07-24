import { Star } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import DeleteReviewButton from "@/components/admin/DeleteReviewButton";
import PageHeader from "@/components/admin/ui/PageHeader";
import { deleteReview } from "./actions";

// Adapted from hardvanta/src/app/admin/reviews/page.js — searchParams is
// a Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/reviews -> /dashboard/reviews.
export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews — Admin" };

const PAGE_SIZE = 20;

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { name: true, email: true } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.review.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="Reviews" description={`${total} total reviews`} />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Product</th>
                <th className="admin-th">Customer</th>
                <th className="admin-th">Rating</th>
                <th className="admin-th">Comment</th>
                <th className="admin-th">Date</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <Star size={32} className="mx-auto mb-2 text-slate-300" />
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="admin-row-hover">
                    <td className="admin-td font-semibold text-slate-900">
                      {review.product?.name || "—"}
                    </td>
                    <td className="admin-td text-slate-500">
                      {review.user?.name || review.user?.email || "—"}
                    </td>
                    <td className="admin-td">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="admin-td max-w-xs text-slate-500">
                      <p className="line-clamp-2">{review.comment || "—"}</p>
                    </td>
                    <td className="admin-td text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="admin-td">
                      <div className="flex justify-end">
                        <DeleteReviewButton id={review.id} onDelete={deleteReview} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/reviews" />
    </div>
  );
}
