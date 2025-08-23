import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ItineraryStorytelling } from '@/components/ItineraryStorytelling/ItineraryStorytelling'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const payload = await getPayload({ config })
  
  const { docs: itineraries } = await payload.find({
    collection: 'travel-itineraries',
    where: {
      slug: {
        equals: params.slug,
      },
    },
    limit: 1,
  })

  const itinerary = itineraries[0]
  
  if (!itinerary) {
    return {
      title: 'Itinerary Not Found',
    }
  }

  return {
    title: itinerary.title,
    description: itinerary.description || `${itinerary.summary?.totalDays} day travel itinerary`,
  }
}

export default async function ItineraryPage({ params }: PageProps) {
  const payload = await getPayload({ config })
  
  const { docs: itineraries } = await payload.find({
    collection: 'travel-itineraries',
    where: {
      slug: {
        equals: params.slug,
      },
      status: {
        equals: 'active',
      },
    },
    limit: 1,
    depth: 2, // Populate relationships
  })

  const itinerary = itineraries[0]
  
  if (!itinerary) {
    notFound()
  }

  return (
    <div className="itinerary-page">
      {/* Hero Section */}
      <div className="itinerary-hero">
        {itinerary.coverImage && typeof itinerary.coverImage === 'object' && (
          <img 
            src={itinerary.coverImage.url || undefined} 
            alt={itinerary.title}
            className="hero-image"
          />
        )}
        <div className="hero-content">
          <h1>{itinerary.title}</h1>
          <div className="itinerary-meta">
            <span className="dates">
              {itinerary.travelDates?.startDate && itinerary.travelDates?.endDate && (
                <>
                  {new Date(itinerary.travelDates.startDate).toLocaleDateString()} - 
                  {new Date(itinerary.travelDates.endDate).toLocaleDateString()}
                </>
              )}
            </span>
            <span className="duration">{itinerary.summary?.totalDays} days</span>
            <span className="type">{itinerary.groupType}</span>
            <span className="budget">{itinerary.budgetRange}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {itinerary.description && (
        <section className="itinerary-description">
          <div className="container">
            <p>{itinerary.description}</p>
          </div>
        </section>
      )}

      {/* 3D Storytelling View */}
      {itinerary.enable3DStorytelling && (
        <section className="itinerary-storytelling-section">
          <div className="container">
            <h2>Journey in 3D</h2>
            <p>Experience your travel itinerary through an immersive 3D journey</p>
            <ItineraryStorytelling itinerary={itinerary} />
          </div>
        </section>
      )}

      {/* Story Chapters (Text Version) */}
      {itinerary.storyChapters && itinerary.storyChapters.length > 0 && (
        <section className="story-chapters">
          <div className="container">
            <h2>Journey Details</h2>
            <div className="chapters-list">
              {itinerary.storyChapters.map((chapter: any, index: number) => (
                <div key={index} className="chapter-card">
                  <div className="chapter-number">Chapter {index + 1}</div>
                  <h3>{chapter.title}</h3>
                  {chapter.dateTime && <p className="date-time">{chapter.dateTime}</p>}
                  <p className="content">{chapter.content}</p>
                  {chapter.address && <p className="address">📍 {chapter.address}</p>}
                  {chapter.media?.type === 'image' && chapter.media.image && typeof chapter.media.image === 'object' && (
                    <img 
                      src={chapter.media.image.url || undefined} 
                      alt={chapter.title}
                      className="chapter-image"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Travel Stats */}
      <section className="travel-stats">
        <div className="container">
          <h2>Trip Overview</h2>
          <div className="stats-grid">
            <div className="stat">
              <h3>Duration</h3>
              <p>{itinerary.summary?.totalDays} Days</p>
            </div>
            <div className="stat">
              <h3>Locations</h3>
              <p>{itinerary.summary?.totalChapters} Stops</p>
            </div>
            <div className="stat">
              <h3>Travel Style</h3>
              <p>{itinerary.groupType}</p>
            </div>
            <div className="stat">
              <h3>Budget</h3>
              <p>{itinerary.budgetRange}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Share */}
      {itinerary.shareToken && (
        <section className="share-section">
          <div className="container">
            <h3>Share This Itinerary</h3>
            <p>Share this link with others: </p>
            <code>{`${process.env.NEXT_PUBLIC_SERVER_URL}/itineraries/share/${itinerary.shareToken}`}</code>
          </div>
        </section>
      )}
    </div>
  )
}

// Generate static paths
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  
  const { docs: itineraries } = await payload.find({
    collection: 'travel-itineraries',
    where: {
      status: {
        equals: 'active',
      },
    },
    limit: 100,
  })

  return itineraries.map((itinerary: any) => ({
    slug: itinerary.slug,
  }))
}
