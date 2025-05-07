
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import DailySummary from "@/components/dashboard/DailySummary";

const Dashboard = () => {
  // Mock data for demonstration
  const [dashboardData] = useState({
    weight: 72.5,
    meals: [
      {
        type: "breakfast",
        description: "Oatmeal with berries",
        feeling: "great"
      },
      {
        type: "lunch",
        description: "Chicken salad with avocado",
        feeling: "okay"
      }
    ],
    activities: [
      { description: "Morning run - 30 minutes", completed: true },
      { description: "Evening yoga", completed: false }
    ],
    foodsIntroduced: [
      { name: "Almonds", category: "Nuts", reaction: "No reaction noticed" },
      { name: "Yogurt", category: "Dairy", reaction: "Slight bloating after 2 hours" }
    ],
    scheduleCompletionRate: 65
  });

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Daily Health Pilot</h1>
        <p className="text-muted-foreground">Track your health journey</p>
      </div>

      <DailySummary 
        weight={dashboardData.weight}
        meals={dashboardData.meals}
        activities={dashboardData.activities}
        foodsIntroduced={dashboardData.foodsIntroduced}
        scheduleCompletionRate={dashboardData.scheduleCompletionRate}
      />
    </PageContainer>
  );
};

export default Dashboard;
