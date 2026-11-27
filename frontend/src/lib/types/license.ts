export interface OpenSourceLicense {
	name: string;
	version: string;
	license: string;
	url: string;
}

export interface OpenSourceLicenseWithText extends OpenSourceLicense {
	text: string;
}
