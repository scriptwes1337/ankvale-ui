# Building applications and websites

Begin with a user task, a main action and a data contract. Select the largest existing composition that fits, then adapt its content and behavior. The live catalogs and generated API references are authoritative for available exports and props.

## Composition order

1. Choose a template for a matching application workflow.
2. Choose an app layout for navigation and persistent page regions.
3. Add blocks for composed sections or workflows.
4. Use components for the remaining controls and interactions.
5. Apply the shared design and motion rules.
6. Connect real data and services, then verify the whole flow.

| Need | Starting point |
| --- | --- |
| Admin/business overview | `dashboard-template` |
| Email reading and composing | `mail-template` |
| AI conversation interface | `chat-template` |
| Accounts and sales pipeline | `crm-template` |
| Spending/portfolio interface | `finances-template` |
| Custom application shell | `app-layout` |
| Project workspace | `app-project-detail`, then the appropriate board/list components |
| Marketing introduction | One appropriate layout from `hero-blocks` |
| Website feature section | `feature-grid`, `feature-bento`, `feature-split` or `feature-tabs` |
| Plans and comparison | `pricing-cards` or `pricing-comparison` |
| Unknown route | `not-found-page` |

Use these registry IDs to find the corresponding API and example. A block’s export or module name can differ from its registry ID. The [selection guide](/guides/selection) provides further recommendations.

## Ownership and integration

Keep navigation destinations, domain types, network requests, authentication and persistence in the application. Templates use illustrative data and local interactions until connected. A button that changes local preview state is not a completed payment, invitation, upload or account operation.

For each service-backed flow, define input, pending state, success result, error result and retry behavior. Disable duplicate submissions where appropriate and preserve user input on failure. Server-side validation and authorization remain necessary even when the client validates a form.

Keep permissions and availability separate from appearance. Hiding a control is presentation; it does not protect a route or API. Use explicit owner-supplied callbacks rather than hardcoding services inside shared visual components.

## Website composition

Use one page-level h1 and a clear sequence of sections: introduction, explanation, evidence, relevant conversion and footer. Choose sections for the actual business rather than filling every available block. Replace fictional testimonials, prices, brands and statistics with verified content before publishing.

Use real text for headlines, labels and body copy. Product graphics can support the message, but should not contain the only readable explanation or primary action.

## Complete interface states

Every applicable screen should account for initial loading, empty content, filtered-empty content, invalid input, service failure, disabled permissions, long content and successful completion. Skeletons should resemble the content geometry. Empty states should explain the next useful action. Error pages should offer a working route back.

## Responsive behavior

Choose what stacks, collapses or scrolls instead of shrinking a desktop screen. Dense boards and data grids may scroll inside their own region. Preserve labels and important actions; avoid page-wide horizontal overflow. Test with real long names and translated labels.

## What remains product-specific

Business rules, content, SEO decisions, analytics events, legal copy, account flows, storage, billing and email delivery belong to each product. Ankvale supplies presentation contracts and examples, not operational services or verified business claims.
