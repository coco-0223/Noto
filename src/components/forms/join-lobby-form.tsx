
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
import { Input } from "@/components/ui/input"
import { useState } from "react";
import type { Lobby } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  password: z.string().min(1, {
    message: "La contraseña es requerida.",
  }),
});


type JoinLobbyFormProps = {
    lobby: Lobby;
    onCorrectPassword: () => void;
}

export function JoinLobbyForm({ lobby, onCorrectPassword }: JoinLobbyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (values.password === lobby.password) {
        toast({
            title: "¡Éxito!",
            description: `Te has unido al lobby "${lobby.name}".`,
        })
        onCorrectPassword();
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "La contraseña es incorrecta. Inténtalo de nuevo.",
        });
        form.reset();
    }
    
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Unirse al Lobby'}
        </Button>
      </form>
    </Form>
  )
}
