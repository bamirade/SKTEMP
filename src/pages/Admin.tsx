import { useSurveys } from "@/hooks/use-surveys";
import { SurveyTable } from "@/components/SurveyTable";
import { AdminStats } from "@/components/AdminStats";
import { Link } from "wouter";
import { Loader2, LayoutDashboard, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const { data: surveys, isLoading, isError } = useSurveys();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
          <h2 className="text-lg font-bold mb-2">Failed to load data</h2>
          <p>Please check your connection and try again.</p>
          <Button variant="outline" className="mt-4 border-red-200 hover:bg-red-100" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="flex h-16 items-center px-4 md:px-8 border-b bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl hidden md:block">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
            <Users className="w-4 h-4" />
            <span>{surveys?.length || 0} Total Records</span>
          </div>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Survey</span>
            </Button>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Overview Statistics</h2>
          {surveys && <AdminStats surveys={surveys} />}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Master List</h2>
          {surveys && <SurveyTable data={surveys} />}
        </div>
      </main>
    </div>
  );
}
