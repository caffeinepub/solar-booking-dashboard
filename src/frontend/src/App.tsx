import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const DashboardPage = lazy(() => import("./pages/Dashboard"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

function RootErrorComponent({ error }: { error: unknown }) {
  const router = useRouter();
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-sm text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-destructive"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h1 className="text-lg font-display font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={() => router.invalidate()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <Suspense
        fallback={
          <div className="flex flex-col gap-3 p-6">
            <Skeleton className="h-16 w-full" />
          </div>
        }
      >
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-3 p-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}

const rootRoute = createRootRoute({
  errorComponent: RootErrorComponent,
  component: () => (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
