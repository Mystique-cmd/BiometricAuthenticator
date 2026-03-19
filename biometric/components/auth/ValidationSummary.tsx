type ValidationSummaryProps = {
  messages: string[];
};

export default function ValidationSummary({ messages }: ValidationSummaryProps) {
  if (messages.length === 0) return null;

  return (
    <div className="rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
      <p className="font-medium">Fix these before continuing:</p>
      <ul className="mt-2 list-disc pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
