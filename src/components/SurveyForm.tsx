import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSurveySchema, CIVIL_STATUS_OPTIONS, EDUCATION_OPTIONS, YOUTH_CLASSIFICATION_OPTIONS, WORK_STATUS_OPTIONS, SEX_OPTIONS, KK_ASSEMBLY_FREQUENCY_OPTIONS, KK_ASSEMBLY_REASON_NO_OPTIONS, LOCATION_OPTIONS, SPECIAL_NEEDS_TYPE_OPTIONS } from "@shared/schema";
import type { CreateSurveyInput } from "@shared/routes";
import { useCreateSurvey } from "@/hooks/use-surveys";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, RotateCcw, Shield, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function SurveyForm() {
  const { toast } = useToast();
  const createSurvey = useCreateSurvey();
  const [isSuccess, setIsSuccess] = useState(false);
  const [birthdateError, setBirthdateError] = useState<string | null>(null);
  const [confirmInfoAccuracy, setConfirmInfoAccuracy] = useState(false);
  const [acceptDataPrivacy, setAcceptDataPrivacy] = useState(false);

  const form = useForm<CreateSurveyInput>({
    resolver: zodResolver(insertSurveySchema),
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
      location: "Purok 1",
      otherLocation: "",
      youthAgeGroup: "Child Youth",
      registeredSkVoter: false,
      registeredNationalVoter: false,
      votedLastElection: false,
      attendedKkAssembly: false,
      kkAssemblyFrequency: undefined,
      kkAssemblyReasonNo: undefined,
      civilStatus: "Single",
      sex: "Male",
      educationalBackground: "High School Level",
      youthClassification: "In School Youth",
      specialNeedsType: "",
      workStatus: "Student",
    },
  });

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

  // Auto-calculate Youth Age Group
  const age = form.watch("age");
  useEffect(() => {
    if (age !== undefined) {
      let group = "";
      if (age <= 17) group = "Child Youth";
      else if (age >= 18 && age <= 24) group = "Core Youth";
      else if (age >= 25 && age <= 30) group = "Young Adult";
      else group = "Young Adult"; // Fallback or handle > 30 appropriately if needed

      form.setValue("youthAgeGroup", group);
    }
  }, [age, form]);

  const onSubmit = async (data: CreateSurveyInput) => {
    if (!confirmInfoAccuracy || !acceptDataPrivacy) {
      toast({
        title: "Error",
        description: "Please confirm both agreements to proceed.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSurvey.mutateAsync(data);

      setIsSuccess(true);
      toast({
        title: "Survey Submitted!",
        description: "Thank you for participating in the Youth Profile survey.",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    form.reset();
    setIsSuccess(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isSuccess) {
    return (
      <Card className="max-w-xl mx-auto border-none shadow-2xl shadow-primary/10 mt-10">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-500 max-w-md mb-8">
            Your youth profile has been successfully recorded in our system. Your participation helps us build a better community.
          </p>
          <Button onClick={handleReset} size="lg" className="gap-2 bg-primary hover:bg-primary/90 rounded-xl">
            <RotateCcw className="w-4 h-4" />
            Submit Another Response
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto border-slate-200/60 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 border-b border-slate-100 pb-6 bg-slate-50/50 rounded-t-xl">
        <CardTitle className="text-2xl text-primary">Youth Profile Survey</CardTitle>
        <CardDescription>
          Please complete this form accurately. This information is used for youth development planning.
        </CardDescription>
        <p className="text-xs text-slate-500 pt-2">
          Fields marked with <span className="text-red-500">*</span> are required
        </p>
      </CardHeader>
      <CardContent className="pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Section */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          autoFocus
                          required
                          minLength={2}
                          maxLength={50}
                          pattern="[A-Za-zÀ-ÖØ-öø-ÿ' \-]+"
                          title="First name should be 2-50 characters; letters, spaces, hyphens and apostrophes only."
                          onBlur={(e: any) => {
                            const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                            if (v !== e.target.value) e.target.value = v;
                            field.onChange(v);
                            field.onBlur?.();
                          }}
                          className="h-11 rounded-lg"
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
                      <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          required
                          minLength={2}
                          maxLength={50}
                          pattern="[A-Za-zÀ-ÖØ-öø-ÿ' \-]+"
                          title="Last name should be 2-50 characters; letters, spaces, hyphens and apostrophes only."
                          onBlur={(e: any) => {
                            const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                            if (v !== e.target.value) e.target.value = v;
                            field.onChange(v);
                            field.onBlur?.();
                          }}
                          className="h-11 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your middle name"
                          {...field}
                          required
                          minLength={2}
                          maxLength={50}
                          pattern="[A-Za-zÀ-ÖØ-öø-ÿ' \-]+"
                          title="Middle name should be 2-50 characters; letters, spaces, hyphens and apostrophes only."
                          onBlur={(e: any) => {
                            const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                            if (v !== e.target.value) e.target.value = v;
                            field.onChange(v);
                            field.onBlur?.();
                          }}
                          className="h-11 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="suffix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suffix <span className="text-slate-400 text-xs font-normal">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Jr, Sr, III"
                          {...field}
                          maxLength={20}
                          title="Suffix should be 0-20 characters; letters, numbers, spaces, periods and hyphens only."
                          onBlur={(e: any) => {
                            const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                            if (v !== e.target.value) e.target.value = v;
                            field.onChange(v);
                            field.onBlur?.();
                          }}
                          className="h-11 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personal Details */}
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
                        <FormLabel>Birthdate <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            required
                            min={minDateStr}
                            max={maxDateStr}
                            className="h-11 rounded-lg"
                          />
                        </FormControl>
                        {birthdateError && (
                          <p className="text-sm font-medium text-red-500 mt-1">{birthdateError}</p>
                        )}
                        <FormDescription className="text-xs">Must be between 14-30 years old</FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sex Assigned by Birth <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEX_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Information */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address <span className="text-slate-400 text-xs font-normal">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                          maxLength={100}
                          title="Please enter a valid email address."
                          onBlur={(e: any) => {
                            const v = String(e.target.value || "").trim().toLowerCase();
                            if (v !== e.target.value) e.target.value = v;
                            field.onChange(v);
                            field.onBlur?.();
                          }}
                          className="h-11 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number <span className="text-slate-400 text-xs font-normal">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+63 9XX XXX XXXX"
                          {...field}
                          maxLength={20}
                          title="Please enter a valid contact number."
                          onBlur={(e: any) => {
                            const v = String(e.target.value || "").trim();
                            if (v !== e.target.value) e.target.value = v;
                            field.onChange(v);
                            field.onBlur?.();
                          }}
                          className="h-11 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location & Age */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location/Purok <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LOCATION_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Age"
                          {...field}
                          value={field.value || ''}
                          readOnly
                          className="h-11 rounded-lg bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">Calculated from birthdate</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("location") === "Others (Outside Rizal)" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="col-span-1 md:col-span-2"
                  >
                    <FormField
                      control={form.control}
                      name="otherLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please Specify Your Location <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your specific location"
                              {...field}
                              maxLength={100}
                              required
                              autoFocus
                              onBlur={(e: any) => {
                                const v = String(e.target.value || "").replace(/\s+/g, " ").trim();
                                if (v !== e.target.value) e.target.value = v;
                                field.onChange(v);
                                field.onBlur?.();
                              }}
                              className="h-11 rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                <FormField
                  control={form.control}
                  name="youthAgeGroup"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Youth Age Group</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-slate-50 h-11 rounded-lg text-slate-700 font-medium cursor-not-allowed" />
                      </FormControl>
                      <FormDescription className="text-xs">14-17: Child Youth • 18-24: Core Youth • 25-30: Young Adult</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Classification & Work */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">2</span>
                Classification & Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Education & Civil Status */}
                <FormField
                  control={form.control}
                  name="educationalBackground"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Educational Background <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select education" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EDUCATION_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="civilStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Civil Status <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CIVIL_STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Youth & Work Status */}
                <FormField
                  control={form.control}
                  name="youthClassification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Youth Classification <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select classification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {YOUTH_CLASSIFICATION_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Status <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select work status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WORK_STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional Special Needs Type */}
                {form.watch("youthClassification") === "Youth with Special Needs" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="col-span-1 md:col-span-2"
                  >
                    <FormField
                      control={form.control}
                      name="specialNeedsType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Needs Type <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-lg">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SPECIAL_NEEDS_TYPE_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Voter Status & Participation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
                Participation & Registration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="registeredSkVoter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm hover:bg-slate-50 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Registered SK Voter
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registeredNationalVoter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm hover:bg-slate-50 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Registered National Voter
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="votedLastElection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm hover:bg-slate-50 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Voted Last Election
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attendedKkAssembly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm hover:bg-slate-50 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Attended KK Assembly
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional fields for KK Assembly */}
              {form.watch("attendedKkAssembly") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t border-slate-100"
                >
                  <FormField
                    control={form.control}
                    name="kkAssemblyFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">How many times did you attend? <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-lg">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {KK_ASSEMBLY_FREQUENCY_OPTIONS.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
                  className="mt-6 pt-6 border-t border-slate-100"
                >
                  <FormField
                    control={form.control}
                    name="kkAssemblyReasonNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Why didn't you attend? <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-lg">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {KK_ASSEMBLY_REASON_NO_OPTIONS.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Confirmation Section */}
            <div className="space-y-5 bg-gradient-to-br from-red-50/50 to-orange-50/30 rounded-xl p-6 border border-red-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">4</span>
                  <h3 className="text-lg font-semibold text-slate-800">Confirmation & Consent</h3>
                </div>
                <p className="text-sm text-slate-600 ml-10">Please confirm both statements before submitting your survey response</p>
              </div>

              <div className="space-y-3 pt-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`flex gap-4 rounded-lg border-2 p-4 transition-all duration-300 ${
                    confirmInfoAccuracy
                      ? "border-green-300 bg-green-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Checkbox
                    id="confirm-accuracy"
                    checked={confirmInfoAccuracy}
                    onCheckedChange={(checked) => setConfirmInfoAccuracy(checked === true)}
                    className="data-[state=checked]:bg-green-600 border-slate-300 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <label htmlFor="confirm-accuracy" className="text-sm font-semibold text-slate-900 cursor-pointer block">
                      I confirm information accuracy
                    </label>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      I confirm that all the information I provided in this survey is accurate and true to the best of my knowledge.
                    </p>
                  </div>
                  {confirmInfoAccuracy && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="flex-shrink-0 pt-1"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`flex gap-4 rounded-lg border-2 p-4 transition-all duration-300 ${
                    acceptDataPrivacy
                      ? "border-blue-300 bg-blue-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Checkbox
                    id="accept-privacy"
                    checked={acceptDataPrivacy}
                    onCheckedChange={(checked) => setAcceptDataPrivacy(checked === true)}
                    className="data-[state=checked]:bg-blue-600 border-slate-300 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <label htmlFor="accept-privacy" className="text-sm font-semibold text-slate-900 cursor-pointer flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      I accept Data Privacy Act of 2012
                    </label>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      I acknowledge that my personal data will be processed in accordance with the{" "}
                      <a
                        href="https://www.officialgazette.gov.ph/2012/08/15/republic-act-no-10173/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                      >
                        RA 10173
                      </a>
                      {" "}and consent to the collection and use of my information for youth development planning and survey purposes.
                    </p>
                  </div>
                  {acceptDataPrivacy && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="flex-shrink-0 pt-1"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {!confirmInfoAccuracy && !acceptDataPrivacy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100"
                >
                  Please confirm both statements to proceed with your submission.
                </motion.div>
              )}

              {confirmInfoAccuracy && acceptDataPrivacy && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs text-green-700 font-medium bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  All confirmations complete! You're ready to submit.
                </motion.div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-indigo-700 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createSurvey.isPending || !!birthdateError || !confirmInfoAccuracy || !acceptDataPrivacy}
            >
              {createSurvey.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Profile"
              )}
            </Button>
            {birthdateError && (
              <p className="text-sm text-red-500 text-center mt-2">
                Please correct the errors above before submitting.
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
