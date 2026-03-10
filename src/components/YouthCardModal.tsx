import { useEffect, useRef, useState } from "react";
import type { Survey } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { exportCardAsPNG } from "@/utils/exportUtils";
import {
  CreditCard,
  Download,
  Heart,
  Loader2,
  Printer,
  Upload,
  User,
} from "lucide-react";

type CardVariant = "id" | "health";

interface YouthCardModalProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: CardVariant;
}

interface CardConfig {
  dialogTitle: string;
  cardTitle: string;
  cardSubtitle: string;
  tipTitle: string;
  tips: string[];
  footerTagline: string;
  fileSuffix: string;
  wrapperId: string;
  frontId: string;
  icon: typeof CreditCard;
  panelTone: string;
  softTone: string;
  labelTone: string;
  footerTone: string;
  badgeTone: string;
  background: string;
}

const CARD_CONFIG: Record<CardVariant, CardConfig> = {
  id: {
    dialogTitle: "Generate Youth Identity Card",
    cardTitle: "Youth Identity Card",
    cardSubtitle: "Sangguniang Kabataan, Rizal",
    tipTitle: "Identity Card Tips",
    tips: [
      "Use a clear photo with a neutral background.",
      "Enable background graphics before printing.",
      "Print in best quality mode for sharper text.",
    ],
    footerTagline: "SERVICE • PARTICIPATION • LEADERSHIP",
    fileSuffix: "idcard",
    wrapperId: "idcard-print-area-wrapper",
    frontId: "id-card-print-area",
    icon: CreditCard,
    panelTone: "border-cyan-200 bg-cyan-50 text-cyan-900",
    softTone: "bg-cyan-500/15",
    labelTone: "text-cyan-100",
    footerTone: "bg-cyan-300 text-slate-900",
    badgeTone: "bg-cyan-200 text-slate-900",
    background: "linear-gradient(145deg, #0f172a 0%, #0f766e 52%, #0891b2 100%)",
  },
  health: {
    dialogTitle: "Generate Youth Health Card",
    cardTitle: "Youth Health Card",
    cardSubtitle: "Community Health Profile",
    tipTitle: "Health Card Tips",
    tips: [
      "Use a recent photo for easier verification.",
      "Keep a printed copy in a dry card sleeve.",
      "Bring this card during barangay health activities.",
    ],
    footerTagline: "CARE • READINESS • COMMUNITY",
    fileSuffix: "healthcard",
    wrapperId: "healthcard-print-area-wrapper",
    frontId: "healthcard-print-area",
    icon: Heart,
    panelTone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    softTone: "bg-emerald-500/15",
    labelTone: "text-emerald-100",
    footerTone: "bg-emerald-300 text-slate-900",
    badgeTone: "bg-emerald-200 text-slate-900",
    background: "linear-gradient(145deg, #052e16 0%, #047857 50%, #10b981 100%)",
  },
};

function formatDate(value?: string): string {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not provided";
  return parsed.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatPhilippineMobileNumber(value?: string): string {
  if (!value?.trim()) return "Not provided";

  const digits = value.replace(/\D/g, "");
  if (!digits) return "Not provided";

  let normalized = digits;

  if (normalized.startsWith("0") && normalized.length === 11) {
    normalized = normalized.slice(1);
  } else if (normalized.startsWith("63") && normalized.length === 12) {
    normalized = normalized.slice(2);
  }

  if (normalized.length !== 10 || !normalized.startsWith("9")) {
    return value.trim();
  }

  return `+63 ${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 10)}`;
}

function formatPhilippineMobileNumberInput(value: string): string {
  const rawValue = value.trimStart();
  if (!rawValue) return "";

  const digits = rawValue.replace(/\D/g, "");
  if (!digits) return rawValue;

  let normalized = digits;
  if (normalized.startsWith("63")) {
    normalized = normalized.slice(2);
  } else if (normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  }

  if (!normalized) {
    if (rawValue.startsWith("+63") || digits === "63") return "+63";
    return rawValue;
  }

  if (!normalized.startsWith("9")) {
    return rawValue;
  }

  const trimmed = normalized.slice(0, 10);
  const first = trimmed.slice(0, 3);
  const second = trimmed.slice(3, 6);
  const third = trimmed.slice(6, 10);

  return ["+63", first, second, third].filter(Boolean).join(" ");
}

function sanitizeFileName(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "youth-card";
  return trimmed
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function buildDisplayName(survey: Survey): string {
  const middleInitial = survey.middleName?.trim() ? ` ${survey.middleName.trim()[0]}.` : "";
  const suffix = survey.suffix?.trim() ? ` ${survey.suffix.trim()}` : "";
  return `${survey.firstName}${middleInitial} ${survey.lastName}${suffix}`;
}

export function YouthCardModal({ survey, open, onOpenChange, variant }: YouthCardModalProps) {
  const config = CARD_CONFIG[variant];
  const Icon = config.icon;
  const [photo, setPhoto] = useState<string | null>(null);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  const [isSavingPNG, setIsSavingPNG] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setPhoto(null);
      setEmergencyContactName("");
      setEmergencyContactNumber("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  if (!survey) return null;

  const fullName = buildDisplayName(survey);
  const cardNumber = `SKR-${String(survey.id ?? 0).padStart(5, "0")}`;
  const locationLabel =
    survey.location === "Others (Outside Rizal)" && survey.otherLocation
      ? survey.otherLocation
      : survey.location || "Not provided";
  const formattedYouthContactNumber = formatPhilippineMobileNumber(survey.contactNumber);
  const formattedEmergencyContactNumber = formatPhilippineMobileNumber(emergencyContactNumber);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Unsupported file",
        description: "Please choose a valid image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please use an image below 8MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        toast({
          title: "Photo ready",
          description: "The card preview has been updated.",
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "Could not read the selected image.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearPhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSavePNG = async () => {
    const namePart = sanitizeFileName(`${survey.firstName} ${survey.lastName}`);
    const fileName = `${namePart}-${config.fileSuffix}`;

    setIsSavingPNG(true);
    try {
      await exportCardAsPNG(config.wrapperId, fileName);
      toast({
        title: "Download started",
        description: "Your card image is being prepared as PNG.",
      });
    } catch {
      toast({
        title: "Export failed",
        description: "The card could not be exported right now.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPNG(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-200 px-6 py-4">
          <DialogTitle className="text-xl font-bold text-slate-900">{config.dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(92vh-82px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
          <aside className="no-print space-y-5 border-b border-slate-200 bg-white p-6 lg:border-b-0 lg:border-r">
            <div className={`rounded-xl border p-4 ${config.panelTone}`}>
              <Label className="mb-3 block text-sm font-semibold">1. Upload Card Photo</Label>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {photo ? "Replace Photo" : "Choose Photo"}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <div className="rounded-lg border border-current/20 bg-white/80 px-3 py-2 text-xs">
                  {photo ? "Photo loaded and ready for preview." : "No image selected yet."}
                </div>
                {photo && (
                  <Button variant="ghost" onClick={handleClearPhoto} className="w-full text-xs">
                    Remove photo
                  </Button>
                )}
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${config.panelTone}`}>
              <Label className="mb-3 block text-sm font-semibold">2. Emergency Contact</Label>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`emergency-name-${variant}`} className="text-xs font-medium">
                    Name
                  </Label>
                  <Input
                    id={`emergency-name-${variant}`}
                    value={emergencyContactName}
                    onChange={(event) => setEmergencyContactName(event.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="bg-white/90 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`emergency-number-${variant}`} className="text-xs font-medium">
                    Contact Number
                  </Label>
                  <Input
                    id={`emergency-number-${variant}`}
                    value={emergencyContactNumber}
                    onChange={(event) => setEmergencyContactNumber(formatPhilippineMobileNumberInput(event.target.value))}
                    placeholder="09XXXXXXXXX"
                    inputMode="tel"
                    className="bg-white/90 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 ${config.softTone}`}>
              <p className="mb-2 text-sm font-semibold text-slate-900">{config.tipTitle}</p>
              <ul className="space-y-2 text-sm text-slate-700">
                {config.tips.map((tip) => (
                  <li key={tip}>• {tip}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Card Holder</p>
              <p className="mt-1 text-base font-bold text-slate-900">{fullName}</p>
              <p className="mt-2 text-sm text-slate-600">Card No. {cardNumber}</p>
            </div>
          </aside>

          <section className="bg-[radial-gradient(circle_at_top,_#e2e8f0,_#f8fafc_45%,_#ffffff)] p-3 sm:p-5 md:p-8">
            <div className="no-print mb-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Preview</p>
              <h3 className="text-lg font-semibold text-slate-900">Front and Back Layout</h3>
            </div>

            <div id={config.wrapperId} className="print-card-stack mx-auto flex max-w-max flex-col items-center gap-6">
              <article
                id={config.frontId}
                className="print-card-face relative h-[220px] w-[350px] overflow-hidden rounded-2xl text-white shadow-2xl"
                style={{ background: config.background }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.35), transparent 28%), radial-gradient(circle at 85% 84%, rgba(255,255,255,0.22), transparent 32%)",
                  }}
                />
                <img
                  src="/favicon.png"
                  alt=""
                  className="pointer-events-none absolute right-4 top-4 h-24 w-24 opacity-15"
                />

                <div className="relative z-10 flex h-full flex-col">
                  <header className="flex items-center justify-between border-b border-white/20 bg-black/15 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/70">Republic of the Philippines</p>
                        <p className="text-xs font-bold uppercase tracking-[0.13em]">{config.cardTitle}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${config.badgeTone}`}>
                      {cardNumber}
                    </span>
                  </header>

                  <div className="grid flex-1 grid-cols-[94px_1fr] gap-3 p-4">
                    <div className="h-24 w-24 overflow-hidden rounded-xl border border-white/40 bg-black/15 shadow-inner">
                      {photo ? (
                        <img src={photo} alt="Card holder" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-10 w-10 text-white/55" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="min-w-0">
                        <p className={`text-[9px] uppercase tracking-[0.18em] ${config.labelTone}`}>Card Holder</p>
                        <h4 className="truncate pr-2 text-sm font-bold leading-snug" title={fullName}>{fullName}</h4>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/75">{config.cardSubtitle}</p>
                      </div>

                      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] leading-tight">
                        <div className="min-w-0">
                          <dt className={config.labelTone}>Age / Sex</dt>
                          <dd className="truncate font-semibold text-white">{survey.age ?? "N/A"} / {survey.sex || "N/A"}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className={config.labelTone}>Civil Status</dt>
                          <dd className="truncate font-semibold text-white" title={survey.civilStatus || "N/A"}>{survey.civilStatus || "N/A"}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className={config.labelTone}>Classification</dt>
                          <dd className="truncate font-semibold text-white" title={survey.youthClassification || "N/A"}>{survey.youthClassification || "N/A"}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className={config.labelTone}>Location</dt>
                          <dd className="truncate font-semibold text-white" title={locationLabel}>{locationLabel}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <footer className={`mt-auto flex h-7 items-center justify-center px-3 ${config.footerTone}`}>
                    <span className="text-[10px] font-bold tracking-[0.22em]">{config.footerTagline}</span>
                  </footer>
                </div>
              </article>

              <article
                className="print-card-face relative h-[220px] w-[350px] overflow-hidden rounded-2xl text-white shadow-2xl"
                style={{ background: config.background }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 82% 12%, rgba(255,255,255,0.35), transparent 26%), radial-gradient(circle at 18% 78%, rgba(255,255,255,0.2), transparent 30%)",
                  }}
                />

                <div className="relative z-10 flex h-full min-h-0 flex-col p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase tracking-[0.16em] text-white/70">Emergency Details</p>
                      <h4 className="text-[13px] font-bold leading-tight">Emergency Contact</h4>
                    </div>
                    <div className="rounded-full border border-white/30 bg-white/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em]">
                      Keep Updated
                    </div>
                  </div>

                  <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[9px]">
                    <div className="min-w-0 rounded-lg border border-white/25 bg-black/20 p-1.5">
                      <p className={`text-[7px] uppercase tracking-[0.16em] ${config.labelTone}`}>Name</p>
                      <p className="mt-0.5 truncate text-[10px] font-semibold" title={emergencyContactName || "Not provided"}>
                        {emergencyContactName || "Not provided"}
                      </p>
                    </div>
                    <div className="min-w-0 rounded-lg border border-white/25 bg-black/20 p-1.5">
                      <p className={`text-[7px] uppercase tracking-[0.16em] ${config.labelTone}`}>Contact Number</p>
                      <p className="mt-0.5 truncate text-[10px] font-semibold" title={formattedEmergencyContactNumber}>
                        {formattedEmergencyContactNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[8px]">
                    <div className="min-w-0 rounded-lg border border-white/25 bg-black/20 p-1.5">
                      <p className={`text-[7px] uppercase tracking-[0.16em] ${config.labelTone}`}>Birthdate</p>
                      <p className="mt-0.5 truncate text-[9px] font-semibold" title={formatDate(survey.birthdate)}>{formatDate(survey.birthdate)}</p>
                    </div>
                    <div className="min-w-0 rounded-lg border border-white/25 bg-black/20 p-1.5">
                      <p className={`text-[7px] uppercase tracking-[0.16em] ${config.labelTone}`}>Youth Contact</p>
                      <p className="mt-0.5 truncate text-[9px] font-semibold" title={formattedYouthContactNumber}>{formattedYouthContactNumber}</p>
                    </div>
                    <div className="min-w-0 rounded-lg border border-white/25 bg-black/20 p-1.5">
                      <p className={`text-[7px] uppercase tracking-[0.16em] ${config.labelTone}`}>Email</p>
                      <p className="mt-0.5 truncate text-[9px] font-semibold" title={survey.email || "Not provided"}>{survey.email || "Not provided"}</p>
                    </div>
                    <div className="min-w-0 rounded-lg border border-white/25 bg-black/20 p-1.5">
                      <p className={`text-[7px] uppercase tracking-[0.16em] ${config.labelTone}`}>Work Status</p>
                      <p className="mt-0.5 truncate text-[9px] font-semibold" title={survey.workStatus || "Not provided"}>{survey.workStatus || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <p className="text-[7px] uppercase tracking-[0.16em] text-white/70">Holder Signature</p>
                      <div className="mt-1 h-5 border-b border-white/60" />
                    </div>
                    <div>
                      <p className="text-[7px] uppercase tracking-[0.16em] text-white/70">Issued Date</p>
                      <div className="mt-1 h-5 border-b border-white/60" />
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="no-print mx-auto mt-6 grid w-full max-w-[350px] grid-cols-1 gap-3 sm:grid-cols-2">
              <Button onClick={handleSavePNG} className="gap-2" size="lg" disabled={isSavingPNG}>
                {isSavingPNG ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Save as PNG
              </Button>
              <Button onClick={handlePrint} className="gap-2" size="lg" variant="outline">
                <Printer className="h-4 w-4" />
                Print Card
              </Button>
            </div>
          </section>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
