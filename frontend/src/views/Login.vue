<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Neo Learn System</h1>
      <p class="subtitle">Hệ thống học tập thông minh</p>

      <el-form :model="loginForm" class="login-form">
        <el-form-item>
          <el-input
            v-model="loginForm.email"
            placeholder="Email"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Mật khẩu"
            size="large"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="login-button"
          :loading="loading"
          @click="handleLogin"
        >
          Đăng nhập
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { loginAPI } from "@/api/auth";

const router = useRouter();
const loading = ref(false);

const loginForm = ref({
  email: "demo@example.com",
  password: "password123",
});

const handleLogin = async () => {
  loading.value = true;
  try {
    const response = await loginAPI(loginForm.value);
    if (response.success) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      ElMessage.success("Đăng nhập thành công!");
      router.push("/");
    }
  } catch (error) {
    ElMessage.error("Đăng nhập thất bại!");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.login-form {
  margin-top: 2rem;
}

.login-button {
  width: 100%;
  margin-top: 1rem;
}
</style>
