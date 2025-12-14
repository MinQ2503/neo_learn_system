<template>
  <el-container class="layout-container">
    <el-aside width="250px" class="sidebar">
      <div class="logo">
        <h2>Neo Learn</h2>
      </div>

      <el-menu :default-active="activeMenu" router class="sidebar-menu">
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>

        <el-menu-item index="/students">
          <el-icon><User /></el-icon>
          <span>Học sinh</span>
        </el-menu-item>

        <el-menu-item index="/attendance">
          <el-icon><Calendar /></el-icon>
          <span>Điểm danh</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h3>{{ pageTitle }}</h3>

          <div class="user-info">
            <span>{{ user?.name || "User" }}</span>
            <el-button type="danger" size="small" @click="handleLogout">
              Đăng xuất
            </el-button>
          </div>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { House, User, Calendar } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();

const user = ref(null);

const activeMenu = computed(() => route.path);

const pageTitle = computed(() => {
  const titles = {
    "/": "Trang chủ",
    "/students": "Quản lý học sinh",
    "/attendance": "Điểm danh",
  };
  return titles[route.path] || "Neo Learn System";
});

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    user.value = JSON.parse(userStr);
  }
});

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
};
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.sidebar {
  background: #304156;
  color: white;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #263445;
  color: white;
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
}

.sidebar-menu {
  border: none;
  background: #304156;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
  color: white;
}

:deep(.el-menu-item.is-active) {
  background-color: #409eff !important;
  color: white;
}

.header {
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h3 {
  margin: 0;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-content {
  background: #f5f5f5;
  padding: 20px;
}
</style>
