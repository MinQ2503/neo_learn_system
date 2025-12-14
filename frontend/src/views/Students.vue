<template>
  <div class="students">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>Danh sách học sinh</h3>
          <el-button type="primary" @click="dialogVisible = true">
            Thêm học sinh
          </el-button>
        </div>
      </template>

      <el-table :data="students" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="student_id" label="Mã SV" width="120" />
        <el-table-column prop="name" label="Họ tên" />
        <el-table-column prop="class" label="Lớp" width="150" />
        <el-table-column label="Thao tác" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">
              Sửa
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              Xóa
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog thêm/sửa học sinh -->
    <el-dialog v-model="dialogVisible" title="Thêm học sinh" width="500px">
      <el-form :model="studentForm" label-width="120px">
        <el-form-item label="Mã sinh viên">
          <el-input v-model="studentForm.student_id" />
        </el-form-item>

        <el-form-item label="Họ tên">
          <el-input v-model="studentForm.name" />
        </el-form-item>

        <el-form-item label="Lớp">
          <el-input v-model="studentForm.class" />
        </el-form-item>

        <el-form-item label="Email">
          <el-input v-model="studentForm.email" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" @click="handleSave">Lưu</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getStudents, createStudent, deleteStudent } from "@/api/students";

const students = ref([]);
const dialogVisible = ref(false);
const studentForm = ref({
  student_id: "",
  name: "",
  class: "",
  email: "",
});

onMounted(async () => {
  await loadStudents();
});

const loadStudents = async () => {
  try {
    const response = await getStudents();
    if (response.success) {
      students.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load students:", error);
  }
};

const handleEdit = (row) => {
  studentForm.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc muốn xóa học sinh này?",
      "Xác nhận",
      {
        type: "warning",
      }
    );

    await deleteStudent(row.id);
    ElMessage.success("Xóa thành công!");
    await loadStudents();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("Xóa thất bại!");
    }
  }
};

const handleSave = async () => {
  try {
    await createStudent(studentForm.value);
    ElMessage.success("Lưu thành công!");
    dialogVisible.value = false;
    await loadStudents();
  } catch (error) {
    ElMessage.error("Lưu thất bại!");
  }
};
</script>

<style scoped>
.students {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}
</style>
