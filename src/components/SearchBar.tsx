
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandEmpty } from "@/components/ui/command";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search channels...", 
  onSearch 
}) => {
  const [query, setQuery] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center border border-iptv-primary/30 rounded-md focus-within:border-iptv-primary transition-colors bg-iptv-card/80">
        <Search className="ml-2 h-4 w-4 shrink-0 text-iptv-text/50" />
        <Input
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {query && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear} 
            className="h-8 w-8 p-0 mr-1"
          >
            <span className="sr-only">Clear</span>
            <span className="text-lg leading-none">&times;</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
