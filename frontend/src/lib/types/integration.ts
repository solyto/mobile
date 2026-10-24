export interface InstanceIntegrations {
	hardcover: boolean;
	tmdb: boolean;
	discogs: boolean;
	bgg: boolean;
	spotify: boolean;
	telegram: boolean;
	ntfy: boolean;
}

export type IntegrationName = keyof InstanceIntegrations;
