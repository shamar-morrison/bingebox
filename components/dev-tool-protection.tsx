"use client"

import { useEffect } from "react"
import { toast } from "sonner"

const DevToolProtection = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      const loadDisableDevtool = async () => {
        try {
          const DisableDevtool = (await import("disable-devtool")).default

          DisableDevtool({
            ondevtoolopen: (_type, next) => {
              toast.error("Developer tools are disabled", {
                duration: 4000,
              })
              next()
            },
            interval: 500,
            disableMenu: false,
            clearLog: true,
            disableSelect: false,
            disableCopy: false,
            disableCut: false,
            disablePaste: false,
            clearIntervalWhenDevOpenTrigger: false,
          })
        } catch (error) {
          console.warn("Failed to load disable-devtool:", error)
        }
      }

      loadDisableDevtool()
    }
  }, [])

  return null
}

export default DevToolProtection
