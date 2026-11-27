// A failed request still reaches the app's global error handler; here it surfaces as an unhandled rejection.
export async function rejectionsDuring(action: () => Promise<void>): Promise<unknown[]> {
	const rejections: unknown[] = [];
	const collect = (reason: unknown) => rejections.push(reason);
	process.on('unhandledRejection', collect);
	try {
		await action();
		await new Promise((resolve) => setTimeout(resolve, 0));
	} finally {
		process.off('unhandledRejection', collect);
	}
	return rejections;
}
