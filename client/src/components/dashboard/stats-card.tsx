import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  iconBgColor: string;
  className?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconBgColor,
  className 
}: StatsCardProps) {
  return (
    <div className={cn("pattern-border hover-lift", className)} data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="pattern-content p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium" data-testid={`text-stats-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground" data-testid={`text-stats-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
            <p className="text-sm" data-testid={`text-stats-subtitle-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {subtitle}
            </p>
          </div>
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor)}>
            <i className={cn(icon, "text-xl")}></i>
          </div>
        </div>
      </div>
    </div>
  );
}
