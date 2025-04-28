
import React, { useEffect, useRef, useState } from "react";
import { IPTVChannel, PlayerState } from "@/types/iptv";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VideoPlayerProps {
  channel: IPTVChannel | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    volume: 0.8,
    currentTime: 0,
    duration: 0,
    loading: true,
  });
  
  const controlsTimeout = useRef<number | null>(null);

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (playerState.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(error => {
        console.error("Playback error:", error);
        toast.error("Failed to play content. Please try another channel.");
      });
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newVolume = videoRef.current.volume > 0 ? 0 : 0.8;
    videoRef.current.volume = newVolume;
    setPlayerState(prev => ({ ...prev, volume: newVolume }));
  };

  // Update volume
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setPlayerState(prev => ({ ...prev, volume: newVolume }));
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    setPlayerState(prev => ({
      ...prev,
      currentTime: videoRef.current?.currentTime || 0,
    }));
  };

  // Show controls on mouse move
  const handleMouseMove = () => {
    setControlsVisible(true);
    
    if (controlsTimeout.current) {
      window.clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = window.setTimeout(() => {
      if (playerState.isPlaying) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  // Update player when channel changes
  useEffect(() => {
    if (!videoRef.current || !channel) return;
    
    setPlayerState(prev => ({ ...prev, loading: true }));
    
    videoRef.current.src = channel.stream_url;
    videoRef.current.load();
    videoRef.current.play().catch(error => {
      console.error("Playback error:", error);
      toast.error("Failed to play this channel. Please try another one.");
      setPlayerState(prev => ({ ...prev, loading: false, isPlaying: false }));
    });
    
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    };
  }, [channel]);

  // Setup event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const onPlay = () => setPlayerState(prev => ({ ...prev, isPlaying: true }));
    const onPause = () => setPlayerState(prev => ({ ...prev, isPlaying: false }));
    const onLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: video.duration || 0,
        loading: false,
      }));
    };
    const onWaiting = () => setPlayerState(prev => ({ ...prev, loading: true }));
    const onPlaying = () => setPlayerState(prev => ({ ...prev, loading: false }));
    const onError = () => {
      console.error("Video error");
      setPlayerState(prev => ({ ...prev, loading: false }));
      toast.error("Stream error. Please try another channel.");
    };
    
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);
    
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
      
      if (controlsTimeout.current) {
        window.clearTimeout(controlsTimeout.current);
      }
    };
  }, []);
  
  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative w-full h-full bg-iptv-background rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {!channel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-iptv-text">
          <Tv className="w-16 h-16 mb-4 text-iptv-primary" />
          <h2 className="text-xl font-semibold">No Channel Selected</h2>
          <p className="text-sm text-gray-400 mt-2">Select a channel from the list to start watching</p>
        </div>
      )}
      
      {playerState.loading && channel && (
        <div className="absolute inset-0 flex items-center justify-center text-iptv-text bg-iptv-background bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-iptv-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading stream...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
          controlsVisible || !playerState.isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {playerState.isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {playerState.volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              
              <div className="w-24">
                <Slider
                  value={[playerState.volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {channel && (
            <div className="text-white text-sm">
              {channel.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
