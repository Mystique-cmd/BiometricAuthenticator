import type { Status } from "@/hooks/useAuthPanel";

type StatusBannerProps = {
  status: Status;
};

export default function StatusBanner({ status }: StatusBannerProps) {
  if (!status.message) return null;

  const style =
    status.kind === "error"
      ? "bg-red-500/10 text-red-200"
      : status.kind === "success"
        ? "bg-emerald-500/10 text-emerald-200"
        : "bg-zinc-900/70 text-zinc-300";

  return (
    <div className={`rounded-md px-3 py-2 text-sm ${style}`}>
      {status.message}
    </div>
  );
}
