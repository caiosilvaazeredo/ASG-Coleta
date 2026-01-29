import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { ArrowUp, ArrowDown, Minus, Lightbulb, Loader2 } from 'lucide-react';
import { Institution, KPIMetric } from '../types';
import { generateSustainabilityInsights } from '../services/geminiService';

interface DashboardProps {
  institution: Institution;
  kpis: KPIMetric[];
}

const Dashboard: React.FC<DashboardProps> = ({ institution, kpis }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Mock data for charts
  const performanceData = [
    { subject: 'Governança', A: 120, fullMark: 150 },
    { subject: 'Econômico', A: 98, fullMark: 150 },
    { subject: 'Ambiental', A: 86, fullMark: 150 },
    { subject: 'Social', A: 99, fullMark: 150 },
  ];

  const evolutionData = [
    { name: '2022', score: 30 },
    { name: '2023', score: 40 },
    { name: '2024', score: 47.5 },
  ];

  const theme = institution.theme;

  useEffect(() => {
    // Reset insights when institution changes
    setInsights(null);
  }, [institution]);

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    const score = kpis.find(k => k.label.includes('Índice'))?.value || "0%";
    const gapCount = parseInt(kpis.find(k => k.label.includes('GAP'))?.value || "0");
    
    const result = await generateSustainabilityInsights(institution.id, score, gapCount, performanceData);
    setInsights(result);
    setLoadingInsights(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Dashboard Executivo</h2>
           <p className="text-gray-500">Visão geral de desempenho ASG - {institution.name}</p>
        </div>
        <button 
            onClick={handleGenerateInsights}
            disabled={loadingInsights}
            className={`flex items-center gap-2 bg-gradient-to-r from-${theme}-600 to-${theme}-800 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-md disabled:opacity-50`}
        >
            {loadingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
            {loadingInsights ? 'Analisando...' : 'Gerar Insights com IA'}
        </button>
      </div>

      {insights && (
        <div className={`bg-${theme}-50 border border-${theme}-200 rounded-xl p-6 shadow-sm`}>
            <h3 className={`text-${theme}-900 font-bold flex items-center gap-2 mb-3`}>
                <Lightbulb className="w-5 h-5" />
                Análise Inteligente (Gemini)
            </h3>
            <div className={`prose prose-sm text-${theme}-800`} dangerouslySetInnerHTML={{ __html: insights }} />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
              <span className={`flex items-center text-sm font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {kpi.trend === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : 
                 kpi.trend === 'down' ? <ArrowDown className="w-4 h-4 mr-1" /> : 
                 <Minus className="w-4 h-4 mr-1" />}
                {Math.abs(kpi.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance por Dimensão</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} />
                        <Radar name={institution.name} dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Evolution Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução do Índice GRI (Anual)</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f3f4f6' }}
                        />
                        <Bar dataKey="score" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Índice %" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;