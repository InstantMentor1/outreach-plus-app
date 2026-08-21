export type PlaybookStatus = 'available' | 'coming-soon';
export type IndustryPlaybook = { slug: string; name: string; status: PlaybookStatus; goal: string; recommendation: string; action: string; example: string; creativeStyle: string; seasonalFocus: string };

export const industryPlaybooks: IndustryPlaybook[] = [
  { slug: 'cafe', name: 'Cafés', status: 'available', goal: 'Increase weekday footfall', recommendation: 'Launch a student coffee combo during quiet afternoon hours.', action: 'Claim offer', example: 'Weekday coffee combo', creativeStyle: 'Warm, quick and neighbourhood-led', seasonalFocus: 'Exams, monsoon and festive beverages' },
  { slug: 'restaurant', name: 'Restaurants', status: 'available', goal: 'Promote a new menu or fill slower days', recommendation: 'Create a family dining campaign for midweek evenings.', action: 'Book table or claim offer', example: 'Family dining campaign', creativeStyle: 'Appetite-led and experience-focused', seasonalFocus: 'Weekends, celebrations and festivals' },
  { slug: 'cloud-kitchen', name: 'Cloud Kitchens', status: 'available', goal: 'Generate repeat orders', recommendation: 'Create a reorder offer for recent customers.', action: 'Order now', example: 'Reorder campaign', creativeStyle: 'Clear, food-first and conversion-led', seasonalFocus: 'Delivery occasions and local events' },
  { slug: 'bakery', name: 'Bakeries', status: 'available', goal: 'Promote seasonal products and pre-orders', recommendation: 'Launch a weekend celebration-box campaign.', action: 'Reserve product', example: 'Festival box campaign', creativeStyle: 'Premium, seasonal and product-led', seasonalFocus: 'Birthdays, festivals and weekends' },
  { slug: 'salon', name: 'Salons and beauty studios', status: 'coming-soon', goal: 'Fill empty appointment slots', recommendation: 'Sector playbook in development.', action: 'Book appointment', example: 'Appointment recovery campaign', creativeStyle: 'Coming soon', seasonalFocus: 'Coming soon' },
  { slug: 'gym', name: 'Gyms and fitness studios', status: 'coming-soon', goal: 'Generate trial memberships', recommendation: 'Sector playbook in development.', action: 'Book trial', example: 'Trial membership campaign', creativeStyle: 'Coming soon', seasonalFocus: 'Coming soon' },
  { slug: 'clothing', name: 'Clothing and lifestyle brands', status: 'coming-soon', goal: 'Promote new arrivals or slow-moving stock', recommendation: 'Sector playbook in development.', action: 'Shop collection', example: 'New arrivals campaign', creativeStyle: 'Coming soon', seasonalFocus: 'Coming soon' },
  { slug: 'local-service', name: 'Local services', status: 'coming-soon', goal: 'Generate enquiries and bookings', recommendation: 'Sector playbook in development.', action: 'Request callback', example: 'Local enquiry campaign', creativeStyle: 'Coming soon', seasonalFocus: 'Coming soon' },
];

export const activePlaybooks = industryPlaybooks.filter((playbook) => playbook.status === 'available');
export const earlyAccessPlaybooks = industryPlaybooks.filter((playbook) => playbook.status === 'coming-soon');
export function playbookFor(businessType?: string | null) { const value = businessType?.toLowerCase() || ''; return industryPlaybooks.find((playbook) => value.includes(playbook.slug) || value.includes(playbook.name.toLowerCase().slice(0, -1))) || industryPlaybooks[0]; }
