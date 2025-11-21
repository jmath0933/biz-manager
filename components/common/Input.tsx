// components/common/Input.tsx

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Input({ label, value, onChange, placeholder }: InputProps) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2"
      />
    </div>
  );
}
