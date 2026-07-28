'use client';

import { Progress, ProgressValue } from '@/client/ui/components/ui/progress';

interface ReservationProgressProps {
  value: number;
}

export function ReservationProgress({ value }: ReservationProgressProps) {
  return (
    <Progress value={value}>
      <ProgressValue>{value}%</ProgressValue>
    </Progress>
  );
}
