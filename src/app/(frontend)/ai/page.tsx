import ClientWrapper from '@/components/Robot/ClientWrapper'
import { ChatWrapper } from '@/components/AIChat/ChatWrapper'
import { AnimationControls } from '@/components/Robot/AnimationControls'

export default function AiPage() {
  return (
    <main className="relative w-full">
      {/* Future content can go here above the robot section */}

      {/* Robot + Chat Section - 100vh split container */}
      <section className="relative w-full h-screen overflow-hidden flex">
        {/* Left Half - Robot */}
        <div className="w-1/2 h-full relative flex flex-col">
          {/* Robot Container */}
          <div className="flex-1">
            <ClientWrapper />
          </div>

          {/* Animation Control Buttons */}
          <AnimationControls />
        </div>

        {/* Right Half - Chat */}
        <div className="w-1/2 h-full relative flex items-center justify-center px-8">
          <div className="w-full h-4/5 max-w-2xl">
            {' '}
            {/* 80% height with max width */}
            <ChatWrapper />
          </div>
        </div>
      </section>

      {/* Future content can go here below the robot section */}
    </main>
  )
}
