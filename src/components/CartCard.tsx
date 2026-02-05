import { useState } from 'react';
import { Cart } from '@/types';
import { Button } from '@/components/design-system';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Eye,
  MapPin,
  CalendarIcon,
  Package,
  Layers,
  Trash2,
} from 'lucide-react';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';
import { formatDate } from '@/utils/formatDate';

interface CartCardProps {
  cart: Cart;
  setSelectedCart: (cart: Cart) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  onDelete?: (codigo: string) => Promise<void>;
}

const CartCard = ({
  cart,
  setSelectedCart,
  setIsModalOpen,
  onDelete,
}: CartCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // Show details
    setSelectedCart(cart);
    setIsModalOpen(true);
  };

  const calibre = cart.codigo ? getCalibreFromCodigo(cart.codigo) : 'N/A';

  // Función para eliminar el carro
  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(cart.codigo);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error al eliminar carro:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date if available (DD/MM/YYYY)
  const formattedDate = cart.fechaCreacion
    ? formatDate(cart.fechaCreacion)
    : 'N/A';

  return (
    <>
      <Card onClick={handleCardClick} className="cursor-pointer">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold">{cart.codigo}</span>
              <Badge className="bg-blue-100 text-blue-700">Carro</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarIcon size={12} />
              {formattedDate}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin size={12} />
            {cart.ubicacion || 'Sin ubicación'}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package size={16} className="text-primary" />
                Bandejas
              </div>
              <div className="text-lg font-semibold">{cart.cantidadBandejas || 0}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers size={16} className="text-purple-500" />
                Huevos
              </div>
              <div className="text-lg font-semibold">{cart.cantidadHuevos || 0}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers size={16} className="text-green-500" />
                Calibre
              </div>
              <div className="text-lg font-semibold">{calibre || 'N/A'}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="small"
              leftIcon={<Eye style={{ width: 14, height: 14 }} />}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCart(cart);
                setIsModalOpen(true);
              }}
            >
              Detalles
            </Button>
            {onDelete && (
              <Button
                variant="secondary"
                size="small"
                leftIcon={<Trash2 style={{ width: 14, height: 14 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                disabled={isDeleting}
              >
                Eliminar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !open && !isDeleting && setShowDeleteConfirm(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el carro{' '}
              <strong>{cart.codigo}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CartCard;
