export function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none placeholder:text-[#B5B5A8] focus:border-brand"
      />
    </label>
  );
}

export function TextArea({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <textarea
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none placeholder:text-[#B5B5A8] focus:border-brand"
      />
    </label>
  );
}
