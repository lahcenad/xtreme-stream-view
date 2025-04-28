
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface IPTVLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  onLogout: () => void;
}

const IPTVLayout: React.FC<IPTVLayoutProps> = ({ 
  sidebar, 
  content,
  onLogout
}) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleLogout = () => {
    onLogout();
    toast.success("Logged out successfully");
  };
  
  return (
    <div className="flex h-screen bg-iptv-background text-iptv-text overflow-hidden">
      {/* Sidebar */}
      <div 
        className={cn(
          "h-full transition-all duration-300 ease-in-out",
          sidebarOpen 
            ? isMobile ? "w-full absolute z-10 inset-0" : "w-80" 
            : "w-0"
        )}
      >
        {sidebarOpen && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-iptv-card/70 border-b border-iptv-primary/20">
              <h1 className="font-bold text-xl">Channels</h1>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-iptv-text/70 hover:text-iptv-text hover:bg-iptv-primary/10"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="text-iptv-text/70 hover:text-iptv-text hover:bg-iptv-primary/10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              {sidebar}
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col h-full transition-all duration-300",
        !sidebarOpen && isMobile ? "w-full" : ""
      )}>
        {/* Content Header */}
        <div className="p-4 flex items-center">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-iptv-text/70 hover:text-iptv-text hover:bg-iptv-primary/10 mr-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
          
          <h1 className="font-bold text-xl">Xtreme Stream View</h1>
          
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-iptv-text/70 hover:text-iptv-text hover:bg-iptv-primary/10 ml-auto"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Player */}
        <div className="flex-1 p-4 overflow-hidden">
          {content}
        </div>
      </div>
    </div>
  );
};

export default IPTVLayout;
