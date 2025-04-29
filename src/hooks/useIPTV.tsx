
import { useState, useEffect } from "react";
import { IPTVCategory, IPTVChannel, XtremeCredentials, EPGData } from "@/types/iptv";
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
  const [contentType, setContentType] = useState<"live" | "movie" | "series">("live");
  const [epgData, setEpgData] = useState<EPGData>({});
  const [isLoadingEpg, setIsLoadingEpg] = useState<boolean>(false);

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
      
      // Filter by content type
      const filteredCategories = data.filter(cat => cat.category_type === contentType);
      
      // Select first category if available
      if (filteredCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(filteredCategories[0].id);
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
      const category = categories.find(cat => cat.id === categoryId);
      
      if (!category) {
        throw new Error("Category not found");
      }
      
      const data = await iptvService.getChannels(credentials, category);
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

  // Fetch EPG data for selected channel
  const fetchEpgData = async (channel: IPTVChannel) => {
    if (!credentials || !channel.epg_channel_id) return;
    
    setIsLoadingEpg(true);
    try {
      const data = await iptvService.getEPG(credentials, channel.id);
      setEpgData(prevData => ({...prevData, ...data}));
    } catch (error) {
      console.error("Error fetching EPG data:", error);
    } finally {
      setIsLoadingEpg(false);
    }
  };
  
  // Change content type (live, movies, series)
  const changeContentType = (type: "live" | "movie" | "series") => {
    setContentType(type);
    setSelectedCategory(null);
    setSelectedChannel(null);
    setChannels([]);
  };

  // Select a category
  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Select a channel
  const selectChannel = (channel: IPTVChannel) => {
    setSelectedChannel(channel);
    
    // Fetch EPG data for live TV channels
    if (contentType === "live" && channel.epg_channel_id) {
      fetchEpgData(channel);
    }
  };

  // Load initial data when logged in
  useEffect(() => {
    if (isLoggedIn && credentials) {
      fetchCategories();
    }
  }, [isLoggedIn, contentType]);

  // Load channels when category is selected
  useEffect(() => {
    if (selectedCategory && isLoggedIn && credentials) {
      fetchChannels(selectedCategory);
    }
  }, [selectedCategory]);

  return {
    isLoggedIn,
    isLoading,
    categories: categories.filter(cat => cat.category_type === contentType),
    channels,
    selectedCategory,
    selectedChannel,
    contentType,
    epgData,
    isLoadingEpg,
    login,
    logout,
    selectCategory,
    selectChannel,
    changeContentType,
    fetchCategories,
    fetchChannels
  };
}
