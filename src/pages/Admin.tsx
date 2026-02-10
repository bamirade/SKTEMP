import { useState } from "react";
import { useSurveys } from "@/hooks/use-surveys";
import { SurveyTable } from "@/components/SurveyTable";
import { AdminStats } from "@/components/AdminStats";
import { Link } from "wouter";
import { Loader2, LayoutDashboard, ArrowLeft, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: surveys, isLoading, isError } = useSurveys();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple temporary password check
    if (password === "admin123") {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Invalid password. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-slate-200">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                {errorMsg && (
                  <p className="text-sm text-destructive font-medium">{errorMsg}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Login to Dashboard
                </Button>
                <Link href="/">
                  <Button variant="ghost" type="button" className="w-full text-slate-500 hover:text-slate-700">
                    Back to Survey
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-center text-slate-400 mt-4">
                Temporary access. Supabase integration coming soon.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
