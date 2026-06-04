'use client';

import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

/**
 * @fileOverview A responsive technical pagination footer for workshop registries.
 * Matches the Midnight Slate design language with high-density navigation.
 */
export function DataTablePagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  className
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn("flex items-center justify-between px-2 py-4 flex-wrap gap-y-4 no-print", className)}>
      <div className="hidden sm:block flex-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
        Certified Registry System
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto ml-auto">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            Items per page
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-9 w-[70px] bg-background border-border/50 rounded-xl font-bold text-xs shadow-sm">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="rounded-xl border-border/50 shadow-2xl">
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs font-bold uppercase tracking-tight cursor-pointer">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="flex w-[120px] items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap tabular-nums">
              {startRange} – {endRange} of {totalItems}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="hidden h-9 w-9 p-0 lg:flex rounded-xl border-border/50 bg-background hover:bg-muted"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 p-0 rounded-xl border-border/50 bg-background hover:bg-muted"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 p-0 rounded-xl border-border/50 bg-background hover:bg-muted"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hidden h-9 w-9 p-0 lg:flex rounded-xl border-border/50 bg-background hover:bg-muted"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
