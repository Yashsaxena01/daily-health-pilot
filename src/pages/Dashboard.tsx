
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Weight, Utensils, Calendar, TrendingUp, Plus, Check, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WeightGraph from "@/components/weight/WeightGraph";
import { useWeightData } from "@/hooks/useWeightData";
import { useScheduleItems } from "@/hooks/useScheduleItems";

interface TodaysFood {
  id: string;
  name: string;
  category: string;
  image_url: string;
}

interface KnownIntolerance {
  id: string;
  food_name: string;
  reaction_level: string;
  discovered_date: string;
}

const Dashboard = () => {
  const today = format(new Date(), "EEEE, MMMM d");
  const { weightData, addWeightEntry, refreshWeightData } = useWeightData();
  const { getTodaysItems, refreshScheduleItems, updateScheduleItem } = useScheduleItems();
  
  const [weight, setWeight] = useState("");
  const [todaysFood, setTodaysFood] = useState<TodaysFood | null>(null);
  const [knownIntolerances, setKnownIntolerances] = useState<KnownIntolerance[]>([]);
  const [newIntolerance, setNewIntolerance] = useState("");
  const [newIntoleranceLevel, setNewIntoleranceLevel] = useState("mild");

  useEffect(() => {
    fetchTodaysFood();
    fetchKnownIntolerances();
    refreshWeightData();
    refreshScheduleItems();
  }, []);

  const fetchTodaysFood = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("foods")
        .select(`
          *,
          food_categories (
            name
          )
        `)
        .eq("scheduled_date", today)
        .eq("introduced", false)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const food = data[0];
        setTodaysFood({
          id: food.id,
          name: food.name,
          category: food.food_categories?.name || "Uncategorized",
          image_url: `https://images.unsplash.com/400x200/?${encodeURIComponent(food.name)}`
        });
      }
    } catch (error) {
      console.error("Error fetching today's food:", error);
    }
  };

  const fetchKnownIntolerances = async () => {
    try {
      const { data, error } = await supabase
        .from("food_intolerances")
        .select("*")
        .order("discovered_date", { ascending: false })
        .limit(5);

      if (error) throw error;

      setKnownIntolerances(data || []);
    } catch (error) {
      console.error("Error fetching intolerances:", error);
    }
  };

  const handleAddWeight = async () => {
    if (!weight) return;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) {
      toast({
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }
    
    await addWeightEntry(new Date(), numWeight);
    setWeight("");
  };

  const handleToggleActivity = async (item: any) => {
    if (!item.id) return;
    
    const success = await updateScheduleItem(item.id, { 
      completed: !item.completed 
    });
    
    if (success) {
      toast({
        description: item.completed ? "Activity marked as incomplete" : "Activity completed!",
      });
      setTimeout(() => {
        refreshScheduleItems();
      }, 500);
    }
  };

  const addKnownIntolerance = async () => {
    if (!newIntolerance.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("food_intolerances")
        .insert({
          food_name: newIntolerance.trim(),
          reaction_level: newIntoleranceLevel,
          discovered_date: new Date().toISOString().split('T')[0],
          category: "known_intolerance",
          user_id: user?.id || null
        });

      if (error) throw error;

      setNewIntolerance("");
      fetchKnownIntolerances();
      
      toast({
        description: "Known intolerance added",
      });
    } catch (error) {
      console.error("Error adding intolerance:", error);
      toast({
        title: "Error",
        description: "Failed to add intolerance",
        variant: "destructive",
      });
    }
  };

  const markFoodAsIntroduced = async () => {
    if (!todaysFood) return;

    try {
      const { error } = await supabase
        .from("foods")
        .update({ 
          introduced: true,
          introduction_date: new Date().toISOString().split('T')[0]
        })
        .eq("id", todaysFood.id);

      if (error) throw error;

      setTodaysFood(null);
      
      toast({
        description: "Food marked as introduced!",
      });
    } catch (error) {
      console.error("Error marking food as introduced:", error);
    }
  };

  const todaysSchedule = getTodaysItems();
  const latestWeight = weightData.length > 0 ? weightData[0].weight : null;
  const completedTasks = todaysSchedule.filter(item => item.completed).length;
  const totalTasks = todaysSchedule.length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Good morning! 👋
        </h1>
        <p className="text-gray-600 text-lg">{today}</p>
      </div>

      {/* Weight Tracking Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl">
            <Weight className="h-6 w-6 mr-3" />
            Weight Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Current Weight</p>
              <p className="text-3xl font-bold">
                {latestWeight ? `${latestWeight} kg` : "No data"}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-200" />
          </div>
          
          <div className="flex gap-3">
            <Input
              type="number"
              step="0.1"
              placeholder="Enter weight (kg)"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-blue-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddWeight();
                }
              }}
            />
            <Button 
              onClick={handleAddWeight} 
              className="bg-white/20 hover:bg-white/30 border border-white/30"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {weightData.length > 0 && (
            <div className="h-32 bg-white/10 rounded-lg p-2">
              <WeightGraph 
                data={weightData.slice(0, 7)} 
                view="daily"
                currentDate={new Date()}
                onDateChange={() => {}}
                showNavigation={false}
              />
            </div>
          )}
          
          <Link to="/weight">
            <Button variant="ghost" className="w-full text-white border border-white/30 hover:bg-white/20">
              View Details
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Today's Food Introduction */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl">
            <Utensils className="h-6 w-6 mr-3" />
            Today's Food Introduction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todaysFood ? (
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <img
                  src={todaysFood.image_url}
                  alt={todaysFood.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.unsplash.com/400x200/?food`;
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{todaysFood.name}</h3>
                  <p className="text-emerald-100">{todaysFood.category}</p>
                </div>
                <Button 
                  onClick={markFoodAsIntroduced}
                  className="bg-white/20 hover:bg-white/30 border border-white/30"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Introduced
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-emerald-100 mb-2">No food scheduled for today</p>
              <Link to="/food">
                <Button className="bg-white/20 hover:bg-white/30 border border-white/30">
                  Schedule Foods
                </Button>
              </Link>
            </div>
          )}

          {/* Known Intolerances */}
          <div className="space-y-3">
            <h4 className="font-semibold text-emerald-100">Known Intolerances</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Add known intolerance"
                value={newIntolerance}
                onChange={(e) => setNewIntolerance(e.target.value)}
                className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-emerald-200"
              />
              <select
                value={newIntoleranceLevel}
                onChange={(e) => setNewIntoleranceLevel(e.target.value)}
                className="px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white"
              >
                <option value="mild" className="text-gray-900">Mild</option>
                <option value="severe" className="text-gray-900">Severe</option>
              </select>
              <Button 
                onClick={addKnownIntolerance}
                className="bg-white/20 hover:bg-white/30 border border-white/30"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {knownIntolerances.length > 0 && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="space-y-1">
                  {knownIntolerances.map((intolerance) => (
                    <div key={intolerance.id} className="flex items-center justify-between text-sm">
                      <span>{intolerance.food_name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        intolerance.reaction_level === 'severe' 
                          ? 'bg-red-200 text-red-800' 
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {intolerance.reaction_level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Link to="/food">
            <Button variant="ghost" className="w-full text-white border border-white/30 hover:bg-white/20">
              View Food Repository
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl">
            <Calendar className="h-6 w-6 mr-3" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 mb-1">Progress</p>
              <p className="text-2xl font-bold">
                {completedTasks}/{totalTasks} completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-100 mb-1">Next Task</p>
              <div className="flex items-center text-purple-200">
                <Clock className="h-4 w-4 mr-1" />
                {todaysSchedule.find(item => !item.completed)?.time || "All done!"}
              </div>
            </div>
          </div>

          {todaysSchedule.length > 0 ? (
            <div className="bg-white/10 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
              {todaysSchedule.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActivity(item)}
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      item.completed 
                        ? 'bg-white border-white' 
                        : 'border-white/50 hover:border-white'
                    }`}
                  >
                    {item.completed && <Check className="h-3 w-3 text-purple-600" />}
                  </button>
                  <div className="flex-1">
                    <p className={`${item.completed ? 'line-through text-purple-200' : ''}`}>
                      {item.title}
                    </p>
                    {item.time && (
                      <p className="text-sm text-purple-200">{item.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-purple-100 mb-2">No activities scheduled for today</p>
            </div>
          )}
          
          <Link to="/schedule">
            <Button variant="ghost" className="w-full text-white border border-white/30 hover:bg-white/20">
              Manage Schedule
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
