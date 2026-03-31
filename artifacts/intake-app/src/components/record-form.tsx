import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lookupByMobile } from "@workspace/api-client-react";
import { format } from "date-fns";
import { User, Printer, Wrench, CreditCard, Clock, Save, RotateCcw } from "lucide-react";

export const recordFormSchema = z.object({
  title: z.string().optional().nullable(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Must be exactly 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  customerType: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  printerMake: z.string().optional().nullable(),
  printerModel: z.string().optional().nullable(),
  cartridgeTonerType: z.string().optional().nullable(),
  serviceType: z.string().min(1, "Service type is required"),
  deviceSerialNumber: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  remark: z.string().optional().nullable(),
  serviceDate: z.string().min(1, "Service date is required"),
  serviceTime: z.string().min(1, "Service time is required"),
}).superRefine((data, ctx) => {
  if (data.serviceType === "Computer/Laptop Repair" && (!data.deviceSerialNumber || data.deviceSerialNumber.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Device Serial Number is required for Computer/Laptop Repair",
      path: ["deviceSerialNumber"],
    });
  }
});

export type RecordFormValues = z.infer<typeof recordFormSchema>;

export const TITLES = ["Mr", "Miss", "Ms", "Mrs"];
export const CUSTOMER_TYPES = ["Home user", "Office user", "Business user"];
export const PRINTER_MAKES = ["HP", "Canon", "Epson", "Brother", "Samsung", "Other"];
export const SERVICE_TYPES = [
  "Photo Copy", "Ink Refill", "Toner Refill", "Printouts", 
  "Scanning", "Lamination", "Computer/Laptop Repair", "Printer Repair"
];
export const PAYMENT_METHODS = ["Cash", "UPI", "Card"];

interface RecordFormProps {
  initialValues?: Partial<RecordFormValues>;
  onSubmit: (data: RecordFormValues) => void;
  isSubmitting?: boolean;
}

export function RecordForm({ initialValues, onSubmit, isSubmitting }: RecordFormProps) {
  const { toast } = useToast();
  
  const defaultDate = format(new Date(), "yyyy-MM-dd");
  const defaultTime = format(new Date(), "HH:mm");

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      mobileNumber: "",
      email: "",
      customerType: "",
      address: "",
      printerMake: "",
      printerModel: "",
      cartridgeTonerType: "",
      serviceType: "",
      deviceSerialNumber: "",
      paymentMethod: "",
      notes: "",
      serviceDate: defaultDate,
      serviceTime: defaultTime,
      ...initialValues,
    },
  });

  const watchServiceType = form.watch("serviceType");
  const watchMobile = form.watch("mobileNumber");

  useEffect(() => {
    const handleLookup = async () => {
      if (watchMobile?.length === 10) {
        try {
          const record = await lookupByMobile({ mobile: watchMobile });
          if (record) {
            form.setValue("title", record.title || "");
            form.setValue("firstName", record.firstName);
            form.setValue("lastName", record.lastName);
            form.setValue("email", record.email || "");
            form.setValue("customerType", record.customerType || "");
            form.setValue("address", record.address || "");
            toast({
              title: "Customer Info Loaded",
              description: "Previous customer details have been auto-filled.",
            });
          }
        } catch (error) {
          // Ignore 404s, it just means no existing customer
        }
      }
    };
    
    // Only lookup if it's a new record creation (no initial id implying an edit)
    if (!initialValues?.firstName) {
      handleLookup();
    }
  }, [watchMobile, toast, form, initialValues]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Details */}
        <Card className="shadow-sm border-border">
          <CardHeader className="bg-muted/50 pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Select value={form.watch("title") || ""} onValueChange={(v) => form.setValue("title", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {TITLES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input {...form.register("firstName")} />
                {form.formState.errors.firstName && <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Last Name <span className="text-destructive">*</span></Label>
                <Input {...form.register("lastName")} />
                {form.formState.errors.lastName && <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mobile Number <span className="text-destructive">*</span></Label>
                <Input {...form.register("mobileNumber")} maxLength={10} placeholder="10 digits" />
                {form.formState.errors.mobileNumber && <p className="text-xs text-destructive">{form.formState.errors.mobileNumber.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Customer Type</Label>
              <Select value={form.watch("customerType") || ""} onValueChange={(v) => form.setValue("customerType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea {...form.register("address")} rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Service Details */}
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/50 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Service Type <span className="text-destructive">*</span></Label>
                <Select value={form.watch("serviceType") || ""} onValueChange={(v) => form.setValue("serviceType", v)}>
                  <SelectTrigger className={form.formState.errors.serviceType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select service required..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.formState.errors.serviceType && <p className="text-xs text-destructive">{form.formState.errors.serviceType.message}</p>}
              </div>

              {watchServiceType === "Computer/Laptop Repair" && (
                <div className="space-y-2 p-4 bg-muted rounded-md border border-border animate-in fade-in slide-in-from-top-4">
                  <Label>Device Serial Number <span className="text-destructive">*</span></Label>
                  <Input {...form.register("deviceSerialNumber")} placeholder="Enter serial number" />
                  {form.formState.errors.deviceSerialNumber && <p className="text-xs text-destructive">{form.formState.errors.deviceSerialNumber.message}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Printer Details */}
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/50 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Printer className="w-5 h-5 text-primary" />
                Device/Printer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Make</Label>
                  <Select value={form.watch("printerMake") || ""} onValueChange={(v) => form.setValue("printerMake", v)}>
                    <SelectTrigger><SelectValue placeholder="Select make..." /></SelectTrigger>
                    <SelectContent>
                      {PRINTER_MAKES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input {...form.register("printerModel")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cartridge / Toner Type</Label>
                <Input {...form.register("cartridgeTonerType")} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Details */}
        <Card className="shadow-sm border-border lg:col-span-2">
          <CardHeader className="bg-muted/50 pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Payment & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Method</Label>
                <Select value={form.watch("paymentMethod") || ""} onValueChange={(v) => form.setValue("paymentMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes / Observations</Label>
                <Textarea {...form.register("notes")} rows={4} placeholder="Any specific issues or requests from customer..." />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/30">
                <div className="space-y-2">
                  <Label>Service Date</Label>
                  <Input type="date" {...form.register("serviceDate")} />
                  {form.formState.errors.serviceDate && <p className="text-xs text-destructive">{form.formState.errors.serviceDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Service Time</Label>
                  <Input type="time" {...form.register("serviceTime")} />
                  {form.formState.errors.serviceTime && <p className="text-xs text-destructive">{form.formState.errors.serviceTime.message}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 mt-8 sticky bottom-4 bg-background p-4 border rounded-lg shadow-lg">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => form.reset()}
          disabled={isSubmitting}
          className="w-32"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-48 text-base font-semibold shadow-md"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSubmitting ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </form>
  );
}
