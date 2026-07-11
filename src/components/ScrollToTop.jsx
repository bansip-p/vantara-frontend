import { useEffect, useState } from 'react';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 bg-vantaraGreen text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition"
      title="Scroll to top"
    >
      ↑
    </button>
  );
}

export default ScrollToTop;