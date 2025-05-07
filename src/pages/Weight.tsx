
import PageContainer from "@/components/layout/PageContainer";
import WeightTracker from "@/components/weight/WeightTracker";

const Weight = () => {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Weight Tracker</h1>
        <p className="text-muted-foreground">Monitor your weight journey</p>
      </div>

      <WeightTracker />
    </PageContainer>
  );
};

export default Weight;
