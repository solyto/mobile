export type PlantLocation = 'indoor' | 'outdoor' | 'both';
export type PlantSunlight = 'full_sun' | 'partial_sun' | 'indirect' | 'shade';

export interface Plant {
	id: string;
	name: string | null;
	latin_name: string | null;
	location: PlantLocation | null;
	sunlight: PlantSunlight | null;
	current_size: string | null;
	max_size: string | null;
	acquired_at: string | null;
	winter_hardy: boolean | null;
	instructions: string | null;
	cover: string | null;
	link: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreatePlantRequest {
	name: string | null;
	latin_name?: string | null;
	location?: PlantLocation | null;
	sunlight?: PlantSunlight | null;
	current_size?: string | null;
	max_size?: string | null;
	acquired_at?: string | null;
	winter_hardy?: boolean | null;
	instructions?: string | null;
	cover_path?: string | null;
	link?: string | null;
}

export interface UpdatePlantRequest {
	name?: string | null;
	latin_name?: string | null;
	location?: PlantLocation | null;
	sunlight?: PlantSunlight | null;
	current_size?: string | null;
	max_size?: string | null;
	acquired_at?: string | null;
	winter_hardy?: boolean | null;
	instructions?: string | null;
	cover_path?: string | null;
	link?: string | null;
}
