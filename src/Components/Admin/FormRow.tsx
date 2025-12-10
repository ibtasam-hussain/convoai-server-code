import { PropsWithChildren } from "react";

export default function FormRow({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#232323]">{label}</span>
      {children}
    </label>
  );
}
