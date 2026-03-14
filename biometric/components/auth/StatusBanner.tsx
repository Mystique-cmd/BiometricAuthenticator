import type { Status } from "@/hooks/useAuthPanel";

type StatusBannerProps = {
  status: Status;
};

export default function StatusBanner({ status }: StatusBannerProps) {
  if (!status.message) return null;

  const style =
    status.kind === "error"
      ? "bg-red-50 text-red-700"
      : status.kind === "success"
        ? "bg-green-50 text-green-700"
        : "bg-zinc-50 text-zinc-700";

  return (
    <div className={`rounded-md px-3 py-2 text-sm ${style}`}>
      {status.message}
    </div>
  );
}
