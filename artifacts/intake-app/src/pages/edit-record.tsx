import { Layout } from "@/components/layout";
import { RecordForm, RecordFormValues } from "@/components/record-form";
import { useGetRecord, useUpdateRecord, getGetRecordQueryKey, getGetRecordsQueryKey, getGetAnalyticsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function EditRecordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const queryClient = useQueryClient();
  
  const { data: record, isLoading, isError } = useGetRecord(id, {
    query: {
      enabled: !!id,
      queryKey: getGetRecordQueryKey(id)
    }
  });

  const updateRecord = useUpdateRecord({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Updated",
          description: "Intake record has been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: getGetRecordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecordQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetAnalyticsQueryKey() });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to update record. " + (error.message || ""),
          variant: "destructive",
        });
      }
    }
  });

  const handleSubmit = async (data: RecordFormValues) => {
    await updateRecord.mutateAsync({ id, data });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !record) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Record Not Found</h2>
          <p className="text-muted-foreground mb-6">The intake record you are looking for does not exist or could not be loaded.</p>
          <Link href="/dashboard" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Edit Record #{record.id}</h2>
          </div>
          <p className="text-muted-foreground ml-9">Update details for {record.firstName} {record.lastName}</p>
        </div>
      </div>
      
      <RecordForm 
        initialValues={record}
        onSubmit={handleSubmit} 
        isSubmitting={updateRecord.isPending} 
      />
    </Layout>
  );
}
