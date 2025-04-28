
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tv } from "lucide-react";
import { XtremeCredentials } from "@/types/iptv";

interface LoginFormProps {
  onLogin: (credentials: XtremeCredentials) => Promise<boolean>;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading }) => {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Simple validation
    if (!url.trim()) {
      setError("URL is required");
      return;
    }
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    
    // Format URL if needed
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = `http://${formattedUrl}`;
    }
    
    // Remove trailing slashes
    formattedUrl = formattedUrl.replace(/\/+$/, "");
    
    await onLogin({
      url: formattedUrl,
      username: username.trim(),
      password: password.trim()
    });
  };
  
  return (
    <div className="h-full flex items-center justify-center p-4 bg-iptv-background">
      <Card className="w-full max-w-md bg-iptv-card border-iptv-primary/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-iptv-primary/20 p-4 rounded-full">
              <Tv className="w-12 h-12 text-iptv-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-iptv-text">Xtreme Stream View</CardTitle>
          <CardDescription className="text-gray-400">
            Connect to your IPTV provider using Xtreme Codes
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-iptv-text">Server URL</Label>
              <Input
                id="url"
                placeholder="http://example.com:port"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-iptv-dark border-iptv-primary/30 text-iptv-text"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-iptv-text">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-iptv-dark border-iptv-primary/30 text-iptv-text"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-iptv-text">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-iptv-dark border-iptv-primary/30 text-iptv-text"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-iptv-primary hover:bg-iptv-secondary text-white"
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
