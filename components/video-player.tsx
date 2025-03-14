"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface VideoPlayerProps {
  src: string
  title: string
  posterImage?: string
}

export default function VideoPlayer({ src, title, posterImage }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const seekTime = (value[0] / 100) * duration

    if (videoRef.current) {
      videoRef.current.currentTime = seekTime
      setCurrentTime(seekTime)
    }
  }

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerRef.current) return

    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  // Update progress as video plays
  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      setProgress((video.currentTime / video.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      setIsBuffering(false)
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("playing", handlePlaying)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("playing", handlePlaying)
    }
  }, [])

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={playerRef}
      className="relative overflow-hidden bg-black rounded-lg aspect-video"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        src={src}
        poster={posterImage}
        onClick={togglePlay}
        preload="metadata"
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30" onClick={togglePlay}>
          <Button
            size="icon"
            variant="ghost"
            className="w-16 h-16 text-white rounded-full bg-black/50 hover:bg-black/70"
          >
            <Play className="w-8 h-8 fill-white" />
          </Button>
        </div>
      )}

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
        </div>
      )}

      {/* Video Title */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-lg font-medium text-white">{title}</h2>
      </div>

      {/* Video Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="px-4 cursor-pointer">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&>span:first-child_span]:bg-primary"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between p-2 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/10">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white hover:bg-white/10">
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white hover:bg-white/10">
              <SkipForward className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/10">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              <div className="w-24">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&>span:first-child_span]:bg-white"
                />
              </div>
            </div>

            <div className="ml-2 text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Playback Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.playbackRate = 0.5
                    }
                  }}
                >
                  0.5x Speed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.playbackRate = 1
                    }
                  }}
                >
                  1x Speed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.playbackRate = 1.5
                    }
                  }}
                >
                  1.5x Speed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.playbackRate = 2
                    }
                  }}
                >
                  2x Speed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/10">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

