import antelopeCanyonHero from './assets/photos/antelope-canyon-hero.jpg'
import antelopeCanyonThumb from './assets/photos/antelope-canyon-thumb.jpg'
import beeAloeHero from './assets/photos/bee-aloe-hero.jpg'
import beeAloeThumb from './assets/photos/bee-aloe-thumb.jpg'
import blackNeckedStiltHero from './assets/photos/black-necked-stilt-hero.jpg'
import blackNeckedStiltThumb from './assets/photos/black-necked-stilt-thumb.jpg'
import byodoInKoiHero from './assets/photos/byodo-in-koi-hero.jpg'
import byodoInKoiThumb from './assets/photos/byodo-in-koi-thumb.jpg'
import chicagoLakefrontHero from './assets/photos/chicago-lakefront-hero.jpg'
import chicagoLakefrontThumb from './assets/photos/chicago-lakefront-thumb.jpg'
import chicagoRiverCruiseHero from './assets/photos/chicago-river-cruise-hero.jpg'
import chicagoRiverCruiseThumb from './assets/photos/chicago-river-cruise-thumb.jpg'
import chicagoWrigleyHero from './assets/photos/chicago-wrigley-hero.jpg'
import chicagoWrigleyThumb from './assets/photos/chicago-wrigley-thumb.jpg'
import chipmunkCactusHero from './assets/photos/chipmunk-cactus-hero.jpg'
import chipmunkCactusThumb from './assets/photos/chipmunk-cactus-thumb.jpg'
import cityscapeHero from './assets/photos/cityscape-hero.jpg'
import cityscapeThumb from './assets/photos/cityscape-thumb.jpg'
import daNangBeachHero from './assets/photos/da-nang-beach-hero.jpg'
import daNangBeachThumb from './assets/photos/da-nang-beach-thumb.jpg'
import daNangMacaqueHero from './assets/photos/da-nang-macaque-hero.jpg'
import daNangMacaqueThumb from './assets/photos/da-nang-macaque-thumb.jpg'
import fountainHillsBloomHero from './assets/photos/fountain-hills-bloom-hero.jpg'
import fountainHillsBloomThumb from './assets/photos/fountain-hills-bloom-thumb.jpg'
import haleakalaObservatoryHero from './assets/photos/haleakala-observatory-hero.jpg'
import haleakalaObservatoryThumb from './assets/photos/haleakala-observatory-thumb.jpg'
import horseshoeBendHero from './assets/photos/horseshoe-bend-hero.jpg'
import horseshoeBendThumb from './assets/photos/horseshoe-bend-thumb.jpg'
import jellyfishHero from './assets/photos/jellyfish-hero.jpg'
import jellyfishThumb from './assets/photos/jellyfish-thumb.jpg'
import kiyomizuDeraHero from './assets/photos/kiyomizu-dera-hero.jpg'
import kiyomizuDeraThumb from './assets/photos/kiyomizu-dera-thumb.jpg'
import lostDutchmanDuskHero from './assets/photos/lost-dutchman-dusk-hero.jpg'
import lostDutchmanDuskThumb from './assets/photos/lost-dutchman-dusk-thumb.jpg'
import makapuuPointHero from './assets/photos/makapuu-point-hero.jpg'
import makapuuPointThumb from './assets/photos/makapuu-point-thumb.jpg'
import mauiLavenderHero from './assets/photos/maui-lavender-hero.jpg'
import mauiLavenderThumb from './assets/photos/maui-lavender-thumb.jpg'
import mauiShorelineHero from './assets/photos/maui-shoreline-hero.jpg'
import mauiShorelineThumb from './assets/photos/maui-shoreline-thumb.jpg'
import mauiSpiderHero from './assets/photos/maui-spider-hero.jpg'
import mauiSpiderThumb from './assets/photos/maui-spider-thumb.jpg'
import mesaFlowersHero from './assets/photos/mesa-flowers-hero.jpg'
import mesaFlowersThumb from './assets/photos/mesa-flowers-thumb.jpg'
import mobotClimatronHero from './assets/photos/mobot-climatron-hero.jpg'
import mobotClimatronThumb from './assets/photos/mobot-climatron-thumb.jpg'
import ryokanHero from './assets/photos/ryokan-hero.jpg'
import ryokanThumb from './assets/photos/ryokan-thumb.jpg'
import snowyEgretHero from './assets/photos/snowy-egret-hero.jpg'
import snowyEgretThumb from './assets/photos/snowy-egret-thumb.jpg'
import stLouisCactusHero from './assets/photos/st-louis-cactus-hero.jpg'
import stLouisCactusThumb from './assets/photos/st-louis-cactus-thumb.jpg'
import stLouisSunflowerHero from './assets/photos/st-louis-sunflower-hero.jpg'
import stLouisSunflowerThumb from './assets/photos/st-louis-sunflower-thumb.jpg'
import taipeiXiaolongbaoHero from './assets/photos/taipei-xiaolongbao-hero.jpg'
import taipeiXiaolongbaoThumb from './assets/photos/taipei-xiaolongbao-thumb.jpg'
import tempeLakeHero from './assets/photos/tempe-lake-hero.jpg'
import tempeLakeThumb from './assets/photos/tempe-lake-thumb.jpg'
import tempeMonsoonCloudsHero from './assets/photos/tempe-monsoon-clouds-hero.jpg'
import tempeMonsoonCloudsThumb from './assets/photos/tempe-monsoon-clouds-thumb.jpg'

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

const realPhotos: Photo[] = [
  {
    id: 'st-louis-sunflower',
    label: 'Sunflower',
    date: '2019-04-17',
    location: 'St. Louis, Missouri',
    camera: 'Samsung Galaxy S8',
    focalLength: '4.25mm',
    aperture: 'f/1.7',
    shutterSpeed: '1/15s',
    thumbSrc: stLouisSunflowerThumb,
    heroSrc: stLouisSunflowerHero,
    aspectRatio: '1024 / 1023',
  },
  {
    id: 'dscn5095',
    label: 'Cactus spines',
    date: '2021-06-08',
    location: 'St. Louis, Missouri',
    camera: 'Nikon COOLPIX L810',
    focalLength: '20.9mm',
    aperture: 'f/4.8',
    shutterSpeed: '1/30s',
    thumbSrc: stLouisCactusThumb,
    heroSrc: stLouisCactusHero,
    aspectRatio: '1024 / 819',
  },
  {
    id: 'dscn5232',
    label: 'Climatron',
    date: '2021-06-16',
    location: 'Missouri Botanical Garden',
    camera: 'Nikon COOLPIX L810',
    focalLength: '4mm',
    aperture: 'f/9.9',
    shutterSpeed: '1/160s',
    thumbSrc: mobotClimatronThumb,
    heroSrc: mobotClimatronHero,
    aspectRatio: '1024 / 768',
  },
  {
    id: 'dscn5814',
    label: 'Bee on aloe',
    date: '2022-03-27',
    location: 'Tempe, Arizona',
    camera: 'Nikon COOLPIX L810',
    focalLength: '95.4mm',
    aperture: 'f/5.9',
    shutterSpeed: '1/250s',
    thumbSrc: beeAloeThumb,
    heroSrc: beeAloeHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: 'dscn6109',
    label: 'Monsoon clouds',
    date: '2022-06-23',
    location: 'Tempe, Arizona',
    camera: 'Nikon COOLPIX L810',
    focalLength: '71.5mm',
    aperture: 'f/5.9',
    shutterSpeed: '1/640s',
    thumbSrc: tempeMonsoonCloudsThumb,
    heroSrc: tempeMonsoonCloudsHero,
    aspectRatio: '1024 / 768',
  },
  {
    id: 'dscn6561',
    label: 'Chicago lakefront',
    date: '2023-03-04',
    location: 'Chicago, Illinois',
    camera: 'Nikon COOLPIX L810',
    focalLength: '5.3mm',
    aperture: 'f/11',
    shutterSpeed: '1/200s',
    thumbSrc: chicagoLakefrontThumb,
    heroSrc: chicagoLakefrontHero,
    aspectRatio: '1024 / 768',
  },
  {
    id: 'dscn6782',
    label: 'Lavender, Maui',
    date: '2023-09-23',
    location: 'Maui',
    camera: 'Nikon COOLPIX L810',
    focalLength: '20.9mm',
    aperture: 'f/4.8',
    shutterSpeed: '1/1500s',
    thumbSrc: mauiLavenderThumb,
    heroSrc: mauiLavenderHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: 'dscn7226',
    label: 'Chipmunk on barrel cactus',
    date: '2024-04-21',
    location: 'Boyce Thompson Arboretum',
    camera: 'Nikon COOLPIX L810',
    focalLength: '79.5mm',
    aperture: 'f/5.9',
    shutterSpeed: '1/100s',
    thumbSrc: chipmunkCactusThumb,
    heroSrc: chipmunkCactusHero,
    aspectRatio: '819 / 1024',
  },
  {
    id: 'dscn7455',
    label: 'Snowy egret',
    date: '2024-09-15',
    location: 'Riparian Preserve at Water Ranch',
    camera: 'Nikon COOLPIX L810',
    focalLength: '63.7mm',
    aperture: 'f/5.9',
    shutterSpeed: '1/250s',
    thumbSrc: snowyEgretThumb,
    heroSrc: snowyEgretHero,
    aspectRatio: '819 / 1024',
  },
  {
    id: 'img3790',
    label: 'Tempe Town Lake',
    date: '2024-09-21',
    location: 'Tempe, Arizona',
    camera: 'Canon EOS Rebel T7',
    focalLength: '105mm',
    aperture: 'f/4.5',
    shutterSpeed: '1/1250s',
    thumbSrc: tempeLakeThumb,
    heroSrc: tempeLakeHero,
    aspectRatio: '682 / 1024',
  },
  {
    id: '1050794',
    label: 'Koi at Byodo-In Temple',
    date: '2025-01-05',
    location: "O'ahu Byodo-In Temple",
    camera: 'OM-5',
    focalLength: '45mm',
    aperture: 'f/8',
    shutterSpeed: '1/80s',
    thumbSrc: byodoInKoiThumb,
    heroSrc: byodoInKoiHero,
    aspectRatio: '1024 / 767',
  },
  {
    id: 'dscn7989',
    label: 'Black-necked stilt',
    date: '2025-01-20',
    location: 'Riparian Preserve at Water Ranch',
    camera: 'Nikon COOLPIX L810',
    focalLength: '104mm',
    aperture: 'f/5.9',
    shutterSpeed: '1/320s',
    thumbSrc: blackNeckedStiltThumb,
    heroSrc: blackNeckedStiltHero,
    aspectRatio: '1024 / 768',
  },
  {
    id: '2041049',
    label: 'Lost Dutchman at dusk',
    date: '2025-02-04',
    location: 'Lost Dutchman State Park',
    camera: 'OM-5',
    focalLength: '45mm',
    aperture: 'f/4',
    shutterSpeed: '1/320s',
    thumbSrc: lostDutchmanDuskThumb,
    heroSrc: lostDutchmanDuskHero,
    aspectRatio: '1024 / 768',
  },
  {
    id: '2141071',
    label: 'Roses and daisies',
    date: '2025-02-14',
    location: 'Mesa, Arizona',
    camera: 'OM-5',
    focalLength: '35mm',
    aperture: 'f/4',
    shutterSpeed: '1/60s',
    thumbSrc: mesaFlowersThumb,
    heroSrc: mesaFlowersHero,
    aspectRatio: '1024 / 768',
  },
  {
    id: '4131376',
    label: 'Cactus bloom',
    date: '2025-04-13',
    location: 'Fountain Hills, Arizona',
    camera: 'OM-5',
    focalLength: '104mm',
    aperture: 'f/4',
    shutterSpeed: '1/80s',
    thumbSrc: fountainHillsBloomThumb,
    heroSrc: fountainHillsBloomHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: 'jellyfish-kaiyukan',
    label: 'Jellyfish',
    date: '2025-05-11',
    location: 'Osaka Aquarium Kaiyukan',
    camera: 'OM-5',
    focalLength: '33mm',
    aperture: 'f/4',
    shutterSpeed: '1/80s',
    thumbSrc: jellyfishThumb,
    heroSrc: jellyfishHero,
    aspectRatio: '1600 / 1200',
  },
  {
    id: 'cityscape-osaka',
    label: 'City at dusk',
    date: '2025-05-13',
    location: 'Osaka, Japan',
    camera: 'OM-5',
    focalLength: '45mm',
    aperture: 'f/4',
    shutterSpeed: '1/80s',
    thumbSrc: cityscapeThumb,
    heroSrc: cityscapeHero,
    aspectRatio: '1600 / 1198',
  },
  {
    id: 'kyoto-station',
    label: 'Kyoto Station',
    date: '2025-05-14',
    location: 'Kyoto Station',
    camera: 'OM-5',
    focalLength: '45mm',
    aperture: 'f/4',
    shutterSpeed: '1/80s',
    thumbSrc: ryokanThumb,
    heroSrc: ryokanHero,
    aspectRatio: '1200 / 1600',
  },
  {
    id: '5141990',
    label: 'Kiyomizu-dera',
    date: '2025-05-15',
    location: 'Kiyomizu-dera Temple',
    camera: 'OM-5',
    focalLength: '33mm',
    aperture: 'f/10',
    shutterSpeed: '1/250s',
    thumbSrc: kiyomizuDeraThumb,
    heroSrc: kiyomizuDeraHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: '9122775',
    label: 'Architecture river cruise',
    date: '2025-09-12',
    location: 'Chicago, Illinois',
    camera: 'OM-5',
    focalLength: '22mm',
    aperture: 'f/8',
    shutterSpeed: '1/320s',
    thumbSrc: chicagoRiverCruiseThumb,
    heroSrc: chicagoRiverCruiseHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: '9122773',
    label: 'Wrigley Building',
    date: '2025-09-12',
    location: 'Chicago, Illinois',
    camera: 'OM-5',
    focalLength: '24mm',
    aperture: 'f/8',
    shutterSpeed: '1/640s',
    thumbSrc: chicagoWrigleyThumb,
    heroSrc: chicagoWrigleyHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: '1100066',
    label: "Makapu‘u Point",
    date: '2026-01-10',
    location: 'Makapu‘u Point Lighthouse Trail',
    camera: 'OM-5',
    focalLength: '12mm',
    aperture: 'f/9',
    shutterSpeed: '1/400s',
    thumbSrc: makapuuPointThumb,
    heroSrc: makapuuPointHero,
    aspectRatio: '1024 / 768',
  },
  {
    id: '4130432',
    label: 'Horseshoe Bend',
    date: '2026-04-13',
    location: 'Horseshoe Bend',
    camera: 'OM-5',
    focalLength: '12mm',
    aperture: 'f/6.3',
    shutterSpeed: '1/400s',
    thumbSrc: horseshoeBendThumb,
    heroSrc: horseshoeBendHero,
    aspectRatio: '1024 / 767',
  },
  {
    id: '4130454',
    label: 'Antelope Canyon',
    date: '2026-04-13',
    location: 'Antelope Canyon',
    camera: 'OM-5',
    focalLength: '12mm',
    aperture: 'f/11',
    shutterSpeed: '1/60s',
    thumbSrc: antelopeCanyonThumb,
    heroSrc: antelopeCanyonHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: 'dscn6842',
    label: 'Haleakalā Observatory',
    date: '2023-09-25',
    location: 'Haleakalā National Park',
    camera: 'Nikon COOLPIX L810',
    focalLength: '5.3mm',
    aperture: 'f/3.3',
    shutterSpeed: '1/500s',
    thumbSrc: haleakalaObservatoryThumb,
    heroSrc: haleakalaObservatoryHero,
    aspectRatio: '1024 / 768',
  },
  {
    id: '7110690',
    label: 'Maui shoreline',
    date: '2026-07-11',
    location: 'Maui',
    camera: 'OM-5',
    focalLength: '36mm',
    aperture: 'f/10',
    shutterSpeed: '1/200s',
    thumbSrc: mauiShorelineThumb,
    heroSrc: mauiShorelineHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: '7120722',
    label: 'Garden spider',
    date: '2026-07-12',
    location: 'Maui',
    camera: 'OM-5',
    focalLength: '45mm',
    aperture: 'f/10',
    shutterSpeed: '1/100s',
    thumbSrc: mauiSpiderThumb,
    heroSrc: mauiSpiderHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: '8070986',
    label: 'Macaque',
    date: '2026-08-08',
    location: 'Da Nang, Vietnam',
    camera: 'OM-5',
    focalLength: '45mm',
    aperture: 'f/8',
    shutterSpeed: '1/100s',
    thumbSrc: daNangMacaqueThumb,
    heroSrc: daNangMacaqueHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: '8111112',
    label: 'Da Nang beach',
    date: '2026-08-12',
    location: 'Da Nang, Vietnam',
    camera: 'OM-5',
    focalLength: '45mm',
    aperture: 'f/7.1',
    shutterSpeed: '1/250s',
    thumbSrc: daNangBeachThumb,
    heroSrc: daNangBeachHero,
    aspectRatio: '768 / 1024',
  },
  {
    id: '8181372',
    label: 'Xiaolongbao',
    date: '2026-08-18',
    location: 'Taipei, Taiwan',
    camera: 'OM-5',
    focalLength: '45mm',
    aperture: 'f/4',
    shutterSpeed: '1/100s',
    thumbSrc: taipeiXiaolongbaoThumb,
    heroSrc: taipeiXiaolongbaoHero,
    aspectRatio: '768 / 1024',
  },
]

export const photos: Photo[] = [...realPhotos].sort((a, b) =>
  a.date.localeCompare(b.date),
)
