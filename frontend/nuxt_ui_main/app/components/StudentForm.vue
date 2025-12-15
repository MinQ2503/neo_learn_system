<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { StudentFormData } from '~/types/student'

const props = defineProps<{
  student?: StudentFormData & { id?: string }
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  submit: [data: StudentFormData]
  cancel: []
}>()

const schema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  studentCode: z.string().min(3, 'Mã sinh viên phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  dateOfBirth: z.string().min(1, 'Vui lòng chọn ngày sinh'),
  course: z.string().optional(),
  avatar: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  fullName: props.student?.fullName || '',
  studentCode: props.student?.studentCode || '',
  email: props.student?.email || '',
  phone: props.student?.phone || '',
  dateOfBirth: props.student?.dateOfBirth || '',
  course: props.student?.course || '',
  avatar: props.student?.avatar || ''
})

const avatarPreview = ref(state.avatar)

const onFileChange = (files: FileList | null) => {
  if (files && files[0]) {
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
      state.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  emit('submit', event.data)
}

const onCancel = () => {
  emit('cancel')
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <!-- Avatar Upload -->
    <UFormGroup label="Ảnh chân dung" name="avatar">
      <div class="flex items-center gap-4">
        <UAvatar
          :src="avatarPreview"
          :alt="state.fullName"
          size="xl"
          icon="i-lucide-user"
        />
        <UInput
          type="file"
          accept="image/*"
          @change="(e) => onFileChange((e.target as HTMLInputElement).files)"
        />
      </div>
    </UFormGroup>

    <!-- Full Name -->
    <UFormGroup label="Họ và tên" name="fullName" required>
      <UInput
        v-model="state.fullName"
        placeholder="Nhập họ và tên"
        icon="i-lucide-user"
      />
    </UFormGroup>

    <!-- Student Code -->
    <UFormGroup label="Mã sinh viên" name="studentCode" required>
      <UInput
        v-model="state.studentCode"
        placeholder="Nhập mã sinh viên"
        icon="i-lucide-hash"
        :disabled="mode === 'edit'"
      />
    </UFormGroup>

    <!-- Email -->
    <UFormGroup label="Email" name="email" required>
      <UInput
        v-model="state.email"
        type="email"
        placeholder="Nhập email"
        icon="i-lucide-mail"
      />
    </UFormGroup>

    <!-- Phone -->
    <UFormGroup label="Số điện thoại" name="phone" required>
      <UInput
        v-model="state.phone"
        placeholder="Nhập số điện thoại"
        icon="i-lucide-phone"
      />
    </UFormGroup>

    <!-- Date of Birth -->
    <UFormGroup label="Ngày sinh" name="dateOfBirth" required>
      <UInput
        v-model="state.dateOfBirth"
        type="date"
        icon="i-lucide-calendar"
      />
    </UFormGroup>

    <!-- Course -->
    <UFormGroup label="Khóa học" name="course">
      <UInput
        v-model="state.course"
        placeholder="Nhập khóa học (ví dụ: K18, K19...)"
        icon="i-lucide-graduation-cap"
      />
    </UFormGroup>

    <!-- Actions -->
    <div class="flex justify-end gap-2">
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        @click="onCancel"
      >
        Hủy
      </UButton>
      <UButton type="submit" color="primary">
        {{ mode === 'create' ? 'Thêm sinh viên' : 'Cập nhật' }}
      </UButton>
    </div>
  </UForm>
</template>
