/** @format */

import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { theme } from "./theme";
import App from "./App";
import "./i18n";
import { queryClient } from "./service/queryClient";

import "./styles/fonts.css";

async function enableMocking() {
  const mock_vite = import.meta.env.VITE_USE_MOCK
  console.log(mock_vite);

  if (mock_vite !== "true") {
    return;
  }
  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <App />
      </MantineProvider>
    </QueryClientProvider>,
  );
});
