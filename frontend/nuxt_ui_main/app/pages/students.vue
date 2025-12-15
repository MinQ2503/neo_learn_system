<script setup lang="ts">
import type { TableColumn } from '#ui/types'
import type { Student, StudentFormData } from '~/types/student'

const {
  students,
  loading,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents
} = useStudents()

// States
const searchQuery = ref('')
const selectedStudent = ref<Student | null>(null)
const isFormOpen = ref(false)
const isDetailOpen = ref(false)
const isDeleteModalOpen = ref(false)
const studentToDelete = ref<Student | null>(null)
const formMode = ref<'create' | 'edit'>('create')

// Load students on mount
onMounted(() => {
  getStudents()
})

// Computed
const filteredStudents = computed(() => {
  return searchStudents(searchQuery.value)
})

// Table columns
const columns: TableColumn<Student>[] = [
  {
    key: 'avatar',
    label: 'Ảnh',
    class: 'w-16',
    sortable: false
  },
  {
    key: 'fullName',
    label: 'Họ và tên',
    sortable: true
  },
  {
    key: 'studentCode',
    label: 'Mã SV',
    sortable: true
  },
  {
    key: 'email',
    label: 'Email',
    sortable: false
  },
  {
    key: 'phone',
    label: 'Số điện thoại',
    sortable: false
  },
  {
    key: 'course',
    label: 'Khóa học',
    sortable: true
  },
  {
    key: 'actions',
    label: 'Thao tác',
    class: 'w-32',
    sortable: false
  }
]

// Actions
const handleCreate = () => {
  selectedStudent.value = null
  formMode.value = 'create'
  isFormOpen.value = true
}

const handleView = (student: Student) => {
  selectedStudent.value = student
  isDetailOpen.value = true
}

const handleEdit = (student: Student) => {
  selectedStudent.value = student
  formMode.value = 'edit'
  isFormOpen.value = false
  isDetailOpen.value = false
  nextTick(() => {
    isFormOpen.value = true
  })
}

const handleDelete = (student: Student) => {
  studentToDelete.value = student
  isDeleteModalOpen.value = true
}

const confirmDelete = () => {
  if (studentToDelete.value) {
    deleteStudent(studentToDelete.value.id)
    isDeleteModalOpen.value = false
    if (isDetailOpen.value) {
      isDetailOpen.value = false
    }
    studentToDelete.value = null
  } else {
    isDeleteModalOpen.value = false
  }
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  studentToDelete.value = null
}

const handleFormSubmit = (data: StudentFormData) => {
  if (formMode.value === 'create') {
    createStudent(data)
  } else if (selectedStudent.value) {
    updateStudent(selectedStudent.value.id, data)
  }
  isFormOpen.value = false
  selectedStudent.value = null
}

const handleFormCancel = () => {
  isFormOpen.value = false
  selectedStudent.value = null
}

// Row actions
const rowActions = (row: Student) => [
  [
    {
      label: 'Xem chi tiết',
      icon: 'i-lucide-eye',
      click: () => handleView(row)
    },
    {
      label: 'Sửa',
      icon: 'i-lucide-pencil',
      click: () => handleEdit(row)
    },
    {
      label: 'Xóa',
      icon: 'i-lucide-trash-2',
      click: () => handleDelete(row)
    }
  ]
]
</script>

<template>
  <UDashboardPanel>
    <UDashboardNavbar
      title="Quản lý sinh viên"
      :badge="filteredStudents.length"
    >
      <template #right>
        <UButton
          icon="i-lucide-plus"
          label="Thêm sinh viên"
          color="primary"
          @click="handleCreate"
        />
      </template>
    </UDashboardNavbar>

    <UDashboardToolbar>
      <template #left>
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Tìm kiếm theo tên, mã SV, email, SĐT, khóa học..."
          class="w-96"
        />
      </template>

      <template #right>
        <USelectMenu
          :items="['Tất cả', 'K18', 'K19', 'K20', 'K21']"
          placeholder="Lọc theo khóa"
        />
      </template>
    </UDashboardToolbar>

    <UDashboardPanelContent>
      <UTable
        :rows="filteredStudents"
        :columns="columns"
        :loading="loading"
        :empty-state="{
          icon: 'i-lucide-users',
          label: 'Chưa có sinh viên nào'
        }"
      >
        <template #avatar-data="{ row }">
          <UAvatar
            :src="row.avatar"
            :alt="row.fullName"
            size="sm"
            icon="i-lucide-user"
          />
        </template>

        <template #fullName-data="{ row }">
          <UButton variant="link" :padded="false" @click="handleView(row)">
            {{ row.fullName }}
          </UButton>
        </template>

        <template #course-data="{ row }">
          <UBadge v-if="row.course" color="primary" variant="subtle">
            {{ row.course }}
          </UBadge>
          <span v-else class="text-muted">-</span>
        </template>

        <template #actions-data="{ row }">
          <UDropdownMenu :items="rowActions(row)">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-more-vertical"
            />
          </UDropdownMenu>
        </template>
      </UTable>
    </UDashboardPanelContent>

    <!-- Form Modal -->
    <UModal v-model="isFormOpen" prevent-close>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{
              formMode === "create"
                ? "Thêm sinh viên mới"
                : "Sửa thông tin sinh viên"
            }}
          </h3>
        </template>

        <StudentForm
          :student="selectedStudent || undefined"
          :mode="formMode"
          @submit="handleFormSubmit"
          @cancel="handleFormCancel"
        />
      </UCard>
    </UModal>

    <!-- Detail Modal -->
    <UModal v-model="isDetailOpen">
      <UCard>
        <template #header>
          <h3
            class="text-lg font-semibold"
          >
            Thông tin sinh viên
          </h3>
        </template>

        <StudentDetail
          v-if="selectedStudent"
          :student="selectedStudent"
          @edit="handleEdit(selectedStudent!)"
          @delete="handleDelete(selectedStudent!)"
          @close="isDetailOpen = false"
        />
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-alert-triangle" class="text-red-500 size-6" />
            <h3 class="text-lg font-semibold">
              Xác nhận xóa
            </h3>
          </div>
        </template>

        <div v-if="studentToDelete" class="space-y-4">
          <p class="text-muted">
            Bạn có chắc chắn muốn xóa sinh viên
            <span class="font-semibold text-default">"{{ studentToDelete.fullName }}"</span>
            ({{ studentToDelete.studentCode }})?
          </p>
          <p class="text-red-500 text-sm">
            Hành động này không thể hoàn tác.
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              @click="cancelDelete"
            >
              Hủy
            </UButton>
            <UButton
              color="error"
              @click="confirmDelete"
            >
              Xóa
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </UDashboardPanel>
</template>
