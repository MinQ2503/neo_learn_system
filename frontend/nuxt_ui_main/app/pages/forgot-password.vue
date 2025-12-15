<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const toast = useToast()

// Định nghĩa trường của form
const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Nhập email của bạn',
    required: true
  }
]

// Định nghĩa schema validation với Zod
const schema = z.object({
  email: z.email('Email không hợp lệ')
})

type Schema = z.output<typeof schema>

// Xử lý submit form
function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Yêu cầu khôi phục mật khẩu cho:', payload.data.email)

  toast.add({
    title: 'Email đã được gửi',
    description: `Vui lòng kiểm tra email ${payload.data.email} để đặt lại mật khẩu.`,
    color: 'success'
  })

  // Redirect về trang login sau 2 giây
  setTimeout(() => {
    router.push('/login')
  }, 2000)
}
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <UAuthForm
      :schema="schema"
      :fields="fields"
      title="Quên mật khẩu"
      description="Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu"
      icon="i-lucide-key-round"
      :submit="{
        label: 'Gửi email khôi phục',
        block: true
      }"
      @submit="onSubmit"
    >
      <template #footer>
        <div class="text-center">
          <ULink to="/login" class="text-primary font-medium">
            <div class="flex items-center justify-center gap-1">
              <UIcon name="i-lucide-arrow-left" class="size-4" />
              Quay về trang đăng nhập
            </div>
          </ULink>
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
