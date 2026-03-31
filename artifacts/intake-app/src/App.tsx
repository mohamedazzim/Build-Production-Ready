import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import IntakeFormPage from "@/pages/intake-form";
import DashboardPage from "@/pages/dashboard";
import EditRecordPage from "@/pages/edit-record";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={IntakeFormPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/edit/:id" component={EditRecordPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
