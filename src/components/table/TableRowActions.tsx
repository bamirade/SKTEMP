/**
 * Table row actions component
 * Handles delete, edit, view ID card, and view health card actions
 */

import { useState } from "react";
import type { Survey } from "@/shared/schema";
import { Loader2, Trash2, Edit3, Heart, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface TableRowActionsProps {
  survey: Survey;
  onDelete: (id: number) => Promise<void>;
  onEdit: (survey: Survey) => void;
  onViewIdCard: (survey: Survey) => void;
  onViewHealthCard: (survey: Survey) => void;
}

export function TableRowActions({
  survey,
  onDelete,
  onEdit,
  onViewIdCard,
  onViewHealthCard,
}: TableRowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(survey.id!);
      toast({
        title: "Record Deleted",
        description: `${survey.firstName} ${survey.lastName}'s record has been permanently removed.`,
      });
      setShowDeleteDialog(false);
    } catch {
      toast({
        title: "Deletion Failed",
        description: `Could not delete ${survey.firstName} ${survey.lastName}'s record. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onViewIdCard(survey)}
            title="View ID Card"
          >
            <CreditCard className="h-4 w-4 text-blue-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View ID Card</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onViewHealthCard(survey)}
            title="View Health Card"
          >
            <Heart className="h-4 w-4 text-red-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View Health Card</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(survey)}
            title="Edit Record"
          >
            <Edit3 className="h-4 w-4 text-slate-700" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit Record</TooltipContent>
      </Tooltip>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 border-slate-200"
              disabled={isDeleting}
              onClick={() => setShowDeleteDialog(true)}
              title="Delete Record"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Record</TooltipContent>
        </Tooltip>

        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove the survey record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <div className="font-medium text-slate-900">
              You are about to permanently delete:
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              <div className="font-semibold text-slate-900">
                {survey.firstName} {survey.lastName}
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                {survey.age && <div>Age: {survey.age}</div>}
                {survey.sex && <div>Sex: {survey.sex}</div>}
                {survey.location && <div>Location: {survey.location}</div>}
              </div>
            </div>
            <div className="text-red-600 font-medium text-sm">
              ⚠️ This action cannot be undone.
            </div>
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-slate-300 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
