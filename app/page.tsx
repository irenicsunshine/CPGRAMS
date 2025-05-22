import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(85vh)]">
      {/* Main content with centered input */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-[#1d4e8f]">
              Lodge Your Grievance
            </h2>
            <p className="text-muted-foreground mt-2">
              Search for information or submit a new grievance
            </p>
          </div>

          <div className="relative">
            <Input
              className="w-full px-4 py-6 text-lg rounded-full border-2 border-[#1d4e8f] focus:border-[#1d4e8f] focus:ring-[#1d4e8f]"
              placeholder="Search for grievances or type your query..."
              type="text"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#1d4e8f] text-white hover:bg-[#15396a] px-4 py-2 rounded-full">
              Search
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white">
              <h3 className="font-semibold text-[#1d4e8f]">
                Lodge New Grievance
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Submit a new complaint or grievance to the appropriate
                department
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white">
              <h3 className="font-semibold text-[#1d4e8f]">Track Grievance</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check the status of your previously submitted grievances
              </p>
            </div>
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
        <p>© {new Date().getFullYear()} CPGRAMS - Government of India</p>
      </footer>
    </div>
  );
}
