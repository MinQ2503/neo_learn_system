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
    name: 'remember',
    label: 'Ghi nhớ đăng nhập',
    type: 'checkbox'
  }
]

// Định nghĩa schema validation với Zod
const schema = z.object({
  email: z.email({ message: 'Email không hợp lệ' }),
  password: z
    .string({ message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
})

type Schema = z.output<typeof schema>

// Xử lý submit form
function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Đăng nhập với:', payload.data)

  // Lưu token giả vào localStorage
  if (import.meta.client) {
    localStorage.setItem('auth_token', 'fake-token-' + Date.now())

    toast.add({
      title: 'Đăng nhập thành công',
      description: `Chào mừng ${payload.data.email}`,
      color: 'success'
    })

    // Redirect về trang chủ sau 500ms
    setTimeout(() => {
      router.push('/')
    }, 500)
  }
}
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <UAuthForm
      :schema="schema"
      :fields="fields"
      title="Đăng nhập"
      description="Nhập thông tin của bạn để truy cập hệ thống"
      icon="i-lucide-lock"
      :submit="{
        label: 'Đăng nhập',
        block: true
      }"
      @submit="onSubmit"
    >
      <template #password-hint>
        <ULink to="/forgot-password" class="text-primary font-medium" tabindex="-1">
          Quên mật khẩu?
        </ULink>
      </template>

      <template #footer>
        <div class="text-center">
          Chưa có tài khoản?
          <ULink to="/register" class="text-primary font-medium">
            Đăng ký ngay
          </ULink>
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
