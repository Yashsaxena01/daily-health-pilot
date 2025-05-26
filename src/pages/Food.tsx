
import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import EliminationDiet from "@/components/food/EliminationDiet";
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Food Tracking</h1>
        <p className="text-muted-foreground">Track your elimination diet and food reactions</p>
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

      <div className="pb-20">
        <EliminationDiet colorCoding={true} />
      </div>
    </PageContainer>
  );
};

export default Food;
