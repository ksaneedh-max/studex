export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="text-center px-6">
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-yellow-400 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">
          Under Maintenance
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 mb-6 max-w-md mx-auto">
          We're currently improving our dashboard to serve you better.
          Please check back soon.
        </p>

      </div>
    </main>
  );
}