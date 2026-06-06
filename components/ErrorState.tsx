export function ErrorState({
  message,
  title = "Something went wrong",
}: {
  message: string;
  title?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800"
      role="alert"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
    </div>
  );
}
