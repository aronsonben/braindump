import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BrainDump from "@/pages/brain-dump";
import Backlog from "@/pages/backlog";
import Categories from "@/pages/categories";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/brain-dump" component={BrainDump} />
      <Route path="/backlog" component={Backlog} />
      <Route path="/categories" component={Categories} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;