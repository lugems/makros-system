'use client';

import * as React from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
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
 * Synchronized across the polymorphic workshop ecosystem.
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
  const [search, setSearch] = React.useState("")

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  const filteredOptions = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) =>
      `${option.label} ${option.description || ""}`.toLowerCase().includes(term)
    )
  }, [options, search])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          value={open ? search : (selectedOption?.label || "")}
          placeholder={isLoading ? "Loading options..." : (open ? searchPlaceholder : placeholder)}
          onFocus={() => handleOpenChange(true)}
          onClick={() => !open && handleOpenChange(true)}
          onChange={(event) => {
            if (!open) setOpen(true)
            setSearch(event.target.value)
          }}
          className={cn(
            "w-full h-12 rounded-xl bg-muted/30 border-none pl-11 pr-10 font-bold text-sm",
            !value && "text-muted-foreground font-medium",
            className
          )}
          />
          {isLoading
            ? <Loader2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin opacity-50" />
            : <ChevronsUpDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />}
        </div>
      </PopoverAnchor>
      <PopoverContent 
        className="pointer-events-auto w-[--radix-popover-trigger-width] p-0 rounded-2xl border-border/50 shadow-2xl overflow-hidden z-[60]"
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command className="bg-background" shouldFilter={false}>
          <div className="border-b px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {searchPlaceholder}
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
            <CommandEmpty className="p-8 text-center text-xs font-medium italic text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value === value ? "" : option.value)
                    handleOpenChange(false)
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg mx-1 my-0.5"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/50 group-aria-selected:text-primary transition-colors shrink-0">
                        {option.icon || <Check className={cn("h-4 w-4 opacity-0", value === option.value && "opacity-100")} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black uppercase tracking-tight truncate">{option.label}</span>
                        {option.description && (
                          <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 leading-none mt-1 truncate">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {value === option.value && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
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
