import { notFound } from 'next/navigation';
import { getAllCities, getCityBySlug } from '../../../lib/locations';
import CityFeedPage from '../../../components/CityFeedPage';

// US-4.5: dedicated "Tengo espacio disponible" journey, separate from the
// mixed feed at /[ciudad]/ — see CityFeedPage's intentTipo prop.
export function generateStaticParams() {
  return getAllCities().map((city) => ({ ciudad: city.slug }));
}

export function generateMetadata({ params }: { params: { ciudad: string } }) {
  const city = getCityBySlug(params.ciudad);
  if (!city) return {};
  return {
    title: `Espacios disponibles en ${city.name} (${city.departmentName}) | Emergencia Colombia 2026`,
    description: `Espacios de alojamiento ofrecidos por la comunidad en ${city.name} (${city.departmentName}). Conexión directa por WhatsApp, sin registro.`,
  };
}

export default function CityOfrezcoPage({ params }: { params: { ciudad: string } }) {
  const city = getCityBySlug(params.ciudad);
  if (!city) notFound();

  return (
    <CityFeedPage
      cityName={city.name}
      citySlug={city.slug}
      departmentName={city.departmentName}
      departmentSlug={city.departmentSlug}
      intentTipo="ofrezco"
    />
  );
}
