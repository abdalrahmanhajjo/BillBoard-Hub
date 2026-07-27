import { Badge } from '@/client/ui/components/ui/badge';
import type { CampaignStatus } from '@/shared/types/campaign';

const STATUS_VARIANT: Record<CampaignStatus, 'secondary' | 'success' | 'outline'> = {
  draft: 'secondary',
  active: 'success',
  completed: 'outline',
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
