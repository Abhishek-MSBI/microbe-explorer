
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TreeMap,
  Legend
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

type TaxonomyReference = {
  id: number;
  taxon_id: string;
  scientific_name: string;
  rank: string | null;
  parent_taxon_id: string | null;
  updated_at: string | null;
  created_at: string | null;
}

type ChartData = {
  name: string;
  value: number;
  rank?: string;
  children?: ChartData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const AnalysisSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [taxonomyData, setTaxonomyData] = useState<ChartData[]>([
    { name: "Bacteroidetes", value: 35, rank: "phylum" },
    { name: "Firmicutes", value: 28, rank: "phylum" },
    { name: "Proteobacteria", value: 15, rank: "phylum" },
    { name: "Actinobacteria", value: 12, rank: "phylum" },
    { name: "Others", value: 10, rank: "phylum" },
  ]);
  const [selectedView, setSelectedView] = useState<'bar' | 'pie' | 'tree'>('bar');
  const { toast } = useToast();

  const calculateDiversityMetrics = (data: ChartData[]) => {
    const totalCount = data.reduce((sum, item) => sum + item.value, 0);
    
    // Shannon diversity index
    const shannon = data.reduce((h, item) => {
      const p = item.value / totalCount;
      return h - (p * Math.log(p));
    }, 0);

    // Simpson diversity index
    const simpson = 1 - data.reduce((d, item) => {
      const p = item.value / totalCount;
      return d + (p * p);
    }, 0);

    // Observed species (richness)
    const richness = data.length;

    // Evenness
    const evenness = shannon / Math.log(richness);

    return { shannon, simpson, richness, evenness };
  };

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
        .limit(10) as { data: TaxonomyReference[] | null, error: Error | null };

      if (dbError) throw dbError;

      if (taxonomyRefs?.length) {
        // Group by rank and calculate relative abundance
        const grouped = taxonomyRefs.reduce((acc, ref) => {
          const rank = ref.rank || 'unknown';
          if (!acc[rank]) acc[rank] = [];
          acc[rank].push(ref);
          return acc;
        }, {} as Record<string, TaxonomyReference[]>);

        const chartData = Object.entries(grouped).flatMap(([rank, refs]) => 
          refs.map((ref, index) => ({
            name: ref.scientific_name.split(' ')[0],
            value: 100 / refs.length, // Convert to percentage
            rank
          }))
        );

        setTaxonomyData(chartData);
        
        toast({
          title: "Taxonomy data updated",
          description: `Found ${taxonomyRefs.length} records across ${Object.keys(grouped).length} ranks`,
        });
      }
    } catch (error: any) {
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

  const metrics = calculateDiversityMetrics(taxonomyData);

  const renderChart = () => {
    switch (selectedView) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={taxonomyData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {taxonomyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'tree':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <TreeMap
              data={taxonomyData}
              dataKey="value"
              nameKey="name"
              fill="#8884d8"
              content={(props: any) => {
                const { depth, x, y, width, height, name, value } = props;
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: COLORS[depth % COLORS.length],
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                    {width > 30 && height > 30 && (
                      <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                      >
                        {`${name} (${value.toFixed(1)}%)`}
                      </text>
                    )}
                  </g>
                );
              }}
            />
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taxonomyData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2dd4bf" name="Relative Abundance (%)" />
            </BarChart>
          </ResponsiveContainer>
        );
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
              onKeyDown={(e) => e.key === 'Enter' && searchTaxonomy()}
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
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setSelectedView('bar')}
            variant={selectedView === 'bar' ? 'default' : 'outline'}
            size="sm"
          >
            Bar Chart
          </Button>
          <Button
            onClick={() => setSelectedView('pie')}
            variant={selectedView === 'pie' ? 'default' : 'outline'}
            size="sm"
          >
            Pie Chart
          </Button>
          <Button
            onClick={() => setSelectedView('tree')}
            variant={selectedView === 'tree' ? 'default' : 'outline'}
            size="sm"
          >
            Tree Map
          </Button>
        </div>
        <div className="h-[300px] w-full">
          {renderChart()}
        </div>
      </Card>
      
      <Card className="p-6 bg-white/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4">Diversity Metrics</h2>
        <div className="space-y-4">
          <MetricRow 
            label="Shannon Index (H')" 
            value={metrics.shannon.toFixed(3)}
            description="Measures species diversity considering both abundance and evenness"
          />
          <MetricRow 
            label="Simpson Index (1-D)" 
            value={metrics.simpson.toFixed(3)}
            description="Probability that two randomly selected individuals belong to different species"
          />
          <MetricRow 
            label="Species Richness" 
            value={metrics.richness.toString()}
            description="Total number of different species in the community"
          />
          <MetricRow 
            label="Evenness (J')" 
            value={metrics.evenness.toFixed(3)}
            description="How evenly the individuals are distributed among different species"
          />
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

const MetricRow = ({ 
  label, 
  value, 
  description 
}: { 
  label: string; 
  value: string; 
  description?: string;
}) => (
  <div className="py-2 border-b border-gray-100 last:border-0">
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
    {description && (
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    )}
  </div>
);
