import type { ComponentProps, ReactNode } from "react"
import { Motion } from "@ankvale/ui/components/motion"
import {
  HeroSculpture,
  HeroPoster,
  HeroWorkspace,
  HeroWorkflow,
  HeroCanvasVisual,
  HeroTeamVisual,
  HeroIndexVisual,
} from "@ankvale/ui/blocks/hero-graphics"
import { cn } from "@ankvale/ui/lib/utils"

export type HeroProps = Omit<ComponentProps<"section">, "title"> & {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  headingLevel?: "h1" | "h2"
  /** Replace the included interactive artwork. Pass null to omit it. */
  children?: ReactNode
}
const inset = "px-[clamp(1.5rem,4cqw,4rem)] py-[clamp(3rem,5cqw,5rem)]"
function HeroRoot({
  layout,
  hero,
  children,
  className,
}: {
  layout: string
  hero: HeroProps
  children: ReactNode
  className?: string
}) {
  const {
    title: _title,
    description: _description,
    actions: _actions,
    eyebrow: _eyebrow,
    headingLevel: _heading,
    children: _children,
    className: heroClass,
    ...props
  } = hero
  return (
    <section
      data-slot={`hero-${layout}`}
      className={cn(
        "@container relative isolate bg-background text-foreground",
        className,
        heroClass
      )}
      {...props}
    >
      {children}
    </section>
  )
}
function HeroCopy({
  hero,
  centered = false,
  titleClass,
  className,
}: {
  hero: HeroProps
  centered?: boolean
  titleClass?: string
  className?: string
}) {
  const Heading = hero.headingLevel ?? "h2"
  return (
    <div
      data-slot="hero-content"
      className={cn(
        "relative z-10 min-w-0",
        centered && "mx-auto flex flex-col items-center text-center",
        className
      )}
    >
      {hero.eyebrow && (
        <div
          data-slot="hero-eyebrow"
          className="mb-6 flex items-center gap-2 text-xs font-medium"
        >
          {hero.eyebrow}
        </div>
      )}
      <Heading
        data-slot="hero-title"
        className={cn(
          "text-[clamp(3rem,7cqw,6.75rem)] font-semibold tracking-[-.055em] [overflow-wrap:anywhere]",
          titleClass,
          "leading-[.97]"
        )}
      >
        {typeof hero.title === "string"
          ? hero.title.split("\n").map((line, i) => (
              <span key={i} data-hero-line className="block">
                {line}
              </span>
            ))
          : hero.title}
      </Heading>
      {hero.description && (
        <div
          data-slot="hero-description"
          className="mt-7 max-w-[38ch] text-[clamp(.9375rem,1.45cqw,1.125rem)] leading-relaxed text-muted-foreground"
        >
          {hero.description}
        </div>
      )}
      {hero.actions && (
        <div
          data-slot="hero-actions"
          className={cn(
            "mt-8 flex flex-wrap items-center gap-3",
            centered && "justify-center"
          )}
        >
          {hero.actions}
        </div>
      )}
    </div>
  )
}
function Visual({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div data-slot="hero-visual" className={cn("relative min-w-0", className)}>
      {children}
    </div>
  )
}

/** A typography-led index. Use for studios, portfolios and focused product launches. */
export function HeroMinimal(props: HeroProps) {
  return (
    <HeroRoot layout="minimal" hero={props}>
      <Motion
        duration={450}
        className={cn(
          "mx-auto grid max-w-[1440px] gap-14 @3xl:grid-cols-[1.35fr_.75fr] @3xl:items-center @3xl:gap-20",
          inset
        )}
      >
        <HeroCopy hero={props} titleClass="text-[clamp(3.25rem,7.5cqw,7rem)]" />
        <Visual className="w-full max-w-md @3xl:justify-self-end">
          {props.children === undefined ? <HeroIndexVisual /> : props.children}
        </Visual>
      </Motion>
    </HeroRoot>
  )
}

/** A centered product story with a saturated blue stage and a working project preview. */
export function HeroProduct(props: HeroProps) {
  return (
    <HeroRoot layout="product" hero={props}>
      <Motion
        duration={450}
        className={cn("mx-auto max-w-[1440px] pb-0", inset)}
      >
        <HeroCopy
          hero={props}
          centered
          titleClass="text-[clamp(3.25rem,7.3cqw,6.75rem)]"
        />
        <Visual className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-t-xl bg-primary px-[clamp(1rem,4cqw,3.5rem)] pt-[clamp(1.5rem,4cqw,3.5rem)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-1/2 h-[200%] w-[120%] -translate-x-1/2 rounded-[50%] border border-white/20"
          />
          <div className="relative">
            {props.children === undefined ? <HeroWorkspace /> : props.children}
          </div>
        </Visual>
      </Motion>
    </HeroRoot>
  )
}

/** A blue outer frame, editorial copy and a color-switchable architectural poster. */
export function HeroFramed(props: HeroProps) {
  return (
    <HeroRoot layout="framed" hero={props} className="p-3 @lg:p-6">
      <div className="rounded-lg bg-primary p-3 @lg:p-6">
        <Motion
          duration={450}
          className="grid items-center gap-10 rounded-sm bg-background p-[clamp(1.5rem,4cqw,4rem)] @3xl:grid-cols-[1.15fr_.85fr] @3xl:gap-16"
        >
          <HeroCopy
            hero={props}
            titleClass="text-[clamp(3rem,6.2cqw,5.75rem)]"
          />
          <Visual className="mx-auto w-full max-w-md">
            {props.children === undefined ? (
              <HeroPoster initial="blue" />
            ) : (
              props.children
            )}
          </Visual>
        </Motion>
      </div>
    </HeroRoot>
  )
}

/** A sharp split layout paired with an original, rotatable blue paper construction. */
export function HeroSplit(props: HeroProps) {
  return (
    <HeroRoot layout="split" hero={props}>
      <Motion
        duration={450}
        className={cn(
          "mx-auto grid max-w-[1440px] items-center gap-8 @3xl:grid-cols-[1.05fr_1fr] @3xl:gap-10",
          inset
        )}
      >
        <HeroCopy hero={props} titleClass="[&>span:last-child]:text-primary" />
        <Visual>
          {props.children === undefined ? <HeroSculpture /> : props.children}
        </Visual>
      </Motion>
    </HeroRoot>
  )
}

/** A centered headline with a connected team illustration and selectable collaborators. */
export function HeroCentered(props: HeroProps) {
  return (
    <HeroRoot layout="centered" hero={props}>
      <Motion
        duration={450}
        className={cn("mx-auto max-w-[1440px] pb-6", inset)}
      >
        <HeroCopy
          hero={props}
          centered
          titleClass="text-[clamp(3rem,7.8cqw,7.5rem)]"
        />
        <Visual className="mx-auto mt-8 max-w-4xl">
          {props.children === undefined ? <HeroTeamVisual /> : props.children}
        </Visual>
      </Motion>
    </HeroRoot>
  )
}

/** Oversized type and a compact orbital study. Useful for a strong single message. */
export function HeroStatement(props: HeroProps) {
  return (
    <HeroRoot layout="statement" hero={props}>
      <Motion duration={450} className={cn("mx-auto max-w-[1440px]", inset)}>
        <HeroCopy
          hero={{ ...props, description: undefined, actions: undefined }}
          titleClass="max-w-none text-[clamp(3.6rem,10.4cqw,10rem)] [&>span:last-child]:text-primary"
        />
        <div className="mt-10 grid items-center gap-8 border-t pt-8 @3xl:grid-cols-[1fr_.5fr]">
          <div>
            <div
              data-slot="hero-description"
              className="max-w-[34ch] text-base leading-7 text-muted-foreground"
            >
              {props.description}
            </div>
            {props.actions && (
              <div
                data-slot="hero-actions"
                className="mt-7 flex flex-wrap gap-3"
              >
                {props.actions}
              </div>
            )}
          </div>
          <Visual className="mx-auto w-full max-w-[260px] @3xl:justify-self-end">
            {props.children === undefined ? (
              <HeroSculpture form="orbit" />
            ) : (
              props.children
            )}
          </Visual>
        </div>
      </Motion>
    </HeroRoot>
  )
}

/** A magazine-like composition: offset title, fine rules and a full-height print. */
export function HeroEditorial(props: HeroProps) {
  return (
    <HeroRoot layout="editorial" hero={props}>
      <Motion duration={450} className={cn("mx-auto max-w-[1440px]", inset)}>
        <div className="mb-8 flex items-center justify-between border-t border-foreground pt-4 font-mono text-[10px] text-muted-foreground">
          <span>AN INDEPENDENT PERSPECTIVE</span>
          <span aria-hidden="true">↙</span>
        </div>
        <div className="grid gap-10 @3xl:grid-cols-[1.1fr_.8fr] @3xl:gap-20">
          <div className="flex flex-col justify-between @3xl:py-8">
            <HeroCopy
              hero={props}
              titleClass="text-[clamp(3.4rem,7cqw,6.75rem)]"
            />
            <div
              aria-hidden="true"
              className="mt-16 hidden items-end justify-between @3xl:flex"
            >
              <svg
                viewBox="0 0 120 90"
                className="w-28 text-primary"
                fill="none"
              >
                <path
                  d="M10 20h70v60M80 20 10 80"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span className="font-mono text-[10px] text-muted-foreground">
                STUDIO NOTES / 001
              </span>
            </div>
          </div>
          <Visual className="mx-auto w-full max-w-md">
            {props.children === undefined ? (
              <HeroPoster initial="paper" />
            ) : (
              props.children
            )}
          </Visual>
        </div>
      </Motion>
    </HeroRoot>
  )
}

/** A working process, not a decorative screenshot. Select a stage to explore it. */
export function HeroShowcase(props: HeroProps) {
  return (
    <HeroRoot layout="showcase" hero={props}>
      <Motion
        duration={450}
        className={cn(
          "mx-auto grid max-w-[1440px] items-center gap-12 @3xl:grid-cols-[1fr_1fr] @3xl:gap-16",
          inset
        )}
      >
        <div>
          <span
            aria-hidden="true"
            className="mb-8 block text-5xl leading-none text-primary"
          >
            ✳
          </span>
          <HeroCopy
            hero={props}
            titleClass="text-[clamp(3rem,6.6cqw,6.25rem)]"
          />
        </div>
        <Visual>
          {props.children === undefined ? <HeroWorkflow /> : props.children}
        </Visual>
      </Motion>
    </HeroRoot>
  )
}

/** A canvas that can be explored with pointer or keyboard; use for creative tools. */
export function HeroCanvas(props: HeroProps) {
  return (
    <HeroRoot layout="canvas" hero={props}>
      <Motion duration={450} className={cn("mx-auto max-w-[1440px]", inset)}>
        <div className="grid items-end gap-8 @3xl:grid-cols-[1.4fr_.6fr]">
          <HeroCopy
            hero={{ ...props, description: undefined, actions: undefined }}
            titleClass="text-[clamp(3.2rem,7.8cqw,7rem)] [&>span:last-child]:text-primary"
          />
          <div className="@3xl:pb-2">
            <div
              data-slot="hero-description"
              className="max-w-[34ch] text-base leading-7 text-muted-foreground"
            >
              {props.description}
            </div>
            {props.actions && (
              <div
                data-slot="hero-actions"
                className="mt-6 flex flex-wrap gap-3"
              >
                {props.actions}
              </div>
            )}
          </div>
        </div>
        <Visual className="mt-12">
          {props.children === undefined ? <HeroCanvasVisual /> : props.children}
        </Visual>
      </Motion>
    </HeroRoot>
  )
}
