import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, DollarSign, RefreshCw, History, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CurrencyRate {
  id: string;
  base_currency: string;
  target_currency: string;
  exchange_rate: number;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

const AdminCurrencySettings = () => {
  const { user } = useAuth();
  const [currentRate, setCurrentRate] = useState<CurrencyRate | null>(null);
  const [newRate, setNewRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCurrentRate();
  }, []);

  const fetchCurrentRate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('currency_rates')
        .select('*')
        .eq('base_currency', 'AFN')
        .eq('target_currency', 'USD')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCurrentRate(data);
        setNewRate(data.exchange_rate.toString());
      }
    } catch (err: any) {
      console.error('Error fetching rate:', err);
      toast.error('Failed to load exchange rate');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRate = async () => {
    const rateValue = parseFloat(newRate);
    if (isNaN(rateValue) || rateValue <= 0) {
      toast.error('Please enter a valid positive exchange rate');
      return;
    }

    setSaving(true);
    try {
      if (currentRate) {
        // Update existing rate
        const { error } = await supabase
          .from('currency_rates')
          .update({
            exchange_rate: rateValue,
            updated_by: user?.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentRate.id);

        if (error) throw error;
      } else {
        // Create new rate
        const { error } = await supabase
          .from('currency_rates')
          .insert({
            base_currency: 'AFN',
            target_currency: 'USD',
            exchange_rate: rateValue,
            is_active: true,
            updated_by: user?.id,
          });

        if (error) throw error;
      }

      toast.success('Exchange rate updated successfully');
      fetchCurrentRate();
    } catch (err: any) {
      console.error('Error updating rate:', err);
      toast.error('Failed to update exchange rate');
    } finally {
      setSaving(false);
    }
  };

  // Calculate example conversions
  const exampleAFN = 1000;
  const calculatedUSD = currentRate 
    ? (exampleAFN / currentRate.exchange_rate).toFixed(2)
    : '0.00';

  return (
    <AdminLayout title="Currency Settings" description="Manage USD exchange rate">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Currency Settings</h1>
          <p className="text-muted-foreground">
            Manage the USD exchange rate for price display across the platform
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            AFN (Afghani) is the base currency. All product prices are stored in AFN. 
            USD prices are calculated dynamically using the rate you set here.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Exchange Rate
              </CardTitle>
              <CardDescription>
                Active rate used for USD conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : currentRate ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <span className="text-lg font-medium">1 USD =</span>
                    <span className="text-2xl font-bold text-primary">
                      {currentRate.exchange_rate.toLocaleString()} AFN
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <History className="h-4 w-4" />
                    <span>
                      Last updated: {format(new Date(currentRate.updated_at), 'PPp')}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    Active
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No exchange rate configured yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Update Exchange Rate
              </CardTitle>
              <CardDescription>
                Set a new AFN to USD conversion rate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate">1 USD equals (in AFN)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g., 87.50"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="text-lg"
                />
              </div>

              {newRate && parseFloat(newRate) > 0 && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Preview:</p>
                  <p>{exampleAFN.toLocaleString()} AFN ≈ ${(exampleAFN / parseFloat(newRate)).toFixed(2)} USD</p>
                </div>
              )}

              <Button 
                onClick={handleUpdateRate} 
                disabled={saving || !newRate}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Update Rate'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Conversion Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Examples</CardTitle>
            <CardDescription>
              How prices will appear across the platform with current rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentRate ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].map((afn) => (
                  <div key={afn} className="p-3 bg-secondary/50 rounded-lg text-center">
                    <div className="font-bold">{afn.toLocaleString()} AFN</div>
                    <div className="text-sm text-muted-foreground">
                      ≈ ${(afn / currentRate.exchange_rate).toFixed(2)} USD
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Set an exchange rate to see conversion examples
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCurrencySettings;
