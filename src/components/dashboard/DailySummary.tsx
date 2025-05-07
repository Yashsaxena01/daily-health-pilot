
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface DailySummaryProps {
  weight?: number;
  meals: {
    type: string;
    photo?: string;
    description: string;
    feeling?: string;
  }[];
  activities: {
    description: string;
    completed: boolean;
  }[];
  foodsIntroduced: {
    name: string;
    category: string;
    reaction?: string;
  }[];
  scheduleCompletionRate: number;
}

const DailySummary = ({
  weight,
  meals,
  activities,
  foodsIntroduced,
  scheduleCompletionRate,
}: DailySummaryProps) => {
  const today = new Date();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{format(today, "EEEE, MMMM d")}</h2>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          Today
        </span>
      </div>

      {weight && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">Morning Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <span className="text-3xl font-bold">{weight}</span>
              <span className="text-sm ml-1 text-muted-foreground">kg</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-muted-foreground">Today's Meals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {meals.length > 0 ? (
            meals.map((meal, index) => (
              <div key={index} className="flex items-center gap-3">
                {meal.photo ? (
                  <div className="w-12 h-12 rounded-md bg-muted overflow-hidden">
                    <img src={meal.photo} alt={meal.type} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    No photo
                  </div>
                )}
                <div>
                  <h4 className="font-medium capitalize">{meal.type}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {meal.description}
                  </p>
                  {meal.feeling && (
                    <p className="text-xs text-accent">Felt: {meal.feeling}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No meals recorded today</p>
          )}
        </CardContent>
      </Card>

      {activities.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Exercise & Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {activities.map((activity, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${activity.completed ? "bg-mint" : "bg-muted"}`} />
                  <span className={activity.completed ? "" : "text-muted-foreground"}>
                    {activity.description}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {foodsIntroduced.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Foods Introduced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {foodsIntroduced.map((food, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{food.name}</span>
                  <span className="text-xs text-muted-foreground"> ({food.category})</span>
                  {food.reaction && (
                    <p className="text-xs text-muted-foreground mt-0.5">{food.reaction}</p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-muted-foreground">
            Schedule Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${scheduleCompletionRate}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {scheduleCompletionRate}% complete
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySummary;
