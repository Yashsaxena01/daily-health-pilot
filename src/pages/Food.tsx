
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import MealPlanner from "@/components/food/MealPlanner";
import EliminationDiet from "@/components/food/EliminationDiet";
import FoodSummary from "@/components/food/FoodSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, AlertCircle, BarChart, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Food = () => {
  // Force scroll to top when the component mounts
  useState(() => {
    window.scrollTo(0, 0);
  });

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Food Tracking</h1>
        <p className="text-muted-foreground">Log meals and manage your elimination diet</p>
      </div>

      <Card className="mb-6 border-accent/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Food Reaction Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>No reaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span>Mild reaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span>Severe reaction</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="pb-20">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Meal Planner
          </TabsTrigger>
          <TabsTrigger value="elimination" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Elimination Diet
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <FoodSummary />
        </TabsContent>
        
        <TabsContent value="meals">
          <MealPlanner />
        </TabsContent>
        
        <TabsContent value="elimination">
          <EliminationDiet colorCoding={true} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Food;
