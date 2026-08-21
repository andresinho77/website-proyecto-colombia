import { notFound } from 'next/navigation';
import { getAllCities, getCityBySlug } from '../../../lib/locations';
import CityFeedPage from '../../../components/CityFeedPage';

// US-4.5: dedicated "Necesito alojamiento" journey, separate from the mixed
// feed at /[ciudad]/ — see CityFeedPage's intentTipo prop.
export function generateStaticParams() {
  return getAllCities().map((city) => ({ ciudad: city.slug }));
}

export function generateMetadata({ params }: { params: { ciudad: string } }) {
  const city = getCityBySlug(params.ciudad);
  if (!city) return {};
  return {
    title: `Necesito alojamiento en ${city.name} (${city.departmentName}) | Emergencia Colombia 2026`,
    description: `Publicaciones de personas y familias que buscan alojamiento temporal en ${city.name} (${city.departmentName}). Conexión directa por WhatsApp, sin registro.`,
  };
}

export default function CityNecesitoPage({ params }: { params: { ciudad: string } }) {
  const city = getCityBySlug(params.ciudad);
  if (!city) notFound();

  return (
    <CityFeedPage
      cityName={city.name}
      citySlug={city.slug}
      departmentName={city.departmentName}
      departmentSlug={city.departmentSlug}
      intentTipo="necesito"
    />
  );
}
