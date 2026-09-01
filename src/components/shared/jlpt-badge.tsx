import { Badge } from '@/components/ui/badge';
import { JLPT_COLORS } from '@/lib/constants';

export function JLPTBadge({ level }: { level: string | null }) {
  if (!level) return null;
  return (
    <Badge className={`${JLPT_COLORS[level] || ''} text-xs font-medium`} variant="secondary">
      {level}
    </Badge>
  );
}
