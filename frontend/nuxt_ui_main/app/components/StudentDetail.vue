<script setup lang="ts">
import type { Student } from '~/types/student'

defineProps<{
  student: Student
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  close: []
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Avatar and Basic Info -->
    <div class="flex items-start gap-6">
      <UAvatar
        :src="student.avatar"
        :alt="student.fullName"
        size="2xl"
        icon="i-lucide-user"
      />
      <div class="flex-1">
        <h3 class="text-2xl font-bold text-default">
          {{ student.fullName }}
        </h3>
        <p class="text-muted">
          {{ student.studentCode }}
        </p>
      </div>
    </div>

    <!-- Details -->
    <UDivider />

    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-sm text-muted">
          Email
        </p>
        <p class="font-medium">
          {{ student.email }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted">
          Số điện thoại
        </p>
        <p class="font-medium">
          {{ student.phone }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted">
          Ngày sinh
        </p>
        <p class="font-medium">
          {{ formatDate(student.dateOfBirth) }}
        </p>
      </div>

      <div v-if="student.course">
        <p class="text-sm text-muted">
          Khóa học
        </p>
        <p class="font-medium">
          {{ student.course }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted">
          Ngày tạo
        </p>
        <p class="font-medium">
          {{ formatDate(student.createdAt) }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted">
          Cập nhật lần cuối
        </p>
        <p class="font-medium">
          {{ formatDate(student.updatedAt) }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <UDivider />

    <div class="flex justify-end gap-2">
      <UButton
        color="neutral"
        variant="outline"
        @click="emit('close')"
      >
        Đóng
      </UButton>
      <UButton
        color="primary"
        variant="outline"
        icon="i-lucide-pencil"
        @click="emit('edit')"
      >
        Sửa
      </UButton>
      <UButton
        color="error"
        icon="i-lucide-trash-2"
        @click="emit('delete')"
      >
        Xóa
      </UButton>
    </div>
  </div>
</template>
