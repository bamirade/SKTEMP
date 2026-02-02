import { SurveyForm } from "@/components/SurveyForm";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-white to-white">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 overflow-hidden">
              <img src="/favicon.png" alt="SK logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-none">SK Profile</h1>
              <p className="text-sm text-muted-foreground font-medium">Youth Data Management</p>
            </div>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
            Administrator Access &rarr;
          </Link>
        </header>

        <main className="mb-12">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
              Shape Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Future</span>
            </h2>
            <p className="text-lg text-slate-600">
              Join the official youth registry. Your participation ensures better programs, representation, and opportunities for the youth sector.
            </p>
          </div>

          <SurveyForm />
        </main>

        <footer className="text-center text-sm text-slate-400 pb-8">
          &copy; {new Date().getFullYear()} Sangguniang Kabataan ng Baranggay Rizal. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
