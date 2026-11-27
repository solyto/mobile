import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import { Auth } from '$lib/state/Auth.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import { en } from '$lib/i18n/en';
import { renderWithContext, type AnyComponent } from './helpers/context';
import ForgotPasswordPage from '../../src/routes/auth/forgot-password/+page.svelte';
import ResendVerificationForm from '$lib/components/auth/ResendVerificationForm.svelte';

afterEach(() => {
	vi.useRealTimers();
});

const flows: [string, AnyComponent, keyof Auth, string][] = [
	['forgot password page', ForgotPasswordPage, 'forgotPassword', en.auth.forgot_password_send],
	['resend verification form', ResendVerificationForm, 'resendVerification', en.auth.resend_verification_send]
];

function resendButton(): HTMLButtonElement {
	return screen.getByText(en.auth.forgot_password_resend, { exact: false }).closest('button')!;
}

describe.each(flows)('%s', (_, component, method, submitLabel) => {
	async function submit(email: string): Promise<{ send: ReturnType<typeof vi.fn>; loadingIndicator: LoadingIndicator }> {
		const send = vi.spyOn(Auth.prototype, method as 'forgotPassword').mockResolvedValue();
		let loadingIndicator!: LoadingIndicator;
		renderWithContext(component, { hint: 'hint' }, { onReady: (stores) => (loadingIndicator = stores.loadingIndicator as LoadingIndicator) });
		await fireEvent.input(screen.getByRole('textbox'), { target: { value: email } });
		await fireEvent.click(screen.getByText(submitLabel));
		await vi.advanceTimersByTimeAsync(0);
		return { send: send as unknown as ReturnType<typeof vi.fn>, loadingIndicator };
	}

	it('asks for an email first', async () => {
		vi.useFakeTimers();
		const { send } = await submit('');

		expect(send).not.toHaveBeenCalled();
		expect(screen.getByText(en.auth.email_error)).toBeTruthy();
	});

	it('sends, then lets the user resend only after a minute', async () => {
		vi.useFakeTimers();
		const { send, loadingIndicator } = await submit('a@b.c');

		expect(send).toHaveBeenCalledTimes(1);
		expect(send).toHaveBeenCalledWith('a@b.c', 'web');
		expect(loadingIndicator.active).toBe(false);
		expect(resendButton().disabled).toBe(true);
		expect(resendButton().textContent).toContain('(60s)');

		await vi.advanceTimersByTimeAsync(59_000);
		expect(resendButton().textContent).toContain('(1s)');
		await fireEvent.click(resendButton());
		expect(send).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(1_000);
		expect(resendButton().disabled).toBe(false);
		expect(resendButton().textContent).not.toContain('(');

		await fireEvent.click(resendButton());
		await vi.advanceTimersByTimeAsync(0);
		expect(send).toHaveBeenCalledTimes(2);
		expect(resendButton().textContent).toContain('(60s)');
	});

	it('stops the loading indicator when sending fails', async () => {
		vi.useFakeTimers();
		vi.spyOn(Auth.prototype, method as 'forgotPassword').mockRejectedValue(new Error('offline'));
		let loadingIndicator!: LoadingIndicator;
		renderWithContext(component, { hint: 'hint' }, { onReady: (stores) => (loadingIndicator = stores.loadingIndicator as LoadingIndicator) });
		const rejections: unknown[] = [];
		const collect = (reason: unknown) => rejections.push(reason);
		process.on('unhandledRejection', collect);

		await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'a@b.c' } });
		await fireEvent.click(screen.getByText(submitLabel));
		await vi.advanceTimersByTimeAsync(0);
		await vi.runOnlyPendingTimersAsync();
		process.off('unhandledRejection', collect);

		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator.active).toBe(false);
	});
});
