import React, { useEffect, useState } from 'react';
import { CustomerPreferences } from '@/types';
import { getCustomerPreferences } from '@/api/endpoints';
import { formatEggCount } from '@/utils/eggCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerPreferencesPanelProps {
  customerId: string;
  className?: string;
}

const CustomerPreferencesPanel: React.FC<CustomerPreferencesPanelProps> = ({
  customerId,
  className = '',
}) => {
  const [preferences, setPreferences] = useState<CustomerPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomerPreferences(customerId);
        setPreferences(data);
      } catch (err) {
        console.error('Error fetching customer preferences:', err);
        setError('No se pudieron cargar las preferencias');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchPreferences();
    }
  }, [customerId]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Cargando preferencias...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!preferences || preferences.totalOrders === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Cliente nuevo - sin historial de compras
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Historial de Compras</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Órdenes</div>
            <div className="text-lg font-semibold">{preferences.totalOrders}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Total Cajas</div>
            <div className="text-lg font-semibold">
              {preferences.totalBoxes.toLocaleString('es-CL')}
            </div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Total Huevos</div>
            <div className="text-lg font-semibold">
              {formatEggCount(preferences.totalEggs)}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Orden Típica</h4>
          <div className="text-sm">
            {preferences.avgBoxesPerOrder} cajas{' '}
            <span className="text-muted-foreground">
              ({formatEggCount(preferences.avgEggsPerOrder)} huevos)
            </span>
          </div>
        </div>

        {preferences.topCalibers && preferences.topCalibers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Calibres Preferidos</h4>
            <div className="space-y-3">
              {preferences.topCalibers.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Calibre {item.caliber}</span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.count} cajas
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {preferences.topFormats && preferences.topFormats.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Formatos Preferidos</h4>
            <div className="space-y-3">
              {preferences.topFormats.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Formato {item.format}</span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.count} cajas
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {preferences.lastPurchase && (
          <div>
            <h4 className="text-sm font-medium mb-2">Última Compra</h4>
            <div className="text-sm">
              {new Date(preferences.lastPurchase).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerPreferencesPanel;
