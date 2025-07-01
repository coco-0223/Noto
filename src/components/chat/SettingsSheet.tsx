'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Crown, User, BrainCircuit } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updatePersona } from '@/app/actions';
import { ScrollArea } from '../ui/scroll-area';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SettingsSheet({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [persona, setPersona] = useState('A friendly and helpful assistant that mimics the user\'s writing style.');
  const [trainingText, setTrainingText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePersona = async () => {
    if (!trainingText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, introduce un texto para aprender de él.",
      });
      return;
    }
    setIsUpdating(true);
    const result = await updatePersona([trainingText], persona);
    setIsUpdating(false);
    if(result.success) {
      setPersona(result.data.updatedPersona);
      toast({
        title: "¡Personalidad actualizada!",
        description: "El chatbot se adaptará ahora al nuevo estilo.",
      });
    } else {
       toast({
        variant: "destructive",
        title: "Actualización fallida",
        description: result.error,
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Ajustes de Noto</SheetTitle>
          <SheetDescription>
            Personaliza el comportamiento y la personalidad de tu chatbot.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                <span>Personalidad del Chatbot</span>
              </h3>
              <Label htmlFor="persona">Descripción del comportamiento</Label>
              <Textarea
                id="persona"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                rows={3}
                placeholder="Describe how the chatbot should behave..."
                className="bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground">
                Esta es la personalidad base de tu bot. Se adaptará a tu estilo de escritura.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <span>Entrenamiento del Chatbot</span>
              </h3>
              <Label htmlFor="training-text">Imitar tu estilo</Label>
              <Textarea
                id="training-text"
                value={trainingText}
                onChange={(e) => setTrainingText(e.target.value)}
                rows={5}
                placeholder="Pega aquí un texto que hayas escrito para que el bot aprenda tu estilo..."
                className="bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground">
                El bot analizará este texto para imitar tu tono, vocabulario y forma de escribir.
              </p>
              <Button onClick={handleUpdatePersona} disabled={isUpdating}>
                {isUpdating ? 'Actualizando...' : 'Actualizar Estilo'}
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
               <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Crown className="h-5 w-5 text-amber-500" />
                <span>Funciones Premium</span>
              </h3>
              <div className="p-4 border rounded-lg bg-primary/10">
                  <p className="text-sm font-medium">Desbloquea todo el potencial de Noto con Premium.</p>
                  <ul className="mt-2 text-xs list-disc list-inside text-muted-foreground">
                      <li>Conversaciones ilimitadas</li>
                      <li>Memoria a largo plazo mejorada</li>
                      <li>Personalización avanzada</li>
                  </ul>
                  <Button className="mt-4" variant="default">
                      Hacerse Premium
                  </Button>
              </div>
            </div>

          </div>
        </ScrollArea>
        <SheetFooter className="p-6 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
