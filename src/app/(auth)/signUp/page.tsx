"use client"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field"
import { signUpSchema } from "@/src/schemas/signUpSchema"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { ApiResponse } from "@/src/types/apiResponse"
import { Input } from "@/src/components/ui/input"
import { Spinner } from "@/src/components/ui/spinner"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/lib/utils"
import { TickerPanel } from "@/src/components/ui/ticker-panel"
import { ThemeToggle } from "@/src/components/ui/theme-toggle"

type signUpFormData = z.infer<typeof signUpSchema>



function PasswordStrength({ password }: { password: string }) {
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const score = Object.values(checks).filter(Boolean).length

  const barColor =
    score <= 1 ? "#EF4444" :
      score === 2 ? "#F59E0B" :
        score === 3 ? "#F59E0B" :
          "#10B981"

  if (password.length === 0) return null

  return (
    <div className="mt-2 rounded-lg border border-border/40 p-3 bg-muted/40 space-y-2.5">
      {/* Strength bar */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[3px] flex-1 rounded-full transition-colors duration-300"
            style={{ background: i < score ? barColor : "rgba(255,255,255,0.1)" }}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-[11px]">
        {[
          ["minLength", "8+ characters"],
          ["uppercase", "Uppercase"],
          ["lowercase", "Lowercase"],
          ["number", "Number"],
          ["specialChar", "Special char"],
        ].map(([key, label]) => {
          const ok = checks[key as keyof typeof checks]
          return (
            <span key={key} className={cn("flex items-center gap-1", ok ? "text-emerald-500" : "text-muted-foreground/60")}>
              {ok ? "✓" : "○"} {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", phoneNumber: "" },
  })

  const password = form.watch("password")

  const onSubmit = async (data: signUpFormData) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>("/api/signup", data)
      toast.success(response.data.message)
      router.replace(`/verify?email=${data.email}`)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Sign up failed", { description: axiosError.response?.data.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Load Space Grotesk */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div
          className="relative w-full max-w-2xl max-h-[95vh] flex rounded-2xl overflow-hidden shadow-2xl"
          style={{ border: "0.5px solid hsl(var(--border))" }}
        >
          {/* Left: ticker panel */}
          <TickerPanel />

          {/* Right: form */}
          <div className="flex-1 bg-card px-8 py-6 overflow-y-auto">
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            <h1 className="font-['Space_Grotesk',sans-serif] font-bold text-[22px] tracking-tight text-foreground mb-1">
              Open your account
            </h1>
            <p className="text-[13px] text-muted-foreground mb-7">
              Join 2.4M traders worldwide
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Name */}
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-[12px] font-medium text-muted-foreground">Full name</FieldLabel>
                      <Input {...field} id="name" placeholder="Enter your full name" className="h-10" />
                      <FieldError className="text-[11px]">
                        {form.formState.errors.name?.message}
                      </FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>

              {/* Email */}
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-[12px] font-medium text-muted-foreground">Email address</FieldLabel>
                      <Input {...field} id="email" type="email" placeholder="you@example.com" className="h-10" />
                      <FieldError className="text-[11px]">
                        {form.formState.errors.email?.message}
                      </FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>

              {/* Phone */}
              <FieldGroup>
                <Controller
                  name="phoneNumber"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-[12px] font-medium text-muted-foreground">Phone number</FieldLabel>
                      <Input {...field} id="phoneNumber" placeholder="+91 00000 00000" className="h-10" />
                      <FieldError className="text-[11px]">
                        {form.formState.errors.phoneNumber?.message}
                      </FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>

              {/* Password */}
              <FieldGroup>
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-[12px] font-medium text-muted-foreground">Password</FieldLabel>
                      <Input {...field} id="password" type="password" placeholder="Create a strong password" className="h-10" />
                      <PasswordStrength password={password} />
                      <FieldError className="text-[11px]">
                        {form.formState.errors.password?.message}
                      </FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>

              {/* Submit */}
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
                {isSubmitting ? (
                  <Spinner />
                ) : (
                  "Create account"
                )}
              </Button>

              {/* Sign in link */}
              <p className="text-center text-[12px] text-muted-foreground pt-1">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-semibold hover:underline"
                  style={{ color: "#00D4FF", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}