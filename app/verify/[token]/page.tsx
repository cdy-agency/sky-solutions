"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyPage() {
  const { token } = useParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const result = await authApi.verify(token as string)
        setStatus("success")
        setMessage((result as any).message)
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message)
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {status === "loading" && (
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          )}
          {status === "error" && (
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message || "Please wait while we verify your email..."}</CardDescription>
        </CardHeader>
        {status !== "loading" && (
          <CardFooter className="justify-center">
            <Link href="/login">
              <Button>{status === "success" ? "Continue to Login" : "Back to Login"}</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
