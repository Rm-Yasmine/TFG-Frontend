export default function TaskStatusBadge({ status }) {
  const normalized = status?.toLowerCase();

  const colorClass =
    normalized === "pending"
      ? "badge-pending"
      : normalized === "completed"
      ? "badge-completed"
      : "badge-default";

  return (
    <span className={`custom-badge ${colorClass}`}>
      {status}
    </span>
  );
}
