import {
  HeroMinimal,
  HeroProduct,
  HeroFramed,
  HeroSplit,
  HeroCentered,
  HeroStatement,
  HeroEditorial,
  HeroShowcase,
  HeroCanvas,
} from "@ankvale/ui/blocks/heroes"

export const heroVariants = {
  split: HeroSplit,
  product: HeroProduct,
  showcase: HeroShowcase,
  framed: HeroFramed,
  editorial: HeroEditorial,
  canvas: HeroCanvas,
  centered: HeroCentered,
  statement: HeroStatement,
  minimal: HeroMinimal,
}
export type HeroVariant = keyof typeof heroVariants
export const heroExamples: Record<
  HeroVariant,
  { title: string; description: string }
> = {
  split: {
    title: "Big ideas.\nRoom to grow.",
    description: "Notes, projects, and a little more room to think.",
  },
  product: {
    title: "From first idea\nto something real.",
    description: "Bring your notes, projects, and people into one workspace.",
  },
  showcase: {
    title: "Less friction.\nMore forward.",
    description:
      "A shared place to plan the work, shape the details, and get it out into the world.",
  },
  framed: {
    title: "A little order.\nA bigger idea.",
    description: "Give your next project the space and structure it needs.",
  },
  editorial: {
    title: "A different\npoint of view.",
    description:
      "A home for independent thinking, unfinished ideas, and work worth sharing.",
  },
  canvas: {
    title: "Ideas, meet\npossibility.",
    description:
      "Put the pieces on the table. Find the connections. See where they take you.",
  },
  centered: {
    title: "Better work.\nIn good company.",
    description:
      "One place for your team to think, plan, and make progress together.",
  },
  statement: {
    title: "Make room\nfor what’s next.",
    description: "Your notes, plans, and next chapter. All in one place.",
  },
  minimal: {
    title: "A place for\nyour next chapter.",
    description: "Organize what you know. Explore what comes next.",
  },
}
