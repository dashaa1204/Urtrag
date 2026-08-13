"use client";

import { useActionState } from "react";
import type { SessionUser } from "@/types";
import { updateProfile } from "@/lib/actions";
import { avatarUrl } from "@/lib/avatar";
import { splitPhone } from "@/lib/phone";
import { COUNTRY_OPTIONS, dialCode } from "@/constant/cities";
import { BIO_MAX } from "@/constant/settings";
import {
  FormError,
  FormNotice,
  PhoneField,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/components/ui";
import { AvatarPicker } from "./avatar-picker";

const groupCls = "text-xs font-semibold uppercase tracking-wider text-ink-soft/70";

export function ProfileForm({ user }: { user: SessionUser }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const values = state?.values;
  // Хадгалсан "+43 660 ..." утгыг код + дугаар хоёр болгож формд тавина
  const phone = splitPhone(user.phone);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormNotice message={state?.notice} />
      <FormError message={state?.error} />

      <AvatarPicker
        name={values?.name || user.name}
        src={avatarUrl(user.avatarPath)}
        error={state?.fieldErrors?.avatar}
      />

      <p className={groupCls}>Хувийн мэдээлэл</p>

      <TextField
        label="Нэр"
        name="name"
        defaultValue={values?.name ?? user.name}
        placeholder="Таны нэр"
        error={state?.fieldErrors?.name}
        required
      />

      <PhoneField
        // Хуучин дугаарт код байхгүй бол оршин суугаа улсаас нь таамаглана
        code={values?.phone_code ?? (phone.code || dialCode(user.country))}
        number={values?.phone ?? phone.number}
        hint="Хаана ч нийтлэгдэхгүй — зөвхөн та мессежээр өөрөө хуваалцна."
        error={state?.fieldErrors?.phone}
      />

      <SelectField
        label="Оршин суугаа улс"
        optional
        name="country"
        defaultValue={values?.country ?? user.country ?? ""}
        hint="Профайл дээр тань далбаагаар харагдана."
        error={state?.fieldErrors?.country}
      >
        <option value="">Сонгоогүй</option>
        {COUNTRY_OPTIONS.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.country}
          </option>
        ))}
      </SelectField>

      <p className={`${groupCls} mt-2`}>Миний тухай</p>

      <TextAreaField
        label="Танилцуулга"
        optional
        name="bio"
        rows={4}
        maxLength={BIO_MAX}
        defaultValue={values?.bio ?? user.bio ?? ""}
        placeholder="Аялагч, илгээгч нартаа өөрийгөө товч танилцуулаарай..."
        hint={`Профайл дээр тань нийтэд харагдана. Дээд тал нь ${BIO_MAX} тэмдэгт.`}
        error={state?.fieldErrors?.bio}
      />

      <SubmitButton pending={pending} className="self-start">
        Хадгалах
      </SubmitButton>
    </form>
  );
}
