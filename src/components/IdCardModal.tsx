import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
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
            {/* ID Card Preview Area */}
            <div
              id="id-card-print-area"
              className="w-[350px] h-[220px] bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-xl overflow-hidden relative text-white"
            >
              {/* Decorative circles */}
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-[-30px] left-[-10px] w-32 h-32 bg-orange-500/20 rounded-full blur-xl"></div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-black/10 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold">SK</span>
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
                    <div className="text-sm font-bold truncate leading-tight">{survey.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[8px] text-indigo-200 uppercase tracking-wider">Age/Sex</div>
                      <div className="text-xs font-semibold">{survey.age} / {survey.sex === 'Male' ? 'M' : 'F'}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-indigo-200 uppercase tracking-wider">Status</div>
                      <div className="text-xs font-semibold truncate">{survey.civilStatus}</div>
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

            <Button onClick={handlePrint} className="mt-6 w-full gap-2" size="lg">
              <Printer className="w-4 h-4" /> Print Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
