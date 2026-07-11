function Logo({ onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-2 cursor-pointer select-none">
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" fill="#D4A017" fillOpacity="0.15" stroke="#D4A017" strokeWidth="1.5" />
        <path
          d="M13 24c0-5 3-9 7-9s7 4 7 9v2a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 23 26v-2.5"
          stroke="#F5F5F5"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="17" cy="17" r="1.3" fill="#F5F5F5" />
        <path d="M12 20c-1.5 0-2.5 1.5-2.5 3" stroke="#F5F5F5" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
      <span className="font-bold text-base sm:text-lg leading-none">Vantara</span>
    </div>
  );
}

export default Logo;