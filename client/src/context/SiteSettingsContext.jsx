import React, { createContext, useContext, useEffect, useState } from "react";
import axiosbase from "../../axiosbasa";

const SiteSettingsContext = createContext({
  siteName: "PakMovie",
  socialLinks: [],
  setSiteName: () => {},
  setSocialLinks: () => {},
});

export const SiteSettingsProvider = ({ children }) => {
  const [siteName, setSiteName] = useState("PakMovie");
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    axiosbase
      .get("/site-settings")
      .then((res) => {
        const data = res.data?.data;
        if (data?.siteName)    setSiteName(data.siteName);
        if (data?.socialLinks) setSocialLinks(data.socialLinks);
      })
      .catch(() => {});
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteName, setSiteName, socialLinks, setSocialLinks }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
