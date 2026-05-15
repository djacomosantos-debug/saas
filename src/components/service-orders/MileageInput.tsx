import { Input } from '@/components/ui/input'

interface MileageInputProps {
  value: string
  onChange: (value: string) => void
}

export function MileageInput({ value, onChange }: MileageInputProps) {
  const formatMileage = (val: string) => {
    const digits = val.replace(/\D/g, '')
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    onChange(raw)
  }

  return (
    <div className="relative">
      <Input
        value={formatMileage(value)}
        onChange={handleChange}
        placeholder="0"
        className="pr-12"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
    </div>
  )
}
