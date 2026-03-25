export default function Card({
  children,
  className = "",
  variant = "default",
  clickable = false,
}) {
  const base =
    "rounded-2xl border transition-all duration-300 ease-out";

  const variants = {
    default:
      "bg-white/90 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-xl",
    glass:
      "bg-white/10 backdrop-blur-lg border-white/20 shadow-md hover:shadow-xl",
    elevated:
      "bg-white border-gray-100 shadow-md hover:-translate-y-1 hover:shadow-2xl",
  };

  const interactive = clickable
    ? "cursor-pointer hover:-translate-y-1 active:scale-[0.98]"
    : "";

  return (
    <div
      className={`${base} ${variants[variant]} ${interactive} p-5 ${className}`}
    >
      {children}
    </div>
  );
}