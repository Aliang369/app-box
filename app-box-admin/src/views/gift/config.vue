<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="searchText"
        placeholder="搜索游戏名称"
        class="filter-input"
        @keyup.enter="fetchList"
      >
        <template #append>
          <el-button @click="fetchList">搜索</el-button>
        </template>
      </el-input>
    </div>
    <el-table v-loading="loading" :data="configList" border style="width: 100%">
      <el-table-column prop="game_id" label="游戏ID" width="100" align="center" />
      <el-table-column label="游戏封面" width="120" align="center">
        <template #default="scope">
          <img
            :src="scope.row.cover"
            class="cover"
            alt="封面"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 100 100&quot;%3E%3Crect fill=&quot;%23f5f5f5&quot; width=&quot;100&quot; height=&quot;100&quot;/%3E%3Ctext fill=&quot;%23999&quot; font-size=&quot;12&quot; x=&quot;50%25&quot; y=&quot;50%25&quot; text-anchor=&quot;middle&quot; dominant-baseline=&quot;middle&quot;%3E暂无封面%3C/text%3E%3C/svg%3E'"
          />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="游戏名称" min-width="150" />
      <el-table-column prop="gift_name" label="礼包名称" min-width="120">
        <template #default="scope">
          {{ scope.row.gift_name || "未配置" }}
        </template>
      </el-table-column>
      <el-table-column prop="gift_desc" label="礼包描述" min-width="200">
        <template #default="scope">
          {{ scope.row.gift_desc || "未配置" }}
        </template>
      </el-table-column>
      <el-table-column prop="updated_at" label="更新时间" width="200">
        <template #default="scope">
          {{ scope.row.updated_at ? formatDate(scope.row.updated_at) : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" @click="openEditDialog(scope.row)">
            编辑
          </el-button>
          <el-button
            v-if="scope.row.id"
            size="small"
            type="danger"
            @click="handleDelete(scope.row.game_id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="设置礼包" :visible.sync="dialogVisible" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="游戏名称">
          <el-input :value="formData.title" disabled />
        </el-form-item>
        <el-form-item label="礼包名称">
          <el-input v-model="formData.gift_name" placeholder="请输入礼包名称" />
        </el-form-item>
        <el-form-item label="礼包描述">
          <el-textarea
            v-model="formData.gift_desc"
            placeholder="请输入礼包描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";

const loading = ref(false);
const searchText = ref("");
const configList = ref<any[]>([]);
const dialogVisible = ref(false);
const formData = reactive({
  game_id: "",
  title: "",
  gift_name: "",
  gift_desc: "",
});

const BASE_URL = "http://localhost:3000";

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/gift-configs`);
    const data = await res.json();
    if (data.code === 0) {
      configList.value = data.data.filter((item: any) => {
        if (!searchText.value) return true;
        return item.title.includes(searchText.value);
      });
    }
  } catch (error) {
    console.error("获取礼包配置失败:", error);
  } finally {
    loading.value = false;
  }
};

const openEditDialog = (row: any) => {
  formData.game_id = row.game_id;
  formData.title = row.title;
  formData.gift_name = row.gift_name || "";
  formData.gift_desc = row.gift_desc || "";
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!formData.gift_name.trim()) {
    return ElMessage.warning("礼包名称不能为空");
  }

  try {
    const res = await fetch(`${BASE_URL}/api/admin/gift-configs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_id: formData.game_id,
        gift_name: formData.gift_name,
        gift_desc: formData.gift_desc,
      }),
    });
    const data = await res.json();
    if (data.code === 0) {
      ElMessage.success("保存成功");
      dialogVisible.value = false;
      fetchList();
    } else {
      ElMessage.error(data.message);
    }
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

const handleDelete = async (game_id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/gift-configs/${game_id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.code === 0) {
      ElMessage.success("删除成功");
      fetchList();
    } else {
      ElMessage.error(data.message);
    }
  } catch (error) {
    ElMessage.error("删除失败");
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
  width: 300px;
}

.cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}
</style>
