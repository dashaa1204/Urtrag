"use client";

import { useActionState } from "react";
import { createShipment, updateShipment } from "@/lib/actions";
import { btnPrimary, FieldError, FormError, inputCls, labelCls } from "@/components/ui";
import { DIRECTIONS } from "@/constant/directions";
import type { Shipment } from "@/types";

export function ShipmentForm({ shipment }: { shipment?: Shipment }) {
  const isEdit = shipment !== undefined;
  const [state, action, pending] = useActionState(isEdit ? updateShipment : createShipment, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {isEdit ? <input type="hidden" name="id" value={shipment.id} /> : null}

      <FormError message={state?.error} />

      <div>
        <label htmlFor="direction" className={labelCls}>
          Чиглэл
        </label>
        <select
          id="direction"
          name="direction"
          defaultValue={state?.values?.direction ?? shipment?.direction ?? "at-mn"}
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
            defaultValue={state?.values?.from_city ?? shipment?.from_city ?? ""}
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
            defaultValue={state?.values?.to_city ?? shipment?.to_city ?? ""}
            placeholder="Улаанбаатар"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="weight_kg" className={labelCls}>
          Ачааны жин (кг)
        </label>
        <input
          id="weight_kg"
          name="weight_kg"
          type="number"
          min="0.1"
          max="500"
          step="0.1"
          defaultValue={state?.values?.weight_kg ?? (shipment ? String(shipment.weight_kg) : "")}
          placeholder="5"
          className={inputCls}
          required
        />
        <FieldError message={state?.fieldErrors?.weight_kg} />
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>
          Ачааны тайлбар
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={state?.values?.description ?? shipment?.description ?? ""}
          placeholder="Юу илгээх гэж байгаагаа бичнэ үү. Жишээ нь: хувцас, эм, бичиг баримт..."
          className={inputCls}
          required
        />
        <FieldError message={state?.fieldErrors?.description} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ready_date" className={labelCls}>
            Бэлэн болох огноо <span className="font-normal text-slate-400">(заавал биш)</span>
          </label>
          <input
            id="ready_date"
            name="ready_date"
            type="date"
            defaultValue={state?.values?.ready_date ?? shipment?.ready_date ?? ""}
            className={inputCls}
          />
          <FieldError message={state?.fieldErrors?.ready_date} />
        </div>
        <div>
          <label htmlFor="deadline_date" className={labelCls}>
            Хүргэх эцсийн огноо <span className="font-normal text-slate-400">(заавал биш)</span>
          </label>
          <input
            id="deadline_date"
            name="deadline_date"
            type="date"
            defaultValue={state?.values?.deadline_date ?? shipment?.deadline_date ?? ""}
            className={inputCls}
          />
          <FieldError message={state?.fieldErrors?.deadline_date} />
        </div>
      </div>

      <div>
        <label htmlFor="offer_price" className={labelCls}>
          Санал болгох үнэ (€/кг) <span className="font-normal text-slate-400">(заавал биш)</span>
        </label>
        <input
          id="offer_price"
          name="offer_price"
          type="number"
          min="1"
          max="1000"
          step="0.5"
          defaultValue={state?.values?.offer_price ?? (shipment?.offer_price ? String(shipment.offer_price) : "")}
          placeholder="12"
          className={inputCls}
        />
        <FieldError message={state?.fieldErrors?.offer_price} />
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Хадгалж байна..." : isEdit ? "Хадгалах" : "Хүсэлт нийтлэх"}
      </button>
    </form>
  );
}
