import { notFound } from 'next/navigation';
import { getDepartments, getDepartmentBySlug } from '../../../../lib/locations';
import CityFeedPage from '../../../../components/CityFeedPage';

// US-4.5: department-level "Necesito alojamiento" journey — mirrors
// app/[ciudad]/necesito/page.tsx one level up the location hierarchy.
export function generateStaticParams() {
  return getDepartments().map((dept) => ({ slug: dept.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const dept = getDepartmentBySlug(params.slug);
  if (!dept) return {};
  return {
    title: `Necesito alojamiento en ${dept.name} | Emergencia Colombia 2026`,
    description: `Publicaciones de personas y familias que buscan alojamiento temporal en el departamento de ${dept.name}. Conexión directa por WhatsApp, sin registro.`,
  };
}

export default function DepartmentNecesitoPage({ params }: { params: { slug: string } }) {
  const dept = getDepartmentBySlug(params.slug);
  if (!dept) notFound();

  return (
    <CityFeedPage
      departmentName={dept.name}
      departmentSlug={dept.slug}
      isDepartmentFeed={true}
      intentTipo="necesito"
    />
  );
}
