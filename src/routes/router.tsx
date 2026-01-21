import { PageLayout } from "@/components/templates/page-layout";
import { Effects } from "@/pages/effects";
import { Home } from "@/pages/home";
import { Tones } from "@/pages/tones";
import { createBrowserRouter } from "react-router";
import { routes } from "./routes";

export const router = createBrowserRouter([
  {
    path: routes.ROOT,
    element: <PageLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: routes.TONES,
        element: <Tones />,
      },
      {
        path: routes.EFFECTS,
        element: <Effects />,
      },
    ],
  },
  {
    path: routes.SIGN_IN,
    element: <div>Sign In Page</div>,
  },
  {
    path: routes.SIGN_UP,
    element: <div>Sign Up Page</div>,
  },
  {
    path: "*",
    element: <div>404 Not Found</div>,
  },
]);
