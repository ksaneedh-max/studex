export default function Card({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm md:shadow-md p-4 md:p-5 border hover:shadow-lg transition">
      {children}
    </div>
  );
}