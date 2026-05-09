<template>
  <div class="p-6 bg-white rounded-lg shadow-sm m-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">游戏内容管理</h2>
      <el-button type="primary" @click="openAddDialog"> + 新增游戏 </el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="封面" width="100" align="center">
        <template #default="scope">
          <el-image :src="scope.row.cover" class="w-12 h-12 rounded-md" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="游戏名称" width="180" />
      <el-table-column prop="tag" label="标签" width="100">
        <template #default="scope">
          <el-tag size="small">{{ scope.row.tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="rating" label="评分" width="80" align="center" />
      <el-table-column prop="downloads" label="下载" width="100" />
      <el-table-column label="操作" fixed="right" min-width="150">
        <template #default="scope">
          <el-button type="primary" size="small" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm title="确定要删除这个游戏吗？" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button type="danger" size="small" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="游戏名称">
          <el-input v-model="formData.title" placeholder="如：元气骑士" />
        </el-form-item>
        <el-form-item label="封面URL">
          <el-input v-model="formData.cover" placeholder="输入封面图链接" />
        </el-form-item>
        <el-form-item label="分类标签">
          <el-select v-model="formData.tag" placeholder="选择标签" class="w-full">
            <el-option label="动作冒险" value="动作" />
            <el-option label="角色扮演" value="RPG" />
            <el-option label="二次元" value="二次元" />
            <el-option label="策略" value="策略" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="formData.short_desc" type="textarea" placeholder="简短描述" />
        </el-form-item>
        <el-form-item label="评分/下载">
          <div class="flex gap-4">
            <el-input-number v-model="formData.rating" :min="1" :max="5" :step="0.1" />
            <el-input v-model="formData.downloads" placeholder="10w+" style="width: 120px" />
          </div>
        </el-form-item>
        <el-form-item label="游戏截图">
          <div v-for="(url, index) in formData.screenshots" :key="index" class="flex gap-2 mb-2">
            <el-input v-model="formData.screenshots[index]" placeholder="输入截图URL" />
            <el-button type="danger" circle :icon="Delete" @click="formData.screenshots.splice(index, 1)" />
          </div>
          <el-button type="dashed" class="w-full" @click="formData.screenshots.push('')"> + 添加一张截图 </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";

const BASE_URL = "http://localhost:3000";
const tableData = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const dialogTitle = computed(() => (isEdit.value ? "编辑游戏" : "新增游戏"));

const formData = ref({
  title: "",
  cover: "",
  tag: "动作",
  short_desc: "",
  rating: 5.0,
  downloads: "1w+",
  screenshots: [] as string[]
});

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/games`).then(r => r.json());
    if (res.code === 0) {
      tableData.value = res.data.map((item: any) => ({
        ...item,
        screenshots: item.screenshots
          ? typeof item.screenshots === "string"
            ? JSON.parse(item.screenshots)
            : item.screenshots
          : []
      }));
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  }
  loading.value = false;
};

onMounted(fetchList);

const openAddDialog = () => {
  isEdit.value = false;
  currentId.value = null;
  formData.value = {
    title: "",
    cover: "",
    tag: "动作",
    short_desc: "",
    rating: 5.0,
    downloads: "1w+",
    screenshots: []
  };
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  isEdit.value = true;
  currentId.value = row.id;
  formData.value = { ...row, screenshots: [...row.screenshots] };
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!formData.value.title || !formData.value.cover) return ElMessage.warning("名称和封面不能为空");
  submitLoading.value = true;
  const url = isEdit.value ? `${BASE_URL}/api/games/${currentId.value}` : `${BASE_URL}/api/games`;
  const method = isEdit.value ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData.value)
    }).then(r => r.json());

    if (res.code === 0) {
      ElMessage.success(isEdit.value ? "修改成功" : "添加成功");
      dialogVisible.value = false;
      fetchList();
    }
  } catch (error) {
    ElMessage.error("操作失败");
  }
  submitLoading.value = false;
};

const handleDelete = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/api/games/${id}`, { method: "DELETE" }).then(r => r.json());
    if (res.code === 0) {
      ElMessage.success("删除成功");
      fetchList();
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
};
</script>
