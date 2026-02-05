import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Package, MapPin } from 'lucide-react';

const ShadcnTest = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-8 space-y-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">shadcn/ui Setup Test</h1>
        <p className="text-muted-foreground">
          Testing shadcn/ui components in the Lomas Altas project
        </p>
      </div>

      {/* Button Tests */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
        <div className="flex gap-4 flex-wrap items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Package className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Card Tests */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pallet Example</CardTitle>
              <CardDescription>Ejemplo de tarjeta de pallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">BODEGA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">60/60 cajas</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">
                Ver Detalles
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Selected Card</span>
                <Badge>CERRADO</Badge>
              </CardTitle>
              <CardDescription>Con borde de acento macOS</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este card usa el color de acento macOS (#007AFF)
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Cancelar
              </Button>
              <Button size="sm" className="flex-1">
                Confirmar
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Box Card</CardTitle>
                <Badge variant="secondary">ESPECIAL</Badge>
              </div>
              <CardDescription>12345678901234 56</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calibre:</span>
                  <span className="font-medium">EXTRA BCO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operario:</span>
                  <span className="font-medium">01</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Input Tests */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Inputs</h2>
        <Card>
          <CardHeader>
            <CardTitle>Form Example</CardTitle>
            <CardDescription>Ejemplo de formulario con inputs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="codigo">Código de Pallet</Label>
              <Input
                type="text"
                id="codigo"
                placeholder="12324101101000"
                className="font-mono"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email del Cliente</Label>
              <Input type="email" id="email" placeholder="cliente@ejemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="calibre">Calibre</Label>
                <Input id="calibre" placeholder="01 - ESPECIAL BCO" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="formato">Formato</Label>
                <Input id="formato" placeholder="180 unidades" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Badge Tests */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>
        <div className="flex gap-2 flex-wrap">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <MapPin className="w-3 h-3 mr-1" />
            BODEGA
          </Badge>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <MapPin className="w-3 h-3 mr-1" />
            PACKING
          </Badge>
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <MapPin className="w-3 h-3 mr-1" />
            TRANSITO
          </Badge>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <MapPin className="w-3 h-3 mr-1" />
            VENTA
          </Badge>
        </div>
      </section>

      {/* Dialog Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dialog</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Abrir Modal de Ejemplo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles de Pallet 12324101101000</DialogTitle>
              <DialogDescription>
                Información completa del pallet y sus cajas asociadas
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <MapPin className="w-3 h-3 mr-1" />
                  BODEGA
                </Badge>
                <Badge variant="secondary">CERRADO</Badge>
              </div>
              <Card>
                <CardContent className="grid grid-cols-2 gap-4 p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Calibre</p>
                    <p className="font-medium">EXTRA BCO</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Cajas</p>
                    <p className="font-medium">60 / 60</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium">Lomas Altas</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Turno</p>
                    <p className="font-medium">Mañana</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Generar Etiqueta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {/* macOS Colors Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">macOS Colors Integration</h2>
        <Card>
          <CardHeader>
            <CardTitle>Custom macOS Colors</CardTitle>
            <CardDescription>
              Tus colores personalizados de macOS funcionan con shadcn/ui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-primary rounded-md"></div>
                <p className="text-xs text-muted-foreground">macOS Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-green-500 rounded-md"></div>
                <p className="text-xs text-muted-foreground">macOS Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-orange-500 rounded-md"></div>
                <p className="text-xs text-muted-foreground">macOS Warning</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-red-500 rounded-md"></div>
                <p className="text-xs text-muted-foreground">macOS Error</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ShadcnTest;
