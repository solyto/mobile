import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AverageNumber from '$lib/components/check-in/stats/AverageNumber.svelte';
import Rating from '$lib/components/libraries/shared/Rating.svelte';
import StatisticWidget from '$lib/components/admin/StatisticWidget.svelte';
import DailyCheckInIcon from '$lib/components/check-in/daily/DailyCheckInIcon.svelte';
import CheckInIcon from '$lib/components/check-in/overview/CheckInIcon.svelte';
import GenreFlexList from '$lib/components/libraries/shared/GenreFlexList.svelte';
import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
import CoverImage from '$lib/components/libraries/shared/CoverImage.svelte';
import NoTodos from '$lib/components/todos/NoTodos.svelte';
import { renderWithContext } from './helpers/context';
import { tag } from '../unit/helpers/factories';
import type { BookGenre } from '$lib/types/library_book';

describe('AverageNumber', () => {
	it('renders the value with two decimals', () => {
		render(AverageNumber, { props: { type: 'mood', value: 3.14159 } });
		expect(screen.getByText('3.14')).toBeInTheDocument();
	});

	it('renders a dash for NaN values', () => {
		render(AverageNumber, { props: { type: 'mood', value: NaN } });
		expect(screen.getByText('-')).toBeInTheDocument();
	});

	it.each([
		[4, 'bg-c-success'],
		[3.5, 'bg-c-btn'],
		[2.5, 'bg-c-warning'],
		[1.75, 'bg-c-action'],
		[1.5, 'bg-c-danger']
	])('colors value %s as %s', (value, expected) => {
		const { container } = render(AverageNumber, { props: { type: 'mood', value } });
		const dot = container.querySelector('.size-4');
		expect(dot?.classList.contains(expected)).toBe(true);
	});

	it('applies the food_amount thresholds for that tracker', () => {
		const success = render(AverageNumber, { props: { type: 'food_amount', value: 4 } });
		expect(success.container.querySelector('.size-4')?.classList.contains('bg-c-success')).toBe(
			true
		);

		const danger = render(AverageNumber, { props: { type: 'food_amount', value: 4.6 } });
		expect(danger.container.querySelector('.size-4')?.classList.contains('bg-c-danger')).toBe(
			true
		);
	});
});

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

	it('highlights up to the current rating', async () => {
		const user = userEvent.setup();
		const { container } = render(Rating, { props: { startRating: 0 } });
		const stars = container.querySelectorAll('svg');
		await user.click(stars[3]);
		expect(stars[3].getAttribute('class')).toContain('text-c-warning');
		expect(stars[4].getAttribute('class')).toContain('text-s-gray-200');
	});
});

describe('StatisticWidget', () => {
	it('renders the label and a human-readable number', () => {
		render(StatisticWidget, { props: { label: 'Users', number: 2500 } });
		expect(screen.getByText('Users')).toBeInTheDocument();
		expect(screen.getByText('2.5K')).toBeInTheDocument();
	});

	it('applies the requested color classes', () => {
		const { container } = render(StatisticWidget, {
			props: { label: 'X', number: 1, color: 'blue' }
		});
		expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
		expect(container.querySelector('.text-blue-600')).toBeInTheDocument();
	});
});

describe('NoTodos', () => {
	it('renders the no-todos message from the translation context', () => {
		renderWithContext(NoTodos);
		expect(screen.getByText(/no todos/i)).toBeInTheDocument();
	});
});

describe('DailyCheckInIcon', () => {
	it('renders a button and calls onSelect on click', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(DailyCheckInIcon, {
			props: { type: 'mood', index: 3, onSelect, isHighlighted: () => false }
		});
		await user.click(screen.getByRole('button'));
		expect(onSelect).toHaveBeenCalledWith(3);
	});

	it('colors the icon by index', () => {
		const { container } = render(DailyCheckInIcon, {
			props: { type: 'mood', index: 5, onSelect: vi.fn(), isHighlighted: () => false }
		});
		expect(container.querySelector('button')?.classList.contains('text-green-500')).toBe(true);
	});

	it('highlights the selected index', () => {
		const { container } = render(DailyCheckInIcon, {
			props: { type: 'mood', index: 2, onSelect: vi.fn(), isHighlighted: (i) => i === 2 }
		});
		const button = container.querySelector('button');
		expect(button?.classList.contains('bg-c-neutral')).toBe(true);
		expect(button?.classList.contains('border-transparent')).toBe(false);
	});

	it('uses the primary color for sports and maps the sport id', () => {
		const { container } = render(DailyCheckInIcon, {
			props: {
				type: 'sports',
				index: 1,
				onSelect: vi.fn(),
				isHighlighted: () => false,
				selectedSports: ['dumbbell', 'bike']
			}
		});
		expect(container.querySelector('button')?.classList.contains('text-c-primary')).toBe(true);
	});
});

describe('CheckInIcon', () => {
	it('renders nothing when the value is null', () => {
		const { container } = render(CheckInIcon, { props: { type: 'mood', value: null } });
		expect(container.querySelector('button')).not.toBeInTheDocument();
	});

	it('colors the icon by value', () => {
		const { container } = render(CheckInIcon, { props: { type: 'mood', value: 4 } });
		expect(container.querySelector('button')?.classList.contains('text-green-300')).toBe(true);
	});

	it('renders a sports icon with the primary color', () => {
		const { container } = render(CheckInIcon, { props: { type: 'sports', value: 1 } });
		expect(container.querySelector('button')?.classList.contains('text-c-primary')).toBe(true);
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
		const { container } = render(TagFlexList, {
			props: {
				tags: [
					{ ...tag(1, 'home'), color: '#ff0000' },
					{ ...tag(2, 'work'), color: '#0000ff' }
				]
			}
		});
		expect(screen.getByText('#home')).toBeInTheDocument();
		expect(screen.getByText('#work')).toBeInTheDocument();
		const pills = container.querySelectorAll('.rounded-full');
		expect(pills[0]).toHaveStyle('background-color: #ff0000');
	});

	it('shows a remove button only when onRemove is provided and calls it', async () => {
		const user = userEvent.setup();
		const onRemove = vi.fn();
		const homeTag = { ...tag(1, 'home'), color: '#ff0000' };
		const { container } = render(TagFlexList, {
			props: { tags: [homeTag], onRemove }
		});
		await user.click(container.querySelector('svg')!);
		expect(onRemove).toHaveBeenCalledWith(homeTag);

		render(TagFlexList, { props: { tags: [{ ...tag(2, 'work'), color: '#0000ff' }] } });
		expect(screen.getAllByText('#work')).toHaveLength(1);
	});
});

describe('CoverImage', () => {
	class FakeImage {
		onload: (() => void) | null = null;
		private _src = '';
		set src(value: string) {
			this._src = value;
			this.onload?.();
		}
		get src() {
			return this._src;
		}
	}

	it('renders the preview and the full image once both have loaded', () => {
		vi.stubGlobal('Image', FakeImage);
		const { container } = render(CoverImage, {
			props: { src: 'full.jpg', previewSrc: 'preview.jpg', alt: 'cover' }
		});
		const images = container.querySelectorAll('img');
		expect(images).toHaveLength(2);
		expect(images[0]).toHaveAttribute('src', 'preview.jpg');
		expect(images[1]).toHaveAttribute('src', 'full.jpg');
		vi.unstubAllGlobals();
	});

	it('renders only the full image when there is no preview', () => {
		vi.stubGlobal('Image', FakeImage);
		const { container } = render(CoverImage, { props: { src: 'full.jpg', alt: 'cover' } });
		const images = container.querySelectorAll('img');
		expect(images).toHaveLength(1);
		expect(images[0]).toHaveAttribute('src', 'full.jpg');
		vi.unstubAllGlobals();
	});
});
