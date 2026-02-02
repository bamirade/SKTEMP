import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSurveySchema, CIVIL_STATUS_OPTIONS, EDUCATION_OPTIONS, YOUTH_CLASSIFICATION_OPTIONS, WORK_STATUS_OPTIONS, SEX_OPTIONS } from "@shared/schema";
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
import { Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export function SurveyForm() {
  const { toast } = useToast();
  const createSurvey = useCreateSurvey();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<CreateSurveyInput>({
    resolver: zodResolver(insertSurveySchema),
    defaultValues: {
      name: "",
      age: undefined,
      youthAgeGroup: "Child Youth",
      registeredSkVoter: false,
      registeredNationalVoter: false,
      votedLastElection: false,
      attendedKkAssembly: false,
      civilStatus: "Single",
      sex: "Male",
      educationalBackground: "High School Level",
      youthClassification: "In School Youth",
      workStatus: "Unemployed",
    },
  });

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
    try {
      await createSurvey.mutateAsync(data);

      // Save to localStorage
      const recentSurveys = JSON.parse(localStorage.getItem("recent_surveys") || "[]");
      localStorage.setItem("recent_surveys", JSON.stringify([data, ...recentSurveys].slice(0, 10)));

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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name, Last Name" {...field} className="h-11 rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex. 18"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-11 rounded-lg"
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

                <FormField
                  control={form.control}
                  name="civilStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Civil Status</FormLabel>
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

                <FormField
                  control={form.control}
                  name="youthAgeGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Youth Age Group</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-slate-50 h-11 rounded-lg text-slate-500 font-medium" />
                      </FormControl>
                      <FormDescription>Automatically calculated based on age.</FormDescription>
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
                <FormField
                  control={form.control}
                  name="educationalBackground"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Educational Background</FormLabel>
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
                  name="youthClassification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Youth Classification</FormLabel>
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
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Work Status</FormLabel>
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
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-indigo-700 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              disabled={createSurvey.isPending}
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
