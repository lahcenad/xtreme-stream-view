
import React from "react";
import { EPGProgram } from "@/types/iptv";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays } from "lucide-react";

interface EPGGuideProps {
  programs: EPGProgram[];
  isLoading: boolean;
}

const EPGGuide: React.FC<EPGGuideProps> = ({ programs, isLoading }) => {
  // Helper to format timestamp to readable time
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Helper to check if a program is currently airing
  const isCurrentlyAiring = (program: EPGProgram): boolean => {
    const now = Date.now();
    return program.start_timestamp <= now && program.stop_timestamp >= now;
  };

  return (
    <Card className="border-iptv-primary/20 bg-iptv-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <CalendarDays className="h-5 w-5 mr-2" />
          TV Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-iptv-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-8 text-iptv-text/70">
            No program information available
          </div>
        ) : (
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-2">
              {programs
                .sort((a, b) => a.start_timestamp - b.start_timestamp)
                .map((program) => (
                  <div 
                    key={program.id} 
                    className={`p-3 border rounded-md ${
                      isCurrentlyAiring(program) 
                        ? "border-iptv-primary bg-iptv-primary/10" 
                        : "border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium">
                        {program.title}
                      </h3>
                      {isCurrentlyAiring(program) && (
                        <span className="text-xs bg-iptv-primary px-1.5 py-0.5 rounded-full text-white">
                          Now
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-iptv-text/70">
                      {formatTime(program.start_timestamp)} - {formatTime(program.stop_timestamp)}
                    </p>
                    {program.description && (
                      <p className="text-sm mt-2 line-clamp-2">
                        {program.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default EPGGuide;
