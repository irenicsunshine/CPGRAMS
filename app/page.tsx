import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(85vh)]">
      {/* Main content with centered input */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-[#1d4e8f]">
              Welcome to the Grievance Handling System
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Our system is designed to help you lodge and track grievances
              efficiently. Please use the links below to submit a new grievance
              or track the status of an existing one.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/grievance">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white">
                <h3 className="font-semibold text-[#1d4e8f]">
                  Lodge New Grievance
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Submit a new complaint or grievance to the appropriate
                  department
                </p>
              </div>
            </Link>
            <Link href="/track-grievance">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white">
                <h3 className="font-semibold text-[#1d4e8f]">
                  Track Grievance
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Check the status of your previously submitted grievances
                </p>
              </div>
            </Link>
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white">
              <h3 className="font-semibold text-[#1d4e8f]">
                Department Directory
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Find contact information for various government departments
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-2 border-t text-center text-sm text-gray-500">
        <p> {new Date().getFullYear()} CPGRAMS - Government of India</p>
      </footer>
    </div>
  );
}
