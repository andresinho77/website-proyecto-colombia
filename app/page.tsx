import CityFeedPage from '../components/CityFeedPage';

export const metadata = {
  title: 'Alojamiento Solidario Colombia | Red de Ayuda y Emergencia',
  description: 'Plataforma comunitaria de alojamiento solidario en toda Colombia. Conexión directa entre personas que ofrecen y necesitan refugio tras la emergencia.',
};

export default function HomePage() {
  return (
    <CityFeedPage
      cityName="Colombia"
      citySlug=""
      isNationalFeed={true}
    />
  );
}
