
import { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import VideoPlayer from "@/components/VideoPlayer";
import ChannelList from "@/components/ChannelList";
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
    login,
    logout,
    selectCategory,
    selectChannel,
  } = useIPTV();

  // Force-set dark mode for the app
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

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
              onSelectCategory={selectCategory}
              onSelectChannel={selectChannel}
              isLoading={isLoading}
            />
          }
          content={<VideoPlayer channel={selectedChannel} />}
          onLogout={logout}
        />
      )}
    </div>
  );
};

export default Index;
