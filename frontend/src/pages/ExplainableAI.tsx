import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MockExplanationService } from '../services/MockExplanationService';
import type { Explanation } from '../types';
import { BrainCircuit, Loader2, ShieldAlert } from 'lucide-react';
import { ShapChart } from '../components/explain/ShapChart';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const explanationService = new MockExplanationService();

export const ExplainableAI: React.FC = () => {
  const [predictionId, setPredictionId] = useState('pred-demo123');
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExplanation = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await explanationService.getExplanation(id);
      setExplanation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation(predictionId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (predictionId) {
      fetchExplanation(predictionId);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Explainable AI</h1>
          <p className="text-sm text-textSecondary mt-1">Interpretability & Feature Contribution</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-80">
          <Input 
            label="" 
            placeholder="Prediction ID..." 
            value={predictionId}
            onChange={(e) => setPredictionId(e.target.value)}
            className="h-9 mt-0"
          />
          <Button type="submit" size="sm" disabled={isLoading}>Analyze</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Column: Context & Summary */}
        <div className="col-span-1 space-y-6">
          <Card className="bg-surface border-secondary shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-textSecondary uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-techBlue" />
                Prediction Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-techBlue" /></div>
              ) : explanation ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-textSecondary block mb-1">Target ID</span>
                    <span className="font-mono text-sm font-medium">{explanation.predictionId}</span>
                  </div>
                  <div className="p-4 bg-riskRed/10 border border-riskRed/20 rounded-lg flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-riskRed mt-0.5" />
                    <div>
                      <span className="block font-bold text-riskRed uppercase tracking-wider text-sm mb-1">High Risk Flagged</span>
                      <p className="text-xs text-textPrimary leading-relaxed">
                        The model identified anomalous patterns primarily driven by <span className="font-semibold">Velocity Deviation</span> and <span className="font-semibold">Amount Anomaly</span>, heavily outweighing the established account history.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
          
          <Card className="bg-surface border-secondary shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-textSecondary uppercase tracking-widest">Base Score</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-black font-mono">{(explanation?.baseValue || 0).toFixed(3)}</span>
                 <span className="text-sm text-textSecondary mb-1">baseline risk</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visualization */}
        <div className="col-span-1 lg:col-span-2">
          <Card className="h-full bg-surface border-secondary shadow-sm flex flex-col">
            <CardHeader className="border-b border-secondary/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">SHAP Feature Contributions</CardTitle>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-riskRed rounded-sm" />
                    <span className="text-textSecondary">Increases Risk</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-healthGreen rounded-sm" />
                    <span className="text-textSecondary">Decreases Risk</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-sm z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-techBlue" />
                </div>
              ) : null}
              {explanation && (
                <ShapChart data={explanation.topFeatures} />
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};
