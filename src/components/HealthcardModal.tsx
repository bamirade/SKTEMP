import type { Survey } from "@shared/schema";
import { YouthCardModal } from "@/components/YouthCardModal";

interface HealthcardModalProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HealthcardModal({ survey, open, onOpenChange }: HealthcardModalProps) {
  return (
    <YouthCardModal
      survey={survey}
      open={open}
      onOpenChange={onOpenChange}
      variant="health"
    />
  );
}
