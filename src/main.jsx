"use client";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {HeroUIProvider} from '@heroui/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <HeroUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark">
            <App />
      </NextThemesProvider>
      </HeroUIProvider>
  </React.StrictMode>,
);
