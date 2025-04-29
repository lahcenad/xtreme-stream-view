import { IPTVCategory, IPTVChannel, XtremeCredentials, EPGData, EPGProgram } from "@/types/iptv";
import { toast } from "sonner";

// API endpoints for Xtreme Codes
const API_ENDPOINTS = {
  GET_LIVE_CATEGORIES: (credentials: XtremeCredentials) => 
    `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_live_categories`,
  
  GET_VOD_CATEGORIES: (credentials: XtremeCredentials) => 
    `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_vod_categories`,
  
  GET_SERIES_CATEGORIES: (credentials: XtremeCredentials) => 
    `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_series_categories`,
  
  GET_LIVE_STREAMS: (credentials: XtremeCredentials, category_id: string) => 
    `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_live_streams&category_id=${category_id}`,
  
  GET_VOD_STREAMS: (credentials: XtremeCredentials, category_id: string) => 
    `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_vod_streams&category_id=${category_id}`,
  
  GET_SERIES: (credentials: XtremeCredentials, category_id: string) => 
    `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_series&category_id=${category_id}`,
  
  GET_STREAM_URL: (credentials: XtremeCredentials, stream_id: string, stream_type: string) => {
    // Fix URL construction to ensure proper format and protocol
    const baseUrl = credentials.url.endsWith('/') 
      ? credentials.url.slice(0, -1) 
      : credentials.url;
      
    if (stream_type === "live") {
      return `${baseUrl}/live/${credentials.username}/${credentials.password}/${stream_id}.m3u8`;
    } else if (stream_type === "movie") {
      return `${baseUrl}/movie/${credentials.username}/${credentials.password}/${stream_id}.mp4`;
    }
    return "";
  },
  
  GET_EPG: (credentials: XtremeCredentials, stream_id?: string) => 
    stream_id 
      ? `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_short_epg&stream_id=${stream_id}`
      : `${credentials.url}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_simple_data_table`,
  
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
  
  // Get all categories (live, vod, series)
  getCategories: async (credentials: XtremeCredentials): Promise<IPTVCategory[]> => {
    try {
      const [liveData, vodData, seriesData] = await Promise.all([
        fetchWithTimeout(API_ENDPOINTS.GET_LIVE_CATEGORIES(credentials)),
        fetchWithTimeout(API_ENDPOINTS.GET_VOD_CATEGORIES(credentials)),
        fetchWithTimeout(API_ENDPOINTS.GET_SERIES_CATEGORIES(credentials))
      ]);
      
      const categories: IPTVCategory[] = [];
      
      if (liveData && !liveData.error) {
        categories.push(...liveData.map((category: any) => ({
          id: category.category_id,
          name: category.category_name,
          category_type: "live" as const
        })));
      }
      
      if (vodData && !vodData.error) {
        categories.push(...vodData.map((category: any) => ({
          id: category.category_id,
          name: category.category_name,
          category_type: "movie" as const
        })));
      }
      
      if (seriesData && !seriesData.error) {
        categories.push(...seriesData.map((category: any) => ({
          id: category.category_id,
          name: category.category_name,
          category_type: "series" as const
        })));
      }
      
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories. Please try again.");
      return [];
    }
  },
  
  // Get channels/streams for a category
  getChannels: async (credentials: XtremeCredentials, category: IPTVCategory): Promise<IPTVChannel[]> => {
    try {
      let apiUrl;
      let streamType;
      
      switch (category.category_type) {
        case "live":
          apiUrl = API_ENDPOINTS.GET_LIVE_STREAMS(credentials, category.id);
          streamType = "live";
          break;
        case "movie":
          apiUrl = API_ENDPOINTS.GET_VOD_STREAMS(credentials, category.id);
          streamType = "movie";
          break;
        case "series":
          apiUrl = API_ENDPOINTS.GET_SERIES(credentials, category.id);
          streamType = "series";
          break;
        default:
          throw new Error("Invalid category type");
      }
      
      const data = await fetchWithTimeout(apiUrl);
      
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to get streams");
      }
      
      return data.map((item: any) => {
        // Fix the stream_id handling
        const streamId = item.stream_id || item.series_id;
        
        if (!streamId) {
          console.warn("Missing stream ID in item:", item);
        }
        
        let stream: IPTVChannel = {
          id: streamId || `unknown-${Math.random().toString(36)}`,
          name: item.name || "Unknown Channel",
          stream_url: streamType === "series" 
            ? "" // Series need additional API call to get actual stream
            : API_ENDPOINTS.GET_STREAM_URL(credentials, streamId, streamType),
          stream_icon: item.stream_icon || "",
          category_id: category.id
        };
        
        // Add EPG ID for live TV channels
        if (streamType === "live" && item.epg_channel_id) {
          stream.epg_channel_id = item.epg_channel_id;
        }
        
        // Ensure stream URL is properly constructed
        console.log(`Generated stream URL for ${stream.name}: ${stream.stream_url}`);
        
        return stream;
      });
    } catch (error) {
      console.error("Error fetching streams:", error);
      toast.error(`Failed to load ${category.category_type} streams. Please try again.`);
      return [];
    }
  },
  
  // Get EPG data for a channel or all channels
  getEPG: async (credentials: XtremeCredentials, stream_id?: string): Promise<EPGData> => {
    try {
      const apiUrl = API_ENDPOINTS.GET_EPG(credentials, stream_id);
      const data = await fetchWithTimeout(apiUrl);
      
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to get EPG data");
      }
      
      const epgData: EPGData = {};
      
      // Process EPG data based on API response format
      if (stream_id) {
        // Single channel EPG
        if (data.epg_listings && Array.isArray(data.epg_listings)) {
          epgData[stream_id] = data.epg_listings.map((program: any) => ({
            id: `${stream_id}-${program.start}-${program.end}`,
            title: program.title || "Unknown Program",
            description: program.description || "",
            start_timestamp: new Date(program.start).getTime(),
            stop_timestamp: new Date(program.end).getTime(),
            channel_id: stream_id
          }));
        }
      } else {
        // All channels EPG
        Object.keys(data).forEach(channelId => {
          if (Array.isArray(data[channelId])) {
            epgData[channelId] = data[channelId].map((program: any) => ({
              id: `${channelId}-${program.start}-${program.end}`,
              title: program.title || "Unknown Program",
              description: program.description || "",
              start_timestamp: new Date(program.start).getTime(),
              stop_timestamp: new Date(program.end).getTime(),
              channel_id: channelId
            }));
          }
        });
      }
      
      return epgData;
    } catch (error) {
      console.error("Error fetching EPG data:", error);
      toast.error("Failed to load TV guide. Please try again.");
      return {};
    }
  }
};
