export default function Card({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition">
      {children}
    </div>
  );
}