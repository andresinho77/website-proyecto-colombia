import { notFound } from 'next/navigation';
import { CITIES, getCityBySlug } from '../../lib/cities';
import CityFeedPage from '../../components/CityFeedPage';

// Static export needs every city path known at build time.
export function generateStaticParams() {
  return CITIES.map((city) => ({ ciudad: city.slug }));
}

export function generateMetadata({ params }: { params: { ciudad: string } }) {
  const city = getCityBySlug(params.ciudad);
  if (!city) return {};
  return {
    title: `Alojamiento Solidario en ${city.name} | Emergencia Terremoto 2026`,
    description: `Publicaciones de alojamiento solidario activas en ${city.name} tras el terremoto del 10 de agosto de 2026. Conexión directa por WhatsApp, sin registro.`,
  };
}

export default function CityPage({ params }: { params: { ciudad: string } }) {
  const city = getCityBySlug(params.ciudad);
  if (!city) notFound();

  return <CityFeedPage cityName={city.name} citySlug={city.slug} />;
}
