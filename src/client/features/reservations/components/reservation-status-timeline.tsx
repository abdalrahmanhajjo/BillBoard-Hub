'use client';

import { Badge } from '@/client/ui/components/ui/badge';
import { Progress, ProgressValue } from '@/client/ui/components/ui/progress';
import { Separator } from '@/client/ui/components/ui/separator';
import type { Reservation } from '../types/reservation';
import { formatDate } from '../utils/reservation-status';
import { CheckIcon, CircleIcon } from 'lucide-react';

interface TimelineStep {
  label: string;
  date: string | null;
  completed: boolean;
}

interface ReservationStatusTimelineProps {
  reservation: Reservation;
}

export function ReservationStatusTimeline({ reservation }: ReservationStatusTimelineProps) {
  const steps: TimelineStep[] = [
    {
      label: 'Submitted',
      date: reservation.createdAt,
      completed: true,
    },
    {
      label: 'Approved',
      date:
        reservation.status === 'approved' ||
        reservation.status === 'running' ||
        reservation.status === 'completed'
          ? reservation.createdAt
          : null,
      completed:
        reservation.status === 'approved' ||
        reservation.status === 'running' ||
        reservation.status === 'completed',
    },
    {
      label: 'Payment Confirmed',
      date:
        reservation.status === 'approved' ||
        reservation.status === 'running' ||
        reservation.status === 'completed'
          ? reservation.createdAt
          : null,
      completed:
        reservation.status === 'approved' ||
        reservation.status === 'running' ||
        reservation.status === 'completed',
    },
    {
      label: 'Creative Approved',
      date: null,
      completed: reservation.status === 'running' || reservation.status === 'completed',
    },
    {
      label: 'Running',
      date: reservation.startDate,
      completed: reservation.status === 'running' || reservation.status === 'completed',
    },
    {
      label: 'Completed',
      date: reservation.endDate,
      completed: reservation.status === 'completed',
    },
  ];

  return (
    <div className="space-y-4">
      <Progress value={0}>
        <ProgressValue className="text-foreground font-medium">Status Timeline</ProgressValue>
      </Progress>

      <div className="space-y-0">
        {steps.map((step, index) => (
          <div key={step.label}>
            <div className="flex items-start gap-3 py-3">
              <div className="mt-0.5 flex shrink-0 flex-col items-center">
                <div
                  className={`flex size-5 items-center justify-center rounded-full ${
                    step.completed
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.completed ? (
                    <CheckIcon className="size-3" />
                  ) : (
                    <CircleIcon className="size-3" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mt-1 h-full w-px ${step.completed ? 'bg-primary' : 'bg-border'}`}
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      step.completed ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.completed && (
                    <Badge
                      variant={
                        step.label === 'Running'
                          ? 'success'
                          : step.label === 'Completed'
                            ? 'outline'
                            : 'default'
                      }
                    >
                      {step.label === 'Running' ? 'Active' : 'Done'}
                    </Badge>
                  )}
                </div>
                {step.date && (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatDate(step.date)}
                  </span>
                )}
              </div>
            </div>
            {index < steps.length - 1 && <Separator className="ml-8" />}
          </div>
        ))}
      </div>
    </div>
  );
}
