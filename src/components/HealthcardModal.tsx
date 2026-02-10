import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import type { Survey } from "@shared/schema";
import { Printer, Upload, User, Heart } from "lucide-react";

interface HealthcardModalProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HealthcardModal({ survey, open, onOpenChange }: HealthcardModalProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePNG = async () => {
    const el = document.getElementById("healthcard-print-area-wrapper");
    if (!el) return;
    try {
      const canvas = await html2canvas(el as HTMLElement, { backgroundColor: null });
      const data = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = data;
      link.download = `${survey.name.replace(/\s+/g, "_")}-healthcard.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to save PNG", err);
    }
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate Youth Healthcard</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="space-y-4">
            <div className="p-4 border border-dashed rounded-lg bg-slate-50">
              <Label className="block mb-2 font-medium">1. Upload ID Photo</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" /> Choose File
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <span className="text-sm text-slate-500">
                  {photo ? "Photo loaded" : "No photo selected"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm">
              <p className="font-semibold mb-1">Healthcard Tips:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enable "Background graphics" in print settings</li>
                <li>Use high-quality paper for health credentials</li>
                <li>Ensure photo is clear and recent</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            {/* Healthcard Preview Area (front/back wrapper) */}
            <div id="healthcard-print-area-wrapper" className="flex flex-col items-center gap-6">
              <div
                id="healthcard-print-area"
                className="w-[350px] h-[220px] bg-gradient-to-br from-red-600 to-rose-700 rounded-xl shadow-xl overflow-hidden relative text-white"
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #be123c 100%)' }}
              >
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" style={{ borderRadius: '9999px', filter: 'blur(40px)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              <div className="absolute bottom-[-30px] left-[-10px] w-32 h-32 bg-red-500/20 rounded-full blur-xl" style={{ borderRadius: '9999px', filter: 'blur(40px)', backgroundColor: 'rgba(239, 68, 68, 0.2)' }}></div>

              <div className="flex items-center justify-between px-4 py-3 bg-black/10 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart className="w-3 h-3 text-red-200" />
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase">Youth Healthcard</span>
                </div>
                <div className="text-[8px] opacity-70">Republic of the Philippines</div>
              </div>

              <div className="p-4 flex gap-4">
                <div className="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden border border-white/30 shadow-inner">
                  {photo ? (
                    <img src={photo} alt="ID" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white/50" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div>
                    <div className="text-[8px] text-red-200 uppercase tracking-wider">Name</div>
                    <div className="text-sm font-bold leading-snug break-words pr-1">{survey.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[8px] text-red-200 uppercase tracking-wider">Age/Sex</div>
                      <div className="text-xs font-semibold">{survey.age} / {survey.sex === 'Male' ? 'M' : 'F'}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-red-200 uppercase tracking-wider">Status</div>
                      <div className="text-xs font-semibold leading-snug break-words pr-1">{survey.civilStatus}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] text-red-200 uppercase tracking-wider">Classification</div>
                    <div className="text-[10px] font-medium leading-tight opacity-90">{survey.youthClassification}</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 w-full h-6 bg-red-700 flex items-center justify-center">
                 <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Youth Health</span>
              </div>
              </div>

              {/* Back side: simple notice/terms + signature area */}
              <div className="w-[350px] h-[220px] bg-gradient-to-br from-red-600 to-rose-700 rounded-xl shadow-xl overflow-hidden relative text-white p-4" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #be123c 100%)' }}>
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" style={{ borderRadius: '9999px', filter: 'blur(40px)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                <div className="absolute bottom-[-30px] left-[-10px] w-32 h-32 bg-red-500/20 rounded-full blur-xl" style={{ borderRadius: '9999px', filter: 'blur(40px)', backgroundColor: 'rgba(239, 68, 68, 0.2)' }}></div>
                <div className="relative z-10">
                  <div className="text-sm font-semibold mb-2">Notice / Terms</div>
                  <div className="text-xs text-red-100 mb-4 leading-relaxed">
                    By using this Youth Healthcard you agree to the local policies and acknowledge that this
                    card is for identification and health reference only. Keep this card secure.
                  </div>

                  <div className="mt-4">
                    <div className="text-[10px] text-red-200 uppercase tracking-wider">Signature</div>
                    <div className="mt-3 h-10 border-b border-white/30"></div>
                    <div className="text-[10px] text-red-100 mt-2">Date: ____________________</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex gap-2 mt-2">
              <Button onClick={handleSavePNG} className="w-1/2 gap-2" size="lg">
                Save as PNG
              </Button>
              <Button onClick={handlePrint} className="w-1/2 gap-2" size="lg">
                <Printer className="w-4 h-4" /> Print Card
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
