<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam" :tool-button="true">
      <template #tableHeader>
        <el-button type="primary" icon="Plus" @click="openAddDialog">新增金刚区按钮</el-button>
      </template>

      <template #is_visible="scope">
        <el-switch :model-value="scope.row.is_visible === 1" @change="val => handleToggleVisible(scope.row, Boolean(val))" />
      </template>

      <template #icon_preview="scope">
        <div class="icon-preview" :style="getIconPreviewStyle(scope.row.icon)"></div>
      </template>

      <template #operation="scope">
        <el-button type="primary" link size="small" icon="EditPen" @click="handleEdit(scope.row)">编辑</el-button>
        <el-popconfirm title="确定删除该金刚区按钮吗？" @confirm="handleDelete(scope.row.id)">
          <template #reference>
            <el-button type="danger" link size="small" icon="Delete">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form :model="formData" label-width="90px">
        <el-form-item label="按钮名称">
          <el-input v-model="formData.name" placeholder="例如：排行" />
        </el-form-item>
        <el-form-item label="图标类名">
          <el-input v-model="formData.icon" placeholder="例如：i-lucide-bar-chart-2" />
        </el-form-item>
        <el-form-item label="图标预览">
          <div class="icon-preview icon-preview-form" :style="getIconPreviewStyle(formData.icon)"></div>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="formData.link_url" placeholder="例如：https://example.com" />
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="formData.sort_order" :min="0" :max="999" />
          <div class="text-xs text-gray-400 ml-2">数字越大越靠前</div>
        </el-form-item>
        <el-form-item label="是否显示">
          <el-switch v-model="formData.is_visible" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button plain @click="openIconClassDoc">查找类名</el-button>
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
const ICON_CLASS_DOC_URL = "https://icones.js.org/collection/lucide";

const proTable = ref();
const initParam = reactive({});
const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const dialogTitle = computed(() => (isEdit.value ? "编辑金刚区按钮" : "新增金刚区按钮"));

const formData = ref({
  name: "",
  icon: "",
  link_url: "",
  sort_order: 0,
  is_visible: true
});

const getTableList = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/home-navs`).then(r => r.json());
    const list = (res.data || []).map((item: any) => ({
      ...item,
      operation_time: item.updated_at || item.created_at
    }));
    return {
      data: {
        list,
        pageNum: 1,
        pageSize: 20,
        total: list.length
      }
    };
  } catch (error) {
    return { data: { list: [], total: 0 } };
  }
};

const columns = reactive<ColumnProps[]>([
  { type: "index", label: "#", width: 70 },
  { prop: "name", label: "按钮名称", width: 140 },
  { prop: "icon", label: "图标类名", width: 220 },
  { prop: "icon_preview", label: "图标", width: 90 },
  { prop: "link_url", label: "跳转链接", minWidth: 220 },
  { prop: "sort_order", label: "排序", width: 90 },
  { prop: "is_visible", label: "显示", width: 90 },
  { prop: "operation_time", label: "更新时间", width: 180 },
  { prop: "operation", label: "操作", fixed: "right", width: 160 }
]);

const openAddDialog = () => {
  isEdit.value = false;
  currentId.value = null;
  formData.value = { name: "", icon: "", link_url: "", sort_order: 0, is_visible: true };
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  isEdit.value = true;
  currentId.value = row.id;
  formData.value = {
    name: row.name,
    icon: row.icon,
    link_url: row.link_url,
    sort_order: Number(row.sort_order) || 0,
    is_visible: Number(row.is_visible) === 1
  };
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!formData.value.name || !formData.value.icon || !formData.value.link_url) {
    return ElMessage.warning("名称、图标、跳转链接不能为空");
  }
  submitLoading.value = true;
  const url = isEdit.value ? `${BASE_URL}/api/admin/home-navs/${currentId.value}` : `${BASE_URL}/api/admin/home-navs`;
  const method = isEdit.value ? "PUT" : "POST";
  const payload = { ...formData.value, is_visible: formData.value.is_visible ? 1 : 0 };

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(r => r.json());
    if (res.code === 0) {
      ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
      dialogVisible.value = false;
      proTable.value?.getTableList();
    } else {
      ElMessage.error(res.message || "保存失败");
    }
  } catch (error) {
    ElMessage.error("网络错误");
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/home-navs/${id}`, { method: "DELETE" }).then(r => r.json());
    if (res.code === 0) {
      ElMessage.success("删除成功");
      proTable.value?.getTableList();
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
};

const handleToggleVisible = async (row: any, visible: boolean) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/home-navs/${row.id}/visible`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_visible: visible ? 1 : 0 })
    }).then(r => r.json());
    if (res.code === 0) {
      ElMessage.success("状态更新成功");
      row.is_visible = visible ? 1 : 0;
    } else {
      ElMessage.error(res.message || "状态更新失败");
      proTable.value?.getTableList();
    }
  } catch (error) {
    ElMessage.error("状态更新失败");
    proTable.value?.getTableList();
  }
};

const getIconPreviewStyle = (icon: string) => {
  const trimmed = String(icon ?? "").trim();
  if (!trimmed) return {};
  const iconName = trimmed.startsWith("i-lucide-")
    ? `lucide:${trimmed.replace("i-lucide-", "")}`
    : trimmed.includes(":")
      ? trimmed
      : `lucide:${trimmed}`;
  const encoded = encodeURIComponent(iconName);
  return {
    backgroundImage: `url("https://api.iconify.design/${encoded}.svg?color=%236366f1")`
  };
};

const openIconClassDoc = () => {
  window.open(ICON_CLASS_DOC_URL, "_blank", "noopener,noreferrer");
};
</script>

<style scoped>
.icon-preview {
  width: 20px;
  height: 20px;
  margin: 0 auto;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.icon-preview-form {
  margin: 0;
  width: 24px;
  height: 24px;
}
</style>
