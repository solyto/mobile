import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { SvelteSet } from 'svelte/reactivity';
import Rating from '$lib/components/libraries/shared/Rating.svelte';
import StatisticWidget from '$lib/components/admin/StatisticWidget.svelte';
import DailyCheckInIcon from '$lib/components/check-in/daily/DailyCheckInIcon.svelte';
import CheckInIcon from '$lib/components/check-in/overview/CheckInIcon.svelte';
import TrackerGlyph from '$lib/components/check-in/TrackerGlyph.svelte';
import GenreFlexList from '$lib/components/libraries/shared/GenreFlexList.svelte';
import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
import CoverImage from '$lib/components/libraries/shared/CoverImage.svelte';
import CoverImageHarness from './helpers/CoverImageHarness.svelte';
import NoTodos from '$lib/components/todos/NoTodos.svelte';
import DeezerButton from '$lib/components/ui/buttons/DeezerButton.svelte';
import HardcoverButton from '$lib/components/ui/buttons/HardcoverButton.svelte';
import Link from '$lib/components/todos/props/Link.svelte';
import { renderWithContext } from './helpers/context';
import { checkInTracker, tag, todo } from '../unit/helpers/factories';
import type { BookGenre } from '$lib/types/library_book';

describe('Rating', () => {
	it('renders five stars', () => {
		const { container } = render(Rating, { props: { startRating: 0 } });
		expect(container.querySelectorAll('svg')).toHaveLength(5);
	});

	it('calls onchange with the clicked rating', async () => {
		const user = userEvent.setup();
		const onchange = vi.fn();
		const { container } = render(Rating, { props: { startRating: 0, onchange } });
		const stars = container.querySelectorAll('svg');
		await user.click(stars[2]);
		expect(onchange).toHaveBeenCalledWith(3);
	});
});

describe('StatisticWidget', () => {
	it('renders the label and a human-readable number', () => {
		render(StatisticWidget, { props: { label: 'Users', number: 2500 } });
		expect(screen.getByText('Users')).toBeInTheDocument();
		expect(screen.getByText('2.5K')).toBeInTheDocument();
	});
});

describe('NoTodos', () => {
	it('invites to add the first todo when there are none at all', () => {
		renderWithContext(NoTodos, { noTodosYet: true });
		expect(screen.getByText('No todos yet.')).toBeInTheDocument();
	});

	it('suggests another filter when todos exist but none match', () => {
		renderWithContext(NoTodos, { noTodosYet: false });
		expect(screen.getByText('No Todos found.')).toBeInTheDocument();
	});
});

describe('DailyCheckInIcon', () => {
	it('renders a button and calls onSelect on click', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(DailyCheckInIcon, {
			props: { type: 'mood', icon: null, index: 3, onSelect, isHighlighted: () => false }
		});
		await user.click(screen.getByRole('button'));
		expect(onSelect).toHaveBeenCalledWith(3);
	});
});

const mood = checkInTracker({ key: 'mood', name: null, type: 'scale', scored: true });

describe('TrackerGlyph', () => {
	it('draws a built-in tracker with its own icon, not from the sprite', () => {
		const { container } = render(TrackerGlyph, { props: { tracker: mood, class: 'size-4' } });
		expect(container.querySelector('svg')).toBeInTheDocument();
		expect(container.querySelector('use')).not.toBeInTheDocument();
	});

	it('draws an own tracker from the icon sprite', () => {
		const { container } = render(TrackerGlyph, { props: { tracker: checkInTracker({ key: null, name: 'Calm', icon: 'leaf' }), class: 'size-4' } });
		expect(container.querySelector('use')?.getAttribute('href')).toBe('/icons/lucide-sprite.svg#leaf');
	});
});

describe('CheckInIcon', () => {
	it('renders nothing when the value is null', () => {
		const { container } = render(CheckInIcon, { props: { tracker: mood, value: null } });
		expect(container.querySelector('button')).not.toBeInTheDocument();
	});

	it('shows a count as its number', () => {
		const { container } = render(CheckInIcon, { props: { tracker: checkInTracker({ key: null, name: 'Glasses', type: 'count' }), value: 7 } });
		expect(container.textContent?.trim()).toBe('7');
	});
});

describe('GenreFlexList', () => {
	function genre(id: number, title: string): BookGenre {
		return { id, title, created_at: '', updated_at: '' };
	}

	it('renders all genres', () => {
		render(GenreFlexList, {
			props: { genres: [genre(1, 'Fantasy'), genre(2, 'Sci-Fi')] }
		});
		expect(screen.getByText('Fantasy')).toBeInTheDocument();
		expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
	});
});

describe('TagFlexList', () => {
	it('renders tags with their colour', () => {
		render(TagFlexList, {
			props: {
				tags: [
					{ ...tag(1, 'home'), color: '#ff0000' },
					{ ...tag(2, 'work'), color: '#0000ff' }
				]
			}
		});
		expect(screen.getByText('#home')).toBeInTheDocument();
		expect(screen.getByText('#work')).toBeInTheDocument();
		expect(screen.getByText('#home')).toHaveStyle('background-color: #ff0000');
	});

	it('shows a remove button only when onRemove is provided and calls it', async () => {
		const user = userEvent.setup();
		const onRemove = vi.fn();
		const homeTag = { ...tag(1, 'home'), color: '#ff0000' };
		const { container } = renderWithContext(TagFlexList, { tags: [homeTag], onRemove });
		await user.click(container.querySelector('svg')!);
		expect(onRemove).toHaveBeenCalledWith(homeTag);

		renderWithContext(TagFlexList, { tags: [{ ...tag(2, 'work'), color: '#0000ff' }] });
		expect(screen.getAllByText('#work')).toHaveLength(1);
	});

	it('names the remove button', () => {
		renderWithContext(TagFlexList, { tags: [tag(1, 'home')], onRemove: vi.fn() });
		expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
	});
});

describe('CoverImage', () => {
	const shown = (container: HTMLElement) => [...container.querySelectorAll('img:not([hidden])')];
	const loader = (container: HTMLElement, src: string) => container.querySelector(`img[hidden][src="${src}"]`)!;

	it('shows nothing until an image has loaded', () => {
		const { container } = renderWithContext(CoverImage, { src: 'full.jpg', previewSrc: 'preview.jpg', alt: 'cover' });

		expect(shown(container)).toHaveLength(0);
	});

	it('shows the preview and the full image once both have loaded', async () => {
		const { container } = renderWithContext(CoverImage, { src: 'full.jpg', previewSrc: 'preview.jpg', alt: 'cover' });

		await fireEvent.load(loader(container, 'preview.jpg'));
		await fireEvent.load(loader(container, 'full.jpg'));

		const images = shown(container);
		expect(images).toHaveLength(2);
		expect(images[0]).toHaveAttribute('src', 'preview.jpg');
		expect(images[1]).toHaveAttribute('src', 'full.jpg');
	});

	it('shows only the full image when there is no preview', async () => {
		const { container } = renderWithContext(CoverImage, { src: 'full.jpg', alt: 'cover' });

		await fireEvent.load(loader(container, 'full.jpg'));

		const images = shown(container);
		expect(images).toHaveLength(1);
		expect(images[0]).toHaveAttribute('src', 'full.jpg');
	});

	it('shows an already loaded cover straight away', () => {
		const { container } = renderWithContext(CoverImage, { src: 'full.jpg', alt: 'cover' }, {
			stores: { loadedCovers: { sources: new SvelteSet(['full.jpg']) } }
		});

		expect(container.querySelectorAll('img[hidden]')).toHaveLength(0);
		expect(shown(container)[0]).toHaveAttribute('src', 'full.jpg');
	});

	it('loads and shows a new cover after the cover changed', async () => {
		const { container, rerender } = render(CoverImageHarness, { src: 'old.jpg', alt: 'cover' });
		await fireEvent.load(loader(container, 'old.jpg'));

		await rerender({ src: 'new.jpg', alt: 'cover' });
		await fireEvent.load(loader(container, 'new.jpg'));

		expect(shown(container)[0]).toHaveAttribute('src', 'new.jpg');
	});
});

describe('DeezerButton / HardcoverButton', () => {
	it.each([
		['Deezer', DeezerButton],
		['Hardcover', HardcoverButton]
	])('%s links a safe url', (_, Button) => {
		renderWithContext(Button, { link: 'https://example.com/album/1' });
		expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/album/1');
	});

	it.each([
		['Deezer', DeezerButton],
		['Hardcover', HardcoverButton]
	])('%s renders nothing for a rejected url', (_, Button) => {
		const { container } = renderWithContext(Button, { link: 'javascript:alert(1)' });
		expect(container.querySelector('a')).toBeNull();
	});
});

describe('todo Link', () => {
	it('opens a safe link from a button', () => {
		const { container } = renderWithContext(Link, { todo: todo({ link: 'https://solyto.app' }) });
		expect(container.querySelector('button')).not.toBeNull();
	});

	it('shows a rejected link as plain text', () => {
		const { container } = renderWithContext(Link, { todo: todo({ link: 'javascript:alert(1)' }) });
		expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
		expect(container.querySelector('button')).toBeNull();
	});
});
