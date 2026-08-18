import { notFound } from 'next/navigation';
import { getDepartments, getDepartmentBySlug } from '../../../lib/locations';
import CityFeedPage from '../../../components/CityFeedPage';

// Pre-render static pages for all 33 departments/districts
export function generateStaticParams() {
  return getDepartments().map((dept) => ({ slug: dept.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const dept = getDepartmentBySlug(params.slug);
  if (!dept) return {};
  return {
    title: `Alojamientos Solidarios en ${dept.name} | Emergencia Colombia 2026`,
    description: `Publicaciones de alojamiento solidario activas en todos los municipios del departamento de ${dept.name}. Contacto directo por WhatsApp, sin registro.`,
  };
}

export default function DepartmentFeedRoute({ params }: { params: { slug: string } }) {
  const dept = getDepartmentBySlug(params.slug);
  if (!dept) notFound();

  return (
    <CityFeedPage
      departmentName={dept.name}
      departmentSlug={dept.slug}
      isDepartmentFeed={true}
    />
  );
}
