
import { DashboardHeader } from "@/components/DashboardHeader";
import { AnalysisSection } from "@/components/AnalysisSection";
import { SampleList } from "@/components/SampleList";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader />
        <AnalysisSection />
        <SampleList />
      </div>
    </div>
  );
};

export default Index;
