export default function AuthLayout({ children }) {
  return (
    <div className="min-h-dvh grid place-items-center">
      <div className="w-full max-w-sm bg-white rounded-xl border p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
