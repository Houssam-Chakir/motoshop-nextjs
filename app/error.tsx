"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-gray-900">Something went wrong!</h1>
        <p className="text-gray-600">We apologize for the inconvenience. An unexpected error has occurred.</p>
        {error.digest && <p className="text-sm text-gray-500">Error ID: {error.digest}</p>}
        {error.digest && <p className="text-sm text-gray-500">Error Message: {error.message}</p>}
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  )
}
