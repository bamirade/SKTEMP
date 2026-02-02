import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import type { Survey } from "@shared/schema";
import { SEX_OPTIONS, CIVIL_STATUS_OPTIONS, WORK_STATUS_OPTIONS, YOUTH_CLASSIFICATION_OPTIONS } from "@shared/schema";
import { useUpdateSurvey } from "@/hooks/use-surveys";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EditSurveyModalProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function EditSurveyModal({ survey, open, onOpenChange, onUpdated }: EditSurveyModalProps) {
  const updateSurvey = useUpdateSurvey();
  const { toast } = useToast();

  const form = useForm<Partial<Survey>>({
    defaultValues: {
      name: "",
      age: undefined,
      sex: "Male",
      civilStatus: "Single",
      youthClassification: "In School Youth",
      workStatus: "Unemployed",
    }
  });

  useEffect(() => {
    if (survey) {
      form.reset({
        name: survey.name ?? "",
        age: survey.age ?? undefined,
        sex: survey.sex ?? "Male",
        civilStatus: survey.civilStatus ?? "Single",
        youthClassification: survey.youthClassification ?? "In School Youth",
        workStatus: survey.workStatus ?? "Unemployed",
      });
    }
  }, [survey]);

  // auto-calc youth age group (watch only `age` to avoid recursive updates)
  const watchedAge = form.watch("age");
  useEffect(() => {
    const age = watchedAge as number | undefined;
    if (age !== undefined && age !== null) {
      let group = "Young Adult";
      if (age <= 17) group = "Child Youth";
      else if (age >= 18 && age <= 24) group = "Core Youth";
      else if (age >= 25 && age <= 30) group = "Young Adult";
      form.setValue("youthAgeGroup" as any, group);
    }
  }, [watchedAge, form]);

  const onSubmit = async (values: Partial<Survey>) => {
    if (!survey) return;
    if (!values.name || values.name.trim() === "") {
      toast({ title: "Error", description: "Name cannot be empty.", variant: "destructive" });
      return;
    }

    try {
      await updateSurvey.mutateAsync({ id: survey.id as number, data: values as any });
      toast({ title: "Updated", description: "Survey record updated successfully." });
      onUpdated?.();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message ?? "Failed to update record.", variant: "destructive" });
    }
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Survey</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 rounded-md" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} className="h-10 rounded-md" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Select sex" /></SelectTrigger>
                        <SelectContent>
                          {SEX_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="civilStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          {CIVIL_STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="youthClassification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classification</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Select classification" /></SelectTrigger>
                        <SelectContent>
                          {YOUTH_CLASSIFICATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Select work status" /></SelectTrigger>
                        <SelectContent>
                          {WORK_STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary" disabled={updateSurvey.isPending}>
                {updateSurvey.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
