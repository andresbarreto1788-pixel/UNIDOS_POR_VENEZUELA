// Hospitales y centros de atencion registrados.
// Los slugs coinciden con los usados en los datos reales (prisma/datos_reales.csv).
// Alimentan el seed inicial y los filtros de busqueda.

export type HospitalSeed = {
  nombre: string;
  slug: string;
  ciudad: string;
  direccion?: string;
  telefono?: string;
  mapsUrl?: string;
};

export const HOSPITALES: HospitalSeed[] = [
  {
    nombre: "Hospital Domingo Luciani (El Llanito)",
    slug: "luciani",
    ciudad: "Caracas",
    direccion: "El Llanito, Petare, Caracas",
    mapsUrl: "https://www.google.com/maps/search/Hospital+Domingo+Luciani+Caracas",
  },
  {
    nombre: "Hospital Dr. Miguel Pérez Carreño",
    slug: "perez-carreno",
    ciudad: "Caracas",
    direccion: "Av. Sucre, Catia, Caracas",
    mapsUrl: "https://www.google.com/maps/search/Hospital+Perez+Carreno+Caracas",
  },
  {
    nombre: "Hospital Universitario de Caracas (HUC)",
    slug: "universitario-caracas",
    ciudad: "Caracas",
    direccion: "Ciudad Universitaria, Los Chaguaramos, Caracas",
    mapsUrl: "https://www.google.com/maps/search/Hospital+Universitario+de+Caracas",
  },
  {
    nombre: "Periférico de Catia (Dr. José Gregorio Hernández)",
    slug: "periferico-catia",
    ciudad: "Caracas",
    direccion: "Catia, Parroquia Sucre, Caracas",
    mapsUrl: "https://www.google.com/maps/search/Hospital+Periferico+de+Catia+Caracas",
  },
  {
    nombre: "Hospital Ricardo Baquero González (Los Magallanes)",
    slug: "ricardo-baquero",
    ciudad: "Caracas",
    direccion: "Los Magallanes de Catia, Caracas",
    mapsUrl: "https://www.google.com/maps/search/Hospital+Ricardo+Baquero+Gonzalez+Caracas",
  },
  {
    nombre: "Cruz Roja Venezolana",
    slug: "cruz-roja",
    ciudad: "Caracas",
    direccion: "Caracas",
    mapsUrl: "https://www.google.com/maps/search/Cruz+Roja+Venezolana+Caracas",
  },
  {
    nombre: "Hospital Vargas de Caracas",
    slug: "vargas-caracas",
    ciudad: "Caracas",
    direccion: "San José, Caracas",
    mapsUrl: "https://www.google.com/maps/search/Hospital+Vargas+de+Caracas",
  },
  {
    nombre: "Hospital J.M. de los Ríos (Niños)",
    slug: "jm-de-los-rios",
    ciudad: "Caracas",
    direccion: "San Bernardino, Caracas",
    mapsUrl: "https://www.google.com/maps/search/Hospital+JM+de+los+Rios+Caracas",
  },
  {
    nombre: "Hospital Militar Dr. Carlos Arvelo",
    slug: "carlos-arvelo",
    ciudad: "Caracas",
    direccion: "Av. José Ángel Lamas, San Martín, Caracas",
    mapsUrl: "https://www.google.com/maps/search/Hospital+Militar+Carlos+Arvelo+Caracas",
  },
  {
    nombre: "Punto de atención - Campo de Golf, Playa Los Cocos",
    slug: "playa-los-cocos",
    ciudad: "Litoral / La Guaira",
    direccion: "Campo de Golf, Playa Los Cocos",
    mapsUrl: "https://www.google.com/maps/search/Playa+Los+Cocos+Venezuela",
  },
];
