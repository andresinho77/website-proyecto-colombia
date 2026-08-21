import { describe, it, expect } from 'vitest';
import {
  getDepartments,
  getDepartmentBySlug,
  getCitiesByDepartment,
  getCityBySlug,
  getAllCities,
  getPriorityLocations,
  searchLocations,
  searchDepartments,
  searchLocationsAndDepartments,
  findLocationByLegacyCity,
  normalizeSlug,
} from '../lib/locations';

describe('Locations Catalog & Utilities (lib/locations.ts)', () => {
  it('loads 32 Colombian departments and over 1,100 municipalities with 100% unique slugs', () => {
    // 32, not the official DIVIPOLA 33 — Bogotá D.C. was merged into
    // Cundinamarca's city list (2026-08-21, explicit maintainer decision):
    // DANE/DIVIPOLA treats Bogotá D.C. as its own department-equivalent
    // (code 11, separate from Cundinamarca/25), but this app deliberately
    // uses the simpler "Bogotá is a city in Cundinamarca" mental model
    // instead. See lib/colombia-locations.json — no /departamento/bogota-d-c/
    // route anymore, Bogotá lives under /departamento/cundinamarca/.
    const depts = getDepartments();
    expect(depts.length).toBe(32);

    const allCities = getAllCities();
    expect(allCities.length).toBeGreaterThan(1100);

    const slugs = new Set(allCities.map((c) => c.slug));
    expect(slugs.size).toBe(allCities.length);

    const bogota = getCityBySlug('bogota');
    expect(bogota?.departmentSlug).toBe('cundinamarca');
    expect(getDepartmentBySlug('bogota-d-c')).toBeUndefined();
  });

  it('normalizes slugs removing accents and special characters', () => {
    expect(normalizeSlug('Bogotá D.C.')).toBe('bogota-d-c');
    expect(normalizeSlug('Medellín')).toBe('medellin');
    expect(normalizeSlug('Quibdó')).toBe('quibdo');
    expect(normalizeSlug('San Andrés y Providencia')).toBe('san-andres-y-providencia');
  });

  it('finds departments by slug', () => {
    const risaralda = getDepartmentBySlug('risaralda');
    expect(risaralda).toBeDefined();
    expect(risaralda?.name).toBe('Risaralda');

    const choco = getDepartmentBySlug('choco');
    expect(choco).toBeDefined();
    expect(choco?.cities.length).toBeGreaterThan(20);
  });

  it('resolves cities directly by unique single slug', () => {
    const cali = getCityBySlug('cali');
    expect(cali).toBeDefined();
    expect(cali?.name).toBe('Cali');
    expect(cali?.departmentName).toBe('Valle del Cauca');

    const quibdo = getCityBySlug('quibdo');
    expect(quibdo).toBeDefined();
    expect(quibdo?.name).toBe('Quibdó');

    const bogota = getCityBySlug('bogota');
    expect(bogota).toBeDefined();
    expect(bogota?.name).toBe('Bogotá');
  });

  it('disambiguates colliding city names with department suffix', () => {
    // Armenia (Quindío capital) gets the clean 'armenia' slug
    const armeniaQuindio = getCityBySlug('armenia');
    expect(armeniaQuindio).toBeDefined();
    expect(armeniaQuindio?.departmentName).toBe('Quindío');

    // Armenia (Antioquia) gets 'armenia-antioquia'
    const armeniaAntioquia = getCityBySlug('armenia-antioquia');
    expect(armeniaAntioquia).toBeDefined();
    expect(armeniaAntioquia?.departmentName).toBe('Antioquia');
  });

  it('performs fast fuzzy searching matching city or department', () => {
    const medellinResults = searchLocations('medellin');
    expect(medellinResults.length).toBeGreaterThan(0);
    expect(medellinResults[0]?.name).toBe('Medellín');
    expect(medellinResults[0]?.departmentSlug).toBe('antioquia');

    const chocoResults = searchLocations('choco');
    expect(chocoResults.length).toBeGreaterThan(0);
    expect(chocoResults.some((c) => c.slug === 'quibdo')).toBe(true);
  });

  it('resolves legacy city slugs and names to canonical locations', () => {
    const pereira = findLocationByLegacyCity('pereira');
    expect(pereira).toBeDefined();
    expect(pereira?.name).toBe('Pereira');
    expect(pereira?.departmentName).toBe('Risaralda');

    const armenia = findLocationByLegacyCity('armenia');
    expect(armenia).toBeDefined();
    expect(armenia?.departmentName).toBe('Quindío');
  });

  it('searches departments and locations simultaneously', () => {
    const { departments, cities } = searchLocationsAndDepartments('antioquia');
    expect(departments.length).toBeGreaterThan(0);
    expect(departments[0]?.slug).toBe('antioquia');
    expect(cities.length).toBeGreaterThan(0);
    // Antioquia no longer has a priority city (isPriority moved to the 5
    // earthquake-affected departments, 2026-08-21), so its capital no
    // longer gets boosted to the front of a plain department-name search
    // among 100+ municipalities — assert the match is IN Antioquia rather
    // than hardcoding which specific city surfaces in the default limit.
    expect(cities.every((c) => c.departmentSlug === 'antioquia')).toBe(true);

    const { departments: chocoDepts, cities: chocoCities } = searchLocationsAndDepartments('choco');
    expect(chocoDepts.length).toBeGreaterThan(0);
    expect(chocoDepts[0]?.name).toBe('Chocó');
    expect(chocoCities.some((c) => c.slug === 'quibdo')).toBe(true);
  });

  it('returns priority emergency locations', () => {
    const priority = getPriorityLocations();
    expect(priority.length).toBeGreaterThanOrEqual(7);
    const slugs = priority.map((p) => p.slug);
    expect(slugs).toContain('pereira');
    expect(slugs).toContain('cali');
    expect(slugs).toContain('quibdo');
  });
});
