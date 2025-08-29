import { type Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const currentAmount = parseFloat(project.currentAmount || "0");
  const goalAmount = parseFloat(project.goalAmount);
  const progress = Math.round((currentAmount / goalAmount) * 100);
  
  const getDaysLeft = () => {
    if (!project.deadline) return null;
    const today = new Date();
    const deadline = new Date(project.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : "Deadline passed";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: project.currency || 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-3" data-testid={`project-card-${project.id}`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-foreground text-sm" data-testid={`text-project-title-${project.id}`}>
            {project.title}
          </h4>
          <p className="text-muted-foreground text-xs" data-testid={`text-project-description-${project.id}`}>
            {project.description}
          </p>
        </div>
        {getDaysLeft() && (
          <span className="text-xs text-muted-foreground" data-testid={`text-project-deadline-${project.id}`}>
            {getDaysLeft()}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground" data-testid={`text-project-funding-${project.id}`}>
            {formatCurrency(currentAmount)} / {formatCurrency(goalAmount)}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-secondary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
