import React, { useState, useMemo } from 'react';
import { Card, Button } from '@/components/design-system';
import { Check, X } from 'lucide-react';
import { ALL_CALIBRE_CODES, CALIBRE_MAP } from '@/utils/getParamsFromCodigo';
import { CalibreSelection } from '@/types';

interface BoxSelectionStepProps {
  selectedCalibres: CalibreSelection[];
  onSelectionChange: (calibres: CalibreSelection[]) => void;
}

const BoxSelectionStep: React.FC<BoxSelectionStepProps> = ({
  selectedCalibres,
  onSelectionChange,
}) => {
  // Convertir array a Map para facilitar el manejo
  const calibreMap = useMemo(() => {
    const map = new Map<string, number>();
    selectedCalibres.forEach((cal) => {
      map.set(cal.calibre, cal.boxCount);
    });
    return map;
  }, [selectedCalibres]);

  // Manejar selección/deselección de calibre
  const handleCalibreToggle = (calibre: string) => {
    const newCalibres = [...selectedCalibres];
    const existingIndex = newCalibres.findIndex((c) => c.calibre === calibre);

    if (existingIndex >= 0) {
      // Remover calibre si ya está seleccionado
      newCalibres.splice(existingIndex, 1);
    } else {
      // Agregar calibre con cantidad inicial 0
      newCalibres.push({ calibre, boxCount: 0 });
    }

    onSelectionChange(newCalibres);
  };

  // Manejar cambio de cantidad para un calibre
  const handleQuantityChange = (calibre: string, quantity: number) => {
    const newCalibres = [...selectedCalibres];
    const existingIndex = newCalibres.findIndex((c) => c.calibre === calibre);

    if (existingIndex >= 0) {
      // Actualizar cantidad
      newCalibres[existingIndex] = {
        ...newCalibres[existingIndex],
        boxCount: Math.max(0, quantity),
      };
    } else {
      // Agregar nuevo calibre con cantidad
      newCalibres.push({ calibre, boxCount: Math.max(0, quantity) });
    }

    onSelectionChange(newCalibres);
  };

  // Remover calibre de la selección
  const handleRemoveCalibre = (calibre: string) => {
    const newCalibres = selectedCalibres.filter((c) => c.calibre !== calibre);
    onSelectionChange(newCalibres);
  };

  // Calcular total de cajas
  const totalBoxes = useMemo(() => {
    return selectedCalibres.reduce((sum, cal) => sum + cal.boxCount, 0);
  }, [selectedCalibres]);

  // Agrupar calibres por tipo (Blanco, Color, Otros)
  const groupedCalibres = useMemo(() => {
    const blancos: string[] = [];
    const color: string[] = [];
    const otros: string[] = [];

    ALL_CALIBRE_CODES.forEach((code) => {
      const name = CALIBRE_MAP[code];
      if (name.includes('BCO')) {
        blancos.push(code);
      } else if (name.includes('COLOR')) {
        color.push(code);
      } else {
        otros.push(code);
      }
    });

    return { blancos, color, otros };
  }, []);

  const isCalibreSelected = (calibre: string) => {
    return calibreMap.has(calibre);
  };

  const getCalibreQuantity = (calibre: string) => {
    return calibreMap.get(calibre) || 0;
  };

  return (
    <Card className="box-selection-step p-6" variant="elevated">
      <div className="mb-6">
        <h2 className="text-xl font-medium mb-2">
          Seleccionar Calibres y Cantidades
        </h2>
        <p className="text-sm text-gray-500">
          Primero selecciona los calibres que necesitas, luego ingresa la
          cantidad de cajas para cada uno
        </p>
      </div>

      {/* Resumen de selección */}
      {totalBoxes > 0 && (
        <div className="mb-6 bg-blue-50 rounded-md p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-blue-700 font-medium">
              Total: {totalBoxes} caja{totalBoxes !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCalibres.map((cal) => (
              <div
                key={cal.calibre}
                className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-blue-200"
              >
                <span className="text-sm font-medium">
                  {CALIBRE_MAP[cal.calibre as keyof typeof CALIBRE_MAP] ||
                    cal.calibre}
                  : {cal.boxCount} cajas
                </span>
                <button
                  onClick={() => handleRemoveCalibre(cal.calibre)}
                  className="text-red-500 hover:text-red-700"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selección de calibres por tipo */}
      <div className="space-y-6">
        {/* Huevos Blancos */}
        {groupedCalibres.blancos.length > 0 && (
          <div className="calibre-group">
            <div className="mb-4 pb-2 border-b-2 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Huevos Blancos
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {groupedCalibres.blancos.map((calibre) => {
                const selected = isCalibreSelected(calibre);
                const quantity = getCalibreQuantity(calibre);
                const calibreName =
                  CALIBRE_MAP[calibre as keyof typeof CALIBRE_MAP] || calibre;

                return (
                  <Card
                    key={calibre}
                    className={`p-4 ${
                      selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    variant={selected ? 'elevated' : 'flat'}
                  >
                    <div className="flex flex-col gap-3">
                      <Button
                        variant={selected ? 'primary' : 'secondary'}
                        onClick={() => handleCalibreToggle(calibre)}
                        className="w-full"
                        size="small"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {selected && <Check size={16} />}
                          <span className="font-medium">{calibreName}</span>
                        </div>
                      </Button>

                      {selected && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-gray-600">
                            Cantidad de cajas:
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                calibre,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Huevos de Color */}
        {groupedCalibres.color.length > 0 && (
          <div className="calibre-group">
            <div className="mb-4 pb-2 border-b-2 border-orange-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Huevos de Color
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {groupedCalibres.color.map((calibre) => {
                const selected = isCalibreSelected(calibre);
                const quantity = getCalibreQuantity(calibre);
                const calibreName =
                  CALIBRE_MAP[calibre as keyof typeof CALIBRE_MAP] || calibre;

                return (
                  <Card
                    key={calibre}
                    className={`p-4 ${
                      selected ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                    }`}
                    variant={selected ? 'elevated' : 'flat'}
                  >
                    <div className="flex flex-col gap-3">
                      <Button
                        variant={selected ? 'primary' : 'secondary'}
                        onClick={() => handleCalibreToggle(calibre)}
                        className="w-full"
                        size="small"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {selected && <Check size={16} />}
                          <span className="font-medium">{calibreName}</span>
                        </div>
                      </Button>

                      {selected && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-gray-600">
                            Cantidad de cajas:
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                calibre,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Otros */}
        {groupedCalibres.otros.length > 0 && (
          <div className="calibre-group">
            <div className="mb-4 pb-2 border-b-2 border-gray-300">
              <h3 className="text-lg font-semibold text-gray-800">Otros</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {groupedCalibres.otros.map((calibre) => {
                const selected = isCalibreSelected(calibre);
                const quantity = getCalibreQuantity(calibre);
                const calibreName =
                  CALIBRE_MAP[calibre as keyof typeof CALIBRE_MAP] || calibre;

                return (
                  <Card
                    key={calibre}
                    className={`p-4 ${
                      selected ? 'ring-2 ring-gray-500 bg-gray-50' : ''
                    }`}
                    variant={selected ? 'elevated' : 'flat'}
                  >
                    <div className="flex flex-col gap-3">
                      <Button
                        variant={selected ? 'primary' : 'secondary'}
                        onClick={() => handleCalibreToggle(calibre)}
                        className="w-full"
                        size="small"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {selected && <Check size={16} />}
                          <span className="font-medium">{calibreName}</span>
                        </div>
                      </Button>

                      {selected && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-gray-600">
                            Cantidad de cajas:
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                calibre,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mensaje si no hay calibres seleccionados */}
      {selectedCalibres.length === 0 && (
        <Card className="p-8 text-center mt-6" variant="flat">
          <p className="text-gray-500">
            Selecciona al menos un calibre para continuar
          </p>
        </Card>
      )}
    </Card>
  );
};

export default BoxSelectionStep;
