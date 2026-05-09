<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="searchText"
        placeholder="搜索用户名或游戏名称"
        class="filter-input"
        @keyup.enter="fetchList"
      >
        <template #append>
          <el-button @click="fetchList">搜索</el-button>
        </template>
      </el-input>
    </div>
    <el-table v-loading="loading" :data="recordList" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="用户头像" width="100" align="center">
        <template #default="scope">
          <img
            :src="scope.row.avatar"
            class="avatar"
            alt="头像"
            onerror="this.src='https://api.dicebear.com/7.x/bottts-neutral/svg?seed=default'"
          />
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="title" label="游戏名称" min-width="150" />
      <el-table-column prop="gift_code" label="激活码" min-width="180">
        <template #default="scope">
          <code class="code">{{ scope.row.gift_code }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="领取时间" width="200">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <el-button size="small" type="success" @click="copyCode(scope.row.gift_code)">
            复制
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";

const loading = ref(false);
const searchText = ref("");
const recordList = ref<any[]>([]);

const BASE_URL = "http://localhost:3000";

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/gift-records`);
    const data = await res.json();
    if (data.code === 0) {
      recordList.value = data.data.filter((item: any) => {
        if (!searchText.value) return true;
        return (
          item.username.includes(searchText.value) ||
          item.title.includes(searchText.value)
        );
      });
    }
  } catch (error) {
    console.error("获取领取记录失败:", error);
  } finally {
    loading.value = false;
  }
};

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    ElMessage.success("复制成功");
  } catch (error) {
    ElMessage.error("复制失败");
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-input {
  width: 350px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.code {
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #6366f1;
  font-family: monospace;
}
</style>
