import React, { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { cn } from "../../lib/utils";

/**
 * GenreMultiSelect
 * Props:
 *   value      – string[]  (selected genres)
 *   onChange   – (string[]) => void
 *   genres     – string[]  (all available genres from seed)
 *   disabled   – boolean
 *   placeholder – string
 */
const GenreMultiSelect = ({
  value = [],
  onChange,
  genres = [],
  disabled = false,
  placeholder = "Select genres…",
}) => {
  const [open, setOpen] = useState(false);

  const toggle = (genre) => {
    if (value.includes(genre)) {
      onChange(value.filter((g) => g !== genre));
    } else {
      onChange([...value, genre]);
    }
  };

  const removeOne = (genre, e) => {
    e.stopPropagation();
    onChange(value.filter((g) => g !== genre));
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-600 bg-gray-800",
            "px-3 py-2 text-sm text-white shadow-sm text-left",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {value.length === 0 ? (
            <span className="text-gray-500 flex-1">{placeholder}</span>
          ) : (
            <>
              {value.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 rounded bg-blue-600/30 border border-blue-500/40 px-1.5 py-0.5 text-xs text-blue-200"
                >
                  {g}
                  <button
                    type="button"
                    onClick={(e) => removeOne(g, e)}
                    className="hover:text-white text-blue-300 transition"
                    aria-label={`Remove ${g}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-gray-400" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search genre…" />
          <CommandList>
            <CommandEmpty>No genre found.</CommandEmpty>
            <CommandGroup>
              {genres.map((genre) => {
                const selected = value.includes(genre);
                return (
                  <CommandItem
                    key={genre}
                    value={genre}
                    onSelect={() => toggle(genre)}
                    className="flex items-center gap-2"
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        selected
                          ? "border-blue-500 bg-blue-600"
                          : "border-gray-500 bg-transparent"
                      )}
                    >
                      {selected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span>{genre}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { GenreMultiSelect };
