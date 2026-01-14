import * as React from "react";

type DashboardChromeContextValue = {
  inShell: boolean;
};

const DashboardChromeContext = React.createContext<DashboardChromeContextValue>({
  inShell: false,
});

export const DashboardChromeProvider = DashboardChromeContext.Provider;

export const useDashboardChrome = () => React.useContext(DashboardChromeContext);
