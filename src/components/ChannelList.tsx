
import React from "react";
import { IPTVCategory, IPTVChannel } from "@/types/iptv";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChannelListProps {
  categories: IPTVCategory[];
  channels: IPTVChannel[];
  selectedCategory: string | null;
  selectedChannel: IPTVChannel | null;
  onSelectCategory: (categoryId: string) => void;
  onSelectChannel: (channel: IPTVChannel) => void;
  isLoading: boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({
  categories,
  channels,
  selectedCategory,
  selectedChannel,
  onSelectCategory,
  onSelectChannel,
  isLoading,
}) => {
  const isMobile = useIsMobile();

  const handleChannelClick = (channel: IPTVChannel) => {
    onSelectChannel(channel);
  };

  return (
    <div className="h-full bg-iptv-card border-r border-iptv-primary/20">
      <Tabs 
        defaultValue={selectedCategory || "all"} 
        className="h-full flex flex-col"
        value={selectedCategory || "all"}
        onValueChange={onSelectCategory}
      >
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
              <TabsList className="bg-transparent h-auto flex p-0 w-max">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className={cn(
                      "data-[state=active]:bg-iptv-primary data-[state=active]:text-white",
                      "rounded-md px-3 py-1.5 mx-1 text-sm font-medium"
                    )}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-iptv-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-iptv-text/80">Loading channels...</p>
              </div>
            </div>
          ) : (
            categories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.id}
                className="m-0 h-full data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <div className="p-2">
                  <h3 className="font-medium text-sm text-iptv-text/70 px-2">
                    {channels.length} Channels
                  </h3>
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-0.5 p-2">
                    {channels.length === 0 ? (
                      <div className="flex justify-center items-center h-24 text-iptv-text/70">
                        No channels found
                      </div>
                    ) : (
                      channels.map((channel) => (
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
                              <span className="text-xs font-medium text-iptv-primary">
                                {channel.name.substring(0, 2).toUpperCase()}
                              </span>
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
              </TabsContent>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default ChannelList;
