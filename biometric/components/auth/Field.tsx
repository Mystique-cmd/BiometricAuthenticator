type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export default function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}: FieldProps) {
  const borderClass = error ? "border-red-300" : "border-zinc-300";
  const ringClass = error ? "focus:ring-red-500" : "focus:ring-zinc-900";
  const focusBorderClass = error ? "focus:border-red-500" : "focus:border-zinc-900";

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      <input
        className={`w-full rounded-md border ${borderClass} bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 ${focusBorderClass} ${ringClass}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
