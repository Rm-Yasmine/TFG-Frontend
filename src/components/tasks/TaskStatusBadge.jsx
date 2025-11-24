export default function TaskStatusBadge({ status }) {
  const color =
    status === "pending"
      ? "bg-warning"
      : status === "completed"
      ? "bg-success"
      : "bg-secondary";

  return (
    <span className={`badge ${color} text-dark px-3 py-2 rounded-pill`}>
      {status}
    </span>
  );
}
