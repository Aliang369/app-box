<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam" :tool-button="true">
      <template #tableHeader>
        <el-button type="primary" icon="Plus" @click="openAddDialog">新增轮播图</el-button>
      </template>

      <template #image_url="scope">
        <div class="flex justify-center">
          <el-image
            :src="scope.row.image_url"
            :preview-src-list="[scope.row.image_url]"
            preview-teleported
            fit="cover"
            class="h-[120px] w-[220px] rounded-md"
          />
        </div>
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
        <el-form-item label="跳转方式">
          <el-select v-model="formData.jump_type" class="w-full" @change="handleJumpTypeChange">
            <el-option v-for="item in jumpTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="jumpTargetLabel">
          <el-input
            v-if="formData.jump_type !== 'none'"
            v-model="formData.jump_value"
            :placeholder="jumpTargetPlaceholder"
            :type="formData.jump_type === 'game' ? 'number' : 'text'"
          />
          <div v-else class="text-xs text-gray-400">当前轮播图点击后不跳转，仅展示图片。</div>
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
const jumpTypeOptions = [
  { label: "游戏ID", value: "game" },
  { label: "H5", value: "h5" },
  { label: "不跳转", value: "none" }
];
const jumpTargetLabel = computed(() => {
  if (formData.value.jump_type === "h5") return "H5地址";
  if (formData.value.jump_type === "game") return "关联游戏ID";
  return "跳转目标";
});
const jumpTargetPlaceholder = computed(() => {
  if (formData.value.jump_type === "h5") return "请输入 H5 页面地址，例如：https://example.com";
  if (formData.value.jump_type === "game") return "请输入游戏ID，点击后跳转详情页";
  return "";
});

const formData = ref({
  image_url: "",
  jump_type: "game",
  jump_value: "",
  sort_order: 0
});

const getTableList = async (params: any) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/banners`).then(r => r.json());
    let list = (res.data || []).map((item: any) => ({
      ...item,
      jump_type_label: item.jump_type === "h5" ? "H5" : item.jump_type === "game" ? "游戏ID" : "不跳转",
      jump_target: item.jump_type === "game" ? item.jump_value || item.game_id || "--" : item.jump_value || "--",
      operation_time: item.operation_time || item.updated_at || item.created_at || null,
      operator: item.operator || item.updated_by_name || item.updated_by || item.created_by_name || item.created_by || null
    }));

    // 按跳转目标搜索
    if (params.jump_target) {
      list = list.filter((item: any) => String(item.jump_target).includes(String(params.jump_target)));
    }

    return {
      data: {
        list: list,
        pageNum: 1,
        pageSize: 10,
        total: list.length
      }
    };
  } catch (error) {
    return { data: { list: [], total: 0 } };
  }
};

const columns = reactive<ColumnProps[]>([
  { type: "index", label: "#", width: 80 },
  { prop: "image_url", label: "轮播图片展示", width: 260 },
  { prop: "jump_type_label", label: "跳转方式", width: 120 },
  { prop: "jump_target", label: "跳转目标", minWidth: 220, search: { el: "input", tooltip: "输入游戏ID或H5地址查找" } },
  { prop: "sort_order", label: "排序权重", width: 120 },
  { prop: "operation_time", label: "操作时间", width: 180 },
  { prop: "operator", label: "操作人", minWidth: 120 },
  { prop: "operation", label: "操作", fixed: "right", width: 180 }
]);

const openAddDialog = () => {
  isEdit.value = false;
  currentId.value = null;
  formData.value = { image_url: "", jump_type: "game", jump_value: "", sort_order: 0 };
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  isEdit.value = true;
  currentId.value = row.id;
  formData.value = {
    image_url: row.image_url || "",
    jump_type: row.jump_type || (row.game_id ? "game" : "none"),
    jump_value: row.jump_type === "game" ? String(row.jump_value || row.game_id || "") : String(row.jump_value || ""),
    sort_order: Number(row.sort_order) || 0
  };
  dialogVisible.value = true;
};

const handleJumpTypeChange = () => {
  formData.value.jump_value = "";
};

const submitForm = async () => {
  if (!formData.value.image_url) return ElMessage.warning("图片URL不能为空");
  if (formData.value.jump_type === "game" && !/^\d+$/.test(String(formData.value.jump_value || "").trim())) {
    return ElMessage.warning("请输入有效的游戏ID");
  }
  if (formData.value.jump_type === "h5" && !String(formData.value.jump_value || "").trim()) {
    return ElMessage.warning("H5地址不能为空");
  }
  submitLoading.value = true;
  const url = isEdit.value ? `${BASE_URL}/api/banners/${currentId.value}` : `${BASE_URL}/api/banners`;
  const method = isEdit.value ? "PUT" : "POST";
  const payload = {
    image_url: formData.value.image_url,
    jump_type: formData.value.jump_type,
    jump_value: formData.value.jump_type === "none" ? "" : String(formData.value.jump_value || "").trim(),
    sort_order: formData.value.sort_order
  };

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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
