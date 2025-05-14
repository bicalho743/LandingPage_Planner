import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LandingPage from "@/pages/LandingPage";
import Planos from "@/pages/Planos";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

// Importação lazy para páginas de checkout
const Checkout = lazy(() => import("@/pages/checkout"));
const Sucesso = lazy(() => import("@/pages/sucesso"));
const Cancelado = lazy(() => import("@/pages/cancelado"));
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Registro = lazy(() => import("@/pages/registro"));

// Componente de loading para Suspense
const PageLoading = () => (
  <div className="h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/" component={LandingPage}/>
        <Route path="/home" component={Home}/>
        <Route path="/planos" component={Planos}/>
        <Route path="/registro" component={Registro}/>
        <Route path="/checkout" component={Checkout}/>
        <Route path="/sucesso" component={Sucesso}/>
        <Route path="/cancelado" component={Cancelado}/>
        <Route path="/login" component={Login}/>
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
