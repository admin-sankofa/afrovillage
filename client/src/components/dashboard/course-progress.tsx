import { type CourseEnrollment, type Course } from "@shared/schema";

interface CourseProgressProps {
  enrollment: CourseEnrollment & {
    course?: Course;
  };
}

export default function CourseProgress({ enrollment }: CourseProgressProps) {
  const progress = enrollment.progress || 0;
  const courseName = enrollment.course?.title || "Unknown Course";
  
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-secondary";
    if (progress >= 50) return "bg-accent";
    return "bg-primary";
  };

  const getNextLesson = (progress: number) => {
    if (progress >= 75) return "Almost Complete!";
    if (progress >= 50) return "Halfway there";
    return "Getting started";
  };

  return (
    <div className="space-y-3" data-testid={`course-progress-${enrollment.id}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground" data-testid={`text-course-title-${enrollment.id}`}>
          {courseName}
        </h4>
        <span className="text-sm text-muted-foreground" data-testid={`text-course-progress-${enrollment.id}`}>
          {progress}% Complete
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground" data-testid={`text-course-next-${enrollment.id}`}>
        Next: {getNextLesson(progress)}
      </p>
    </div>
  );
}
