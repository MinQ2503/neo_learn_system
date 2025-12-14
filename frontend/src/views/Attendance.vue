<template>
  <div class="attendance">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>Điểm danh</h3>
          <el-button type="primary" @click="startCamera">
            <el-icon><Camera /></el-icon>
            Bật Camera
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="camera-section">
            <video ref="videoRef" width="100%" autoplay></video>
            <canvas ref="canvasRef" style="display: none"></canvas>

            <div class="camera-controls" v-if="cameraActive">
              <el-button type="success" @click="captureAndRecognize">
                Chụp và nhận diện
              </el-button>
              <el-button type="danger" @click="stopCamera">
                Tắt Camera
              </el-button>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="result-section">
            <h4>Kết quả nhận diện</h4>

            <el-empty v-if="!recognitionResult" description="Chưa có kết quả" />

            <div v-else class="recognition-result">
              <el-result
                :icon="recognitionResult.recognized ? 'success' : 'warning'"
                :title="
                  recognitionResult.recognized
                    ? 'Nhận diện thành công'
                    : 'Không nhận diện được'
                "
              >
                <template #sub-title>
                  <div v-if="recognitionResult.recognized">
                    <p><strong>Họ tên:</strong> {{ recognitionResult.name }}</p>
                    <p>
                      <strong>Độ tin cậy:</strong>
                      {{ (recognitionResult.confidence * 100).toFixed(2) }}%
                    </p>
                    <p>
                      <strong>Thời gian:</strong> {{ recognitionResult.time }}
                    </p>
                  </div>
                </template>
              </el-result>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <h3>Lịch sử điểm danh hôm nay</h3>
      </template>

      <el-table :data="attendanceList" style="width: 100%">
        <el-table-column prop="student_name" label="Học sinh" />
        <el-table-column prop="student_id" label="Mã SV" width="120" />
        <el-table-column prop="time" label="Thời gian" width="200" />
        <el-table-column prop="confidence" label="Độ tin cậy" width="150">
          <template #default="scope">
            {{ (scope.row.confidence * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Trạng thái" width="120">
          <template #default="scope">
            <el-tag type="success">Có mặt</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Camera } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { faceRecognize } from "@/api/face";

const videoRef = ref(null);
const canvasRef = ref(null);
const cameraActive = ref(false);
const recognitionResult = ref(null);
const attendanceList = ref([]);

let stream = null;

const startCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });
    videoRef.value.srcObject = stream;
    cameraActive.value = true;
    ElMessage.success("Camera đã được bật");
  } catch (error) {
    ElMessage.error("Không thể truy cập camera: " + error.message);
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    videoRef.value.srcObject = null;
    cameraActive.value = false;
    ElMessage.info("Camera đã được tắt");
  }
};

const captureAndRecognize = async () => {
  const canvas = canvasRef.value;
  const video = videoRef.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  // Convert to blob
  canvas.toBlob(async (blob) => {
    try {
      ElMessage.loading("Đang nhận diện...");

      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      const response = await faceRecognize(formData);

      if (response.success && response.data.recognized) {
        recognitionResult.value = {
          ...response.data,
          time: new Date().toLocaleTimeString("vi-VN"),
        };

        // Thêm vào danh sách điểm danh
        attendanceList.value.unshift({
          student_name: response.data.name,
          student_id: response.data.student_id || "N/A",
          time: new Date().toLocaleString("vi-VN"),
          confidence: response.data.confidence,
          status: "present",
        });

        ElMessage.success("Điểm danh thành công!");
      } else {
        recognitionResult.value = {
          recognized: false,
        };
        ElMessage.warning("Không nhận diện được khuôn mặt");
      }
    } catch (error) {
      ElMessage.error("Lỗi khi nhận diện: " + error.message);
    }
  }, "image/jpeg");
};
</script>

<style scoped>
.attendance {
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

.camera-section {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.camera-section video {
  display: block;
  width: 100%;
  height: auto;
}

.camera-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.result-section {
  min-height: 400px;
}

.result-section h4 {
  margin-top: 0;
  margin-bottom: 20px;
}

.recognition-result {
  text-align: center;
}

.recognition-result p {
  margin: 10px 0;
  font-size: 1.1rem;
}
</style>
