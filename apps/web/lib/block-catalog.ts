import appDefinitions from "./app-block-definitions.json"
import siteDefinitions from "./site-block-definitions.json"
export const baseBlockDefinitions = [
  {
    id: "not-found-page",
    name: "404 page",
    component: "NotFoundPage",
    category: "Page states",
    module: "error-pages",
  },
  {
    id: "navbar-standard",
    name: "Standard navigation",
    component: "NavbarStandard",
    category: "Navigation",
    module: "navigation",
  },
  {
    id: "navbar-floating",
    name: "Floating navigation",
    component: "NavbarFloating",
    category: "Navigation",
    module: "navigation",
  },
  {
    id: "navbar-mega",
    name: "Mega menu",
    component: "NavbarMega",
    category: "Navigation",
    module: "navigation",
  },
  {
    id: "feature-grid",
    name: "Feature grid",
    component: "FeatureGrid",
    category: "Features",
    module: "features",
  },
  {
    id: "feature-bento",
    name: "Bento features",
    component: "FeatureBento",
    category: "Features",
    module: "features",
  },
  {
    id: "feature-split",
    name: "Alternating features",
    component: "FeatureSplit",
    category: "Features",
    module: "features",
  },
  {
    id: "feature-tabs",
    name: "Tabbed showcase",
    component: "FeatureTabs",
    category: "Features",
    module: "features",
  },
  {
    id: "logo-cloud",
    name: "Logo collection",
    component: "LogoCloud",
    category: "Social proof",
    module: "social-proof",
  },
  {
    id: "testimonial-grid",
    name: "Testimonial cards",
    component: "TestimonialGrid",
    category: "Social proof",
    module: "social-proof",
  },
  {
    id: "testimonial-spotlight",
    name: "Featured quote",
    component: "TestimonialSpotlight",
    category: "Social proof",
    module: "social-proof",
  },
  {
    id: "pricing-cards",
    name: "Pricing plans",
    component: "PricingCards",
    category: "Pricing",
    module: "pricing",
  },
  {
    id: "pricing-comparison",
    name: "Plan comparison",
    component: "PricingComparison",
    category: "Pricing",
    module: "pricing",
  },
  {
    id: "faq-accordion",
    name: "Accordion FAQ",
    component: "FaqAccordion",
    category: "FAQs",
    module: "faq",
  },
  {
    id: "faq-split",
    name: "Split FAQ",
    component: "FaqSplit",
    category: "FAQs",
    module: "faq",
  },
  {
    id: "cta-banner",
    name: "Centered call to action",
    component: "CtaBanner",
    category: "Calls to action",
    module: "cta",
  },
  {
    id: "cta-split",
    name: "Split call to action",
    component: "CtaSplit",
    category: "Calls to action",
    module: "cta",
  },
  {
    id: "cta-newsletter",
    name: "Newsletter signup",
    component: "CtaNewsletter",
    category: "Calls to action",
    module: "cta",
  },
  {
    id: "footer-minimal",
    name: "Minimal footer",
    component: "FooterMinimal",
    category: "Footers",
    module: "footers",
  },
  {
    id: "footer-columns",
    name: "Column footer",
    component: "FooterColumns",
    category: "Footers",
    module: "footers",
  },
  {
    id: "footer-editorial",
    name: "Editorial footer",
    component: "FooterEditorial",
    category: "Footers",
    module: "footers",
  },
] as const
export type BlockDefinition = {
  id: string
  name: string
  component: string
  category: string
  module: string
  backlogId?: string
}
export const blockDefinitions: readonly BlockDefinition[] = [
  ...baseBlockDefinitions,
  ...appDefinitions.map((item) => ({ ...item, category: "Application" })),
  ...siteDefinitions,
]
export type BlockId = string
export const categories = [
  ...new Set(blockDefinitions.map((item) => item.category)),
]

export const sampleLinks = [
  { label: "Features", href: "/examples/studio#features" },
  { label: "Pricing", href: "/examples/studio#pricing" },
  { label: "Questions", href: "/examples/studio#questions" },
]
export const sampleGroups = [
  {
    title: "Explore",
    links: [
      {
        label: "Components",
        href: "/playground",
        description: "The small details, thoughtfully made.",
      },
      {
        label: "Hero layouts",
        href: "/blocks/heroes",
        description: "Make the first impression count.",
      },
    ],
  },
  {
    title: "Build",
    links: [
      {
        label: "Website blocks",
        href: "/blocks",
        description: "Complete sections that fit together.",
      },
      {
        label: "Example website",
        href: "/examples/studio",
        description: "See the collection in context.",
      },
    ],
  },
]
export const sampleFeatures = [
  {
    title: "A place for every idea",
    description:
      "Bring your notes, projects, and next good thought together in one considered space.",
  },
  {
    title: "Less friction. More flow.",
    description:
      "Thoughtful controls and clear structure help you stay with the work that matters.",
  },
  {
    title: "Space to make it yours",
    description:
      "Adjust the details, find your rhythm, and build something that feels like you.",
  },
]
export const sampleQuotes = [
  {
    quote:
      "A calmer workspace makes room for better ideas. The little details make the whole experience feel considered.",
    name: "Alex Morgan",
    role: "Sample quote · fictional profile",
  },
  {
    quote:
      "Everything feels like it belongs together, from the first screen to the last small interaction.",
    name: "Jamie Chen",
    role: "Sample quote · fictional profile",
  },
  {
    quote:
      "It is the kind of space that helps you focus on the work, and enjoy the process a little more.",
    name: "Sam Rivera",
    role: "Sample quote · fictional profile",
  },
]
export const samplePlans = [
  {
    name: "Personal",
    description: "A little space for your own good ideas.",
    monthly: 0,
    yearly: 0,
    features: ["Personal workspace", "Notes and projects", "Essential tools"],
    href: "/examples/studio#questions",
    actionLabel: "Explore Personal",
  },
  {
    name: "Studio",
    description: "A thoughtful home for a growing team.",
    monthly: 18,
    yearly: 180,
    features: [
      "Everything in Personal",
      "Shared workspaces",
      "Team permissions",
      "Priority support",
    ],
    href: "/examples/studio#questions",
    actionLabel: "Explore Studio",
    featured: true,
  },
  {
    name: "Collective",
    description: "More room for ambitious work.",
    monthly: 36,
    yearly: 360,
    features: [
      "Everything in Studio",
      "Multiple teams",
      "Advanced permissions",
      "Dedicated onboarding",
    ],
    href: "/examples/studio#questions",
    actionLabel: "Explore Collective",
  },
]
export const sampleFaqs = [
  {
    question: "Can I customize these blocks?",
    answer:
      "Yes. Each block accepts your content and uses shared design tokens. The source lives in your project, ready to adapt.",
  },
  {
    question: "Do the blocks work on smaller screens?",
    answer:
      "Layouts reflow across screen sizes. Navigation includes a mobile menu, and wide comparison tables can be scrolled.",
  },
  {
    question: "Does the default style support dark mode?",
    answer:
      "Yes. The same solid surfaces, clear borders, and spacing use shared tokens for both light and dark modes.",
  },
  {
    question: "Are the example forms and plans real?",
    answer:
      "No. Prices, profiles, and brands are illustrative. Forms need your own service integration before they can submit data.",
  },
]
export const sampleLogos = [
  "northstar",
  "Capsule",
  "offscript",
  "Orbit",
  "Layers",
].map((name) => ({ name }))
