import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import WorldIDAuth from "./pages/WorldIDAuth";
import WorldIDVerification from "./pages/WorldIDVerification";
import Marketplace from "./pages/Marketplace";
import TokenSystem from "./pages/TokenSystem";
import Lottery from "./pages/Lottery";
import Lending from "./pages/Lending";
import Dashboard from "./pages/Dashboard";
import ListProduct from "./pages/ListProduct";
import Tasks from "./pages/Tasks";
import Exchange from "./pages/Exchange";
import Referral from "./pages/Referral";
import ProductDetail from "./pages/ProductDetail";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={WorldIDAuth} />
      <Route path="/verify" component={WorldIDVerification} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/list-product" component={ListProduct} />
      <Route path="/tokens" component={TokenSystem} />
      <Route path="/lottery" component={Lottery} />
      <Route path="/lending" component={Lending} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/exchange" component={Exchange} />
      <Route path="/referral" component={Referral} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
