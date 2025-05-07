
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import MealTracker from "@/components/food/MealTracker";
import EliminationDiet from "@/components/food/EliminationDiet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Food = () => {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Food Tracking</h1>
        <p className="text-muted-foreground">Log meals and manage your elimination diet</p>
      </div>

      <Tabs defaultValue="meals">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="meals">Meal Tracker</TabsTrigger>
          <TabsTrigger value="elimination">Elimination Diet</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meals">
          <MealTracker />
        </TabsContent>
        
        <TabsContent value="elimination">
          <EliminationDiet />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Food;
