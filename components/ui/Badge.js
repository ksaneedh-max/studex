export default function Badge({
  children,
  variant = "success",
  size = "sm",
  rounded = "full",
  className = "",
}) {
  const variants = {
    success: "bg-green-100 text-green-700 ring-green-600/20",
    danger: "bg-red-100 text-red-700 ring-red-600/20",
    warning: "bg-yellow-100 text-yellow-700 ring-yellow-600/20",
    info: "bg-blue-100 text-blue-700 ring-blue-600/20",
    neutral: "bg-gray-100 text-gray-700 ring-gray-500/20",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  const radius = {
    sm: "rounded",
    full: "rounded-full",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium
        ${sizes[size]}
        ${radius[rounded]}
        ${variants[variant]}
        ring-1 ring-inset
        ${className}
      `}
    >
      {children}
    </span>
  );
}