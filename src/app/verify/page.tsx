"use client"
import { Suspense } from "react";
import { Button } from "@/src/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/src/components/ui/field"
import { Input } from "@/src/components/ui/input"
import { Spinner } from "@/src/components/ui/spinner"
import { ThemeToggle } from "@/src/components/ui/theme-toggle"
import { TickerPanel } from "@/src/components/ui/ticker-panel"  // ← shared component
import { verifySchema } from "@/src/schemas/verifySchema"
import { ApiResponse } from "@/src/types/apiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
export const dynamic = "force-dynamic";
type verifyFormData = z.infer<typeof verifySchema>
function VerifyContent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const router = useRouter()

  const form = useForm<verifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { verifyCode: "" },
  })

  const onSubmit = async (data: verifyFormData) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>("/api/verify", {
        email,
        verifyCode: data.verifyCode,
      })
      toast.success(response.data.message)
      router.replace("/login")
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Code verification failed", {
        description: axiosError.response?.data.message,
      })
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
          {/* Left: ticker panel — identical to sign-up */}
          <TickerPanel />

          {/* Right: form */}
          <div className="flex-1 bg-card px-8 py-6 overflow-y-auto flex flex-col justify-center">
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            {/* Email icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: "rgba(0,212,255,0.1)",
                border: "0.5px solid rgba(0,212,255,0.25)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>

            <h1 className="font-['Space_Grotesk',sans-serif] font-bold text-[22px] tracking-tight text-foreground mb-1">
              Check your email
            </h1>
            <div className="mb-7">
              <p className="text-[13px] text-muted-foreground">
                We sent a 6-digit code to{" "}
                {email ? (
                  <span
                    className="font-medium"
                    style={{ color: "#00D4FF" }}
                  >
                    {email}
                  </span>
                ) : (
                  "your email"
                )}
              </p>

              <p className="text-[12px] text-muted-foreground/80 mt-2">
                Didn&apos;t receive the email? Check your spam folder or try signing up again.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FieldGroup>
                <Controller
                  name="verifyCode"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-[12px] font-medium text-muted-foreground">
                        Verification code
                      </FieldLabel>
                      <Input
                        {...field}
                        id="verifyCode"
                        placeholder="000000"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        className="h-10 tracking-[0.4em] text-center font-['Space_Grotesk',sans-serif] text-base"
                      />
                      <FieldError className="text-[11px]">
                        {form.formState.errors.verifyCode?.message}
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
                {isSubmitting ? <Spinner /> : "Verify account"}
              </Button>

              <p className="text-center text-[12px] text-muted-foreground pt-1">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => router.replace("/signUp")}
                  className="font-semibold hover:underline"
                  style={{ color: "#00D4FF", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Go back
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}