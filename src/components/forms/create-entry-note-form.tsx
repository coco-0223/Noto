
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react";
import { Mic, Send } from "lucide-react";

const formSchema = z.object({
  note: z.string().min(5, "La nota es muy corta."),
});

type CreateEntryNoteFormProps = {
    onNoteCreated: (values: { note: string, audioUrl?: string }) => void;
}

export function CreateEntryNoteForm({ onNoteCreated }: CreateEntryNoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
    },
  })

  // TO-DO: Implement voice to text transcription
  const handleRecord = () => {
    setIsRecording(!isRecording);
    // Placeholder for transcription logic
    if (!isRecording) {
        form.setValue("note", "Transcripción de audio pendiente...");
    } else {
        form.setValue("note", "");
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        onNoteCreated(values);
        form.reset();
        setIsLoading(false);
    }, 500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Crear Nota</FormLabel>
              <FormControl>
                <div className="relative">
                    <Textarea 
                        placeholder="Escribe una nota o usa el micrófono para transcribir..."
                        className="pr-20"
                        {...field}
                    />
                    <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center gap-1">
                        <Button 
                            type="button" 
                            size="icon" 
                            variant={isRecording ? 'destructive' : 'ghost'}
                            onClick={handleRecord}
                        >
                            <Mic className="h-5 w-5"/>
                            <span className="sr-only">{isRecording ? 'Detener grabación' : 'Grabar nota de voz'}</span>
                        </Button>
                        <Button type="submit" size="icon" disabled={isLoading}>
                            <Send className="h-5 w-5"/>
                            <span className="sr-only">Enviar Nota</span>
                        </Button>
                    </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
