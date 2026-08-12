"use client";

import { useActionState } from "react";
import { createTrip, updateTrip } from "@/lib/actions";
import { FieldRow, FormError, SubmitButton, TextAreaField, TextField } from "@/components/ui";
import { RouteFields } from "@/views/listings/components";
import { LISTING_COPY } from "@/constant/listings";
import type { Trip } from "@/types";

export function TripForm({ trip }: { trip?: Trip }) {
  const isEdit = trip !== undefined;
  const [state, action, pending] = useActionState(isEdit ? updateTrip : createTrip, undefined);
  const values = state?.values;
  const errors = state?.fieldErrors;

  return (
    <form action={action} className="flex flex-col gap-4">
      {isEdit ? <input type="hidden" name="id" value={trip.id} /> : null}

      <FormError message={state?.error} />

      <RouteFields
        from={values?.from_city ?? trip?.from_city ?? ""}
        to={values?.to_city ?? trip?.to_city ?? ""}
        fromError={errors?.from_city}
        toError={errors?.to_city}
      />

      <TextField
        label="Аялах огноо"
        name="travel_date"
        type="date"
        defaultValue={values?.travel_date ?? trip?.travel_date}
        error={errors?.travel_date}
        required
      />

      <FieldRow>
        <TextField
          label="Авах боломжтой жин (кг)"
          name="available_kg"
          type="number"
          min="0.5"
          max="500"
          step="0.5"
          defaultValue={values?.available_kg ?? (trip ? String(trip.available_kg) : "")}
          placeholder="10"
          error={errors?.available_kg}
          required
        />
        <TextField
          label="1 кг-ийн үнэ (€)"
          name="price_per_kg"
          type="number"
          min="1"
          max="1000"
          step="0.5"
          defaultValue={values?.price_per_kg ?? (trip ? String(trip.price_per_kg) : "")}
          placeholder="12"
          error={errors?.price_per_kg}
          required
        />
      </FieldRow>

      <TextAreaField
        label="Нэмэлт тайлбар"
        optional
        name="notes"
        rows={3}
        maxLength={2000}
        defaultValue={values?.notes ?? trip?.notes ?? ""}
        placeholder="Жишээ нь: Зөвхөн хуурай хүнс, бичиг баримт авна. Шөнийн нислэг..."
        error={errors?.notes}
      />

      <SubmitButton pending={pending}>
        {isEdit ? "Хадгалах" : LISTING_COPY.trip.submitLabel}
      </SubmitButton>
    </form>
  );
}
