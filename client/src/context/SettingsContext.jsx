import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

// Country and currency data
export const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD", symbol: "$", locale: "en-US" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$", locale: "en-CA" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", locale: "en-GB" },
  { code: "EU", name: "European Union", currency: "EUR", symbol: "€", locale: "de-DE" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥", locale: "ja-JP" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", locale: "en-AU" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹", locale: "en-IN" },
  { code: "CN", name: "China", currency: "CNY", symbol: "¥", locale: "zh-CN" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$", locale: "pt-BR" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "$", locale: "es-MX" }
];

export const SettingsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    country: "US",
    currency: "USD",
    locale: "en-US",
    symbol: "$"
  });

  // Update settings when user changes
  useEffect(() => {
    if (user) {
      const actualUser = user.user || user;
      const userCountry = actualUser.country || "US";
      const userCurrency = actualUser.currency || "USD";
      
      // Find the country data to get locale and symbol
      const countryData = COUNTRIES.find(c => c.code === userCountry) || COUNTRIES[0];
      
      setSettings({
        country: userCountry,
        currency: userCurrency,
        locale: countryData.locale,
        symbol: countryData.symbol
      });
    }
  }, [user]);

  // Function to get currency formatting options
  const getCurrencyFormat = () => {
    return {
      currency: settings.currency,
      locale: settings.locale,
      symbol: settings.symbol
    };
  };

  // Function to format currency amounts
  const formatCurrency = (amount) => {
    // Format the number without currency symbol first
    const formattedNumber = new Intl.NumberFormat(settings.locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    // Then add our custom symbol
    return `${settings.symbol}${formattedNumber}`;
  };

  // Update settings (this will be called when user updates settings)
  const updateSettings = (newSettings) => {
    const countryData = COUNTRIES.find(c => c.code === newSettings.country) || COUNTRIES[0];
    
    const updatedSettings = {
      country: newSettings.country,
      currency: newSettings.currency || countryData.currency,
      locale: countryData.locale,
      symbol: countryData.symbol
    };
    
    setSettings(updatedSettings);
  };

  const value = {
    settings,
    getCurrencyFormat,
    formatCurrency,
    updateSettings,
    COUNTRIES
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};