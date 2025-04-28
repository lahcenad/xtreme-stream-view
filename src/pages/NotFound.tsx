
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tv } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-iptv-background text-iptv-text">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-iptv-primary/20 p-4 rounded-full">
            <Tv className="w-16 h-16 text-iptv-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-6">Oops! Channel not found</p>
        <Button
          asChild
          variant="default"
          className="bg-iptv-primary hover:bg-iptv-secondary"
        >
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
