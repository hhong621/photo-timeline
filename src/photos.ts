import cityscapeHero from './assets/photos/cityscape-hero.jpg'
import cityscapeThumb from './assets/photos/cityscape-thumb.jpg'
import jellyfishHero from './assets/photos/jellyfish-hero.jpg'
import jellyfishThumb from './assets/photos/jellyfish-thumb.jpg'
import ryokanHero from './assets/photos/ryokan-hero.jpg'
import ryokanThumb from './assets/photos/ryokan-thumb.jpg'

export type Photo = {
  id: string
  label: string
  date: string
  location: string
  camera: string
  focalLength: string
  aperture: string
  shutterSpeed: string
  thumbSrc: string
  heroSrc: string
  /** CSS `aspect-ratio` value (width / height) */
  aspectRatio: string
}

const samplePhotos: Omit<Photo, 'id' | 'date'>[] = [
  {
    label: 'Jellyfish',
    location: 'Monterey Bay Aquarium, CA',
    camera: 'Sony α7 IV',
    focalLength: '35mm',
    aperture: 'f/2.8',
    shutterSpeed: '1/125s',
    thumbSrc: jellyfishThumb,
    heroSrc: jellyfishHero,
    aspectRatio: '4 / 3',
  },
  {
    label: 'Matsumoto Ryokan',
    location: 'Matsumoto, Japan',
    camera: 'Fujifilm X-T5',
    focalLength: '23mm',
    aperture: 'f/4',
    shutterSpeed: '1/60s',
    thumbSrc: ryokanThumb,
    heroSrc: ryokanHero,
    aspectRatio: '3 / 4',
  },
  {
    label: 'City at dusk',
    location: 'Shinjuku, Tokyo',
    camera: 'Leica Q3',
    focalLength: '28mm',
    aperture: 'f/5.6',
    shutterSpeed: '1/250s',
    thumbSrc: cityscapeThumb,
    heroSrc: cityscapeHero,
    aspectRatio: '800 / 599',
  },
]

export const photos: Photo[] = Array.from({ length: 24 }, (_, i) => {
  const month = (i % 12) + 1
  const day = (i % 28) + 1
  const year = 2020 + Math.floor(i / 12)
  const sample = samplePhotos[i % samplePhotos.length]

  return {
    ...sample,
    id: `photo-${i}`,
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  }
})
