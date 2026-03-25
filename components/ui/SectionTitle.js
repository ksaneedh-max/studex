export default function SectionTitle({
  children,
  subtitle,
  align = "left",
  className = "",
}) {
  const alignment = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={`mb-4 ${alignment[align]} ${className}`}>
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900">
        {children}
      </h2>

      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>
      )}
      
    </div>
  );
}