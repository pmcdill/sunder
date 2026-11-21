# Sunder Construction website

Static site for Sunder Construction LLC: About, Projects and Contact.

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

There's no build step. Point any static host at the repo root:

- **Vercel**: import the repo, choose framework preset "Other", and leave the build command empty.
- **Netlify**: set the publish directory to `/`.

## Before launch

- Fill in the bracketed placeholders (contact details, license, project copy).
- Add project photos (see `CLAUDE.md`).
- Connect the contact form to an endpoint (see `CLAUDE.md`).
- Self-host the licensed BD Plakatbau and Stymie fonts.

See `CLAUDE.md` for structure, brand rules and design details.
