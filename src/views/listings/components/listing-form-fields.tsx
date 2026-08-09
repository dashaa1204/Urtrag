import type { Direction } from "@/types";
import { DIRECTIONS } from "@/constant/directions";
import { FieldRow, SelectField, TextField } from "@/components/ui";

/** Чиглэл сонгох талбар — аялал, ачаа хоёр формд ижил. */
export function DirectionField({ defaultValue, error }: { defaultValue: string; error?: string }) {
  return (
    <SelectField label="Чиглэл" name="direction" defaultValue={defaultValue} error={error}>
      {(Object.keys(DIRECTIONS) as Direction[]).map((direction) => (
        <option key={direction} value={direction}>
          {DIRECTIONS[direction].label}
        </option>
      ))}
    </SelectField>
  );
}

/** Хаанаас / хаашаа хосолсон талбар. */
export function CityFields({ from, to }: { from: string; to: string }) {
  return (
    <FieldRow>
      <TextField label="Хаанаас" optional name="from_city" defaultValue={from} placeholder="Вена" />
      <TextField label="Хаашаа" optional name="to_city" defaultValue={to} placeholder="Улаанбаатар" />
    </FieldRow>
  );
}
