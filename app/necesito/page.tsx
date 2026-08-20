import CityFeedPage from '../../components/CityFeedPage';

// US-4.5: national-level "Necesito alojamiento" journey — mirrors the
// city-level /[ciudad]/necesito route, see app/[ciudad]/necesito/page.tsx.
export const metadata = {
  title: 'Necesito alojamiento en Colombia | Emergencia Colombia 2026',
  description: 'Publicaciones de personas y familias que buscan alojamiento temporal en toda Colombia tras la emergencia. Conexión directa por WhatsApp, sin registro.',
};

export default function NationalNecesitoPage() {
  return (
    <CityFeedPage
      cityName="Colombia"
      citySlug=""
      isNationalFeed={true}
      intentTipo="necesito"
    />
  );
}
