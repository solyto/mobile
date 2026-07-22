<p align="center">
  <img src="https://raw.githubusercontent.com/solyto/assets/main/solyto_logo.png" />
</p>

solyto is a free, private, all-in-one personal management app — covering your todos, contacts, calendar, notes, news, music and book library in one place, with one login, and one coherent interface. No annoying AI features, no tracking, no subscriptions, no bullshit. Use it on the web, install it as a PWA, or self-host it entirely on your own infrastructure. Built out of frustration with bloated tools, fragmented self-hosted stacks, and services that keep adding things you never asked for.

# solyto app

Frontend for [solyto.app](https://solyto.app).

Built with SvelteKit 2, Svelte 5, Tailwind CSS v4, and TypeScript.

## Development

Install dependencies:

```sh
npm install
```

Start the dev server:

```sh
npm run dev
```

Runs on [http://localhost:5173](http://localhost:5173) when using the local Docker setup. Running `npm run dev` directly will use the default Vite port instead.

The easiest way to get the full stack running locally is via the [solyto workspace](https://github.com/solyto/solyto).

## Other commands

```sh
npm run build       # production build
npm run preview     # preview the production build locally
npm run check       # type-check with svelte-check
npm run lint        # prettier + eslint
npm run format      # auto-format
```

## Deployment

Handled via Ansible in [solyto/deployment](https://github.com/solyto/deployment).

---

## Licensing

Solyto is licensed under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.en.html) (AGPL-3.0).

You are free to use, modify, and self-host this software. If you distribute it or run it as a network service, you must make your source code available under the same license.
