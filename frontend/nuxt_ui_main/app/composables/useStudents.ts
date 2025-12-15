import type { Student, StudentFormData } from '~/types/student'

export const useStudents = () => {
  const students = ref<Student[]>([])
  const loading = ref(false)
  const toast = useToast()

  // Load students from localStorage
  const loadStudents = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('students')
      if (stored) {
        students.value = JSON.parse(stored)
      }
    }
  }

  // Save students to localStorage
  const saveStudents = () => {
    if (import.meta.client) {
      localStorage.setItem('students', JSON.stringify(students.value))
    }
  }

  // Get all students
  const getStudents = () => {
    loadStudents()
    return students.value
  }

  // Get student by id
  const getStudentById = (id: string) => {
    return students.value.find(s => s.id === id)
  }

  // Create student
  const createStudent = (data: StudentFormData) => {
    loading.value = true
    try {
      const newStudent: Student = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      students.value.push(newStudent)
      saveStudents()

      toast.add({
        title: 'Thành công',
        description: 'Thêm sinh viên mới thành công',
        color: 'success'
      })
      return newStudent
    } catch (error) {
      toast.add({
        title: 'Lỗi',
        description: 'Không thể thêm sinh viên',
        color: 'error'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  // Update student
  const updateStudent = (id: string, data: Partial<StudentFormData>) => {
    loading.value = true
    try {
      const index = students.value.findIndex(s => s.id === id)
      if (index !== -1) {
        students.value[index] = {
          ...students.value[index],
          ...data,
          updatedAt: new Date().toISOString()
        }
        saveStudents()

        toast.add({
          title: 'Thành công',
          description: 'Cập nhật thông tin sinh viên thành công',
          color: 'success'
        })
        return students.value[index]
      }
      throw new Error('Student not found')
    } catch (error) {
      toast.add({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin sinh viên',
        color: 'error'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  // Delete student
  const deleteStudent = (id: string) => {
    loading.value = true
    try {
      const index = students.value.findIndex(s => s.id === id)
      if (index !== -1) {
        students.value.splice(index, 1)
        saveStudents()

        toast.add({
          title: 'Thành công',
          description: 'Xóa sinh viên thành công',
          color: 'success'
        })
        return true
      }
      throw new Error('Student not found')
    } catch (error) {
      toast.add({
        title: 'Lỗi',
        description: 'Không thể xóa sinh viên',
        color: 'error'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  // Search students
  const searchStudents = (query: string) => {
    if (!query) return students.value

    const lowerQuery = query.toLowerCase()
    return students.value.filter(student =>
      student.fullName.toLowerCase().includes(lowerQuery)
      || student.studentCode.toLowerCase().includes(lowerQuery)
      || student.email.toLowerCase().includes(lowerQuery)
      || student.phone.includes(query)
      || (student.course && student.course.toLowerCase().includes(lowerQuery))
    )
  }

  return {
    students,
    loading,
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents
  }
}
