import type { Survey } from "@shared/schema";
import { YouthCardModal } from "@/components/YouthCardModal";

interface IdCardModalProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IdCardModal({ survey, open, onOpenChange }: IdCardModalProps) {
  return <YouthCardModal survey={survey} open={open} onOpenChange={onOpenChange} variant="id" />;
}
