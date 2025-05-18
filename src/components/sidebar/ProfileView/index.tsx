export default function ProfileView() {
	return (
		<div className="mt-auto flex flex-col border-t dark:invert text-black border-black/20">
			{/* <button className="p-4 hover:bg-black/10 cursor-pointer flex flex-row items-center gap-2 justify-start w-full text-left">
				<BsKeyboard />
				<span className="text-sm">Typerace</span>
			</button>
			<hr className="opacity-20" /> */}
			<button className="p-4 hover:bg-black/10 cursor-pointer flex flex-row items-center gap-2 justify-start w-full text-left">
				<img
					src="/icons/avatar.png"
					alt="file-mode"
					className="w-4 h-4"
				/>
				<span className="text-sm">Anonymous</span>
			</button>
		</div>
	);
}
