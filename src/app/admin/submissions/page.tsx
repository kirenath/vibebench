"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react"

export default function AdminSubmissionsPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Quick form state for MVP submission
  const [challengeId, setChallengeId] = useState("")
  const [phaseKey, setPhaseKey] = useState("phase1")
  const [challengePhaseId, setChallengePhaseId] = useState("")
  
  const [modelVariantId, setModelVariantId] = useState("")
  const [channelId, setChannelId] = useState("web") // or api
  const [isPublished, setIsPublished] = useState(true)
  const [manualTouched, setManualTouched] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("challenge_id", challengeId)
      formData.set("phase_key", phaseKey)
      formData.set("is_published", isPublished ? "true" : "false")
      formData.set("manual_touched", manualTouched ? "true" : "false")
      
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Upload failed")
      }

      setSuccess(true)
      // reset form mostly except relations if needed
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Submission</h1>
        <p className="text-muted-foreground mt-1">Record a new AI model test result and its artifacts.</p>
      </div>

      <Card>
        <CardHeader className="bg-muted/10 border-b pb-4">
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Challenge Phase ID (UUID)</label>
                <input required value={challengePhaseId} onChange={(e) => setChallengePhaseId(e.target.value)} name="challenge_phase_id" className="flex h-10 w-full rounded-md border border-input px-3" placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Model Variant ID</label>
                <input required value={modelVariantId} onChange={(e) => setModelVariantId(e.target.value)} name="model_variant_id" className="flex h-10 w-full rounded-md border border-input px-3" placeholder="e.g. gpt-4-turbo" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Channel ID</label>
                <select required value={channelId} onChange={(e) => setChannelId(e.target.value)} name="channel_id" className="flex h-10 w-full rounded-md border border-input px-3 bg-background">
                  <option value="web">Web UI</option>
                  <option value="api">API</option>
                  <option value="codex-app">Codex App</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Challenge ID (For filePath generation)</label>
                <input required value={challengeId} onChange={(e) => setChallengeId(e.target.value)} className="flex h-10 w-full rounded-md border border-input px-3" placeholder="e.g. receipt" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phase Key (For filePath generation)</label>
                <input required value={phaseKey} onChange={(e) => setPhaseKey(e.target.value)} className="flex h-10 w-full rounded-md border border-input px-3" placeholder="e.g. phase1" />
              </div>
            </div>

            <hr />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-600">HTML Artifact (Required)</label>
                <input type="file" name="file_html" accept=".html,.txt" className="flex w-full text-smborder border-input px-3 py-2 rounded-md" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-600">PRD Artifact</label>
                <input type="file" name="file_prd" accept=".md,.txt" className="flex w-full text-sm border border-input px-3 py-2 rounded-md" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-600">Screenshot Artifact</label>
                <input type="file" name="file_screenshot" accept="image/png,image/jpeg" className="flex w-full text-sm border border-input px-3 py-2 rounded-md" />
              </div>
            </div>

            <hr />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isPub" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded" />
                <label htmlFor="isPub" className="text-sm font-medium">Publish immediately</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isMan" checked={manualTouched} onChange={(e) => setManualTouched(e.target.checked)} className="rounded" />
                <label htmlFor="isMan" className="text-sm font-medium text-orange-600">Manual rules applied / Touched by human</label>
              </div>
            </div>

            {manualTouched && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Manual Touch Notes</label>
                <textarea name="manual_notes" rows={2} className="flex min-h-[60px] w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="Why was this manually touched?" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium">Duration (ms) (Optional)</label>
                <input type="number" name="duration_ms" className="flex h-10 w-full rounded-md border border-input px-3" placeholder="30000" />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium">Iteration Count (Optional)</label>
                <input type="number" name="iteration_count" className="flex h-10 w-full rounded-md border border-input px-3" placeholder="1" />
              </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
            {success && <div className="p-4 bg-green-500/10 text-green-600 rounded-lg text-sm font-medium flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Upload and UPSERT successful!</div>}

            <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading & Processing...</> : <><UploadCloud className="w-5 h-5 mr-2" /> Upload Submission</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
