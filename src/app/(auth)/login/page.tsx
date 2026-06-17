"use client"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Input } from "@/src/components/ui/input"
import { Spinner } from "@/src/components/ui/spinner"
import { Button } from "@/src/components/ui/button"
import { signInSchema } from "@/src/schemas/signInSchema"
import { TickerPanel } from "@/src/components/ui/ticker-panel"
import { signIn } from "next-auth/react"
import { ThemeToggle } from "@/src/components/ui/theme-toggle"

type signInFormData = z.infer<typeof signInSchema>

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<signInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  })

  const onSubmit = async (data: signInFormData) => {
    setIsSubmitting(true)
    try {
      const result = await signIn("credentials", {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        toast.error("Invalid credentials")
        return
      }
      router.replace('/dashboard');
      toast.success("Login successful")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div
          className="relative w-full max-w-2xl max-h-[95vh] flex rounded-2xl overflow-hidden shadow-2xl"
          style={{ border: "0.5px solid hsl(var(--border))" }}
        >
          <TickerPanel />
          
          <div className="flex-1 bg-card px-8 py-6 overflow-y-auto flex flex-col justify-center">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
              </div>
            <h1 className="font-['Space_Grotesk',sans-serif] font-bold text-[22px] tracking-tight text-foreground mb-1">
              
              Welcome back
            </h1>
            <p className="text-[13px] text-muted-foreground mb-7">
              Sign in to your TradeX account
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FieldGroup>
                <Controller
                  name="identifier"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-[12px] font-medium text-muted-foreground">
                        Email or phone number
                      </FieldLabel>
                      <Input
                        {...field}
                        id="identifier"
                        placeholder="you@example.com"
                        className="h-10"
                      />
                      <FieldError className="text-[11px]">
                        {form.formState.errors.identifier?.message}
                      </FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>

              <FieldGroup>
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-[12px] font-medium text-muted-foreground">
                        Password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="h-10"
                      />
                      <FieldError className="text-[11px]">
                        {form.formState.errors.password?.message}
                      </FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg font-['Space_Grotesk',sans-serif] font-semibold text-[14px] transition-opacity hover:opacity-90 disabled:opacity-50 mt-2"
                style={{
                  background: "#00D4FF",
                  color: "#0A0F1E",
                  border: "none",
                }}
              >
                {isSubmitting ? <Spinner /> : "Sign in"}
              </Button>

              <p className="text-center text-[12px] text-muted-foreground pt-1">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signUp")}
                  className="font-semibold hover:underline"
                  style={{ color: "#00D4FF", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Sign up
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}