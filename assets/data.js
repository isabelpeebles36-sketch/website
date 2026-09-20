/* THE ONLY FILE YOU NEED TO EDIT TO ADD OR CHANGE WORK.
   PIECES = personal work (goes into the star on the Work page).
   EXPERIENCE = roles and internships (goes into the index on the About page).
   Add/edit a piece and it shows up automatically, incl. its own page at
   Project.dc.html#your-slug. `image` can be one path or a list (first = tile
   cover, rest = extra views on the piece's own page); each list item can be
   a bare path or { src, caption }. */

window.SITE_DATA = (function () {

const PIECES = [
  { slug: 'piece-one', title: 'Title coming soon', year: '2025',
    medium: 'Oil on canvas', dimensions: '', image: 'assets/images/blue-portrait.jpg',
    description: 'Description coming soon.' },
  { slug: 'piece-two', title: 'Title coming soon', year: '2025',
    medium: 'Oil on canvas', dimensions: '', image: 'assets/images/enough.jpg',
    description: 'Description coming soon.' },
  { slug: 'piece-three', title: 'Title coming soon', year: '2024',
    medium: 'Oil on canvas', dimensions: '', image: 'assets/images/hands.jpg',
    description: 'Description coming soon.' },
  { slug: 'piece-four', title: 'Title coming soon', year: '2024',
    medium: 'Coloured pencil', dimensions: '', image: 'assets/images/two-faces.jpg',
    description: 'Description coming soon.' },
  { slug: 'piece-five', title: 'Title coming soon', year: '2023',
    medium: 'Coloured pencil', dimensions: '', image: 'assets/images/cocoon.jpg',
    description: 'Description coming soon.' },
  { slug: 'piece-six', title: 'Title coming soon', year: '2023',
    medium: 'Mixed medium — acrylic and oil on canvas', dimensions: '',
    image: ['assets/images/holding-on.jpg',
      { src: 'assets/images/holding-on-detail.jpg', caption: 'Detail' },
      { src: 'assets/images/holding-on-install.jpg', caption: 'Installed' }],
    description: 'Description coming soon.' },
  { slug: 'piece-seven', title: 'Title coming soon', year: '2023',
    medium: 'Glazed ceramic', dimensions: '',
    image: ['assets/images/ceramics.jpg', { src: 'assets/images/ceramics-install.jpg', caption: 'Installed' }],
    description: 'Description coming soon.' },
  { slug: 'piece-eight', title: 'Title coming soon', year: '2022',
    medium: 'Mixed medium', dimensions: '', image: 'assets/images/collage.jpg',
    description: 'Description coming soon.' },
  { slug: 'piece-nine', title: 'Title coming soon', year: '2022',
    medium: 'Ink on skin, photographed', dimensions: '', image: 'assets/images/word-hands.jpg',
    description: 'Description coming soon.' },
  { slug: 'piece-ten', title: 'Title coming soon', year: '2021',
    medium: 'Photography', dimensions: '', image: 'assets/images/piece-ten.jpg',
    description: 'Description coming soon.' }
];

const PROJECTS = [];

/* EXPERIENCE = roles and internships, shown as the index on the About page.
   `artefact` is optional — a thing you actually made during the role. */
const EXPERIENCE = [
  {
    org: 'Existential Risk Laboratory (XLab)',
    role: 'Operations & Design Intern',
    year: 'Jul — Aug 2026',
    summary: 'Designed the lab\u2019s logos and branding materials, including the mark for Second Look, and led a full redesign of the XLab website. Alongside the design work I restructured the programme databases \u2014 sorting systems, colour-coded tracking and budget management \u2014 to make day-to-day operations legible.',
    outputs: ['Second Look mark', 'Website redesign', 'Branding materials', 'Database restructure'],
    artefact: null
  },
  {
    org: 'TIGON Power',
    role: 'Data Analyst Intern',
    year: 'May — Jul 2026',
    summary: 'Built Volta, a full-stack dashboard tracking a four-plant power fleet against live market prices, on a Python and FastAPI engine that automates revenue, cost and profit calculations. Outputs validated to within 0.03% of manual analyst figures, behind an API built to keep contract pricing confidential.',
    outputs: ['Volta dashboard', 'Python / FastAPI', 'Secure pricing API'],
    artefact: null
  },
  {
    org: 'Java Productivity App',
    role: 'Personal project',
    year: 'Mar 2025',
    summary: 'A task management application written in Java, with SQL (Derby) storage, email notifications and task tracking. Built to understand backend logic end to end rather than to ship.',
    outputs: ['Java', 'SQL (Derby)'],
    artefact: null
  }
];

function pictures(p) {
  const v = p && p.image;
  if (!v) return [];
  if (typeof v === 'string') return [{ src: v, caption: '' }];
  return v.filter(Boolean).map(e => typeof e === 'string' ? { src: e, caption: '' } : { src: e.src, caption: e.caption || '' });
}
function cover(p) { const l = pictures(p); return l.length ? l[0].src : ''; }

return { PIECES, PROJECTS, EXPERIENCE, pictures, cover };
})();
