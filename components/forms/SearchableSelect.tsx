import { useState } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

// Custom searchable select component
export default function SearchableSelect({
  options,
  placeholder,
  value,
  onChange,
  displayKey = "name",
  valueKey = "_id",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  displayKey?: string;
  valueKey?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) => option[displayKey].toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className='flex items-center border-b px-3 py-2'>
          <Search className='h-4 w-4 mr-2 opacity-50' />
          <input
            className='flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className={cn("max-h-[200px] overflow-y-auto", filteredOptions.length === 0 && "py-6 text-center text-sm")}>
          {filteredOptions.length === 0 ? (
            <p className='text-muted-foreground'>No results found</p>
          ) : (
            filteredOptions.map((option) => (
              <SelectItem key={option[valueKey]} value={option[valueKey]}>
                {option[displayKey]}
              </SelectItem>
            ))
          )}
        </div>
      </SelectContent>
    </Select>
  );
}
