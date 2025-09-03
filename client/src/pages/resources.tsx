import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Resources() {
  const { data: resources, isLoading } = useQuery({
    queryKey: ["/api/resources"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-destructive";
      case "warning": return "text-accent";
      case "normal": return "text-secondary";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "critical": return "destructive";
      case "warning": return "secondary";
      case "normal": return "default";
      default: return "outline";
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "solar": return "fas fa-solar-panel";
      case "water": return "fas fa-tint";
      case "food": return "fas fa-seedling";
      case "internet": return "fas fa-wifi";
      default: return "fas fa-gauge";
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case "solar": return "text-secondary";
      case "water": return "text-blue-500";
      case "food": return "text-green-500";
      case "internet": return "text-purple-500";
      default: return "text-muted-foreground";
    }
  };

  const energyResources = resources?.filter((r: any) => ["solar", "wind", "battery"].includes(r.type)) || [];
  const waterResources = resources?.filter((r: any) => ["water", "rainwater", "greywater"].includes(r.type)) || [];
  const foodResources = resources?.filter((r: any) => ["food", "garden", "compost"].includes(r.type)) || [];
  const techResources = resources?.filter((r: any) => ["internet", "network", "server"].includes(r.type)) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-muted h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const ResourceCard = ({ resource }: { resource: any }) => {
    const level = parseFloat(resource.currentLevel);
    const capacity = parseFloat(resource.capacity || "100");
    const percentage = Math.min((level / capacity) * 100, 100);

    return (
      <Card className="afro-card" data-testid={`resource-card-${resource.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${getResourceColor(resource.type)}`}>
                <i className={`${getResourceIcon(resource.type)} text-lg`}></i>
              </div>
              <div>
                <CardTitle className="text-lg" data-testid={`text-resource-name-${resource.id}`}>
                  {resource.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{resource.type}</p>
              </div>
            </div>
            <Badge 
              variant={getStatusBadgeVariant(resource.status)} 
              className={getStatusColor(resource.status)}
              data-testid={`badge-resource-status-${resource.id}`}
            >
              {resource.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Level</span>
              <span className="text-lg font-bold" data-testid={`text-resource-level-${resource.id}`}>
                {level}{resource.unit === "percentage" || resource.unit === "%" ? "%" : ` ${resource.unit || ""}`}
              </span>
            </div>
            
            <Progress 
              value={resource.unit === "percentage" || resource.unit === "%" ? level : percentage} 
              className="w-full h-3"
              data-testid={`progress-resource-${resource.id}`}
            />
            
            {resource.metadata && (
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground">
                {Object.entries(resource.metadata as object).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(resource.lastUpdated).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6" data-testid="resources-page">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Village Resources
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Monitor our sustainable off-grid infrastructure and resource consumption
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="pattern-border hover-lift">
          <div className="pattern-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Energy Independence</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-energy-independence">100%</p>
                <p className="text-secondary text-sm">Self-sufficient</p>
              </div>
              <div className="cultural-icon">
                <i className="fas fa-bolt"></i>
              </div>
            </div>
          </div>
        </Card>

        <Card className="pattern-border hover-lift">
          <div className="pattern-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Water Independence</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-water-independence">100%</p>
                <p className="text-blue-500 text-sm">Self-sufficient</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-tint text-blue-500 text-xl"></i>
              </div>
            </div>
          </div>
        </Card>

        <Card className="pattern-border hover-lift">
          <div className="pattern-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Food Production</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-food-production">5%</p>
                <p className="text-green-500 text-sm">Early stage</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-seedling text-green-500 text-xl"></i>
              </div>
            </div>
          </div>
        </Card>

        <Card className="pattern-border hover-lift">
          <div className="pattern-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Connectivity</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-connectivity">99%</p>
                <p className="text-purple-500 text-sm">High speed</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-wifi text-purple-500 text-xl"></i>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="tab-all-resources">All Resources</TabsTrigger>
          <TabsTrigger value="energy" data-testid="tab-energy">Energy</TabsTrigger>
          <TabsTrigger value="water" data-testid="tab-water">Water</TabsTrigger>
          <TabsTrigger value="food" data-testid="tab-food">Food</TabsTrigger>
          <TabsTrigger value="tech" data-testid="tab-tech">Technology</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="section-all-resources">
            {resources && resources.length > 0 ? (
              resources.map((resource: any) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-resources">
                <div className="cultural-icon mx-auto mb-4">
                  <i className="fas fa-gauge text-2xl"></i>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No Resource Data
                </h3>
                <p className="text-muted-foreground">
                  Resource monitoring is not currently available
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="energy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="section-energy-resources">
            {energyResources.length > 0 && energyResources.map((resource: any) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          
          {/* Victron Energy Monitoring System */}
          <Card className="pattern-border">
            <div className="pattern-content">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-solar-panel text-secondary text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif">Live Energy Monitoring</h3>
                    <p className="text-sm text-muted-foreground">Real-time solar and battery system data</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <iframe 
                  width="100%" 
                  height="800" 
                  src="https://vrm.victronenergy.com/installation/156972/embed/eb7d8f21"
                  className="rounded-lg border"
                  title="Victron Energy Monitoring"
                  data-testid="iframe-victron-energy"
                />
              </CardContent>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="water" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="section-water-resources">
            {waterResources.length > 0 ? (
              waterResources.map((resource: any) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-water-resources">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-tint text-blue-500 text-xl"></i>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No Water Data
                </h3>
                <p className="text-muted-foreground">
                  Water resource monitoring is not available
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="food" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="section-food-resources">
            {foodResources.length > 0 ? (
              foodResources.map((resource: any) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-food-resources">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-seedling text-green-500 text-xl"></i>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No Food Production Data
                </h3>
                <p className="text-muted-foreground">
                  Food production monitoring is not available
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tech" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="section-tech-resources">
            {techResources.length > 0 ? (
              techResources.map((resource: any) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-tech-resources">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-wifi text-purple-500 text-xl"></i>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No Technology Data
                </h3>
                <p className="text-muted-foreground">
                  Technology resource monitoring is not available
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
