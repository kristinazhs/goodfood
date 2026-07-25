export function Field({
  label,
  type = "text",
  placeholder,
  defaultValue,
  name,
  required,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  name?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none placeholder:text-[#B5B5A8] focus:border-brand"
      />
    </label>
  );
}

export function TextArea({
  label,
  placeholder,
  defaultValue,
  name,
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  name?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <textarea
        rows={3}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full resize-none rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none placeholder:text-[#B5B5A8] focus:border-brand"
      />
    </label>
  );
}
