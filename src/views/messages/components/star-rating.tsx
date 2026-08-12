"use client";

const STARS = [1, 2, 3, 4, 5];

/** Дарж сонгодог одны үнэлгээ. */
export function StarRating({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} од`}
          className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-2xl transition duration-150 ease-out hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 active:scale-95 sm:h-9 sm:w-9 ${
            star <= value ? "text-amber-500" : "text-ink/20 hover:text-amber-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
