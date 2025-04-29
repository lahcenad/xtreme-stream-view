
import { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import VideoPlayer from "@/components/VideoPlayer";
import ChannelList from "@/components/ChannelList";
import EPGGuide from "@/components/EPGGuide";
import IPTVLayout from "@/components/IPTVLayout";
import { useIPTV } from "@/hooks/useIPTV";

const Index = () => {
  const {
    isLoggedIn,
    isLoading,
    categories,
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
  } = useIPTV();

  // Force-set dark mode for the app
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  // Get programs for the selected channel
  const currentPrograms = selectedChannel?.epg_channel_id 
    ? epgData[selectedChannel.id] || []
    : [];

  return (
    <div className="bg-iptv-background h-screen text-iptv-text">
      {!isLoggedIn ? (
        <LoginForm onLogin={login} isLoading={isLoading} />
      ) : (
        <IPTVLayout
          sidebar={
            <ChannelList
              categories={categories}
              channels={channels}
              selectedCategory={selectedCategory}
              selectedChannel={selectedChannel}
              contentType={contentType}
              onSelectCategory={selectCategory}
              onSelectChannel={selectChannel}
              onChangeContentType={changeContentType}
              isLoading={isLoading}
            />
          }
          content={
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <VideoPlayer channel={selectedChannel} />
              </div>
              
              {/* Show EPG only for live TV channels with EPG data */}
              {contentType === "live" && selectedChannel?.epg_channel_id && (
                <div className="mt-4">
                  <EPGGuide 
                    programs={currentPrograms} 
                    isLoading={isLoadingEpg} 
                  />
                </div>
              )}
            </div>
          }
          onLogout={logout}
        />
      )}
    </div>
  );
};

export default Index;
