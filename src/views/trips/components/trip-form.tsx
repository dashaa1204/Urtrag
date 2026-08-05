"use client";

import { useActionState } from "react";
import { createTrip, updateTrip } from "@/lib/actions";
import { btnPrimary, FieldError, FormError, inputCls, labelCls } from "@/components/ui";
import { DIRECTIONS } from "@/constant/directions";
import type { Trip } from "@/types";

export function TripForm({ trip }: { trip?: Trip }) {
  const isEdit = trip !== undefined;
  const [state, action, pending] = useActionState(isEdit ? updateTrip : createTrip, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {isEdit ? <input type="hidden" name="id" value={trip.id} /> : null}

      <FormError message={state?.error} />

      <div>
        <label htmlFor="direction" className={labelCls}>
          Чиглэл
        </label>
        <select
          id="direction"
          name="direction"
          defaultValue={state?.values?.direction ?? trip?.direction ?? "at-mn"}
          className={inputCls}
        >
          <option value="at-mn">{DIRECTIONS["at-mn"].label}</option>
          <option value="mn-at">{DIRECTIONS["mn-at"].label}</option>
        </select>
        <FieldError message={state?.fieldErrors?.direction} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="from_city" className={labelCls}>
            Хаанаас <span className="font-normal text-slate-400">(заавал биш)</span>
          </label>
          <input
            id="from_city"
            name="from_city"
            defaultValue={state?.values?.from_city ?? trip?.from_city ?? ""}
            placeholder="Вена"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="to_city" className={labelCls}>
            Хаашаа <span className="font-normal text-slate-400">(заавал биш)</span>
          </label>
          <input
            id="to_city"
            name="to_city"
            defaultValue={state?.values?.to_city ?? trip?.to_city ?? ""}
            placeholder="Улаанбаатар"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="travel_date" className={labelCls}>
          Аялах огноо
        </label>
        <input
          id="travel_date"
          name="travel_date"
          type="date"
          defaultValue={state?.values?.travel_date ?? trip?.travel_date}
          className={inputCls}
          required
        />
        <FieldError message={state?.fieldErrors?.travel_date} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="available_kg" className={labelCls}>
            Авах боломжтой жин (кг)
          </label>
          <input
            id="available_kg"
            name="available_kg"
            type="number"
            min="0.5"
            max="500"
            step="0.5"
            defaultValue={state?.values?.available_kg ?? (trip ? String(trip.available_kg) : "")}
            placeholder="10"
            className={inputCls}
            required
          />
          <FieldError message={state?.fieldErrors?.available_kg} />
        </div>
        <div>
          <label htmlFor="price_per_kg" className={labelCls}>
            1 кг-ийн үнэ (€)
          </label>
          <input
            id="price_per_kg"
            name="price_per_kg"
            type="number"
            min="1"
            max="1000"
            step="0.5"
            defaultValue={state?.values?.price_per_kg ?? (trip ? String(trip.price_per_kg) : "")}
            placeholder="12"
            className={inputCls}
            required
          />
          <FieldError message={state?.fieldErrors?.price_per_kg} />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelCls}>
          Нэмэлт тайлбар <span className="font-normal text-slate-400">(заавал биш)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={2000}
          defaultValue={state?.values?.notes ?? trip?.notes ?? ""}
          placeholder="Жишээ нь: Зөвхөн хуурай хүнс, бичиг баримт авна. Шөнийн нислэг..."
          className={inputCls}
        />
        <FieldError message={state?.fieldErrors?.notes} />
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Хадгалж байна..." : isEdit ? "Хадгалах" : "Аялал зарлах"}
      </button>
    </form>
  );
}
