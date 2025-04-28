
import { IPTVCategory, IPTVChannel, XtremeCredentials } from "@/types/iptv";
import { toast } from "sonner";

// API endpoints for Xtreme Codes
const API_ENDPOINTS = {
  GET_CATEGORIES: (credentials: XtremeCredentials) => 
    `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_live_categories`,
  
  GET_LIVE_STREAMS: (credentials: XtremeCredentials, category_id: string) => 
    `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_live_streams&category_id=${category_id}`,
  
  GET_STREAM_URL: (credentials: XtremeCredentials, stream_id: string) => 
    `${credentials.url}/live/${credentials.username}/${credentials.password}/${stream_id}.m3u8`,
  
  VALIDATE_ACCOUNT: (credentials: XtremeCredentials) => 
    `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}`
};

// Helper function for API calls
const fetchWithTimeout = async (url: string, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Service functions
export const iptvService = {
  // Validate Xtreme Codes account
  validateAccount: async (credentials: XtremeCredentials): Promise<boolean> => {
    try {
      const response = await fetchWithTimeout(API_ENDPOINTS.VALIDATE_ACCOUNT(credentials));
      return response && response.user_info && !response.error;
    } catch (error) {
      console.error("Error validating account:", error);
      toast.error("Failed to validate your account. Please check your credentials.");
      return false;
    }
  },
  
  // Get all categories
  getCategories: async (credentials: XtremeCredentials): Promise<IPTVCategory[]> => {
    try {
      const data = await fetchWithTimeout(API_ENDPOINTS.GET_CATEGORIES(credentials));
      
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to get categories");
      }
      
      return data.map((category: any) => ({
        id: category.category_id,
        name: category.category_name
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories. Please try again.");
      return [];
    }
  },
  
  // Get channels for a category
  getChannels: async (credentials: XtremeCredentials, categoryId: string): Promise<IPTVChannel[]> => {
    try {
      const data = await fetchWithTimeout(API_ENDPOINTS.GET_LIVE_STREAMS(credentials, categoryId));
      
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to get channels");
      }
      
      return data.map((channel: any) => ({
        id: channel.stream_id,
        name: channel.name,
        stream_url: API_ENDPOINTS.GET_STREAM_URL(credentials, channel.stream_id),
        stream_icon: channel.stream_icon || "",
        epg_channel_id: channel.epg_channel_id,
        category_id: categoryId
      }));
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast.error("Failed to load channels. Please try again.");
      return [];
    }
  }
};
