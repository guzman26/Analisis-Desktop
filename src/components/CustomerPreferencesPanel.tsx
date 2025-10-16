import React, { useEffect, useState } from 'react';
import { CustomerPreferences } from '@/types';
import { getCustomerPreferences } from '@/api/endpoints';
import { formatEggCount } from '@/utils/eggCalculations';
import './CustomerPreferencesPanel.css';

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
      <div className={`customer-preferences-panel ${className}`}>
        <div className="preferences-loading">
          <div className="loading-spinner"></div>
          <span>Cargando preferencias...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`customer-preferences-panel ${className}`}>
        <div className="preferences-error">{error}</div>
      </div>
    );
  }

  if (!preferences || preferences.totalOrders === 0) {
    return (
      <div className={`customer-preferences-panel ${className}`}>
        <div className="preferences-empty">
          <p>Cliente nuevo - sin historial de compras</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`customer-preferences-panel ${className}`}>
      <div className="preferences-header">
        <h3>Historial de Compras</h3>
      </div>

      <div className="preferences-content">
        {/* Summary Stats */}
        <div className="preferences-stats">
          <div className="stat-item">
            <span className="stat-label">Órdenes</span>
            <span className="stat-value">{preferences.totalOrders}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Cajas</span>
            <span className="stat-value">{preferences.totalBoxes.toLocaleString('es-CL')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Huevos</span>
            <span className="stat-value">{formatEggCount(preferences.totalEggs)}</span>
          </div>
        </div>

        {/* Average Order Size */}
        <div className="preferences-section">
          <h4>Orden Típica</h4>
          <div className="preference-detail">
            <span>{preferences.avgBoxesPerOrder} cajas</span>
            <span className="detail-secondary">
              ({formatEggCount(preferences.avgEggsPerOrder)} huevos)
            </span>
          </div>
        </div>

        {/* Top Calibers */}
        {preferences.topCalibers && preferences.topCalibers.length > 0 && (
          <div className="preferences-section">
            <h4>Calibres Preferidos</h4>
            <div className="preference-list">
              {preferences.topCalibers.map((item, index) => (
                <div key={index} className="preference-item">
                  <div className="preference-item-header">
                    <span className="preference-name">Calibre {item.caliber}</span>
                    <span className="preference-percentage">{item.percentage}%</span>
                  </div>
                  <div className="preference-bar">
                    <div
                      className="preference-bar-fill"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="preference-count">{item.count} cajas</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Formats */}
        {preferences.topFormats && preferences.topFormats.length > 0 && (
          <div className="preferences-section">
            <h4>Formatos Preferidos</h4>
            <div className="preference-list">
              {preferences.topFormats.map((item, index) => (
                <div key={index} className="preference-item">
                  <div className="preference-item-header">
                    <span className="preference-name">Formato {item.format}</span>
                    <span className="preference-percentage">{item.percentage}%</span>
                  </div>
                  <div className="preference-bar">
                    <div
                      className="preference-bar-fill"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="preference-count">{item.count} cajas</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Purchase */}
        {preferences.lastPurchase && (
          <div className="preferences-section">
            <h4>Última Compra</h4>
            <div className="preference-detail">
              {new Date(preferences.lastPurchase).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPreferencesPanel;

