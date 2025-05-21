import idealContext from '@/controller/idealContext';
import useDocumentSaver from '@/hooks/useDocumentSaver';
import { useContext } from 'react';

function DocumentSaver() {
	// const [isSaved, setIsSaved] = useState(false);
	const { state } = useContext(idealContext);
	useDocumentSaver();

	if (!state.isSaved) {
		return null;
	}

	return (
		<div className="dark:invert animate-sidebarOpen flex items-center justify-center gap-2">
			<img
				src="/icons/checked.png"
				alt="checked"
				className="w-4 h-4"
			/>
			<span className="text-sm text-black">Saved</span>
		</div>
	);
}

export default DocumentSaver;
