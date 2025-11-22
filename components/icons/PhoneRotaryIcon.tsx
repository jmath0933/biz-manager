export default function PhoneRotaryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-gray-500"
    >
      <path d="M7 17 L17 7" />
      <path d="M6 14 C6 12, 8 10, 10 10" />
      <path d="M14 14 C14 12, 16 10, 18 10" />
      <circle cx="12" cy="18" r="2" />
    </svg>
  );
}
