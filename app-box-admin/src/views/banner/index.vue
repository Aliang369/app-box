<template>
  <div class="p-6 bg-white rounded-lg shadow-sm m-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">首页轮播图管理</h2>
      <el-button type="primary" @click="openAddDialog()"> + 新增轮播图 </el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="轮播图片" min-width="300" align="center">
        <template #default="scope">
          <el-image :src="scope.row.image_url" class="h-28 rounded-md w-[80%] object-cover" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="game_id" label="关联游戏ID" width="120" align="center" />
      <el-table-column prop="sort_order" label="排序权重" width="100" align="center" />
      <el-table-column label="操作" fixed="right" width="180" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" plain mr-2 @click="openEditDialog(scope.row)">编辑</el-button>
          <el-popconfirm title="确定要删除这张轮播图吗？" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button type="danger" size="small" plain>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑轮播图' : '新增轮播图'" v-model="dialogVisible" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="图片URL">
          <el-input v-model="formData.image_url" placeholder="建议填入1080x750比例的图片" />
        </el-form-item>
        <el-form-item label="关联游戏ID">
          <el-input v-model="formData.game_id" placeholder="填入ID用于点击跳转(非必填)" />
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="formData.sort_order" :min="0" :max="100" />
          <div class="text-xs text-gray-400 ml-2">数字越大越靠前</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">{{ isEdit ? '确定修改' : '确定添加' }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";

const BASE_URL = "http://localhost:3000";

const tableData = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);

const formData = ref({
  image_url: "",
  game_id: "",
  sort_order: 0
});

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/banners`).then(r => r.json());
    if (res.code === 0) {
      tableData.value = res.data;
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
  }
  loading.value = false;
};

onMounted(() => {
  fetchList();
});

const openAddDialog = () => {
  isEdit.value = false;
  editId.value = null;
  formData.value = {
    image_url: "",
    game_id: "",
    sort_order: 0
  };
  dialogVisible.value = true;
};

const openEditDialog = (row: any) => {
  isEdit.value = true;
  editId.value = row.id;
  formData.value = {
    image_url: row.image_url || "",
    game_id: row.game_id || "",
    sort_order: row.sort_order || 0
  };
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!formData.value.image_url) {
    return ElMessage.warning("图片URL不能为空");
  }

  submitLoading.value = true;
  try {
    let res;
    if (isEdit.value && editId.value) {
      // 修改模式：调用 PUT 接口
      res = await fetch(`${BASE_URL}/api/banners/${editId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData.value)
      }).then(r => r.json());
    } else {
      // 新增模式：调用 POST 接口
      res = await fetch(`${BASE_URL}/api/banners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData.value)
      }).then(r => r.json());
    }

    if (res.code === 0) {
      ElMessage.success(isEdit.value ? "修改成功！" : "添加成功！");
      dialogVisible.value = false;
      fetchList();
    } else {
      ElMessage.error(res.message);
    }
  } catch (error) {
    ElMessage.error("网络错误");
  }
  submitLoading.value = false;
};

const handleDelete = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/api/banners/${id}`, {
      method: "DELETE"
    }).then(r => r.json());

    if (res.code === 0) {
      ElMessage.success("删除成功");
      fetchList();
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
};
</script>
