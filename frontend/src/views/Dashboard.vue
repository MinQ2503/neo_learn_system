<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon students">
              <el-icon :size="40"><User /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalStudents }}</h3>
              <p>Tổng học sinh</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon present">
              <el-icon :size="40"><Check /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.present }}</h3>
              <p>Có mặt hôm nay</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon absent">
              <el-icon :size="40"><Close /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.absent }}</h3>
              <p>Vắng mặt</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon percentage">
              <el-icon :size="40"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.percentage }}%</h3>
              <p>Tỷ lệ điểm danh</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <template #header>
            <h3>Điểm danh gần đây</h3>
          </template>
          <el-table :data="recentAttendance" style="width: 100%">
            <el-table-column prop="student_name" label="Học sinh" />
            <el-table-column prop="date" label="Ngày" />
            <el-table-column prop="time" label="Giờ" />
            <el-table-column prop="status" label="Trạng thái">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === 'present' ? 'success' : 'danger'"
                >
                  {{ scope.row.status === "present" ? "Có mặt" : "Vắng" }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <h3>Thông báo</h3>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(notification, index) in notifications"
              :key="index"
              :timestamp="notification.time"
            >
              {{ notification.message }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { User, Check, Close, TrendCharts } from "@element-plus/icons-vue";
import { getAttendanceReport } from "@/api/attendance";

const stats = ref({
  totalStudents: 50,
  present: 45,
  absent: 5,
  percentage: 90,
});

const recentAttendance = ref([
  {
    student_name: "Nguyễn Văn A",
    date: "2025-11-11",
    time: "08:30",
    status: "present",
  },
  {
    student_name: "Trần Thị B",
    date: "2025-11-11",
    time: "08:32",
    status: "present",
  },
  {
    student_name: "Lê Văn C",
    date: "2025-11-11",
    time: "08:35",
    status: "present",
  },
  {
    student_name: "Phạm Thị D",
    date: "2025-11-11",
    time: "-",
    status: "absent",
  },
]);

const notifications = ref([
  { message: "Điểm danh thành công cho lớp CNTT-K15", time: "08:30" },
  { message: "Thêm học sinh mới: Nguyễn Văn E", time: "07:45" },
  { message: "Cập nhật thông tin học sinh", time: "07:20" },
]);

onMounted(async () => {
  try {
    const response = await getAttendanceReport();
    if (response.success) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.students {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.present {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.absent {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.percentage {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info h3 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}
</style>
