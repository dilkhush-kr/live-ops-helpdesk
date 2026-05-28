"use client";

export default function ConnectionBanner({ disconnected }) {
  if (!disconnected) return null;

  return (
    <div className="bg-red-600 text-white text-center py-2 font-semibold">
      Connection Lost: Reconnecting...
    </div>
  );
}