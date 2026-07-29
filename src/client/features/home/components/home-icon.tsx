import {
  BadgeCheck,
  BarChart3,
  Building2,
  Bus,
  CalendarCheck,
  FileText,
  LifeBuoy,
  MapPin,
  MonitorPlay,
  Rocket,
  Search,
  Signpost,
  Store,
  Tag,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { HomeIconKey } from '@/client/features/home/home.types';

const HOME_ICONS = {
  'badge-check': BadgeCheck,
  'bar-chart': BarChart3,
  building: Building2,
  bus: Bus,
  'calendar-check': CalendarCheck,
  'file-text': FileText,
  'life-buoy': LifeBuoy,
  'map-pin': MapPin,
  'monitor-play': MonitorPlay,
  rocket: Rocket,
  search: Search,
  signpost: Signpost,
  store: Store,
  tag: Tag,
  target: Target,
  users: Users,
  zap: Zap,
} satisfies Record<HomeIconKey, React.ComponentType<LucideProps>>;

export function HomeIcon({ name, ...props }: LucideProps & { name: HomeIconKey }) {
  const Icon = HOME_ICONS[name];
  return <Icon {...props} />;
}
