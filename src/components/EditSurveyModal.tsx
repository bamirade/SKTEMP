import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import type { Survey } from "@shared/schema";
import { SEX_OPTIONS, CIVIL_STATUS_OPTIONS, WORK_STATUS_OPTIONS, YOUTH_CLASSIFICATION_OPTIONS, EDUCATION_OPTIONS, KK_ASSEMBLY_FREQUENCY_OPTIONS, KK_ASSEMBLY_REASON_NO_OPTIONS, LOCATION_OPTIONS, SPECIAL_NEEDS_TYPE_OPTIONS } from "@shared/schema";
import { useUpdateSurvey } from "@/hooks/use-surveys";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface EditSurveyModalProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function EditSurveyModal({ survey, open, onOpenChange, onUpdated }: EditSurveyModalProps) {
  const updateSurvey = useUpdateSurvey();
  const { toast } = useToast();
  const [birthdateError, setBirthdateError] = useState<string | null>(null);

  const form = useForm<Partial<Survey>>({
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      suffix: "",
      birthdate: "",
      email: "",
      contactNumber: "",
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
      location: "Purok 1",
      otherLocation: "",
      specialNeedsType: "",
    }
  });

  useEffect(() => {
    if (survey) {
      form.reset({
        firstName: survey.firstName ?? "",
        lastName: survey.lastName ?? "",
        middleName: survey.middleName ?? "",
        suffix: survey.suffix ?? "",
        birthdate: survey.birthdate ?? "",
        email: survey.email ?? "",
        contactNumber: survey.contactNumber ?? "",
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
        location: survey.location ?? "Purok 1",
        otherLocation: survey.otherLocation ?? "",
        specialNeedsType: survey.specialNeedsType ?? "",
      });
      setBirthdateError(null);
    }
  }, [survey, form]);

  // Auto-calculate age from birthdate
  const birthdate = form.watch("birthdate");
  useEffect(() => {
    if (birthdate) {
      const today = new Date();
      const birthDate = new Date(birthdate);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }

      // Validate age is within range
      if (calculatedAge >= 14 && calculatedAge <= 30) {
        form.setValue("age", calculatedAge);
        setBirthdateError(null);
      } else if (calculatedAge < 14) {
        form.setValue("age", undefined);
        setBirthdateError("You must be at least 14 years old to participate.");
      } else {
        form.setValue("age", undefined);
        setBirthdateError("This survey is for youth aged 14-30 years old.");
      }
    } else {
      form.setValue("age", undefined);
      setBirthdateError(null);
    }
  }, [birthdate, form]);

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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">Edit Survey Record</DialogTitle>
          <p className="text-sm text-slate-500 mt-1">Update the youth survey information below</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6 pb-6">
              {/* Personal Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200"
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded"></span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">
                          First Name <span className="text-red-500">*</span>
                        </FormLabel>
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
                            className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                            placeholder="John"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">
                          Last Name <span className="text-red-500">*</span>
                        </FormLabel>
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
                            className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                            placeholder="Doe"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Middle Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            minLength={2}
                            maxLength={50}
                            pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]+"
                            title="Middle name should be 2-50 characters; letters, spaces, hyphens and apostrophes only."
                            onBlur={(e: any) => {
                              const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                              if (v !== e.target.value) e.target.value = v;
                              field.onChange(v);
                              field.onBlur?.();
                            }}
                            className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                            placeholder="Joseph"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="suffix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Suffix</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Jr, Sr, III"
                            maxLength={20}
                            title="Suffix should be 0-20 characters."
                            onBlur={(e: any) => {
                              const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                              if (v !== e.target.value) e.target.value = v;
                              field.onChange(v);
                              field.onBlur?.();
                            }}
                            className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>

              {/* Contact & Birthdate Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200"
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-green-500 rounded"></span>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birthdate"
                    render={({ field }) => {
                      const today = new Date();
                      const maxDate = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
                      const minDate = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
                      const maxDateStr = maxDate.toISOString().split('T')[0];
                      const minDateStr = minDate.toISOString().split('T')[0];

                      return (
                        <FormItem>
                          <FormLabel className="font-medium text-slate-700">Birthdate</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              min={minDateStr}
                              max={maxDateStr}
                              className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                            />
                          </FormControl>
                          {birthdateError && (
                            <div className="text-sm font-medium text-red-500 mt-1.5 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4" />
                              {birthdateError}
                            </div>
                          )}
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">
                          Age <span className="text-slate-500 font-normal">(Auto-calculated)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ''}
                            readOnly
                            className="h-10 rounded-md bg-slate-100 text-slate-600 font-semibold cursor-not-allowed border-slate-300"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                            maxLength={100}
                            onBlur={(e: any) => {
                              const v = String(e.target.value || "").trim().toLowerCase();
                              if (v !== e.target.value) e.target.value = v;
                              field.onChange(v);
                              field.onBlur?.();
                            }}
                            className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+63 9XX XXX XXXX"
                            {...field}
                            maxLength={20}
                            onBlur={(e: any) => {
                              const v = String(e.target.value || "").trim();
                              if (v !== e.target.value) e.target.value = v;
                              field.onChange(v);
                              field.onBlur?.();
                            }}
                            className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>

              {/* Location & Demographics */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200"
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-purple-500 rounded"></span>
                  Location & Demographics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Location/Purok</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                            <SelectTrigger className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {LOCATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Sex</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                            <SelectTrigger className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                              <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                            <SelectContent>
                              {SEX_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Conditional otherLocation */}
                {form.watch("location") === "Others (Outside Rizal)" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-slate-300"
                  >
                    <FormField
                      control={form.control}
                      name="otherLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-slate-700">Please Specify Your Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your specific location"
                              {...field}
                              maxLength={100}
                              autoFocus
                              onBlur={(e: any) => {
                                const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                                if (v !== e.target.value) e.target.value = v;
                                field.onChange(v);
                                field.onBlur?.();
                              }}
                              className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </motion.div>

              {/* Education & Status Classification */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200"
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-amber-500 rounded"></span>
                  Education & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="educationalBackground"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Educational Background</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                            <SelectTrigger className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                              <SelectValue placeholder="Select education" />
                            </SelectTrigger>
                            <SelectContent>
                              {EDUCATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="civilStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Civil Status</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                            <SelectTrigger className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {CIVIL_STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="youthClassification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Youth Classification</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                            <SelectTrigger className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                              <SelectValue placeholder="Select classification" />
                            </SelectTrigger>
                            <SelectContent>
                              {YOUTH_CLASSIFICATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">Work Status</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                            <SelectTrigger className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                              <SelectValue placeholder="Select work status" />
                            </SelectTrigger>
                            <SelectContent>
                              {WORK_STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="youthAgeGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700">
                          Youth Age Group <span className="text-slate-500 font-normal">(Auto-calculated)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="h-10 rounded-md bg-slate-100 text-slate-600 font-semibold cursor-not-allowed border-slate-300"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Conditional Special Needs Type */}
                {form.watch("youthClassification") === "Youth with Special Needs" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-slate-300"
                  >
                    <FormField
                      control={form.control}
                      name="specialNeedsType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-slate-700">Type of Special Needs</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                              <SelectTrigger className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {SPECIAL_NEEDS_TYPE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </motion.div>

              {/* Voter & Participation Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200"
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded"></span>
                  Voter Status & Participation
                </h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="registeredSkVoter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 rounded-lg border border-slate-200 p-3.5 hover:bg-slate-100 transition-colors cursor-pointer">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            className="h-5 w-5 rounded"
                          />
                        </FormControl>
                        <FormLabel className="text-slate-700 font-medium cursor-pointer">Registered SK Voter</FormLabel>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registeredNationalVoter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 rounded-lg border border-slate-200 p-3.5 hover:bg-slate-100 transition-colors cursor-pointer">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            className="h-5 w-5 rounded"
                          />
                        </FormControl>
                        <FormLabel className="text-slate-700 font-medium cursor-pointer">Registered National Voter</FormLabel>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="votedLastElection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 rounded-lg border border-slate-200 p-3.5 hover:bg-slate-100 transition-colors cursor-pointer">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            className="h-5 w-5 rounded"
                          />
                        </FormControl>
                        <FormLabel className="text-slate-700 font-medium cursor-pointer">Voted in Last Election</FormLabel>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="attendedKkAssembly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 rounded-lg border border-slate-200 p-3.5 hover:bg-slate-100 transition-colors cursor-pointer">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            className="h-5 w-5 rounded"
                          />
                        </FormControl>
                        <FormLabel className="text-slate-700 font-medium cursor-pointer">Attended KK Assembly</FormLabel>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* KK Assembly Follow-up Questions */}
                  {form.watch("attendedKkAssembly") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-slate-300"
                    >
                      <FormField
                        control={form.control}
                        name="kkAssemblyFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-slate-700">How many times did you attend?</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                <SelectTrigger className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  {KK_ASSEMBLY_FREQUENCY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {form.watch("attendedKkAssembly") === false && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-slate-300"
                    >
                      <FormField
                        control={form.control}
                        name="kkAssemblyReasonNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-slate-700">Why didn't you attend?</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                <SelectTrigger className="h-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                                  <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  {KK_ASSEMBLY_REASON_NO_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </form>
        </Form>

        {/* Footer with Actions */}
        <div className="flex-shrink-0 flex justify-between items-center gap-3 pt-4 border-t border-slate-200 mt-2">
          <p className="text-xs text-slate-500">
            {updateSurvey.isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Saving your changes...
              </span>
            ) : (
              "Changes are saved to the database"
            )}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateSurvey.isPending}
              className="h-10 px-4 rounded-md text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={updateSurvey.isPending}
              className="h-10 px-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors"
            >
              {updateSurvey.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
