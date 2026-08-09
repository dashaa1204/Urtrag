"use client";

import { useActionState } from "react";
import { createShipment, updateShipment } from "@/lib/actions";
import { FieldRow, FormError, SubmitButton, TextAreaField, TextField } from "@/components/ui";
import { CityFields, DirectionField } from "@/views/listings/components";
import { LISTING_COPY } from "@/constant/listings";
import type { Shipment } from "@/types";

export function ShipmentForm({ shipment }: { shipment?: Shipment }) {
  const isEdit = shipment !== undefined;
  const [state, action, pending] = useActionState(isEdit ? updateShipment : createShipment, undefined);
  const values = state?.values;
  const errors = state?.fieldErrors;

  return (
    <form action={action} className="flex flex-col gap-4">
      {isEdit ? <input type="hidden" name="id" value={shipment.id} /> : null}

      <FormError message={state?.error} />

      <DirectionField
        defaultValue={values?.direction ?? shipment?.direction ?? "at-mn"}
        error={errors?.direction}
      />

      <CityFields
        from={values?.from_city ?? shipment?.from_city ?? ""}
        to={values?.to_city ?? shipment?.to_city ?? ""}
      />

      <TextField
        label="Ачааны жин (кг)"
        name="weight_kg"
        type="number"
        min="0.1"
        max="500"
        step="0.1"
        defaultValue={values?.weight_kg ?? (shipment ? String(shipment.weight_kg) : "")}
        placeholder="5"
        error={errors?.weight_kg}
        required
      />

      <TextAreaField
        label="Ачааны тайлбар"
        name="description"
        rows={3}
        maxLength={2000}
        defaultValue={values?.description ?? shipment?.description ?? ""}
        placeholder="Юу илгээх гэж байгаагаа бичнэ үү. Жишээ нь: хувцас, эм, бичиг баримт..."
        error={errors?.description}
        required
      />

      <FieldRow>
        <TextField
          label="Бэлэн болох огноо"
          optional
          name="ready_date"
          type="date"
          defaultValue={values?.ready_date ?? shipment?.ready_date ?? ""}
          error={errors?.ready_date}
        />
        <TextField
          label="Хүргэх эцсийн огноо"
          optional
          name="deadline_date"
          type="date"
          defaultValue={values?.deadline_date ?? shipment?.deadline_date ?? ""}
          error={errors?.deadline_date}
        />
      </FieldRow>

      <TextField
        label="Санал болгох үнэ (€/кг)"
        optional
        name="offer_price"
        type="number"
        min="1"
        max="1000"
        step="0.5"
        defaultValue={values?.offer_price ?? (shipment?.offer_price ? String(shipment.offer_price) : "")}
        placeholder="12"
        error={errors?.offer_price}
      />

      <SubmitButton pending={pending}>
        {isEdit ? "Хадгалах" : LISTING_COPY.shipment.submitLabel}
      </SubmitButton>
    </form>
  );
}
