# Brand logos ("Trusted by leading brands and agencies")

The home page logo strip uses generated local wordmarks by default. This avoids
requesting files that are not present and keeps the page free of asset 404s.

## Expected files

If the project has permission to display a company's real logo, drop it here and
then add its `logo` path in `src/client/features/home/data/homepage.ts`:

| Company  | File           |
| -------- | -------------- |
| Alfa     | `alfa.svg`     |
| touch    | `touch.svg`    |
| ABC      | `abc.svg`      |
| Spinneys | `spinneys.svg` |
| BeitMisk | `beitmisk.svg` |
| OMT      | `omt.svg`      |
| CMA CGM  | `cma-cgm.svg`  |
| MTV      | `mtv.svg`      |
| KIA      | `kia.svg`      |

## Guidelines

- **Format:** prefer `.svg` (crisp at any size). PNG works too — if you use a
  different extension, update the matching `logo:` path in `homepage.ts`.
- **Color:** single-color or full-color both work. The strip renders logos in
  grayscale and reveals full color on hover, so a solid dark or monochrome logo
  looks best.
- **Padding:** trim surrounding whitespace so logos sit on a consistent visual
  height (the strip fixes height at ~28–32px and lets width flow).
- **Rights:** only use logos you have permission to display. Client/partner
  "trusted by" walls are common, but confirm usage rights per brand.

Do not add a `logo` path before its file exists. To add or remove a company,
edit the `brands` array in `src/client/features/home/data/homepage.ts`.
