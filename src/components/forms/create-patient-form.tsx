
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
import type { Patient } from "@/lib/types";

const formSchema = z.object({
  firstName: z.string().min(2, "El nombre es muy corto."),
  lastName: z.string().min(2, "El apellido es muy corto."),
  age: z.coerce.number().min(0, "La edad no puede ser negativa."),
  diagnosis: z.string().min(5, "El diagnóstico es muy corto."),
});


type CreatePatientFormProps = {
    onPatientCreated: (patient: Omit<Patient, 'id' | 'lobbyId' | 'lastEntry'>) => Promise<void>;
    lobbyId: string;
}

export function CreatePatientForm({ onPatientCreated }: CreatePatientFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: 0,
      diagnosis: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        await onPatientCreated(values);
        form.reset();
    } catch (error) {
        // Error is handled by the parent component's toast
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nombres</FormLabel>
                    <FormControl>
                        <Input placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                        <Input placeholder="Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Edad</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnóstico</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Faringitis aguda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Añadiendo...' : 'Añadir Paciente'}
        </Button>
      </form>
    </Form>
  )
}
