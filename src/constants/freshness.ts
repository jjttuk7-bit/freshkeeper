export const FRESHNESS_CONFIG = {
  fresh: {
    label: '신선',
    color: 'bg-freshness-fresh',
    textColor: 'text-freshness-fresh',
    badgeClass: 'bg-freshness-fresh/10 text-freshness-fresh border-freshness-fresh/20',
  },
  caution: {
    label: '주의',
    color: 'bg-freshness-caution',
    textColor: 'text-freshness-caution',
    badgeClass: 'bg-freshness-caution/10 text-freshness-caution border-freshness-caution/20',
  },
  urgent: {
    label: '긴급',
    color: 'bg-freshness-urgent',
    textColor: 'text-freshness-urgent',
    badgeClass: 'bg-freshness-urgent/10 text-freshness-urgent border-freshness-urgent/20',
  },
  expired: {
    label: '만료',
    color: 'bg-freshness-expired',
    textColor: 'text-freshness-expired',
    badgeClass: 'bg-freshness-expired/10 text-freshness-expired border-freshness-expired/20',
  },
} as const
