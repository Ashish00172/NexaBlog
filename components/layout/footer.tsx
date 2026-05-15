export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} NexaBlog. All rights reserved.</p>
        <p>Enterprise publishing platform for modern organizations.</p>
      </div>
    </footer>
  );
}
