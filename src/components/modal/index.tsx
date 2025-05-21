import { createPortal } from 'react-dom';

export default function Modal(props: {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	onCancel: Function;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	onConfirm: Function;
}) {
	return createPortal(
		<div className="w-full h-[100vh] dark:invert z-50 bg-white/40 text-black absolute top-0 left-0 flex items-center justify-center gap-4">
			<div className="bg-gray-200 animate-open rounded-2xl flex flex-col items-end gap-6 p-6">
				<p>Are you sure you want to delete the document?</p>
				<div className="flex gap-4">
					<button
						onClick={() => props.onCancel()}
						className="px-6 py-2 border border-black/50 opacity-50 rounded-lg cursor-pointer hover:bg-gray-300 "
					>
						Cancel
					</button>
					<button
						onClick={() => props.onConfirm()}
						className="px-6 py-2 bg-blue-300 rounded-lg cursor-pointer hover:bg-gray-300 "
					>
						Delete
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
