
import React, { useState, useEffect } from "react";
import { IPTVCategory, IPTVChannel } from "@/types/iptv";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tv, Film, ListVideo } from "lucide-react";
import SearchBar from "./SearchBar";

interface ChannelListProps {
  categories: IPTVCategory[];
  channels: IPTVChannel[];
  selectedCategory: string | null;
  selectedChannel: IPTVChannel | null;
  contentType: "live" | "movie" | "series";
  onSelectCategory: (categoryId: string) => void;
  onSelectChannel: (channel: IPTVChannel) => void;
  onChangeContentType: (type: "live" | "movie" | "series") => void;
  isLoading: boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({
  categories,
  channels,
  selectedCategory,
  selectedChannel,
  contentType,
  onSelectCategory,
  onSelectChannel,
  onChangeContentType,
  isLoading,
}) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredChannels, setFilteredChannels] = useState<IPTVChannel[]>(channels);

  // Update filtered channels when channels or search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredChannels(channels);
    } else {
      const filtered = channels.filter(channel => 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChannels(filtered);
    }
  }, [channels, searchQuery]);

  const handleChannelClick = (channel: IPTVChannel) => {
    onSelectChannel(channel);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const contentTypeIcons = {
    live: <Tv className="w-4 h-4 mr-1" />,
    movie: <Film className="w-4 h-4 mr-1" />,
    series: <ListVideo className="w-4 h-4 mr-1" />
  };

  return (
    <div className="h-full bg-iptv-card border-r border-iptv-primary/20 flex flex-col">
      {/* Content Type Selection */}
      <div className="p-2 border-b border-iptv-primary/20">
        <Tabs 
          value={contentType} 
          onValueChange={(value) => onChangeContentType(value as "live" | "movie" | "series")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="live" className="flex items-center justify-center">
              <Tv className="w-4 h-4 mr-1" />
              <span>Live TV</span>
            </TabsTrigger>
            <TabsTrigger value="movie" className="flex items-center justify-center">
              <Film className="w-4 h-4 mr-1" />
              <span>Movies</span>
            </TabsTrigger>
            <TabsTrigger value="series" className="flex items-center justify-center">
              <ListVideo className="w-4 h-4 mr-1" />
              <span>Series</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Search Bar */}
      <div className="px-2 pt-2">
        <SearchBar 
          onSearch={handleSearch}
          placeholder={`Search ${contentType === 'live' ? 'channels' : contentType === 'movie' ? 'movies' : 'series'}...`}
        />
      </div>
      
      {/* Categories */}
      <div className="p-2 border-b border-iptv-primary/20">
        <h2 className="font-semibold text-lg text-iptv-text px-2 py-1">
          Categories
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-6 h-6 border-2 border-iptv-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ScrollArea className={cn(
            "whitespace-nowrap", 
            isMobile ? "h-16" : "h-12"
          )}>
            <div className="flex p-0 w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 mx-1 text-sm font-medium",
                    selectedCategory === category.id
                      ? "bg-iptv-primary text-white"
                      : "bg-transparent text-iptv-text/70 hover:bg-iptv-primary/10"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-iptv-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-iptv-text/80">Loading {contentType} content...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-2">
              <h3 className="font-medium text-sm text-iptv-text/70 px-2">
                {filteredChannels.length} {contentType === "live" ? "Channels" : contentType === "movie" ? "Movies" : "Series"}
                {searchQuery && <span> matching "{searchQuery}"</span>}
              </h3>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-0.5 p-2">
                {filteredChannels.length === 0 ? (
                  <div className="flex justify-center items-center h-24 text-iptv-text/70">
                    {searchQuery ? "No matching content found" : "No content found"}
                  </div>
                ) : (
                  filteredChannels.map((channel) => (
                    <button
                      key={channel.id}
                      className={cn(
                        "w-full text-left p-2 rounded-md flex items-center gap-3 hover:bg-iptv-primary/10 transition-colors",
                        selectedChannel?.id === channel.id
                          ? "bg-iptv-primary/20"
                          : ""
                      )}
                      onClick={() => handleChannelClick(channel)}
                    >
                      {channel.stream_icon ? (
                        <img
                          src={channel.stream_icon}
                          alt={channel.name}
                          className="w-8 h-8 rounded object-contain bg-black/30 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-iptv-primary/30 flex items-center justify-center flex-shrink-0">
                          {contentTypeIcons[contentType]}
                        </div>
                      )}
                      <span className="text-sm text-iptv-text truncate">
                        {channel.name}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelList;
