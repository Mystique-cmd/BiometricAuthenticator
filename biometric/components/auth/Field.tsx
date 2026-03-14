type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: FieldProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      <input
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
