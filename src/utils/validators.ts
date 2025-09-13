

export function validateOIB(oib: string): boolean {

  const cleanOib = oib.replace(/[\s-]/g, '')

  if (!/^\d{11}$/.test(cleanOib)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 10; i++) {
    sum = (sum + parseInt(cleanOib[i])) * 10 % 11
    if (sum === 10) sum = 1
  }
  
  const checkDigit = (11 - sum) % 11
  const lastDigit = parseInt(cleanOib[10])
  
  return checkDigit === lastDigit
}

export function formatOIB(oib: string): string {
  const cleanOib = oib.replace(/[\s-]/g, '')
  if (cleanOib.length === 11) {
    return `${cleanOib.slice(0, 5)} ${cleanOib.slice(5, 10)} ${cleanOib.slice(10)}`
  }
  return oib
}

export function validateCroatianPostalCode(postalCode: string): boolean {

  const code = parseInt(postalCode)
  return /^\d{5}$/.test(postalCode) && code >= 10000 && code <= 53000
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateCroatianPhone(phone: string): boolean {

  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

  const patterns = [
    /^\+38599\d{7}$/, // +385 99 xxx xxxx
    /^\+38598\d{7}$/, // +385 98 xxx xxxx
    /^\+38597\d{7}$/, // +385 97 xxx xxxx
    /^\+38596\d{7}$/, // +385 96 xxx xxxx
    /^\+38595\d{7}$/, // +385 95 xxx xxxx
    /^\+38591\d{7}$/, // +385 91 xxx xxxx
    /^099\d{7}$/, // 099 xxx xxxx
    /^098\d{7}$/, // 098 xxx xxxx
    /^097\d{7}$/, // 097 xxx xxxx
    /^096\d{7}$/, // 096 xxx xxxx
    /^095\d{7}$/, // 095 xxx xxxx
    /^091\d{7}$/, // 091 xxx xxxx
    /^\+385[1-5]\d{7}$/, // +385 xx xxx xxxx (landline)
    /^0[1-5]\d{7}$/, // 0xx xxx xxxx (landline)
  ]
  
  return patterns.some(pattern => pattern.test(cleanPhone))
}

export function formatCroatianPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

  if (/^(\+385|0)(9[1-9])\d{7}$/.test(cleanPhone)) {
    if (cleanPhone.startsWith('+385')) {
      const number = cleanPhone.slice(4)
      return `+385 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`
    } else {
      return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`
    }
  }

  if (/^(\+385|0)[1-5]\d{7}$/.test(cleanPhone)) {
    if (cleanPhone.startsWith('+385')) {
      const number = cleanPhone.slice(4)
      return `+385 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`
    } else {
      return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`
    }
  }
  
  return phone // Return as-is if doesn't match known patterns
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} je obavezan`
  }
  return null
}

export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
  if (value && value.length < minLength) {
    return `${fieldName} mora imati najmanje ${minLength} karaktera`
  }
  return null
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
  if (value && value.length > maxLength) {
    return `${fieldName} može imati najviše ${maxLength} karaktera`
  }
  return null
}

export class FormValidator {
  private errors: Record<string, string> = {}
  
  validate(field: string, value: any, rules: ValidationRule[]): this {
    this.errors[field] = ''
    
    for (const rule of rules) {
      const error = rule(value, field)
      if (error) {
        this.errors[field] = error
        break
      }
    }
    
    return this
  }
  
  getErrors(): Record<string, string> {
    return { ...this.errors }
  }
  
  hasErrors(): boolean {
    return Object.values(this.errors).some(error => error !== '')
  }
  
  getError(field: string): string {
    return this.errors[field] || ''
  }
  
  clear(): this {
    this.errors = {}
    return this
  }
}

export type ValidationRule = (value: any, field: string) => string | null

export const Rules = {
  required: (value: any, field: string) => validateRequired(value, field),
  email: (value: string) => {
    if (value && !validateEmail(value)) {
      return 'Unesite valjanu email adresu'
    }
    return null
  },
  oib: (value: string) => {
    if (value && !validateOIB(value)) {
      return 'Unesite valjan OIB'
    }
    return null
  },
  phone: (value: string) => {
    if (value && !validateCroatianPhone(value)) {
      return 'Unesite valjan broj telefona'
    }
    return null
  },
  postalCode: (value: string) => {
    if (value && !validateCroatianPostalCode(value)) {
      return 'Unesite valjan poštanski broj'
    }
    return null
  },
  minLength: (min: number) => (value: string, field: string) => 
    validateMinLength(value, min, field),
  maxLength: (max: number) => (value: string, field: string) => 
    validateMaxLength(value, max, field)
}