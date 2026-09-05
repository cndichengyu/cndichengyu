# Footer Artwork

- File: `footer-handdrawn.png`
- Requested model: `gpt-image-2`
- Method: bundled ImageGen CLI, via the user's OpenAI-compatible image API
- Request: 1536 x 512, high quality, PNG
- Post-processing: chroma-key removal using the bundled `remove_chroma_key.py`, with a soft matte and spill cleanup; transparent PNG checked against white and GitHub dark backgrounds.
- The illustration contains no activity statistics. README statistics remain external GitHub-API-backed images, subject to provider and GitHub image caching.

## Generation Prompt

```text
Use case: illustration-story
Asset type: a wide unframed footer illustration for a personal GitHub profile.
Primary request: a genuinely hand-drawn little developer workbench, charming and personal rather than a polished corporate tech illustration.
Subject: one open laptop, a small portable external hard drive joined to it by a loose cable, a phone lying nearby, an open notebook with a few illegible pencil scribbles, and two colored pencils. These are everyday tools for making desktop apps, mobile tools and learning notes.
Style/medium: scanned colored-pencil and ink sketch, visibly irregular thin graphite outlines, small loose hatching, subdued watercolor washes inside the objects, human imperfections, light observational sketchbook drawing. Keep objects recognizable and use a coherent three-quarter tabletop perspective.
Composition: a long, low, single still-life group centered across a 3:1 canvas. Laptop a little left of center, notebook right, other objects placed naturally between them. Entire objects visible, generous clear margin above, below and at both ends. Only the objects and a few short pencil contact-shadow strokes, no desk slab, no room backdrop, no frame or card.
Colors: opaque off-white and cool gray device surfaces, muted sage, soft sky blue and a tiny coral accent. The drawing itself must contain no magenta.
Background: exactly flat uniform vivid magenta #FF00FF everywhere outside the objects, including empty spaces between objects, suitable for chroma-key removal. No pink spill, no background texture or gradient. Keep opaque white notebook pages and device bodies.
Text: no readable text, no logos, no numbers, no title, no slogan, no watermark.
Avoid: vector-perfect shapes, SVG aesthetics, thick cartoon outlines, glossy 3D, dramatic lighting, floating code symbols, fake charts, badges, UI panels, geometric decoration, sparkles, plants, beige full-page backgrounds, and rounded rectangle containers.
```
