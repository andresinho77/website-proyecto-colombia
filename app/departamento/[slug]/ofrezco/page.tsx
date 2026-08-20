import { notFound } from 'next/navigation';
import { getDepartments, getDepartmentBySlug } from '../../../../lib/locations';
import CityFeedPage from '../../../../components/CityFeedPage';

// US-4.5: department-level "Tengo espacio disponible" journey — mirrors
// app/[ciudad]/ofrezco/page.tsx one level up the location hierarchy.
export function generateStaticParams() {
  return getDepartments().map((dept) => ({ slug: dept.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const dept = getDepartmentBySlug(params.slug);
  if (!dept) return {};
  return {
    title: `Espacios disponibles en ${dept.name} | Emergencia Colombia 2026`,
    description: `Espacios de alojamiento ofrecidos por la comunidad en el departamento de ${dept.name}. Conexión directa por WhatsApp, sin registro.`,
  };
}

export default function DepartmentOfrezcoPage({ params }: { params: { slug: string } }) {
  const dept = getDepartmentBySlug(params.slug);
  if (!dept) notFound();

  return (
    <CityFeedPage
      departmentName={dept.name}
      departmentSlug={dept.slug}
      isDepartmentFeed={true}
      intentTipo="ofrezco"
    />
  );
}
