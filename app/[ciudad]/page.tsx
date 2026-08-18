import { notFound } from 'next/navigation';
import { getAllCities, getCityBySlug } from '../../lib/locations';
import CityFeedPage from '../../components/CityFeedPage';

// Pre-render static pages for all Colombian cities/municipalities
export function generateStaticParams() {
  return getAllCities().map((city) => ({ ciudad: city.slug }));
}

export function generateMetadata({ params }: { params: { ciudad: string } }) {
  const city = getCityBySlug(params.ciudad);
  if (!city) return {};
  return {
    title: `Alojamiento Solidario en ${city.name} (${city.departmentName}) | Emergencia Colombia 2026`,
    description: `Publicaciones de alojamiento solidario activas en ${city.name} (${city.departmentName}) tras la emergencia. Conexión directa por WhatsApp, sin registro.`,
  };
}

export default function CityPage({ params }: { params: { ciudad: string } }) {
  const city = getCityBySlug(params.ciudad);
  if (!city) notFound();

  return (
    <CityFeedPage
      cityName={city.name}
      citySlug={city.slug}
      departmentName={city.departmentName}
      departmentSlug={city.departmentSlug}
    />
  );
}
