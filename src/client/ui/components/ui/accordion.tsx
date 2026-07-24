'use client';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { Plus, Minus } from 'lucide-react';

import { cn } from '@/client/ui/lib/utils';

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root data-slot="accordion" className={cn('w-full', className)} {...props} />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-zinc-200 last:border-b-0', className)}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger focus-visible:ring-ring/50 flex flex-1 items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium text-zinc-900 transition-colors outline-none hover:bg-zinc-50 focus-visible:ring-2',
          className,
        )}
        {...props}
      >
        {children}
        <span className="relative flex size-5 shrink-0 items-center justify-center text-zinc-400">
          <Plus className="size-5 transition-opacity duration-200 group-data-[panel-open]/accordion-trigger:opacity-0" />
          <Minus className="absolute size-5 opacity-0 transition-opacity duration-200 group-data-[panel-open]/accordion-trigger:opacity-100" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0"
      {...props}
    >
      <div className={cn('px-6 pb-5 text-[15px] leading-relaxed text-zinc-600', className)}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
