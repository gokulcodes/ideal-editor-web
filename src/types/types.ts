export type File = {
	id: string;
	name: string;
	type: 'file';
	content?: string;
};

export type Folder = {
	id: string;
	name: string;
	type: 'folder';
	childFiles: Array<File | Folder>;
};
