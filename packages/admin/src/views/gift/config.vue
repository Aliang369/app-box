<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :tool-button="false">
      <template #tableHeader>
        <el-button type="primary" icon="Plus" @click="openAddDialog">新增配置</el-button>
      </template>

      <template #cover="scope">
        <el-image :src="scope.row.cover" style="width: 45px; height: 45px; border-radius: 6px" fit="cover" />
      </template>

      <template #operation="scope">
        <el-button type="primary" link size="small" @click="handleEdit(scope.row)">修改</el-button>
        <el-button type="success" link size="small" @click="openCodeDialog(scope.row)">配置</el-button>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" title="配置礼包内容" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="游戏ID">
          <el-input-number v-model="formData.game_id" :min="1" :step="1" />
          <span class="ml-2 text-xs text-gray-400">来源于“游戏管理”列表中的游戏ID</span>
        </el-form-item>
        <el-form-item label="礼包名称">
          <el-input v-model="formData.gift_name" placeholder="如：新手启航豪华礼包" />
        </el-form-item>
        <el-form-item label="礼包描述">
          <el-input v-model="formData.gift_desc" type="textarea" :rows="3" placeholder="描述该礼包包含的奖励..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="codeDialogVisible" title="配置激活码" width="620px">
      <el-form :model="codeForm" label-width="100px">
        <el-form-item label="游戏ID">
          <el-input v-model="codeForm.game_id" disabled />
        </el-form-item>
        <el-form-item label="游戏名称">
          <el-input v-model="codeForm.title" disabled />
        </el-form-item>
        <el-form-item label="批量激活码">
          <el-input v-model="codeForm.codesText" type="textarea" :rows="10" placeholder="每行一个激活码，保存时会自动去重" />
        </el-form-item>
        <div class="flex items-center justify-between ml-[100px] mb-3">
          <div class="text-xs text-gray-400">已配置 {{ codeForm.code_total }} 个，剩余未领取 {{ codeForm.code_unused }} 个</div>
          <div class="flex items-center gap-2">
            <el-button size="small" @click="handleExportCodes('all')">导出全部</el-button>
            <el-button size="small" @click="handleExportCodes('unused')">导出未发放</el-button>
            <el-button size="small" @click="handleExportCodes('claimed')">导出已发放</el-button>
          </div>
        </div>
      </el-form>
      <el-table :data="codeItems" border max-height="280" v-loading="codeListLoading">
        <el-table-column prop="gift_code" label="激活码" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_claimed ? 'info' : 'success'" effect="plain">
              {{ scope.row.is_claimed ? "已发放" : "未发放" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="claimed_at" label="发放时间" width="180" align="center">
          <template #default="scope">
            {{ scope.row.claimed_at || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template #default="scope">
            <el-button v-if="!scope.row.is_claimed" type="danger" link size="small" @click="handleDeleteCode(scope.row.id)">
              删除
            </el-button>
            <span v-else class="text-gray-300">--</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="codeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCodeForm" :loading="codeSubmitLoading">保存激活码</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";

const BASE_URL = "http://localhost:3000";
const proTable = ref();
const dialogVisible = ref(false);
const submitLoading = ref(false);
const codeDialogVisible = ref(false);
const codeSubmitLoading = ref(false);
const codeListLoading = ref(false);
const codeItems = ref<any[]>([]);

const formData = ref({
  game_id: null,
  gift_name: "",
  gift_desc: ""
});

const codeForm = ref({
  game_id: null as number | null,
  title: "",
  codesText: "",
  code_total: 0,
  code_unused: 0
});

const getTableList = async (params: any) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/gift-configs`).then(r => r.json());
    let list = res.data || [];

    if (params.title) {
      list = list.filter((item: any) => item.title.includes(params.title));
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
  { prop: "game_id", label: "游戏ID", width: 90, search: { el: "input" } },
  { prop: "cover", label: "封面", width: 100 },
  { prop: "title", label: "游戏名称", width: 180, search: { el: "input" } },
  { prop: "gift_name", label: "当前礼包名称", width: 200 },
  { prop: "code_total", label: "激活码总数", width: 110 },
  { prop: "code_unused", label: "剩余可领", width: 100 },
  { prop: "gift_desc", label: "礼包详细奖励", showOverflowTooltip: true },
  { prop: "operation", label: "操作", fixed: "right", width: 160 }
]);

const openAddDialog = () => {
  formData.value = {
    game_id: null,
    gift_name: "",
    gift_desc: ""
  };
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  formData.value = {
    game_id: row.game_id,
    gift_name: row.gift_name || "新手启航礼包",
    gift_desc: row.gift_desc || ""
  };
  dialogVisible.value = true;
};

const openCodeDialog = (row: any) => {
  codeForm.value = {
    game_id: row.game_id,
    title: row.title || "",
    codesText: "",
    code_total: Number(row.code_total) || 0,
    code_unused: Number(row.code_unused) || 0
  };
  codeDialogVisible.value = true;
  fetchCodeItems();
};

const fetchCodeItems = async () => {
  if (!codeForm.value.game_id) return;
  codeListLoading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/gift-code-items?game_id=${codeForm.value.game_id}`).then(r => r.json());
    if (res.code === 0) {
      codeItems.value = res.data || [];
      codeForm.value.code_total = codeItems.value.length;
      codeForm.value.code_unused = codeItems.value.filter(item => !item.is_claimed).length;
    } else {
      ElMessage.error(res.message || "获取激活码列表失败");
    }
  } catch (error) {
    ElMessage.error("网络请求错误");
  } finally {
    codeListLoading.value = false;
  }
};

const submitForm = async () => {
  if (!formData.value.game_id) return ElMessage.warning("请先填写游戏ID");
  submitLoading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/gift-configs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData.value)
    }).then(r => r.json());

    if (res.code === 0) {
      ElMessage.success("配置保存成功");
      dialogVisible.value = false;
      proTable.value?.getTableList();
    } else {
      ElMessage.error(res.message || "保存失败，请检查游戏ID是否存在");
    }
  } catch (error) {
    ElMessage.error("网络请求错误");
  } finally {
    submitLoading.value = false;
  }
};

const submitCodeForm = async () => {
  if (!codeForm.value.game_id) return ElMessage.warning("请先选择游戏");
  const codes = codeForm.value.codesText
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
  if (!codes.length) return ElMessage.warning("请至少填写一个激活码");

  codeSubmitLoading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/gift-code-items/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: codeForm.value.game_id, codes })
    }).then(r => r.json());

    if (res.code === 0) {
      ElMessage.success(res.message || "激活码保存成功");
      codeForm.value.codesText = "";
      await fetchCodeItems();
      proTable.value?.getTableList();
    } else {
      ElMessage.error(res.message || "激活码保存失败");
    }
  } catch (error) {
    ElMessage.error("网络请求错误");
  } finally {
    codeSubmitLoading.value = false;
  }
};

const handleDeleteCode = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/gift-code-items/${id}`, { method: "DELETE" }).then(r => r.json());
    if (res.code === 0) {
      ElMessage.success("删除成功");
      await fetchCodeItems();
      proTable.value?.getTableList();
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  } catch (error) {
    ElMessage.error("网络请求错误");
  }
};

const handleExportCodes = (type: "all" | "unused" | "claimed") => {
  const list = codeItems.value.filter(item => {
    if (type === "unused") return !item.is_claimed;
    if (type === "claimed") return !!item.is_claimed;
    return true;
  });
  if (!list.length) return ElMessage.warning("当前没有可导出的激活码");

  const rows = [
    ["游戏ID", "游戏名称", "激活码", "状态", "发放时间"],
    ...list.map(item => [
      String(codeForm.value.game_id || ""),
      codeForm.value.title || "",
      item.gift_code || "",
      item.is_claimed ? "已发放" : "未发放",
      item.claimed_at || ""
    ])
  ];
  const csv = "\ufeff" + rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `gift-codes-${codeForm.value.game_id}-${type}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
</script>
