
import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import EliminationDiet from "@/components/food/EliminationDiet";
import FoodIntolerances from "@/components/food/FoodIntolerances";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Food = () => {
  const [activeTab, setActiveTab] = useState("elimination");

  // Force scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageContainer>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Food Tracking</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track your elimination diet and food reactions</p>
      </div>

      <Card className="mb-4 sm:mb-6 border-accent/20">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-medium flex items-center">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Food Reaction Key
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500 flex-shrink-0"></div>
              <span>No reaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
              <span>Mild reaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 flex-shrink-0"></div>
              <span>Severe reaction</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="pb-16 sm:pb-20">
        <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
          <TabsTrigger value="elimination" className="text-xs sm:text-sm">
            Elimination Diet
          </TabsTrigger>
          <TabsTrigger value="intolerances" className="text-xs sm:text-sm">
            Food Intolerances
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="elimination" className="mt-0">
          <EliminationDiet colorCoding={true} />
        </TabsContent>
        
        <TabsContent value="intolerances" className="mt-0">
          <FoodIntolerances />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Food;
