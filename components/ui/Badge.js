export default function Badge({ text, type }) {
  let color = "bg-green-100 text-green-700";

  if (type === "danger") color = "bg-red-100 text-red-700";
  else if (type === "warning") color = "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-2 py-1 text-xs rounded ${color}`}>
      {text}
    </span>
  );
}