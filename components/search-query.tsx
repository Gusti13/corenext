"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryHelpers } from "@/hooks/use-query-helpers";
import { useState } from "react";
import { Search, X } from "lucide-react";

export function SearchInputQuery() {
  const { getQueryParams, setMultipleQueryParams, removeQueryParam } =
    useQueryHelpers();
  const params = getQueryParams();
  const initialSearch = params.get("search") || "";

  const [search, setSearch] = useState(initialSearch);

  const handleSearch = () => {
    if (search) setMultipleQueryParams({ search, page: "1" });
    else handleClear();
  };

  const handleClear = () => {
    setSearch("");
    removeQueryParam("search");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button onClick={handleSearch} className="cursor-pointer">
        <Search />
      </Button>
    </div>
  );
}
