export async function resizeImage(file: File, maxDimension = 800): Promise<File> {
	return new Promise((resolve) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			const canvas = document.createElement('canvas');
			let { width, height } = img;
			if (width > maxDimension || height > maxDimension) {
				if (width > height) {
					height = Math.round((height * maxDimension) / width);
					width = maxDimension;
				} else {
					width = Math.round((width * maxDimension) / height);
					height = maxDimension;
				}
			}
			canvas.width = width;
			canvas.height = height;
			canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
			canvas.toBlob(
				(blob) => resolve(new File([blob!], file.name, { type: file.type })),
				file.type,
				0.85
			);
		};
		img.src = url;
	});
}
