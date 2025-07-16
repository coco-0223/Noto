
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useState } from "react";
import type { Lobby } from "@/lib/types";
import { addLobby } from "@/lib/firebase/lobbies";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre del lobby debe tener al menos 2 caracteres.",
  }),
  facility: z.string().min(2, {
    message: "El nombre del centro debe tener al menos 2 caracteres.",
  }),
  hasPassword: z.boolean().default(false),
  password: z.string().optional(),
}).refine(data => {
    if (data.hasPassword) {
        return data.password && data.password.length >= 4;
    }
    return true;
}, {
    message: "La contraseña es requerida y debe tener al menos 4 caracteres.",
    path: ["password"],
});


type CreateLobbyFormProps = {
    onLobbyCreated: () => void;
}

export function CreateLobbyForm({ onLobbyCreated }: CreateLobbyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      facility: "",
      hasPassword: false,
      password: "",
    },
  })

  const watchHasPassword = form.watch("hasPassword");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        await addLobby(values);
        onLobbyCreated();
    } catch (error) {
        console.error("Error creating lobby:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo crear el lobby. Inténtalo de nuevo.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Lobby</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ala Pediátrica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="facility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Centro Médico</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Hospital General" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hasPassword"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel>Proteger con Contraseña</FormLabel>
                    <FormDescription>
                        Requerir una contraseña para unirse a este lobby.
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
            </FormItem>
          )}
        />
        {watchHasPassword && (
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Contraseña del Lobby</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creando...' : 'Crear Lobby'}
        </Button>
      </form>
    </Form>
  )
}
