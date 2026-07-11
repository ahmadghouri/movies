import React, { createContext, useContext, useEffect, useState } from "react";
import axiosbase from "../../axiosbasa";

const SiteSettingsContext = createContext({ siteName: "PakMovie" });

export const SiteSettingsProvider = ({ children }) => {
  const [siteName, setSiteName] = useState("PakMovie");

  useEffect(() => {
    axiosbase
      .get("/site-settings")
      .then((res) => {
        const name = res.data?.data?.siteName;
        if (name) setSiteName(name);
      })
      .catch(() => {}); // fallback to default
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteName, setSiteName }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
