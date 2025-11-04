// Country and city data for the Secretos application

// List of countries
const countryList = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'ES', name: 'España' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'MX', name: 'México' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panamá' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Perú' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  { code: 'FR', name: 'Francia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'IT', name: 'Italia' },
  { code: 'UK', name: 'Reino Unido' },
  { code: 'JP', name: 'Japón' },
  { code: 'AU', name: 'Australia' }
];

// List of cities by country
const cityListByCountry = {
  'AR': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
  'BO': ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Potosí'],
  'BR': ['São Paulo', 'Río de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza'],
  'CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta'],
  'CO': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'],
  'CR': ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Liberia'],
  'CU': ['La Habana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara'],
  'EC': ['Quito', 'Guayaquil', 'Cuenca', 'Machala', 'Ambato'],
  'SV': ['San Salvador', 'Santa Ana', 'San Miguel', 'Sonsonate', 'Ahuachapán'],
  'ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza'],
  'GT': ['Ciudad de Guatemala', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'San Miguel'],
  'HN': ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso'],
  'MX': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Cancún'],
  'NI': ['Managua', 'León', 'Masaya', 'Chinandega', 'Matagalpa'],
  'PA': ['Ciudad de Panamá', 'San Miguelito', 'Tocumen', 'David', 'Arraiján'],
  'PY': ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Capiatá', 'Lambaré'],
  'PE': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura'],
  'PR': ['San Juan', 'Bayamón', 'Carolina', 'Ponce', 'Caguas'],
  'DO': ['Santo Domingo', 'Santiago', 'La Romana', 'San Pedro de Macorís', 'La Vega'],
  'UY': ['Montevideo', 'Salto', 'Paysandú', 'Las Piedras', 'Rivera'],
  'VE': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Ciudad Guayana'],
  'US': ['Nueva York', 'Los Ángeles', 'Chicago', 'Houston', 'Phoenix'],
  'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa'],
  'FR': ['París', 'Marsella', 'Lyon', 'Toulouse', 'Niza'],
  'DE': ['Berlín', 'Hamburgo', 'Múnich', 'Colonia', 'Fráncfort'],
  'IT': ['Roma', 'Milán', 'Nápoles', 'Turín', 'Palermo'],
  'UK': ['Londres', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool'],
  'JP': ['Tokio', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo'],
  'AU': ['Sídney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaida']
};

// Export the data
export { countryList, cityListByCountry };