import { useState, useEffect } from "react";
import { SurveyTable } from "@/components/SurveyTable";
import { AdminStats } from "@/components/AdminStats";
import { Link } from "wouter";
import { Loader2, LayoutDashboard, ArrowLeft, Users, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { transformApiSurveysToSurveys, type ApiSurveyResponse } from "@/lib/transformSurveyData";
import { useToast } from "@/hooks/use-toast";
import type { Survey } from "@/shared/schema";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const { toast } = useToast();

  // Auto-authenticate if password exists in localStorage
  useEffect(() => {
    const checkSession = async () => {
      const savedPassword = localStorage.getItem('admin_password');
      const savedSurveys = localStorage.getItem('admin_surveys');
      if (savedPassword) {
        setAuthToken(savedPassword);
        // Show cached data immediately for better UX (if available)
        if (savedSurveys) {
          try {
            setSurveys(JSON.parse(savedSurveys));
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem('admin_surveys');
          }
        }
        // Always fetch fresh data from server to ensure it's up-to-date
        await authenticateWithPassword(savedPassword);
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  const authenticateWithPassword = async (pwd: string) => {
    try {
      const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;
      const normalizedBaseUrl = functionUrl.replace(/\/$/, "");
      const adminSurveysUrl = normalizedBaseUrl.endsWith("/admin/surveys")
        ? normalizedBaseUrl
        : `${normalizedBaseUrl}/admin/surveys`;

      const response = await fetch(adminSurveysUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${pwd}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json() as ApiSurveyResponse[];
        const transformedSurveys = transformApiSurveysToSurveys(data);
        setSurveys(transformedSurveys);
        localStorage.setItem('admin_surveys', JSON.stringify(transformedSurveys));
        setIsAuthenticated(true);
        setAuthToken(pwd);
        setPassword("");
        setErrorMsg("");
      } else {
        // Password invalid, clear it
        localStorage.removeItem('admin_password');
        localStorage.removeItem('admin_surveys');
        setErrorMsg("Session expired. Please log in again.");
        setHasError(true);
        setTimeout(() => setHasError(false), 600);
      }
    } catch (err: any) {
      // Network or other error, clear stored password
      localStorage.removeItem('admin_password');
      localStorage.removeItem('admin_surveys');
      setErrorMsg("Authentication failed. Please log in again.");
      setHasError(true);
      setTimeout(() => setHasError(false), 600);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg("");
    setHasError(false);

    try {
      if (!password) return;

      const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;
      const normalizedBaseUrl = functionUrl.replace(/\/$/, "");
      const adminSurveysUrl = normalizedBaseUrl.endsWith("/admin/surveys")
        ? normalizedBaseUrl
        : `${normalizedBaseUrl}/admin/surveys`;

      const response = await fetch(adminSurveysUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json() as ApiSurveyResponse[];
        const transformedSurveys = transformApiSurveysToSurveys(data);
        // Store password for future authenticated requests
        localStorage.setItem('admin_password', password);
        localStorage.setItem('admin_surveys', JSON.stringify(transformedSurveys));
        setSurveys(transformedSurveys);
        setIsAuthenticated(true);
        setAuthToken(password);
        setPassword("");
        setErrorMsg("");
      } else if (response.status === 401) {
        setErrorMsg("Invalid password. Please try again.");
        setHasError(true);
        setPassword("");
        setTimeout(() => setHasError(false), 600);
      } else {
        setErrorMsg(`Authentication failed (${response.status}). Please try again.`);
        setHasError(true);
        setPassword("");
        setTimeout(() => setHasError(false), 600);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication failed. Please check your credentials.");
      setHasError(true);
      setPassword("");
      setTimeout(() => setHasError(false), 600);
    }

    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_password');
    localStorage.removeItem('admin_surveys');
    setIsAuthenticated(false);
    setSurveys([]);
    setAuthToken("");
  };

  const handleRefreshSurveys = async () => {
    try {
      const token = authToken || localStorage.getItem('admin_password') || "";
      if (!token) return;

      const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;
      const normalizedBaseUrl = functionUrl.replace(/\/$/, "");
      const adminSurveysUrl = normalizedBaseUrl.endsWith("/admin/surveys")
        ? normalizedBaseUrl
        : `${normalizedBaseUrl}/admin/surveys`;

      const response = await fetch(adminSurveysUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json() as ApiSurveyResponse[];
        const transformedSurveys = transformApiSurveysToSurveys(data);
        setSurveys(transformedSurveys);
        localStorage.setItem('admin_surveys', JSON.stringify(transformedSurveys));
      }
    } catch (err: any) {
      console.error('Failed to refresh surveys:', err);
    }
  };

  const handleDeleteSurvey = async (id: number) => {
    try {
      const token = authToken || localStorage.getItem('admin_password') || "";
      if (!token) {
        toast({
          title: "Error",
          description: "Missing admin session. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL;
      const normalizedBaseUrl = functionUrl.replace(/\/$/, "");
      const adminSurveysUrl = normalizedBaseUrl.endsWith("/admin/surveys")
        ? normalizedBaseUrl
        : `${normalizedBaseUrl}/admin/surveys`;

      const response = await fetch(`${adminSurveysUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from local state and localStorage
        const updatedSurveys = surveys.filter(s => s.id !== id);
        setSurveys(updatedSurveys);
        localStorage.setItem('admin_surveys', JSON.stringify(updatedSurveys));

        toast({
          title: "Success",
          description: "Survey record deleted successfully.",
        });
      } else {
        throw new Error(`Failed to delete: ${response.statusText}`);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete survey record.",
        variant: "destructive",
      });
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-500 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

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
              {errorMsg && (
                <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Admin Password</label>
                <div className={`relative ${hasError ? 'animate-shake' : ''}`}>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className={`w-full pr-10 ${errorMsg ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={isLoggingIn}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isLoggingIn}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isLoggingIn || !password}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Login to Dashboard"
                  )}
                </Button>
                <Link href="/">
                  <Button
                    variant="ghost"
                    type="button"
                    className="w-full text-slate-500 hover:text-slate-700"
                    disabled={isLoggingIn}
                  >
                    Back to Survey
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  if (surveys.length === 0 && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-amber-50 text-amber-600 p-6 rounded-xl text-center">
          <h2 className="text-lg font-bold mb-2">No records found</h2>
          <p>There are currently no survey records in the database.</p>
          <Button variant="outline" className="mt-4 border-amber-200 hover:bg-amber-100" onClick={() => window.location.reload()}>
            Refresh
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
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-700"
            onClick={handleLogout}
          >
            Logout
          </Button>
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
          {surveys && <SurveyTable data={surveys} onDelete={handleDeleteSurvey} onRefresh={handleRefreshSurveys} />}
        </div>
      </main>
    </div>
  );
}
