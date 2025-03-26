"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

export default function ReportBugPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    bugDescription: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // The form will be automatically handled by Netlify when submitted
      setSubmitted(true)
    } catch (error) {
      toast.error("Failed to submit bug report. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-16 pt-32">
        <div className="container max-w-xl">
          <Card className={"bg-transparent"}>
            <CardHeader>
              <CardTitle>Thank You!</CardTitle>
              <CardDescription>
                Your bug report has been submitted successfully. We appreciate
                your feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setSubmitted(false)}>
                Submit Another Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16 pt-32">
      <div className="container max-w-xl">
        <Card className={"bg-transparent"}>
          <CardHeader>
            <CardTitle>Report a Bug</CardTitle>
            <CardDescription>
              Help us improve BingeBox by reporting any issues you encounter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              name="bug-report"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Hidden input for Netlify forms */}
              <input type="hidden" name="form-name" value="bug-report" />
              <p className="hidden">
                <label>
                  Don&#39;t fill this out if you&#39;re human:{" "}
                  <input name="bot-field" />
                </label>
              </p>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bugDescription" className="text-sm font-medium">
                  Bug Description
                </Label>
                <Textarea
                  id="bugDescription"
                  name="bugDescription"
                  value={formState.bugDescription}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Bug Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
