type Mode = "signup" | "login";

type ModeToggleProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
  disabled?: boolean;
};

export default function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-zinc-200 p-1">
      <button
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
          mode === "signup"
            ? "bg-zinc-900 text-white"
            : "text-zinc-700 hover:bg-zinc-50"
        }`}
        onClick={() => onChange("signup")}
        disabled={disabled}
      >
        Sign Up
      </button>
      <button
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
          mode === "login"
            ? "bg-zinc-900 text-white"
            : "text-zinc-700 hover:bg-zinc-50"
        }`}
        onClick={() => onChange("login")}
        disabled={disabled}
      >
        Log In
      </button>
    </div>
  );
}
