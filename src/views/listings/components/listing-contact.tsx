import Link from "next/link";
import type { SessionUser } from "@/types";
import type { ListingSummary } from "@/lib/listing";
import { MessageForm } from "@/components/ui";
import { OwnerActions } from "./owner-actions";

/**
 * Дэлгэрэнгүй хуудасны доод хайрцаг. Үзэгч хэн байхаас хамаарч
 * эзний удирдлага, мессежийн форм, эсвэл нэвтрэх урилга харуулна.
 */
export function ListingContact({
  listing,
  viewer,
}: {
  listing: ListingSummary;
  viewer: SessionUser | null;
}) {
  if (viewer?.id === listing.userId) {
    return <OwnerActions listing={listing} />;
  }

  if (listing.status === "closed") {
    return <p className="text-sm text-slate-500">Энэ зар хаагдсан байна.</p>;
  }

  if (!viewer) {
    return (
      <p className="text-sm text-slate-600">
        {listing.contactPrompt}{" "}
        <Link
          href={`/login?next=${listing.href}`}
          className="font-semibold text-indigo-600 hover:underline"
        >
          нэвтэрч орно уу
        </Link>
        .
      </p>
    );
  }

  return (
    <>
      <h2 className="mb-3 font-semibold text-slate-900">{listing.userName}-тай холбогдох</h2>
      <MessageForm
        listingType={listing.type}
        listingId={listing.id}
        placeholder={listing.contactPlaceholder}
      />
    </>
  );
}
