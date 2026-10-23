import { setContext, getContext } from 'svelte';

export class UpdateRequired {
	required = $state<boolean>(false);
	minVersion = $state<string | null>(null);

	require(minVersion: string | null): void {
		this.required = true;
		this.minVersion = minVersion;
	}
}

const UPDATE_REQUIRED_KEY = Symbol('SOLYTO_UPDATE_REQUIRED');

export function setUpdateRequired(): UpdateRequired {
	return setContext(UPDATE_REQUIRED_KEY, new UpdateRequired());
}

export function getUpdateRequired(): UpdateRequired {
	return getContext<UpdateRequired>(UPDATE_REQUIRED_KEY);
}
