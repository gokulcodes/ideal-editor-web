export type File = {
	id: string;
	name: string;
	type: 'folder' | 'file';
	content: string;
	childFiles: Array<File>;
};
