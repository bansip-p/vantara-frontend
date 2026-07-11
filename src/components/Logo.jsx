function Logo({ onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-2.5 cursor-pointer select-none">
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
        {/* Outer shield/leaf shape — represents protection + nature */}
        <path
          d="M24 4 L42 11 V22 C42 33 34.5 41 24 44 C13.5 41 6 33 6 22 V11 Z"
          fill="#1B4332"
          stroke="#D4A017"
          strokeWidth="1.5"
        />
        {/* Inner pulse/heartbeat line — represents AI health monitoring */}
        <path
          d="M11 24 H17 L20 17 L24 31 L27 24 H37"
          stroke="#D4A017"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Small paw accent, bottom */}
        <circle cx="24" cy="36.5" r="1.6" fill="#74C69D" />
      </svg>
      <div className="leading-tight">
        <div className="font-bold text-base sm:text-lg text-white">Vantara</div>
        <div className="hidden sm:block text-[9px] tracking-wider text-white/60 -mt-1">AI GUARDIAN</div>
      </div>
    </div>
  );
}

export default Logo;