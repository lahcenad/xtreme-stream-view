
import { useState, useEffect } from "react";
import { IPTVCategory, IPTVChannel, XtremeCredentials } from "@/types/iptv";
import { iptvService } from "@/services/iptvService";
import { useLocalStorage } from "./useLocalStorage";
import { toast } from "sonner";

export function useIPTV() {
  // Store credentials in local storage
  const [credentials, setCredentials] = useLocalStorage<XtremeCredentials | null>(
    "iptv-credentials", 
    null
  );
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!credentials);
  const [categories, setCategories] = useState<IPTVCategory[]>([]);
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Login with Xtreme Codes credentials
  const login = async (creds: XtremeCredentials) => {
    setIsLoading(true);
    try {
      const isValid = await iptvService.validateAccount(creds);
      
      if (isValid) {
        setCredentials(creds);
        setIsLoggedIn(true);
        toast.success("Successfully logged in!");
        return true;
      } else {
        toast.error("Invalid credentials. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Connection failed. Please check your URL and try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setCredentials(null);
    setIsLoggedIn(false);
    setCategories([]);
    setChannels([]);
    setSelectedCategory(null);
    setSelectedChannel(null);
    toast.info("Logged out successfully");
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!credentials) return;
    
    setIsLoading(true);
    try {
      const data = await iptvService.getCategories(credentials);
      setCategories(data);
      
      // Select first category if available
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch channels for a category
  const fetchChannels = async (categoryId: string) => {
    if (!credentials) return;
    
    setIsLoading(true);
    try {
      const data = await iptvService.getChannels(credentials, categoryId);
      setChannels(data);
      
      // Select first channel if available
      if (data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0]);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a category
  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Select a channel
  const selectChannel = (channel: IPTVChannel) => {
    setSelectedChannel(channel);
  };

  // Load initial data when logged in
  useEffect(() => {
    if (isLoggedIn && credentials) {
      fetchCategories();
    }
  }, [isLoggedIn]);

  // Load channels when category is selected
  useEffect(() => {
    if (selectedCategory && isLoggedIn && credentials) {
      fetchChannels(selectedCategory);
    }
  }, [selectedCategory]);

  return {
    isLoggedIn,
    isLoading,
    categories,
    channels,
    selectedCategory,
    selectedChannel,
    login,
    logout,
    selectCategory,
    selectChannel,
    fetchCategories,
    fetchChannels
  };
}
