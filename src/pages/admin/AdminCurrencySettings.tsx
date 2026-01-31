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
import { useLanguage } from "@/lib/i18n";
import { useCurrencyTranslations } from "@/lib/currency-translations";

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
  const { language, isRTL } = useLanguage();
  const { t } = useCurrencyTranslations(language);
  
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
      toast.error(t('toast', 'loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRate = async () => {
    const rateValue = parseFloat(newRate);
    if (isNaN(rateValue) || rateValue <= 0) {
      toast.error(t('toast', 'invalidRate'));
      return;
    }

    setSaving(true);
    try {
      if (currentRate) {
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

      toast.success(t('toast', 'updateSuccess'));
      fetchCurrentRate();
    } catch (err: any) {
      console.error('Error updating rate:', err);
      toast.error(t('toast', 'updateError'));
    } finally {
      setSaving(false);
    }
  };

  // Format number based on language
  const formatNumber = (num: number) => {
    if (isRTL) {
      return num.toLocaleString('fa-IR');
    }
    return num.toLocaleString('en-US');
  };

  // Calculate example conversions
  const exampleAFN = 1000;
  const calculatedUSD = currentRate 
    ? (exampleAFN / currentRate.exchange_rate).toFixed(2)
    : '0.00';

  return (
    <AdminLayout title={t('page', 'title')} description={t('page', 'description')}>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-2xl font-bold">{t('page', 'title')}</h1>
          <p className="text-muted-foreground">
            {t('page', 'description')}
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('alert', 'baseCurrencyInfo')}
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t('currentRate', 'title')}
              </CardTitle>
              <CardDescription>
                {t('currentRate', 'description')}
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
                    <span className="text-lg font-medium">{t('currentRate', 'oneUsdEquals')}</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatNumber(currentRate.exchange_rate)} {t('currentRate', 'afnSuffix')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <History className="h-4 w-4" />
                    <span>
                      {t('currentRate', 'lastUpdated')} {format(new Date(currentRate.updated_at), 'PPp')}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    {t('currentRate', 'active')}
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('currentRate', 'noRateConfigured')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                {t('updateRate', 'title')}
              </CardTitle>
              <CardDescription>
                {t('updateRate', 'description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate">{t('updateRate', 'inputLabel')}</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder={t('updateRate', 'inputPlaceholder')}
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="text-lg"
                />
              </div>

              {newRate && parseFloat(newRate) > 0 && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">{t('updateRate', 'preview')}</p>
                  <p>
                    {formatNumber(exampleAFN)} {t('examples', 'afn')} {t('common', 'approximately')} $
                    {(exampleAFN / parseFloat(newRate)).toFixed(2)} {t('examples', 'usd')}
                  </p>
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
                    {t('updateRate', 'saving')}
                  </>
                ) : (
                  t('updateRate', 'updateButton')
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Conversion Examples */}
        <Card>
          <CardHeader>
            <CardTitle>{t('examples', 'title')}</CardTitle>
            <CardDescription>
              {t('examples', 'description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentRate ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].map((afn) => (
                  <div key={afn} className="p-3 bg-secondary/50 rounded-lg text-center">
                    <div className="font-bold">{formatNumber(afn)} {t('examples', 'afn')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('common', 'approximately')} ${(afn / currentRate.exchange_rate).toFixed(2)} {t('examples', 'usd')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {t('examples', 'noRateMessage')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCurrencySettings;
