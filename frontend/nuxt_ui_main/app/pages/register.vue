<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const toast = useToast()

// Định nghĩa các trường của form
const fields: AuthFormField[] = [
  {
    name: 'username',
    type: 'text',
    label: 'Tên đăng nhập',
    placeholder: 'Nhập tên đăng nhập',
    required: true
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Nhập email của bạn',
    required: true
  },
  {
    name: 'password',
    label: 'Mật khẩu',
    type: 'password',
    placeholder: 'Nhập mật khẩu',
    required: true
  },
  {
    name: 'confirmPassword',
    label: 'Xác nhận mật khẩu',
    type: 'password',
    placeholder: 'Nhập lại mật khẩu',
    required: true
  }
]

// Định nghĩa schema validation với Zod
const schema = z
  .object({
    username: z
      .string({ message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .max(20, 'Tên đăng nhập không được quá 20 ký tự')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'
      ),
    email: z.email('Email không hợp lệ'),
    password: z
      .string({ message: 'Mật khẩu phải có ít nhất 6 ký tự' })
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu không được quá 50 ký tự'),
    confirmPassword: z.string({ message: 'Vui lòng xác nhận mật khẩu' })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

type Schema = z.output<typeof schema>

// Xử lý submit form
function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Đăng ký với:', payload.data)

  toast.add({
    title: 'Đăng ký thành công',
    description: `Tài khoản ${payload.data.username} đã được tạo. Vui lòng đăng nhập.`,
    color: 'success'
  })

  // Redirect sang trang login sau 1 giây
  setTimeout(() => {
    router.push('/login')
  }, 1000)
}
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <UAuthForm
      :schema="schema"
      :fields="fields"
      title="Đăng ký tài khoản"
      description="Tạo tài khoản mới để sử dụng hệ thống"
      icon="i-lucide-user-plus"
      :submit="{
        label: 'Đăng ký',
        block: true
      }"
      @submit="onSubmit"
    >
      <template #footer>
        <div class="text-center">
          Đã có tài khoản?
          <ULink to="/login" class="text-primary font-medium">
            Đăng nhập ngay
          </ULink>
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
