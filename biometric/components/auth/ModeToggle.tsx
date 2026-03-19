type Mode = "signup" | "login";

type ModeToggleProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
  disabled?: boolean;
};

export default function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
      <button
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
          mode === "signup"
            ? "bg-cyan-400 text-zinc-900"
            : "text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200"
        }`}
        onClick={() => onChange("signup")}
        disabled={disabled}
      >
        Sign Up
      </button>
      <button
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
          mode === "login"
            ? "bg-cyan-400 text-zinc-900"
            : "text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200"
        }`}
        onClick={() => onChange("login")}
        disabled={disabled}
      >
        Log In
      </button>
    </div>
  );
}
