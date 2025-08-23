import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ExperienceExplorer } from '@/components/ExperienceExplorer/ExperienceExplorer'
import { ExperienceStorytelling } from '@/components/ExperienceStorytelling/ExperienceStorytelling'
import './page.scss'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const payload = await getPayload({ config })
  
  const { docs: experiences } = await payload.find({
    collection: 'experiences',
    where: {
      slug: {
        equals: resolvedParams.slug,
      },
    },
    limit: 1,
  })

  const experience = experiences[0]
  
  if (!experience) {
    return {
      title: 'Experience Not Found',
    }
  }

  return {
    title: experience.seo?.metaTitle || experience.title,
    description: experience.seo?.metaDescription || experience.shortDescription,
  }
}

export default async function ExperiencePage({ params }: PageProps) {
  const resolvedParams = await params
  const payload = await getPayload({ config })
  
  const { docs: experiences } = await payload.find({
    collection: 'experiences',
    where: {
      slug: {
        equals: resolvedParams.slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
    depth: 3, // Populate relationships deeply
  })

  let experience = experiences[0]
  
  // Manually populate destination lat/lng if they're missing
  if (experience && experience.destinations) {
    const destinationsWithCoords = await Promise.all(
      experience.destinations.map(async (destItem: any) => {
        if (destItem.destination && typeof destItem.destination === 'object') {
          // Check if lat/lng are missing
          if (destItem.destination.lat === undefined || destItem.destination.lng === undefined) {
            // Fetch the destination directly to get virtual fields
            try {
              const fullDest = await payload.findByID({
                collection: 'destinations',
                id: destItem.destination.id,
                depth: 0,
              })
              return {
                ...destItem,
                destination: {
                  ...destItem.destination,
                  lat: fullDest.lat,
                  lng: fullDest.lng,
                }
              }
            } catch (error) {
              console.error('Error fetching destination:', error)
            }
          }
        }
        return destItem
      })
    )
    
    experience = {
      ...experience,
      destinations: destinationsWithCoords
    }
  }
  
  // Debug: Check what we're getting
  if (experience && process.env.NODE_ENV === 'development') {
    console.log('Experience fetched:', {
      title: experience.title,
      destinationsCount: experience.destinations?.length,
      firstDestination: (() => {
        const firstDestination = experience.destinations?.[0]?.destination
        if (!firstDestination || typeof firstDestination === 'number') return null
        
        return {
          id: firstDestination.id,
          title: firstDestination.title,
          hasLocationData: !!firstDestination.locationData,
          locationDataType: typeof firstDestination.locationData,
          lat: firstDestination.lat,
          lng: firstDestination.lng,
        }
      })()
    })
  }
  
  if (!experience) {
    notFound()
  }

  return (
    <div className="experience-page">
      {/* Hero Section */}
      <div className="experience-hero">
        {experience.heroImage && typeof experience.heroImage === 'object' && (
          <img 
            src={experience.heroImage.url || undefined} 
            alt={experience.title}
            className="hero-image"
          />
        )}
        <div className="hero-content">
          <h1>{experience.title}</h1>
          <p className="experience-type">
            {experience.experienceType && typeof experience.experienceType === 'object' && 'name' in experience.experienceType
              ? (experience.experienceType as any).name 
              : experience.experienceType && typeof experience.experienceType === 'string' 
              ? experience.experienceType
              : 'Experience'}
          </p>
          <p className="duration">
            {experience.duration?.days} Days / {experience.duration?.nights} Nights
          </p>
        </div>
      </div>

      {/* Description */}
      <section className="experience-description">
        <div className="container">
          {experience.description && typeof experience.description === 'string' && (
            <div dangerouslySetInnerHTML={{ __html: experience.description }} />
          )}
        </div>
      </section>

      {/* 3D Storytelling View */}
      {experience.enable3DStorytelling && (
        <section className="experience-storytelling">
          <ExperienceStorytelling experience={experience} />
        </section>
      )}

      {/* 3D Explorer View */}
      {experience.enable3DExplorer && (
        <section className="experience-explorer">
          <ExperienceExplorer experience={experience} />
        </section>
      )}

      {/* Destinations List */}
      <section className="experience-destinations">
        <div className="container">
          <h2>Destinations</h2>
          <div className="destinations-grid">
            {experience.destinations?.map((dest: any, index: number) => (
              <div key={index} className="destination-card">
                <h3>
                  {dest.destination && typeof dest.destination === 'object' 
                    ? dest.destination.title 
                    : dest.customLocation?.title}
                </h3>
                <p className="days">{dest.days} days</p>
                {dest.description && <p>{dest.description}</p>}
                {dest.highlights && (
                  <ul className="highlights">
                    {dest.highlights.map((highlight: any, i: number) => (
                      <li key={i}>{highlight.activity}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="experience-details">
        <div className="container">
          <div className="details-grid">
            {experience.whatsIncluded && (
              <div className="included">
                <h3>What's Included</h3>
                <ul>
                  {experience.whatsIncluded.map((item: any, i: number) => (
                    <li key={i}>{item.item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {experience.whatsNotIncluded && (
              <div className="not-included">
                <h3>What's Not Included</h3>
                <ul>
                  {experience.whatsNotIncluded.map((item: any, i: number) => (
                    <li key={i}>{item.item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {experience.bestTimeToVisit && (
            <div className="best-time">
              <h3>Best Time to Visit</h3>
              <p>{experience.bestTimeToVisit}</p>
            </div>
          )}
        </div>
      </section>

      {/* Pricing */}
      {experience.priceRange && (
        <section className="experience-pricing">
          <div className="container">
            <h2>Pricing</h2>
            <p className="price">
              Starting from {experience.priceRange.currency} {experience.priceRange.startingFrom} per person
            </p>
            {experience.priceRange.pricingNote && (
              <p className="note">{experience.priceRange.pricingNote}</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

// Generate static paths for all published experiences
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  
  const { docs: experiences } = await payload.find({
    collection: 'experiences',
    where: {
      status: {
        equals: 'published',
      },
    },
    limit: 100,
  })

  return experiences.map((experience: any) => ({
    slug: experience.slug,
  }))
}
