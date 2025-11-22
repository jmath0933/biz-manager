export default function PhoneClassicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-gray-500"
    >
      <path d="M4 4h16v4H4z" /> {/* 수화기 */}
      <path d="M4 8v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /> {/* 본체 */}
      <circle cx="12" cy="14" r="3" /> {/* 다이얼 */}
    </svg>
  );
}
