import React, { useState, useEffect, useRef } from 'react';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Basic focus management: focus first item in menu when opened
  // In a production app, you might use a more robust focus-trapping library.
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstFocusableElement = menuRef.current.querySelector(
        'a[href], button:not([disabled])'
      );
      if (firstFocusableElement) {
        (firstFocusableElement as HTMLElement)?.focus();
      }
    } else if (!isOpen && triggerRef.current) {
        // Optionally return focus to the trigger button
        // triggerRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = ''; // Cleanup on unmount
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button - Only visible on mobile (screens smaller than md) */}
      <div className="md:hidden">
        <button
          ref={triggerRef}
          type="button"
          className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          aria-label={isOpen ? "Close main menu" : "Open main menu"}
          aria-expanded={isOpen}
          aria-controls="mobileMenuPanel"
          onClick={toggleMenu}
        >
          {isOpen ? (
            // X Icon
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger Icon
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Overlay - Only visible on mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ease-in-out md:hidden
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
        aria-hidden={!isOpen}
      />

      {/* Mobile Menu Panel - Only visible on mobile */}
      <div
        ref={menuRef}
        id="mobileMenuPanel"
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out md:hidden
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobileMenuTitle"
        aria-hidden={!isOpen}
        tabIndex={-1} // Makes the panel focusable for the effect hook
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="mobileMenuTitle" className="text-lg font-semibold text-gray-800">
            Menu
          </h2>
          <button
            type="button"
            className="p-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4" aria-label="Main navigation">
          <a href="#" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">Dashboard</a>
          <a href="#" onClick={closeMenu} className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">Team</a>
          <a href="#" onClick={closeMenu} className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">Projects</a>
          <a href="#" onClick={closeMenu} className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">Calendar</a>
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;
