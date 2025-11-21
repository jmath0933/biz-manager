// components/common/PhoneGroup.tsx

interface PhoneGroupProps<T extends string> {
  label: string;
  area: string;
  main: string;
  sub: string;
  fields: [T, T, T]; // ✅ 튜플로 명확하게 지정
  onChange: (field: T, value: string) => void;
}

export default function PhoneGroup<T extends string>({
  label,
  area,
  main,
  sub,
  fields,
  onChange,
}: PhoneGroupProps<T>) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          value={area}
          onChange={(e) => onChange(fields[0], e.target.value)}
          className="w-20 border rounded-md px-3 py-2"
          maxLength={3}
        />
        <input
          value={main}
          onChange={(e) => onChange(fields[1], e.target.value)}
          className="w-24 border rounded-md px-3 py-2"
          maxLength={4}
        />
        <input
          value={sub}
          onChange={(e) => onChange(fields[2], e.target.value)}
          className="w-24 border rounded-md px-3 py-2"
          maxLength={4}
        />
      </div>
    </div>
  );
}
