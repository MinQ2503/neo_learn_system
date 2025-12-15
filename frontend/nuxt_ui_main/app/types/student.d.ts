export interface Student {
  id: string
  fullName: string
  studentCode: string
  email: string
  phone: string
  dateOfBirth: string
  avatar?: string
  course?: string
  createdAt: string
  updatedAt: string
}

export interface StudentFormData {
  fullName: string
  studentCode: string
  email: string
  phone: string
  dateOfBirth: string
  avatar?: string
  course?: string
}
