import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useRouter from "@hooks/useRoutes";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Layout from "@components/layout";
import { ToastContainer } from "react-toastify";
import { setupInterceptors } from "@constants/api-instance";
import { useTranslation } from "react-i18next";
import NotFound from "./pages/not-found";
import Statistic from "./statistic";
import AppErrorBoundary from "./components/appErrorBoundary";
import "@/utils/refreshAuth";
import "./index.css";

const queryClient = new QueryClient();

const InterceptorWrapper = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useEffect(() => {
    setupInterceptors(navigate, t);
  }, [navigate]);

  useEffect(() => {
    const currentLang = localStorage.getItem("i18nextLng") || "en";
    document.documentElement.dir = currentLang === "en" ? "ltr" : "rtl";
  }, []);

  return <div>{children}</div>;
};

const App = () => {
  const { privateRoute, publicRoute } = useRouter();

  return (
    // <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <InterceptorWrapper>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Statistic />
          <Routes>
            {publicRoute.map((route, idx) => (
              <Route key={idx} path={route.route} element={route.element} />
            ))}

            <Route element={<Layout />}>
              {privateRoute.map((route, idx) => (
                <Route key={idx} path={route.route} element={route.element} />
              ))}

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </InterceptorWrapper>
      </BrowserRouter>
    </QueryClientProvider>
    // </AppErrorBoundary>
  );
};

export default App;
