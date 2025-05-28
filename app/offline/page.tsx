import { Button } from "@/components/ui/button"
import { Wifi, WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <WifiOff className="h-24 w-24 text-muted-foreground" />
            <div className="absolute -top-2 -right-2 bg-destructive rounded-full p-1">
              <WifiOff className="h-4 w-4 text-destructive-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">You&#39;re offline</h1>
          <p className="text-muted-foreground">
            It looks like you&#39;re not connected to the internet. Some
            features may not be available until you reconnect.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => window.location.reload()} className="w-full">
            <Wifi className="mr-2 h-4 w-4" />
            Try again
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Go back
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>You can still browse previously visited pages while offline.</p>
        </div>
      </div>
    </div>
  )
}
