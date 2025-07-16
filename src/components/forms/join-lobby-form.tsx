
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
import { useToast } from "@/hooks/use-toast";
import { verifyLobbyPassword } from "@/app/actions";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  password: z.string().min(1, {
    message: "La contraseña es requerida.",
  }),
});


type JoinLobbyFormProps = {
    lobbyId: string;
    onSuccessfulJoin: () => void;
}

export function JoinLobbyForm({ lobbyId, onSuccessfulJoin }: JoinLobbyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const result = await verifyLobbyPassword(lobbyId, values.password);
    
    if (result.success) {
        toast({
            title: "¡Éxito!",
            description: "Contraseña correcta.",
        });
        onSuccessfulJoin();
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.message,
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
