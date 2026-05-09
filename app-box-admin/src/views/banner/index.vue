<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam" :tool-button="true">
      <template #tableHeader>
        <el-button type="primary" icon="Plus" @click="openAddDialog">新增轮播图</el-button>
      </template>

      <template #image_url="scope">
        <el-image :src="scope.row.image_url" class="h-24 w-full rounded-md object-cover" fit="cover" />
      </template>

      <template #operation="scope">
        <el-button type="primary" link size="small" icon="EditPen" @click="handleEdit(scope.row)">编辑</el-button>
        <el-popconfirm title="确定要删除这张轮播图吗？" @confirm="handleDelete(scope.row.id)">
          <template #reference>
            <el-button type="danger" link size="small" icon="Delete">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="图片URL">
          <el-input v-model="formData.image_url" placeholder="建议填入横版高清图片链接" />
        </el-form-item>
        <el-form-item label="关联游戏ID">
          <el-input v-model="formData.game_id" placeholder="点击将跳转到该ID的游戏" />
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="formData.sort_order" :min="0" :max="100" />
          <div class="text-xs text-gray-400 ml-2">数字越大越靠前</div>
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
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";

const BASE_URL = "http://localhost:3000";

const proTable = ref();
const initParam = reactive({});
const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const dialogTitle = computed(() => (isEdit.value ? "编辑轮播图" : "新增轮播图"));

const formData = ref({
  image_url: "",
  game_id: "",
  sort_order: 0
});

const getTableList = async (params: any) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/banners`).then(r => r.json());
    let list = res.data || [];

    // 按关联游戏 ID 搜索
    if (params.game_id) {
      list = list.filter((item: any) => String(item.game_id).includes(String(params.game_id)));
    }

    return {
      list,
      pageNum: 1,
      pageSize: 10,
      total: list.length
    };
  } catch (error) {
    return { list: [], total: 0 };
  }
};

const columns = reactive<ColumnProps[]>([
  { type: "index", label: "#", width: 80 },
  { prop: "image_url", label: "轮播图片展示", minWidth: 300 },
  { prop: "game_id", label: "关联游戏ID", width: 150, search: { el: "input", tooltip: "输入游戏ID查找" } },
  { prop: "sort_order", label: "排序权重", width: 120 },
  { prop: "operation", label: "操作", fixed: "right", width: 180 }
]);

const openAddDialog = () => {
  isEdit.value = false;
  currentId.value = null;
  formData.value = { image_url: "", game_id: "", sort_order: 0 };
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  isEdit.value = true;
  currentId.value = row.id;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!formData.value.image_url) return ElMessage.warning("图片URL不能为空");
  submitLoading.value = true;
  const url = isEdit.value ? `${BASE_URL}/api/banners/${currentId.value}` : `${BASE_URL}/api/banners`;
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
      proTable.value?.getTableList(); // 刷新表格
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
    const res = await fetch(`${BASE_URL}/api/banners/${id}`, { method: "DELETE" }).then(r => r.json());
    if (res.code === 0) {
      ElMessage.success("删除成功");
      proTable.value?.getTableList(); // 刷新表格
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
};
</script>
