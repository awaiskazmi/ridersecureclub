"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useAppStore } from "@/stores/app";

export function Combobox({
  initialValue,
  data,
  onValueChange,
  children,
}: {
  initialValue?: string;
  data: { value: string; label: string }[];
  onValueChange: (value: { value: string; label: string }) => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(initialValue || "");

  const { createUserModalOpen, setCreateUserModalOpen } = useAppStore(
    (state) => state
  );

  const handleClick = () => {
    setCreateUserModalOpen(true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full"
        >
          {value
            ? data.find((option) => option.label.includes(value))?.label
            : "Select a user..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>No data.</CommandEmpty>
            <CommandGroup>
              {data.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    onValueChange(option);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.label ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {children ? <CommandGroup>{children}</CommandGroup> : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
