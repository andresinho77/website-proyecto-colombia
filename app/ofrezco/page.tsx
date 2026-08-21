import CityFeedPage from '../../components/CityFeedPage';

// US-4.5: national-level "Tengo espacio disponible" journey — mirrors the
// city-level /[ciudad]/ofrezco route, see app/[ciudad]/ofrezco/page.tsx.
export const metadata = {
  title: 'Espacios disponibles en Colombia | Emergencia Colombia 2026',
  description: 'Espacios de alojamiento ofrecidos por la comunidad en toda Colombia tras la emergencia. Conexión directa por WhatsApp, sin registro.',
};

export default function NationalOfrezcoPage() {
  return (
    <CityFeedPage
      cityName="Colombia"
      citySlug=""
      isNationalFeed={true}
      intentTipo="ofrezco"
    />
  );
}
