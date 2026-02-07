import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import type { Survey } from "@shared/schema";
import { Printer, Upload, User } from "lucide-react";

interface IdCardModalProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IdCardModal({ survey, open, onOpenChange }: IdCardModalProps) {
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
    const el = document.getElementById("idcard-print-area-wrapper");
    if (!el) return;
    try {
      const canvas = await html2canvas(el as HTMLElement, { backgroundColor: null });
      const data = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = data;
      link.download = `${survey.name.replace(/\s+/g, "_")}-idcard.png`;
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
          <DialogTitle>Generate Youth ID</DialogTitle>
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

            <div className="p-4 rounded-lg bg-blue-50 text-blue-800 text-sm">
              <p className="font-semibold mb-1">Printing Tips:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enable "Background graphics" in print settings</li>
                <li>Set layout to Landscape if needed</li>
                <li>Use high quality paper for best results</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            {/* ID Card Preview Area (front/back wrapper) */}
            <div id="idcard-print-area-wrapper" className="flex flex-col items-center gap-6">
              <div
                id="id-card-print-area"
                className="w-[350px] h-[220px] bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-xl overflow-hidden relative text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)' }}
              >
              {/* Decorative circles */}
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" style={{ borderRadius: '9999px', filter: 'blur(40px)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              <div className="absolute bottom-[-30px] left-[-10px] w-32 h-32 bg-orange-500/20 rounded-full blur-xl" style={{ borderRadius: '9999px', filter: 'blur(40px)', backgroundColor: 'rgba(249, 115, 22, 0.2)' }}></div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-black/10 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="text-[10px] font-bold leading-none">SK</span>
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase">Youth Identity Card</span>
                </div>
                <div className="text-[8px] opacity-70">Republic of the Philippines</div>
              </div>

              {/* Body */}
              <div className="p-4 flex gap-4">
                {/* Photo Area */}
                <div className="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden border border-white/30 shadow-inner">
                  {photo ? (
                    <img src={photo} alt="ID" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white/50" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <div>
                    <div className="text-[8px] text-indigo-200 uppercase tracking-wider">Name</div>
                    <div className="text-sm font-bold leading-snug break-words pr-1">{survey.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[8px] text-indigo-200 uppercase tracking-wider">Age/Sex</div>
                      <div className="text-xs font-semibold">{survey.age} / {survey.sex === 'Male' ? 'M' : 'F'}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-indigo-200 uppercase tracking-wider">Status</div>
                      <div className="text-xs font-semibold leading-snug break-words pr-1">{survey.civilStatus}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] text-indigo-200 uppercase tracking-wider">Classification</div>
                    <div className="text-[10px] font-medium leading-tight opacity-90">{survey.youthClassification}</div>
                  </div>
                </div>
              </div>

              {/* Footer Bar */}
              <div className="absolute bottom-0 w-full h-6 bg-orange-500 flex items-center justify-center">
                 <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Youth Empowerment</span>
              </div>
              </div>

              {/* Back side: simple notice/terms + signature area */}
              <div className="w-[350px] h-[220px] bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-xl overflow-hidden relative text-white p-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)' }}>
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" style={{ borderRadius: '9999px', filter: 'blur(40px)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                <div className="absolute bottom-[-30px] left-[-10px] w-32 h-32 bg-orange-500/20 rounded-full blur-xl" style={{ borderRadius: '9999px', filter: 'blur(40px)', backgroundColor: 'rgba(249, 115, 22, 0.2)' }}></div>
                <div className="relative z-10">
                  <div className="text-sm font-semibold mb-2">Notice / Terms</div>
                  <div className="text-xs text-indigo-100 mb-4 leading-relaxed">
                    This Youth Identity Card is provided for community identification purposes. Misuse or
                    tampering of this card may be subject to local regulations. Keep this card safe.
                  </div>

                  <div className="mt-4">
                    <div className="text-[10px] text-indigo-200 uppercase tracking-wider">Signature</div>
                    <div className="mt-3 h-10 border-b border-white/30"></div>
                    <div className="text-[10px] text-indigo-100 mt-2">Date: ____________________</div>
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
