
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

export const AnalysisSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [taxonomyData, setTaxonomyData] = useState([
    { name: "Bacteroidetes", value: 35 },
    { name: "Firmicutes", value: 28 },
    { name: "Proteobacteria", value: 15 },
    { name: "Actinobacteria", value: 12 },
    { name: "Others", value: 10 },
  ]);
  const { toast } = useToast();

  const searchTaxonomy = async () => {
    if (!searchTerm) {
      toast({
        title: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-taxonomy', {
        body: { searchTerm }
      });

      if (error) throw error;

      // Fetch the stored taxonomy data from our database
      const { data: taxonomyRefs, error: dbError } = await supabase
        .from('taxonomy_references')
        .select('*')
        .order('scientific_name', { ascending: true })
        .limit(10);

      if (dbError) throw dbError;

      if (taxonomyRefs?.length) {
        const chartData = taxonomyRefs.map(ref => ({
          name: ref.scientific_name.split(' ')[0], // Use genus name for brevity
          value: 1 // For now, just showing presence
        }));
        setTaxonomyData(chartData);
        
        toast({
          title: "Taxonomy data updated",
          description: `Found ${taxonomyRefs.length} records`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error fetching taxonomy data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card className="p-6 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Taxonomic Composition</h2>
          <div className="flex-1 flex gap-2">
            <Input 
              placeholder="Search taxonomy..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchTaxonomy()}
            />
            <Button 
              onClick={searchTaxonomy}
              disabled={loading}
              className="bg-theme-500 hover:bg-theme-600 text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taxonomyData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#2dd4bf" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <Card className="p-6 bg-white/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4">Diversity Metrics</h2>
        <div className="space-y-4">
          <MetricRow label="Shannon Index" value="3.8" />
          <MetricRow label="Simpson Index" value="0.85" />
          <MetricRow label="Observed Species" value="1,432" />
          <MetricRow label="Chao1 Estimate" value="1,587" />
        </div>
        <div className="mt-6">
          <Button className="w-full bg-theme-500 hover:bg-theme-600 text-white">
            Export Analysis
          </Button>
        </div>
      </Card>
    </div>
  );
};

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);
