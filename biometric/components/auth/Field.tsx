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
  const borderClass = error ? "border-red-500/60" : "border-zinc-800";
  const ringClass = error ? "focus:ring-red-500/60" : "focus:ring-cyan-400/40";
  const focusBorderClass = error
    ? "focus:border-red-500/70"
    : "focus:border-cyan-400/60";

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </label>
      <input
        className={`w-full rounded-md border ${borderClass} bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 ${focusBorderClass} ${ringClass}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
