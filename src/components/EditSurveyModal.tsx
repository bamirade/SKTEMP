import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import type { Survey } from "@shared/schema";
import { SEX_OPTIONS, CIVIL_STATUS_OPTIONS, WORK_STATUS_OPTIONS, YOUTH_CLASSIFICATION_OPTIONS, EDUCATION_OPTIONS, KK_ASSEMBLY_FREQUENCY_OPTIONS, KK_ASSEMBLY_REASON_NO_OPTIONS } from "@shared/schema";
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
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      age: undefined,
      sex: "Male",
      civilStatus: "Single",
      youthClassification: "In School Youth",
      workStatus: "Student",
      educationalBackground: "High School Level",
      youthAgeGroup: "Child Youth",
      registeredSkVoter: false,
      registeredNationalVoter: false,
      votedLastElection: false,
      attendedKkAssembly: false,
      kkAssemblyFrequency: undefined,
      kkAssemblyReasonNo: undefined,
    }
  });

  useEffect(() => {
    if (survey) {
      form.reset({
        firstName: survey.firstName ?? "",
        lastName: survey.lastName ?? "",
        age: survey.age ?? undefined,
        sex: survey.sex ?? "Male",
        civilStatus: survey.civilStatus ?? "Single",
        youthClassification: survey.youthClassification ?? "In School Youth",
        workStatus: survey.workStatus ?? "Student",
        educationalBackground: survey.educationalBackground ?? "High School Level",
        youthAgeGroup: survey.youthAgeGroup ?? "Child Youth",
        registeredSkVoter: survey.registeredSkVoter ?? false,
        registeredNationalVoter: survey.registeredNationalVoter ?? false,
        votedLastElection: survey.votedLastElection ?? false,
        attendedKkAssembly: survey.attendedKkAssembly ?? false,
        kkAssemblyFrequency: survey.kkAssemblyFrequency ?? undefined,
        kkAssemblyReasonNo: survey.kkAssemblyReasonNo ?? undefined,
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
    if (!values.firstName || values.firstName.trim() === "" || !values.lastName || values.lastName.trim() === "") {
      toast({ title: "Error", description: "First name and last name cannot be empty.", variant: "destructive" });
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required
                        minLength={2}
                        maxLength={50}
                        pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]+"
                        title="First name should be 2-50 characters; letters, spaces, hyphens and apostrophes only."
                        onBlur={(e: any) => {
                          const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                          if (v !== e.target.value) e.target.value = v;
                          field.onChange(v);
                          field.onBlur?.();
                        }}
                        className="h-10 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required
                        minLength={2}
                        maxLength={50}
                        pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]+"
                        title="Last name should be 2-50 characters; letters, spaces, hyphens and apostrophes only."
                        onBlur={(e: any) => {
                          const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                          if (v !== e.target.value) e.target.value = v;
                          field.onChange(v);
                          field.onBlur?.();
                        }}
                        className="h-10 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={14}
                        max={30}
                        step={1}
                        required
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                        }}
                        onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                          const paste = e.clipboardData.getData('text');
                          if (!/^\d+$/.test(paste)) e.preventDefault();
                        }}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        onBlur={(e: any) => {
                          const val = e.target.value;
                          if (val === "") {
                            field.onChange(undefined);
                            field.onBlur?.();
                            return;
                          }
                          let n = Number(val);
                          if (Number.isNaN(n)) {
                            field.onChange(undefined);
                            field.onBlur?.();
                            return;
                          }
                          if (n < 14) n = 14;
                          if (n > 30) n = 30;
                          if (String(n) !== val) e.target.value = String(n);
                          field.onChange(n);
                          field.onBlur?.();
                        }}
                        className="h-10 rounded-md"
                      />
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
                name="educationalBackground"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Educational Background</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Select education" /></SelectTrigger>
                        <SelectContent>
                          {EDUCATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youthClassification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Youth Classification</FormLabel>
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

              <FormField
                control={form.control}
                name="youthAgeGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Youth Age Group</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-slate-50 h-10 rounded-md text-slate-500 font-medium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Voter Status & Participation */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="registeredSkVoter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm hover:bg-slate-50 transition-colors">
                    <FormControl>
                      <input type="checkbox" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} className="accent-indigo-600 h-5 w-5" />
                    </FormControl>
                    <FormLabel>Registered SK Voter</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registeredNationalVoter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm hover:bg-slate-50 transition-colors">
                    <FormControl>
                      <input type="checkbox" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} className="accent-indigo-600 h-5 w-5" />
                    </FormControl>
                    <FormLabel>Registered National Voter</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="votedLastElection"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm hover:bg-slate-50 transition-colors">
                    <FormControl>
                      <input type="checkbox" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} className="accent-indigo-600 h-5 w-5" />
                    </FormControl>
                    <FormLabel>Voted Last Election</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendedKkAssembly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm hover:bg-slate-50 transition-colors">
                    <FormControl>
                      <input type="checkbox" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} className="accent-indigo-600 h-5 w-5" />
                    </FormControl>
                    <FormLabel>Attended KK Assembly</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional fields for KK Assembly */}
              {form.watch("attendedKkAssembly") && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <FormField
                    control={form.control}
                    name="kkAssemblyFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">How many times did you attend?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                          <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Select frequency" /></SelectTrigger>
                          <SelectContent>
                            {KK_ASSEMBLY_FREQUENCY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {form.watch("attendedKkAssembly") === false && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <FormField
                    control={form.control}
                    name="kkAssemblyReasonNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Why didn't you attend?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                          <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Select reason" /></SelectTrigger>
                          <SelectContent>
                            {KK_ASSEMBLY_REASON_NO_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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
