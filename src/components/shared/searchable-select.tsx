'use client';

import * as React from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * @fileOverview A professional, Dialog-compatible searchable selector.
 * Hardened to handle Radix focus-trap behavior and large datasets.
 */
export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  isLoading = false,
  className
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-12 px-4 rounded-xl bg-muted/30 border-none font-bold text-sm",
            !value && "text-muted-foreground font-medium",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin opacity-50" /> : selectedOption?.icon}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-border/50 shadow-2xl overflow-hidden" align="start">
        <Command className="bg-background">
          <CommandInput 
            placeholder={searchPlaceholder} 
            className="h-12 border-none focus:ring-0 font-bold uppercase text-[10px] tracking-widest"
          />
          <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
            <CommandEmpty className="p-8 text-center text-xs font-medium italic text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg mx-1 my-0.5"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/50 group-aria-selected:text-primary transition-colors">
                        {option.icon || <Check className={cn("h-4 w-4 opacity-0", value === option.value && "opacity-100")} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-tight">{option.label}</span>
                        {option.description && (
                          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 leading-none mt-1">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {value === option.value && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
