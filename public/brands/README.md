# Brand logos ("Trusted by leading brands and agencies")

The home page logo strip renders these files. Each one is the company's real
logo, taken from the owner's own site (or, where the site ships no usable
asset, from Wikimedia Commons).

## Current files

| Company  | File           | Source                                              |
| -------- | -------------- | --------------------------------------------------- |
| alfa     | `alfa.png`     | alfa.com.lb                                         |
| touch    | `touch.svg`    | touch.com.lb                                        |
| ABC      | `abc.svg`      | shopwithabc.com (white variant recoloured to black) |
| Spinneys | `spinneys.png` | spinneyslebanon.com                                 |
| BeitMisk | `beitmisk.png` | beitmisk.com                                        |
| OMT      | `omt.svg`      | omt.com.lb                                          |
| CMA CGM  | `cma-cgm.svg`  | Wikimedia Commons (`CMA CGM logo.svg`)              |
| mtv      | `mtv.svg`      | mtv.com.lb                                          |
| KIA      | `kia.svg`      | Wikimedia Commons (`KIA logo3.svg`, 2021 identity)  |

Paths are wired in `src/client/features/home/data/homepage.ts`.

## Guidelines

- **Format:** prefer `.svg` (crisp at any size). PNG works too — if you use a
  different extension, update the matching `logo:` path in `homepage.ts`.
- **Color:** ship the variant that reads on a white strip. Knock-out (white)
  logos disappear there; use the brand's positive/dark variant instead. The
  strip renders logos in grayscale and reveals full color on hover.
- **Padding:** trim surrounding whitespace so logos sit on a consistent visual
  height (the strip fixes height at ~28–32px and lets width flow).
- **Rights:** only use logos you have permission to display. Client/partner
  "trusted by" walls are common, but confirm usage rights per brand — and only
  list companies that are actually customers.

Do not add a `logo` path before its file exists; brands without one fall back to
a generated wordmark. To add or remove a company, edit the `brands` array in
`src/client/features/home/data/homepage.ts`.
