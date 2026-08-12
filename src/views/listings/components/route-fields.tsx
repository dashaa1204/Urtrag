"use client";

import { useState } from "react";
import { ComboboxField, FieldRow, type ComboboxOption } from "@/components/ui";
import { CITIES, findCity } from "@/constant/cities";

const CITY_OPTIONS: ComboboxOption[] = CITIES.map((city) => ({
  value: city.name,
  hint: `${city.flag} ${city.country}`,
  keywords: [city.country, ...city.aliases],
}));

/**
 * Хаанаас / хаашаа хос — аялал, ачаа хоёр формд ижил.
 * Аль ч хотоос аль ч хот руу болно; чиглэлийг сонгосон хотуудаас нь өөрөө тодорхойлно.
 */
export function RouteFields({
  from,
  to,
  fromError,
  toError,
}: {
  from: string;
  to: string;
  fromError?: string;
  toError?: string;
}) {
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  const fromCity = findCity(fromValue);
  const toCity = findCity(toValue);
  const sameCity = fromCity !== undefined && fromCity === toCity;

  return (
    <div className="flex flex-col gap-3">
      <FieldRow>
        <ComboboxField
          label="Хаанаас"
          name="from_city"
          value={fromValue}
          onValueChange={setFromValue}
          options={CITY_OPTIONS}
          placeholder="Vienna"
          error={fromError}
        />
        <ComboboxField
          label="Хаашаа"
          name="to_city"
          value={toValue}
          onValueChange={setToValue}
          options={CITY_OPTIONS}
          placeholder="Ulaanbaatar"
          error={toError}
        />
      </FieldRow>

      {sameCity ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Хаанаас, хаашаа хоёр өөр хот байх ёстой.
        </p>
      ) : fromCity && toCity ? (
        <p className="rounded-lg bg-ink/8 px-3 py-2 text-sm text-ink">
          Чиглэл:{" "}
          <span className="font-semibold">
            {fromCity.flag} {fromCity.name} → {toCity.flag} {toCity.name}
          </span>{" "}
          · {fromCity.country} → {toCity.country}
        </p>
      ) : (
        <p className="text-xs text-ink-soft">
          Хотоо бичиж эхлээд жагсаалтаас сонгоно уу — чиглэл автоматаар тодорхойлогдоно.
        </p>
      )}
    </div>
  );
}
