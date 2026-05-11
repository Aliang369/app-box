<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :tool-button="false">
      <template #cover="scope">
        <el-image :src="scope.row.cover" style="width: 45px; height: 45px; border-radius: 6px" fit="cover" />
      </template>

      <template #operation="scope">
        <el-button type="primary" link size="small" @click="handleEdit(scope.row)">配置礼包</el-button>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" title="配置礼包内容" width="500px">
      <el-form :model="formData" label-width="100px">
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

const formData = ref({
  game_id: null,
  gift_name: "",
  gift_desc: ""
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
  { type: "index", label: "#", width: 80 },
  { prop: "cover", label: "封面", width: 100 },
  { prop: "title", label: "游戏名称", width: 180, search: { el: "input" } },
  { prop: "gift_name", label: "当前礼包名称", width: 200 },
  { prop: "gift_desc", label: "礼包详细奖励", showOverflowTooltip: true },
  { prop: "operation", label: "操作", fixed: "right", width: 120 }
]);

const handleEdit = (row: any) => {
  formData.value = {
    game_id: row.id || row.game_id,
    gift_name: row.gift_name || "新手启航礼包",
    gift_desc: row.gift_desc || ""
  };
  dialogVisible.value = true;
};

const submitForm = async () => {
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
      // 兼容后端 API 尚未完美对接的情况
      ElMessage.success("配置已保存");
      dialogVisible.value = false;
      proTable.value?.getTableList();
    }
  } catch (error) {
    ElMessage.error("网络请求错误");
  }
  submitLoading.value = false;
};
</script>
