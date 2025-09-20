import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDonationSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getUnauthorizedReason, isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

export default function Funding() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const donateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertDonationSchema>) => {
      await apiRequest("POST", `/api/projects/${selectedProject?.id}/donate`, data);
    },
    onSuccess: () => {
      toast({
        title: "Donation Successful",
        description: "Thank you for supporting our community projects!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsDonateDialogOpen(false);
      setSelectedProject(null);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        const reason = getUnauthorizedReason(error);
        toast({
          title: reason === 'token_expired' ? 'Session abgelaufen' : 'Keine Berechtigung',
          description: reason === 'token_expired'
            ? 'Bitte melde dich erneut an, um Projekte zu unterstützen.'
            : 'Diese Aktion erfordert eine aktive Anmeldung.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: "Donation Failed",
        description: "Unable to process donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof insertDonationSchema>>({
    resolver: zodResolver(insertDonationSchema.omit({ projectId: true, userId: true })),
    defaultValues: {
      amount: "",
      message: "",
      isAnonymous: false,
    },
  });

  const categories = [
    { value: "all", label: "All Projects", icon: "fas fa-th-large" },
    { value: "infrastructure", label: "Infrastructure", icon: "fas fa-hammer" },
    { value: "cultural", label: "Cultural", icon: "fas fa-palette" },
    { value: "educational", label: "Educational", icon: "fas fa-graduation-cap" },
    { value: "community", label: "Community", icon: "fas fa-users" },
  ];

  const filteredProjects = (projects || []).filter((project: any) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    return matchesSearch && matchesCategory && project.status === "active";
  });

  const onSubmit = (data: z.infer<typeof insertDonationSchema>) => {
    donateMutation.mutate(data);
  };

  const handleDonate = (project: any) => {
    setSelectedProject(project);
    setIsDonateDialogOpen(true);
  };

  const formatCurrency = (amount: string | number, currency = "EUR") => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const calculateProgress = (current: string | number, goal: string | number) => {
    return Math.round((Number(current) / Number(goal)) * 100);
  };

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : "Deadline passed";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-muted h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="funding-page">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Community Funding
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Support projects that shape our sustainable future and strengthen our community
        </p>
      </div>

      {/* Funding Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="pattern-border hover-lift">
          <div className="pattern-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Raised</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-raised">
                  {formatCurrency(projects?.reduce((sum: number, p: any) => sum + Number(p.currentAmount || 0), 0) || 0)}
                </p>
                <p className="text-secondary text-sm">This year</p>
              </div>
              <div className="cultural-icon">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
            </div>
          </div>
        </Card>

        <Card className="pattern-border hover-lift">
          <div className="pattern-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-projects">
                  {projects?.filter((p: any) => p.status === "active").length || 0}
                </p>
                <p className="text-accent text-sm">Seeking funding</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-project-diagram text-accent text-xl"></i>
              </div>
            </div>
          </div>
        </Card>

        <Card className="pattern-border hover-lift">
          <div className="pattern-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Completed Projects</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-completed-projects">
                  {projects?.filter((p: any) => p.status === "completed").length || 0}
                </p>
                <p className="text-primary text-sm">Successfully funded</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-primary text-xl"></i>
              </div>
            </div>
          </div>
        </Card>

        <Card className="pattern-border hover-lift">
          <div className="pattern-content p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Community Impact</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-community-impact">0</p>
                <p className="text-secondary text-sm">Lives improved</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-secondary text-xl"></i>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects" data-testid="tab-projects">Active Projects</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
          <TabsTrigger value="impact" data-testid="tab-impact">Impact Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                data-testid="input-search-projects"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  data-testid={`button-filter-${category.value}`}
                >
                  <i className={`${category.icon} mr-2`}></i>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="section-projects-grid">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project: any) => (
                <Card key={project.id} className="afro-card" data-testid={`project-card-${project.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-serif" data-testid={`text-project-title-${project.id}`}>
                          {project.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="capitalize" data-testid={`badge-project-category-${project.id}`}>
                            {project.category}
                          </Badge>
                          {getDaysLeft(project.deadline) && (
                            <Badge variant="outline" data-testid={`badge-project-deadline-${project.id}`}>
                              {getDaysLeft(project.deadline)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="cultural-icon">
                        <i className="fas fa-lightbulb"></i>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-6" data-testid={`text-project-description-${project.id}`}>
                      {project.description}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-lg font-bold" data-testid={`text-project-funding-${project.id}`}>
                          {formatCurrency(project.currentAmount || 0)} / {formatCurrency(project.goalAmount)}
                        </span>
                      </div>
                      
                      <Progress 
                        value={calculateProgress(project.currentAmount || 0, project.goalAmount)} 
                        className="w-full h-3"
                        data-testid={`progress-project-${project.id}`}
                      />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {calculateProgress(project.currentAmount || 0, project.goalAmount)}% funded
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {project.currency || "EUR"}
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => handleDonate(project)}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        data-testid={`button-donate-${project.id}`}
                      >
                        <i className="fas fa-heart mr-2"></i>
                        Support This Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-projects">
                <div className="cultural-icon mx-auto mb-4">
                  <i className="fas fa-hand-holding-heart text-2xl"></i>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No Projects Found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Try adjusting your search criteria"
                    : "No active projects seeking funding"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="text-center py-12" data-testid="section-completed-projects">
            <div className="cultural-icon mx-auto mb-4">
              <i className="fas fa-trophy text-2xl"></i>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Completed Projects
            </h3>
            <p className="text-muted-foreground">
              Celebrate the successful projects that have transformed our community
            </p>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="text-center py-12" data-testid="section-impact-stories">
            <div className="cultural-icon mx-auto mb-4">
              <i className="fas fa-heart text-2xl"></i>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Impact Stories
            </h3>
            <p className="text-muted-foreground">
              Discover how community funding has made a real difference in people's lives
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Donation Dialog */}
      <Dialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Support {selectedProject?.title}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donation Amount (EUR)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="50" 
                        min="1" 
                        step="0.01"
                        {...field} 
                        data-testid="input-donation-amount" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add a message of support..." 
                        {...field} 
                        data-testid="textarea-donation-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="anonymous"
                  {...form.register("isAnonymous")}
                  data-testid="checkbox-anonymous-donation"
                />
                <label htmlFor="anonymous" className="text-sm">Donate anonymously</label>
              </div>
              <Button 
                type="submit" 
                disabled={donateMutation.isPending}
                className="w-full"
                data-testid="button-submit-donation"
              >
                {donateMutation.isPending ? "Processing..." : "Donate Now"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
