import { useState } from "react";
import { Layout } from "@/components/layout";
import { 
  useGetRecords, 
  useGetAnalytics, 
  useDeleteRecord,
  getGetRecordsQueryKey,
  getGetAnalyticsQueryKey
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { exportToCSV, exportToExcel, exportToJSON } from "@/lib/export";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { 
  Search, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Calendar,
  Users,
  Activity,
  ArrowUpDown
} from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filters state
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "serviceDate">("latest");
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Delete state
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  // Queries
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalytics({
    query: { queryKey: getGetAnalyticsQueryKey() }
  });

  const recordsParams = {
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy
  };

  const { data: records, isLoading: recordsLoading } = useGetRecords(recordsParams, {
    query: { queryKey: getGetRecordsQueryKey(recordsParams) }
  });

  const deleteRecord = useDeleteRecord({
    mutation: {
      onSuccess: () => {
        toast({ title: "Record deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getGetRecordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAnalyticsQueryKey() });
        setRecordToDelete(null);
      },
      onError: () => {
        toast({ title: "Failed to delete record", variant: "destructive" });
        setRecordToDelete(null);
      }
    }
  });

  const handleDelete = () => {
    if (recordToDelete) {
      deleteRecord.mutate({ id: recordToDelete });
    }
  };

  // Export handlers
  const handleExport = (type: 'csv' | 'excel' | 'json') => {
    if (!records || records.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const exportData = records.map(r => ({
      ID: r.id,
      Date: r.serviceDate,
      Time: r.serviceTime,
      Customer: `${r.firstName} ${r.lastName}`,
      Mobile: r.mobileNumber,
      Service: r.serviceType,
      Make: r.printerMake || '-',
      Model: r.printerModel || '-',
      Payment: r.paymentMethod || '-'
    }));

    const filename = `InkCraft_Records_${format(new Date(), "yyyy-MM-dd")}`;

    if (type === 'csv') exportToCSV(exportData, filename);
    if (type === 'excel') exportToExcel(exportData, filename);
    if (type === 'json') exportToJSON(exportData, filename);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        
        {/* Analytics Header */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Entries</CardTitle>
                <Calendar className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold text-primary">{analytics?.todayCount || 0}</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold">{analytics?.weekCount || 0}</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold">{analytics?.monthCount || 0}</div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50 border-secondary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Service</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? <Skeleton className="h-8 w-full" /> : (
                  <div className="text-xl font-semibold truncate" title={analytics?.mostCommonService || "None"}>
                    {analytics?.mostCommonService || "None"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Table Section */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Intake Records</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, mobile..."
                    className="pl-8 w-[200px] bg-background"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      // Simple debounce
                      setTimeout(() => setDebouncedSearch(e.target.value), 500);
                    }}
                  />
                </div>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[140px] bg-background"
                  title="Date From"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[140px] bg-background"
                  title="Date To"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSortBy(prev => prev === "latest" ? "oldest" : "latest")}
                  title="Toggle Sort Order"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="ml-auto">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                      <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> Excel (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      <FileText className="w-4 h-4 mr-2 text-blue-600" /> CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('json')}>
                      <FileJson className="w-4 h-4 mr-2 text-orange-600" /> JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">ID / Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Device / Printer</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-10 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : records?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No records found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    records?.map((record) => (
                      <TableRow key={record.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-medium">#{record.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(record.serviceDate), "dd MMM yy")}
                            <br/>
                            {record.serviceTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{record.firstName} {record.lastName}</div>
                          <div className="text-sm text-muted-foreground">{record.mobileNumber}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="mb-1">{record.serviceType}</Badge>
                          {record.paymentMethod && <div className="text-xs text-muted-foreground mt-1">Pay: {record.paymentMethod}</div>}
                        </TableCell>
                        <TableCell>
                          {record.printerMake || record.printerModel ? (
                            <div className="text-sm">
                              {record.printerMake} {record.printerModel}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/edit/${record.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Pencil className="w-4 h-4 mr-2" /> Edit Record
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                onClick={() => setRecordToDelete(record.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>

      <AlertDialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the intake record
              #{recordToDelete} from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteRecord.isPending ? "Deleting..." : "Delete Record"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Layout>
  );
}
