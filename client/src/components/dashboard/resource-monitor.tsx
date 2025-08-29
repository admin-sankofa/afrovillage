import { type Resource } from "@shared/schema";

interface ResourceMonitorProps {
  resource: Resource;
}

export default function ResourceMonitor({ resource }: ResourceMonitorProps) {
  const level = parseFloat(resource.currentLevel);
  const isPercentage = resource.unit === "percentage" || resource.unit === "%";
  
  const getStatusColor = (status: string, level: number) => {
    if (status === "critical") return "bg-destructive";
    if (status === "warning") return "bg-accent";
    if (level >= 80) return "bg-secondary";
    if (level >= 50) return "bg-blue-500";
    return "bg-primary";
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "solar": return "fas fa-solar-panel text-secondary";
      case "water": return "fas fa-tint text-blue-500";
      case "food": return "fas fa-seedling text-green-500";
      case "internet": return "fas fa-wifi text-purple-500";
      default: return "fas fa-gauge text-muted-foreground";
    }
  };

  const getDisplayValue = () => {
    if (isPercentage) return `${level}%`;
    return `${level}${resource.unit ? ` ${resource.unit}` : ''}`;
  };

  const getSubtext = () => {
    const metadata = resource.metadata as any;
    if (resource.type === "solar" && metadata?.generation) {
      return `Generating ${metadata.generation}`;
    }
    if (resource.type === "water" && metadata?.capacity) {
      return `${metadata.capacity} available`;
    }
    if (resource.type === "food" && metadata?.harvest) {
      return `Harvest in ${metadata.harvest}`;
    }
    if (resource.type === "internet" && metadata?.speed) {
      return metadata.speed;
    }
    return resource.status;
  };

  return (
    <div className="space-y-2" data-testid={`resource-monitor-${resource.id}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground flex items-center">
          <i className={`${getIcon(resource.type)} mr-2`}></i>
          {resource.name}
        </span>
        <span className="text-sm text-foreground font-semibold" data-testid={`text-resource-value-${resource.id}`}>
          {getDisplayValue()}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(resource.status, level)}`}
          style={{ width: isPercentage ? `${level}%` : "100%" }}
        ></div>
      </div>
      <p className="text-xs text-muted-foreground" data-testid={`text-resource-status-${resource.id}`}>
        {getSubtext()}
      </p>
    </div>
  );
}
